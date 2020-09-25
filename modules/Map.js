var MAP = {
    description: 'models from Anchor Modeling, http://www.anchormodeling.com',
    // name of the root element and resulting JSON object
    root: 'schema',
    // define 'keys' for elements that may occur more than once
    // on the same level in the XML document
    key: {
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
        },
        // WIP: keys sisula
        key: function(xml, fragment) {
            return fragment.getAttribute('of') + 
                   '|' +
                   fragment.getAttribute('route') + 
                   '|' +
                   fragment.getAttribute('stop');
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
    }
};

