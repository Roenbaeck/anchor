
var MAP = {
    key: {
        knot: function (xml, fragment) {
            return fragment.getAttribute('mnemonic');
        },
        anchor: function (xml, fragment) {
            return fragment.getAttribute('mnemonic');
        },
        attribute: function (xml, fragment) {
            return fragment.getAttribute('mnemonic');
        },
        tie: function (xml, fragment) {
            var roles = xml.evaluate(
                '*[@role]',
                fragment,
                null,
                XPathResult.ORDERED_NODE_ITERATOR_TYPE, // document order
                null
            );
            var key = '', role = roles.iterateNext();
            while (role) {
                key += role.getAttribute('type') + '_' + role.getAttribute('role');
                role = roles.iterateNext();
                if (role) key += '_';
            }
            return key;
        },
        anchorRole: function (xml, fragment) {
            return fragment.getAttribute('type') + '_' + fragment.getAttribute('role');
        },
        knotRole: function (xml, fragment) {
            return fragment.getAttribute('type') + '_' + fragment.getAttribute('role');
        }
    },
    // used to replace certain element names with others
    replacer: function (name) {
        switch (name) {
            case 'anchorRoles':
                return 'roles';
            case 'knotRoles':
                return 'roles';
            default:
                return name;
        }
    },
}
