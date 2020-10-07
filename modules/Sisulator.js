var Sisulator = {
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
                        object[xmlFragment.nodeName] = new Object();
                    var partialObject = object[xmlFragment.nodeName];
                    if(typeof map.key[xmlFragment.nodeName] === 'function') {
                        var key = map.key[xmlFragment.nodeName](xml, xmlFragment);
                        if(key) {
                            partialObject = partialObject[key] = new Object();
                            partialObject.id = key;
                            var name = xmlFragment.nodeName + listSuffix;
                            name = map.replacer ? map.replacer(name) : name;
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
    sisulate: async function(xml, map, directives) {
        // objectify the xml
        var jsonObject = Sisulator.objectify(xml, map);
        // consistent with other line breaks and without comments
        //jsonObject[map.root]._xml = xml.replace(/(\r\n|\n|\r)/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
        eval("var " + map.root + " = jsonObject." + map.root);
        // this variable holds the result
        var _sisula_ = '';
        var scripts = await directives();
        scripts = scripts.replace(/\r/g, ''); // unify line breaks
        // only non-empty lines that are not comments (starts with #)
        scripts = scripts.match(/^[^#].+/gm);
        if(scripts) {
            var script;
            var splitter = /\/\*~|~\*\//g; // split JS /*~ sisula template ~*/ JS
            // process every sisula
            for(var scriptIndex = 0; script = scripts[scriptIndex]; scriptIndex++) {
                script = script.replace(/^\s+/,'').replace(/\s+$/,''); // trim
                var sisula = await directives(script);
                // make sure everything starts with JavaScript (empty row)
                sisula = '\n' + sisula;
                // split language into JavaScript and SQL template components
                var sisulets = sisula.split(splitter);
                // substitute from SQL template to JavaScript
                for(var i = 1; i < sisulets.length; i+=2) {
                    // honor escaped dollar signs
                    sisulets[i] = sisulets[i].replace(/[$]{2}/g, '§DOLLAR§'); // escaping dollar signs
                    sisulets[i] = sisulets[i].replace(/["]{2}/g, '§DOUBLE§'); // escaping double quotes
                    sisulets[i] = sisulets[i].replace(/["]{1}/g, '§SINGLE§'); // escaping single quotes
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
            _sisula_ = _sisula_.replace(/§SINGLE§/g, '\"'); // unescaping double quotes
            _sisula_ = _sisula_.replace(/§DOUBLE§/g, '"'); // unescaping double quotes
            _sisula_ = _sisula_.replace(/^\s*[\r\n]/gm, ''); // remove empty lines
            _sisula_ = _sisula_.replace(/(\S+[^\S\n])(?:[^\S\n]+)/gm, '$1'); // consume multiple spaces, but not indentation
        }
        return _sisula_;
    }
};


