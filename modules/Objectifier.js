var Objectifier = {
    objectify: function(xml, map) {
        var listSuffix = 's';
        function objectifier(xmlFragment, map, object) {
            if(xmlFragment.nodeType === 1) {
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
                            if(!object[name])
                                object[name] = [];
                            object[name].push(key);
                        }
                    }
                    if (xmlFragment.attributes.length > 0) {
                        for (var j = 0; j < xmlFragment.attributes.length; j++) {
                            var attribute = xmlFragment.attributes.item(j);
                            partialObject[attribute.nodeName] = attribute.nodeValue;
                        }
                    }
                    var child = xmlFragment.firstChild;
                    if(child) objectifier(child, map, partialObject);
                }
            }
            else if(xmlFragment.nodeType === 3) {
                if(xmlFragment.nodeValue)
                    object['_' + xmlFragment.parentNode.nodeName] = xmlFragment.nodeValue;
            }
            var sibling = xmlFragment.nextSibling;
            if(sibling) objectifier(sibling, map, object);
            return object;
        }
        return objectifier(xml.documentElement, map, {});
    }
};
