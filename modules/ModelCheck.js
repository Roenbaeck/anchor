// ModelCheck: what has to be right in an Anchor model before anything is generated from it. It finds the mistakes that make
// a generator give an error far from their cause, or no error and names such as GEN_undefined: a setting missing from the
// <metadata> of the model, a knot or a role that refers to something that is not there, two constructs with the same
// mnemonic, an attribute that is both knotted and not, a tie with fewer than two anchors or nexuses.
//
// It is the rules of anchor.xsd that a program can check without an XML Schema 1.1 processor, plus the settings that the
// generators read. It reads the element that is the schema through the few parts of the DOM that both a browser and
// modules/DomFacade.js have (nodeType, nodeName, getAttribute, childNodes), so it runs in the generator in Snowflake
// (tools/build-snowflake-generator.ps1) and under Jint as well. ES5, no dependencies.
//
//   ModelCheck.problems(schemaElement)  an array of messages, empty if the model is right
//   ModelCheck.assert(schemaElement)    throws an Error that lists the problems, if there are any
//   ModelCheck.metadata                 the settings that a model needs, with the value that the modeler would give them
var ModelCheck = (function () {
    // What the generators read from the <metadata> of the model, with the modeler's default for a Snowflake model. The
    // generators do not fill in what is missing, so a missing setting is an error here. databaseTarget and temporalization
    // are not in the list: the generator sets them (the temporalization may come from its arguments).
    var METADATA = {
        changingRange: 'datetime', encapsulation: 'public', identity: 'int', metadataPrefix: 'Metadata', metadataType: 'int',
        metadataUsage: 'true', changingSuffix: 'ChangedAt', identitySuffix: 'ID', positIdentity: 'int', positGenerator: 'true',
        positingRange: 'datetime', positingSuffix: 'PositedAt', positorRange: 'tinyint', positorSuffix: 'Positor',
        reliabilityRange: 'decimal(5,2)', reliabilitySuffix: 'Reliability', defaultReliability: '1', deleteReliability: '0',
        assertionSuffix: 'Assertion', partitioning: 'false', entityIntegrity: 'true', restatability: 'true',
        idempotency: 'false', assertiveness: 'true', naming: 'improved', positSuffix: 'Posit', annexSuffix: 'Annex',
        chronon: 'timestamp_ntz(9)', now: 'sysdate()', dummySuffix: 'Dummy', versionSuffix: 'Version',
        statementTypeSuffix: 'StatementType', checksumSuffix: 'Checksum', businessViews: 'true', decisiveness: 'true',
        equivalence: 'false', equivalentSuffix: 'EQ', equivalentRange: 'tinyint', deletability: 'false',
        deletablePrefix: 'Deletable', deletionSuffix: 'Deleted', privacy: 'Ignore', checksum: 'false', triggers: 'true',
        knotAliases: 'false', naturalKeyAttributes: 'true'
    };

    function elements(parent, name) {
        var found = [];
        var nodes = parent.childNodes || [];
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeType === 1 && (name === undefined || nodes[i].nodeName === name)) found.push(nodes[i]);
        }
        return found;
    }

    function attribute(element, name) {
        var value = element.getAttribute(name);
        return value === null || value === undefined ? null : value;
    }

    function blank(value) {
        return value === null || /^\s*$/.test(value);
    }

    function problems(root) {
        var found = [];
        function problem(where, message) { found.push((where ? where + ': ' : '') + message); }

        if (!root || root.nodeName !== 'schema') {
            problem('', 'the XML has to start with a <schema> element, as the Anchor Modeler saves a model (Generate > XML code)');
            return found;
        }

        // the settings of the model
        var metadataElements = elements(root, 'metadata');
        if (metadataElements.length !== 1) {
            problem('', 'the schema has to have one <metadata> element of its own, and it has ' + metadataElements.length);
        } else {
            var metadata = metadataElements[0];
            var missing = [];
            for (var name in METADATA) {
                if (Object.prototype.hasOwnProperty.call(METADATA, name) && attribute(metadata, name) === null) {
                    missing.push(name + '="' + METADATA[name] + '"');
                }
            }
            if (missing.length > 0) {
                problem('<metadata>', 'these settings are missing (the generator does not fill in a setting; the values are what the modeler would give a ' +
                    'Snowflake model): ' + missing.join(', '));
            }
            for (var setting in METADATA) {
                if (!Object.prototype.hasOwnProperty.call(METADATA, setting)) continue;
                var given = attribute(metadata, setting);
                if (given !== null && (METADATA[setting] === 'true' || METADATA[setting] === 'false') && given !== 'true' && given !== 'false') {
                    problem('<metadata>', setting + ' has to be "true" or "false", not "' + given + '"');
                }
            }
            var naming = attribute(metadata, 'naming');
            if (naming !== null && naming !== 'original' && naming !== 'improved') {
                problem('<metadata>', 'naming has to be "original" or "improved", not "' + naming + '"');
            }
            var temporalization = attribute(metadata, 'temporalization');
            if (temporalization !== null && temporalization !== 'uni' && temporalization !== 'bi' && temporalization !== 'crt') {
                problem('<metadata>', 'temporalization has to be "uni", "bi" or "crt", not "' + temporalization + '"');
            }
        }

        var knots = elements(root, 'knot'), anchors = elements(root, 'anchor'), nexuses = elements(root, 'nexus'), ties = elements(root, 'tie');
        var knotMnemonics = {}, entityMnemonics = {}, anchorMnemonics = {}, nexusMnemonics = {};

        function required(where, element, names) {
            for (var i = 0; i < names.length; i++) {
                if (blank(attribute(element, names[i]))) problem(where, 'it has no ' + names[i]);
            }
        }

        for (var k = 0; k < knots.length; k++) {
            var knot = knots[k], knotName = 'knot ' + (attribute(knot, 'mnemonic') || '(without mnemonic)');
            required(knotName, knot, ['mnemonic', 'descriptor', 'identity', 'dataRange']);
            var knotMnemonic = attribute(knot, 'mnemonic');
            if (knotMnemonic !== null) {
                if (knotMnemonics[knotMnemonic]) problem(knotName, 'another knot has the same mnemonic');
                knotMnemonics[knotMnemonic] = true;
            }
        }

        function entity(element, kind, mnemonics) {
            var mnemonic = attribute(element, 'mnemonic'), where = kind + ' ' + (mnemonic || '(without mnemonic)');
            required(where, element, ['mnemonic', 'descriptor', 'identity']);
            if (mnemonic !== null) {
                if (entityMnemonics[mnemonic]) problem(where, 'another anchor or nexus has the same mnemonic');
                if (knotMnemonics[mnemonic]) problem(where, 'a knot has the same mnemonic');
                entityMnemonics[mnemonic] = true;
                mnemonics[mnemonic] = true;
            }
            return where;
        }

        // the mnemonics of all entities first, since a role refers to one declared later
        for (var a = 0; a < anchors.length; a++) entity(anchors[a], 'anchor', anchorMnemonics);
        for (var n = 0; n < nexuses.length; n++) entity(nexuses[n], 'nexus', nexusMnemonics);

        function attributesOf(owner, where) {
            var seen = {}, list = elements(owner, 'attribute');
            for (var i = 0; i < list.length; i++) {
                var attributeElement = list[i], mnemonic = attribute(attributeElement, 'mnemonic');
                var here = where + ', attribute ' + (mnemonic || '(without mnemonic)');
                required(here, attributeElement, ['mnemonic', 'descriptor']);
                if (mnemonic !== null) {
                    if (seen[mnemonic]) problem(here, 'another attribute of the ' + where + ' has the same mnemonic');
                    seen[mnemonic] = true;
                }
                var knotRange = attribute(attributeElement, 'knotRange'), dataRange = attribute(attributeElement, 'dataRange');
                if (blank(knotRange) === blank(dataRange)) {
                    problem(here, blank(knotRange) ? 'it has neither a dataRange (its own values) nor a knotRange (a knot)' :
                        'it has both a dataRange and a knotRange; it is either knotted or not');
                } else if (!blank(knotRange) && !knotMnemonics[knotRange]) {
                    problem(here, 'its knotRange "' + knotRange + '" is not a knot of the model');
                }
            }
        }

        function keysIn(owner) {
            var list = [];
            var stack = [owner];
            while (stack.length > 0) {
                var current = stack.pop(), children = elements(current);
                for (var i = 0; i < children.length; i++) {
                    if (children[i].nodeName === 'key') list.push(children[i]); else stack.push(children[i]);
                }
            }
            return list;
        }

        var routes = {};   // 'entity route' that some key makes up
        var allKeys = keysIn(root);
        for (var key = 0; key < allKeys.length; key++) {
            var of = attribute(allKeys[key], 'of'), route = attribute(allKeys[key], 'route');
            if (blank(of) || blank(route)) {
                problem('key', 'a key needs both an "of" (the anchor or nexus it is a key of) and a "route"');
            } else if (!entityMnemonics[of]) {
                problem('key', 'a key of "' + of + '", which is not an anchor or nexus of the model');
            } else routes[of + ' ' + route] = true;
        }

        function identifiersOf(owner, where) {
            var list = elements(owner, 'identifier');
            for (var i = 0; i < list.length; i++) {
                var route = attribute(list[i], 'route'), mnemonic = attribute(owner, 'mnemonic');
                if (blank(route)) problem(where, 'an identifier has no route');
                else if (!routes[mnemonic + ' ' + route]) problem(where, 'the identifier route "' + route + '" is not made up by any key of ' + mnemonic + ' (<key of="' + mnemonic + '" route="' + route + '" .../> in its attributes or roles)');
            }
        }

        function roles(owner, where) {
            var list = elements(owner, 'role'), anchorRoles = 0;
            for (var i = 0; i < list.length; i++) {
                var role = attribute(list[i], 'role'), type = attribute(list[i], 'type');
                var here = where + ', role ' + (role || '(without name)');
                required(here, list[i], ['role', 'type']);
                if (type !== null) {
                    if (!entityMnemonics[type] && !knotMnemonics[type]) problem(here, 'its type "' + type + '" is not an anchor, nexus or knot of the model');
                    if (anchorMnemonics[type]) anchorRoles++;
                }
                var identifier = attribute(list[i], 'identifier');
                if (identifier !== null && identifier !== 'true' && identifier !== 'false') problem(here, 'identifier has to be "true" or "false", not "' + identifier + '"');
            }
            return { list: list, anchorRoles: anchorRoles };
        }

        for (var ai = 0; ai < anchors.length; ai++) {
            var anchorWhere = 'anchor ' + (attribute(anchors[ai], 'mnemonic') || '(without mnemonic)');
            attributesOf(anchors[ai], anchorWhere);
            identifiersOf(anchors[ai], anchorWhere);
        }
        for (var ni = 0; ni < nexuses.length; ni++) {
            var nexusWhere = 'nexus ' + (attribute(nexuses[ni], 'mnemonic') || '(without mnemonic)');
            attributesOf(nexuses[ni], nexusWhere);
            identifiersOf(nexuses[ni], nexusWhere);
            var nexusRoles = roles(nexuses[ni], nexusWhere);
            if (nexusRoles.anchorRoles < 1) problem(nexusWhere, 'a nexus has to have a role that is an anchor');
            for (var nr = 0; nr < nexusRoles.list.length; nr++) {
                if (attribute(nexusRoles.list[nr], 'identifier') === 'true') {
                    problem(nexusWhere + ', role ' + (attribute(nexusRoles.list[nr], 'role') || '(without name)'), 'the identity of a nexus identifies it, so a role of it is never an identifier');
                }
            }
        }

        var tieNames = {};
        for (var ti = 0; ti < ties.length; ti++) {
            var tieRoles = roles(ties[ti], 'tie ' + (ti + 1));
            var parts = [], seenRoles = {}, entityRoles = 0;
            for (var tr = 0; tr < tieRoles.list.length; tr++) {
                var type = attribute(tieRoles.list[tr], 'type') || '', roleName = attribute(tieRoles.list[tr], 'role') || '';
                parts.push(type + '_' + roleName);
                if (entityMnemonics[type]) entityRoles++;
                if (seenRoles[type + ' ' + roleName]) problem('tie ' + parts.join('_'), 'two of its roles are the same type with the same role name, "' + type + ' ' + roleName + '"');
                seenRoles[type + ' ' + roleName] = true;
            }
            var tieName = parts.join('_');
            if (tieRoles.list.length < 2) problem('tie ' + tieName, 'a tie has at least two roles, and it has ' + tieRoles.list.length);
            else if (entityRoles < 2) problem('tie ' + tieName, 'a tie has to have at least two roles that are anchors or nexuses (the same one twice is fine), and it has ' + entityRoles);
            if (tieNames[tieName]) problem('tie ' + tieName, 'another tie has the same roles, so the same name');
            tieNames[tieName] = true;
        }

        return found;
    }

    function assertValid(root) {
        var found = problems(root);
        if (found.length === 0) return;
        throw new Error('The model has ' + found.length + (found.length === 1 ? ' problem' : ' problems') + ', so nothing was generated:\n  - ' +
            found.join('\n  - ') + '\nCorrect the model XML and generate again.');
    }

    return { problems: problems, assert: assertValid, metadata: METADATA };
})();
