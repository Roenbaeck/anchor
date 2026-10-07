// derive.js: the values the SQL Server templates need that Anchor's sisulets compute with helper
// functions or small expressions at generation time. The resolver runs it after Helpers.js and
// the naming conventions, in the same scope, so it can use their helpers and iterators.
//
// Only facts are derived here, never SQL. A template reaches only what the JSON holds, so what a
// sisulet asks of a helper or an array (a count, a length) is computed here and stored as data.
//
// Every group of templates has a block of its own, so that the work on them merges cleanly.

// ---- common ----
//   attributeCount  the number of attributes of an anchor or nexus
var anchor;
while (anchor = schema.nextAnchor())
    anchor.attributeCount = anchor.attributes ? anchor.attributes.length : 0;
// ---- end common ----

// ---- tables: CreateKnots, CreateNexuses, CreateAttributes, CreateTies, equivalence, rewinders, encryption, CLR, descriptions ----
//   attributeCount       the number of attributes of a nexus (the common block has it for anchors)
//   roleCount            the number of roles of a nexus or tie
//   hasDescription       whether the construct (knot, anchor, nexus, tie, role, attribute) has a description
//   descriptionText      the description as the body of a SQL string literal (single quotes doubled), or null
//   hasChecksums         whether the CLR (the MD5 function) is needed: a knot or an anchor's attribute has a checksum
//   encryptionGroups     the encryption groups of the anchors' attributes, in order of first use, each as
//                        {name, attributes: [{name}]}; the attributes are listed last first, as the original does
(function () {
    function deriveDescription(construct) {
        var text = construct.description && construct.description._description;
        construct.hasDescription = !!(text && text.length > 0);
        construct.descriptionText = construct.hasDescription ? String(text).replace(/'/g, "''") : null;
    }
    var knot, anchor, attribute, nexus, tie, role;
    var checksums = false;
    while (knot = schema.nextKnot()) {
        deriveDescription(knot);
        if (knot.hasChecksum()) checksums = true;
    }
    while (anchor = schema.nextAnchor()) {
        deriveDescription(anchor);
        while (attribute = anchor.nextAttribute())
            if (attribute.hasChecksum()) checksums = true;
    }
    while (attribute = schema.nextAttribute())
        deriveDescription(attribute);
    while (nexus = schema.nextNexus()) {
        deriveDescription(nexus);
        nexus.attributeCount = nexus.attributes ? nexus.attributes.length : 0;
        nexus.roleCount = nexus.roles ? nexus.roles.length : 0;
        while (role = nexus.nextRole()) deriveDescription(role);
    }
    while (tie = schema.nextTie()) {
        deriveDescription(tie);
        tie.roleCount = tie.roles ? tie.roles.length : 0;
        while (role = tie.nextRole()) deriveDescription(role);
    }
    schema.hasChecksums = checksums;

    var groups = {}, group, names = [];
    while (anchor = schema.nextAnchor()) {
        while (attribute = anchor.nextAttribute()) {
            if (group = attribute.getEncryptionGroup()) {
                if (!groups[group]) groups[group] = [];
                groups[group].push(attribute.name);
            }
        }
    }
    var list = [];
    for (group in groups) {
        var members = [], member;
        while ((member = groups[group].pop()) !== undefined) members.push({ name: member });
        list.push({ name: group, attributes: members });
    }
    schema.encryptionGroups = list;
})();
// ---- end tables ----

// ---- triggers-a: attribute and anchor triggers, restatement constraints ----
//   hasUnrestatableAttributes  whether some historized attribute may not store restatements
//   hasUnrestatableTies        whether some historized tie with roles outside of its identifier
//                              may not store restatements
var attribute, tie;
schema.hasUnrestatableAttributes = false;
while (attribute = schema.nextAttribute())
    if (attribute.isHistorized() && !attribute.isRestatable())
        schema.hasUnrestatableAttributes = true;
schema.hasUnrestatableTies = false;
while (tie = schema.nextHistorizedTie())
    if (tie.values.length > 0 && !tie.isRestatable())
        schema.hasUnrestatableTies = true;
// ---- end triggers-a ----

// ---- triggers-b: nexus and tie triggers, key generators ----
//   equivalentKnotColumnName  on a knotted nexus attribute: the column that carries the equivalent of its
//                             knot, the attribute's own with the improved naming, else the knot's
(function () {
    var nexus, attribute;
    while (nexus = schema.nextNexus()) {
        while (attribute = nexus.nextAttribute()) {
            if (attribute.isKnotted())
                attribute.equivalentKnotColumnName = schema.IMPROVED ? attribute.knotEquivalentColumnName : attribute.knot.equivalentColumnName;
        }
    }
})();
// ---- end triggers-b ----

// ---- perspectives-a: anchor and nexus perspectives ----
//   chronicleAttributes  the chronicle attributes of a nexus (static ones with a chronicle number above
//                        zero) in chronicle order, as nexus.nextChronicle() visits them
var perspectiveNexus;
while (perspectiveNexus = schema.nextNexus()) {
    perspectiveNexus._buildChronicleList();
    perspectiveNexus.chronicleAttributes = [];
    for (var perspectiveChronicle = 0; perspectiveChronicle < perspectiveNexus._chronicleSorted.length; perspectiveChronicle++)
        perspectiveNexus.chronicleAttributes.push(perspectiveNexus._chronicleSorted[perspectiveChronicle].mnemonic);
}
// ---- end perspectives-a ----

// ---- perspectives-b: tie perspectives, keys ----
//   keyRoutes  of an anchor or nexus that has keys: one item for each route, in the order of its keys,
//              since a template cannot walk an object (keys is an object of routes, and a route's
//              stops an object of stops). Each item holds
//     route, name, tableName, changingColumnName, historized   the route and what the naming convention gave the key
//     stopCount                  the number of stops of the route
//     viewStopCount              the number of stops as CreateKeys.js counts them in the key view: twice the
//                                number when the natural key table is generated (its table section has
//                                already assigned the count, and the view section counts on from there)
//     branchCount                the number of branches of the route
//     historizedAttributeCount   the number of stops whose attribute is historized
//     attributeStops             the stops that have an attribute: routedValueColumnName,
//                                routedChangingColumnName, dataRange, uniqueColumnName (the column that the
//                                unique constraint names at this position: CreateKeys.js takes the column of the
//                                stop before, the last stop's for the first, which is why this is not the stop's own),
//                                isLastStop (this is the last stop of the route, with or without an attribute)
//     lastAttribute              the attribute of the last stop: capsule, name, entityReferenceName, changingColumnName
//     branches                   one item for each branch, in the order that for..in gives the branch numbers:
//                                componentCount, idColumn, valueColumnName, qualifiedType, isHistorized,
//                                changingColumnName, capsule and name (of the attribute that ends the branch), and
//                                steps: for a branch of more than one component, the tables to join, as
//                                { isTie, tieCapsule, tieName, mnemonic, hasAnchor, anchorCapsule, anchorName,
//                                  anchorMnemonic, anchorIdentityColumnName, roleColumnName } and
//                                { isAttribute, capsule, name, mnemonic, entityReferenceName,
//                                  referencedAnchorMnemonic, referencedAnchorIdentityColumnName }
var pbReferencedAnchor = null; // as in CreateKeys.js, the anchor last joined leaks from one branch to the next
function pbDeriveKeyRoutes(entity) {
    if (!entity.keys) return;
    var routes = [], routeName, key, stopName, components, component, attribute, i, j;
    for (routeName in entity.keys) {
        key = entity.keys[routeName];
        components = [];
        for (stopName in key.stops) components.push(key.stops[stopName]);
        var count = components.length, branches = {}, branchCount = 0, historized = 0, attributeStops = [], lastAttribute = null;
        for (i = 0; i < count; i++) {
            component = components[i];
            attribute = component.attribute;
            if (component.branch) {
                if (!branches[component.branch]) { branchCount++; branches[component.branch] = []; }
                branches[component.branch].push(component);
            }
            if (attribute) {
                if (attribute.timeRange) historized++;
                // CreateKeys.js names the column of the stop before, the last stop's for the first. A stop that
                // has no routed column (one of a tie) gives undefined: the text "undefined" in front of a comma, nothing
                // where there is no comma.
                var previous = components[(i + count - 1) % count].routedValueColumnName;
                var unique = previous !== undefined ? previous : (key.historized || i != count - 1 ? 'undefined' : '');
                attributeStops.push({
                    routedValueColumnName: component.routedValueColumnName,
                    routedChangingColumnName: component.routedChangingColumnName,
                    dataRange: attribute.dataRange,
                    uniqueColumnName: unique,
                    isLastStop: i == count - 1
                });
            }
        }
        attribute = components[count - 1] ? components[count - 1].attribute : null;
        if (attribute) lastAttribute = {
            capsule: attribute.capsule, name: attribute.name,
            entityReferenceName: attribute.entityReferenceName, changingColumnName: attribute.changingColumnName
        };
        var branchItems = [];
        for (var branchName in branches) {
            var list = branches[branchName], endpoint = list[list.length - 1], startpoint = list[0];
            attribute = endpoint.attribute || {};
            var item = {
                componentCount: list.length,
                idColumn: startpoint.tie ? startpoint.role.columnName : attribute.entityReferenceName,
                valueColumnName: attribute.valueColumnName,
                qualifiedType: endpoint.routedValueColumnName,
                isHistorized: !!attribute.timeRange,
                changingColumnName: attribute.changingColumnName,
                capsule: attribute.capsule,
                name: attribute.name,
                steps: []
            };
            if (list.length > 1) {
                for (j = 0; component = list[j]; j++) {
                    var tie = component.tie, second;
                    if (tie) {
                        component = list[++j];
                        second = component ? component.role : null;
                        var step = {
                            isTie: true, tieCapsule: tie.capsule, tieName: tie.name,
                            mnemonic: 'S' + list[j - 1].stop + 'S' + (component ? component.stop : undefined),
                            hasAnchor: false
                        };
                        if (second && second.isAnchorRole()) {
                            pbReferencedAnchor = second.anchor;
                            step.hasAnchor = true;
                            step.anchorCapsule = pbReferencedAnchor.capsule;
                            step.anchorName = pbReferencedAnchor.name;
                            step.anchorMnemonic = pbReferencedAnchor.mnemonic;
                            step.anchorIdentityColumnName = pbReferencedAnchor.identityColumnName;
                            step.roleColumnName = second.columnName;
                        }
                        item.steps.push(step);
                    }
                    else if (component.attribute) {
                        attribute = component.attribute;
                        item.steps.push({
                            isAttribute: true, capsule: attribute.capsule, name: attribute.name, mnemonic: attribute.mnemonic,
                            entityReferenceName: attribute.entityReferenceName,
                            referencedAnchorMnemonic: pbReferencedAnchor ? pbReferencedAnchor.mnemonic : '',
                            referencedAnchorIdentityColumnName: pbReferencedAnchor ? pbReferencedAnchor.identityColumnName : ''
                        });
                    }
                }
            }
            branchItems.push(item);
        }
        routes.push({
            route: routeName, name: key.name, tableName: key.tableName, changingColumnName: key.changingColumnName,
            historized: !!key.historized,
            stopCount: count,
            viewStopCount: schema.NATURAL_KEY_ATTRIBUTES ? 2 * count : count,
            branchCount: branchCount,
            historizedAttributeCount: historized,
            attributeStops: attributeStops,
            lastAttribute: lastAttribute,
            branches: branchItems
        });
    }
    entity.keyRoutes = routes;
}
var pbKeyAnchor, pbKeyNexus;
while (pbKeyAnchor = schema.nextAnchor()) pbDeriveKeyRoutes(pbKeyAnchor);
while (schema.nextNexus && (pbKeyNexus = schema.nextNexus())) pbDeriveKeyRoutes(pbKeyNexus);
// ---- end perspectives-b ----

// ---- business: the business perspectives ----
// ---- end business ----

// ---- schema tracking ----
// ---- end schema tracking ----
