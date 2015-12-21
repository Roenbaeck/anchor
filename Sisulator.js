var Sisulator = {
    // the map defines 'keys' for elements that may occur more than once
    // on the same level in the XML document
    MAP: {
        knot: function(xml, fragment) {
            return fragment.getAttribute('mnemonic');
        },
        anchor: function(xml, fragment) {
            return fragment.getAttribute('mnemonic');
        },
        attribute: function(xml, fragment) {
            return fragment.getAttribute('mnemonic');
        },
        tie: function(xml, fragment) {
            var roles = xml.evaluate(
                    '*[@role]',
                    fragment,
                    null,
                    XPathResult.ORDERED_NODE_ITERATOR_TYPE, // document order
                    null
            );
            var key = '', role = roles.iterateNext();
            while(role) {
                key += role.getAttribute('type') + '_' + role.getAttribute('role');
                role = roles.iterateNext();
                if(role) key += '_';
            }
            return key;
        },
        anchorRole: function(xml, fragment) {
            return fragment.getAttribute('type') + '_' + fragment.getAttribute('role');
        },
        knotRole: function(xml, fragment) {
            return fragment.getAttribute('type') + '_' + fragment.getAttribute('role');
        }
    },
    // used to replace certain element names with others
    replacer: function(name) {
        switch(name) {
            case 'anchorRoles':
                return 'roles';
            case 'knotRoles':
                return 'roles';
            default:
                return name;
        }
    },
    // this function will recursively traverse the XML document and
    // create a 'hash' object that mimics the structure using the given map
    // to handle siblings using the same tag
    objectify: function(xml, map) {
        var listSuffix = 's';
        function objectifier(xmlFragment, map, object) {
            // element node
            if(xmlFragment.nodeType === 1) {
                // if there are children or attributes we need a container
                if(xmlFragment.attributes.length > 0 || xmlFragment.firstChild) {
                    if(!object[xmlFragment.nodeName])
                        object[xmlFragment.nodeName] = Object.create(null);
                    var partialObject = object[xmlFragment.nodeName];
                    if(typeof map[xmlFragment.nodeName] === 'function') {
                        var key = map[xmlFragment.nodeName](xml, xmlFragment);
                        if(key) {
                            partialObject = partialObject[key] = Object.create(null);
                            partialObject.id = key;
                            var name = Sisulator.replacer(
                                    xmlFragment.nodeName + listSuffix
                            );
                            // reference the object from the array
                            if(!object[name])
                                object[name] = [];
                            object[name].push(key);
                        }
                    }
                    // process attributes
                    if (xmlFragment.attributes.length > 0) {
                        for (var j = 0; j < xmlFragment.attributes.length; j++) {
                            var attribute = xmlFragment.attributes.item(j);
                            partialObject[attribute.nodeName] = attribute.nodeValue;
                        }
                    }
                    // process children
                    var child = xmlFragment.firstChild;
                    if(child) objectifier(child, map, partialObject);
                }
            }
            // text node
            else if(xmlFragment.nodeType === 3) {
                // add content with underscore naming
                if(xmlFragment.nodeValue)
                    object['_' + xmlFragment.parentNode.nodeName] = xmlFragment.nodeValue;
            }
            // process siblings
            var sibling = xmlFragment.nextSibling;
            if(sibling) objectifier(sibling, map, object);
            return object;
        }
        // just initialize and return the result
        return objectifier(xml.documentElement, map, {});
    },
    sisulate: function(xml, directive) {
        // objectify the xml
        var schema = Sisulator.objectify(xml, Sisulator.MAP).schema;
        var cacheDisabler = '';
        if(DEBUG) cacheDisabler = '?r=' + Math.random();
        // this variable holds the result
        var _sisula_ = '';

        // process and evaluate all sisulas in the directive
        var xmlhttp = new window.XMLHttpRequest();
        xmlhttp.open("GET", directive + cacheDisabler, false);
        xmlhttp.send(null);
        var response = xmlhttp.responseText.replace(/\r/g, ''); // unify line breaks
        // only non-empty lines that are not comments (starts with #)
        var scripts = response.match(/^[^#].+/gm);
        var script;
        var splitter = /\/\*~([\s\S]*?)~\*\//g; // split JS /*~ sisula template ~*/ JS
        // process every sisula
        for(var s = 0; script = scripts[s]; s++) {
            xmlhttp.open("GET", script.trim() + cacheDisabler, false);
            xmlhttp.send(null);
            var sisula = xmlhttp.responseText;
            // split language into JavaScript and SQL template components
            var sisulets = sisula.split(splitter);
            // substitute from SQL template to JavaScript
            for(var i = 1; i < sisulets.length; i+=2) {
                // honor escaped dollar signs
                sisulets[i] = sisulets[i].replace(/[$]{2}/g, '§DOLLAR§'); // escaping dollar signs
                sisulets[i] = sisulets[i].replace(/["]{2}/g, '§QUOTED§'); // escaping double quotes
                sisulets[i] = sisulets[i].replace(/[$]{([\S\s]*?)}[$]/g, '" + $1 + "'); // multi-expression
                sisulets[i] = sisulets[i].replace(/[$]\(([\S\s]*?)\)\?[^\S\n]*([^:\n]*)[:]?[^\S\n]*(.*)/g, '" + ($1 ? "$2" : "$3") + "'); // conditional
                sisulets[i] = sisulets[i].replace(/[\$]([\w.]*?)(?:([\$])|([^\w.]|$))/g, '" + ($1 ? $1 : "") + "$3'); // single
                sisulets[i] = sisulets[i].replace(/(\r\n|\n|\r)/g, '\\n" +\n'); // line breaks
                sisulets[i] = sisulets[i].replace(/^/gm, '"'); // start of line
                sisulets[i] = '_sisula_+=' + sisulets[i] + '";'; // variable assignment
            }
            // join the parts together again (now all JavaScript)
            sisula = sisulets.join('');
            try {
                if(DEBUG && console && console.log)
                    console.log(sisula);
                // this eval needs schema and _sisula_ to be defined
                eval(sisula);
            }
            catch(e) {
                if(DEBUG && console && console.error && script)
                    console.error('The script ' + script + ' could not be executed.');
                throw e;
            }
        }
        _sisula_ = _sisula_.replace(/§DOLLAR§/g, '$'); // unescaping dollar signs
        _sisula_ = _sisula_.replace(/§QUOTED§/g, '"'); // unescaping double quotes
        _sisula_ = _sisula_.replace(/^\s*[\r\n]/gm, ''); // remove empty lines
        _sisula_ = _sisula_.replace(/(\S+[^\S\n])(?:[^\S\n]+)/gm, '$1'); // consume multiple spaces, but not indentation
        return _sisula_;
    }
};

