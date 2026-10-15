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
//   hasChecksums         whether the CLR (the MD5 function) is needed: a knot or an attribute, of an anchor or a
//                        nexus, has a checksum
//   encryptionGroups     the encryption groups of the attributes, of anchors and nexuses, in order of first use,
//                        each as {name, attributes: [{name}]}; the attributes are listed last first, as the original does
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
    while (anchor = schema.nextAnchor())
        deriveDescription(anchor);
    while (attribute = schema.nextAttribute()) {
        deriveDescription(attribute);
        if (attribute.hasChecksum()) checksums = true;
    }
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
    while (attribute = schema.nextAttribute()) {
        if (group = attribute.getEncryptionGroup()) {
            if (!groups[group]) groups[group] = [];
            groups[group].push(attribute.name);
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

// ---- keys: natural keys ----
//   schema.naturalKeys   one item for each route of each anchor and nexus, as naturalKeys() in Helpers.js describes it,
//                        with what SQL Server adds:
//     the type of a checksum   varbinary(16), the MD5 the checksum columns hold
//     usable                   also false for a value that cannot be compared with = and has no checksum: a geography,
//                              geometry, xml, text, ntext or image
//     indexable                whether every column a value is compared on can be a key of the unique index of the key
//                              table: not a (max) type
//     unindexable              the first column that cannot, when indexable is false
schema.naturalKeys = naturalKeys();
(function () {
    var k, c, key, column;
    for (k = 0; k < schema.naturalKeys.length; k++) {
        key = schema.naturalKeys[k];
        key.indexable = true;
        key.unindexable = null;
        for (c = 0; c < key.columns.length; c++) {
            column = key.columns[c];
            if (column.isChecksum) column.type = 'varbinary(16)';
        }
        for (c = 0; c < key.matches.length; c++) {
            column = key.matches[c];
            if (column.isChecksum) {
                column.type = 'varbinary(16)';
                continue;
            }
            if (key.usable && /^\s*(geography|geometry|xml|text|ntext|image)\b/i.test(column.type || '')) {
                key.usable = false;
                key.problem = column.name + ' is a ' + column.type + ', which cannot be compared, and it has no checksum';
            }
            if (key.indexable && /\(\s*max\s*\)/i.test(column.type || '')) {
                key.indexable = false;
                key.unindexable = column.name;
            }
        }
        if (!key.usable) {
            key.notes = [];
            key.joins = [];
            key.columns = [];
            key.matches = [];
        }
    }
})();
// ---- end keys ----

// ---- business: the business perspectives ----
// ---- end business ----

// ---- schema tracking ----
//   serialization.chunks  the model's XML (serialization._serialization) cut into pieces of at most 3000
//                         characters, as objects with a text. SQL Server reads a string value from JSON
//                         as at most 4000 characters (JSON_VALUE), so the whole text, which is tens of
//                         thousands, can only reach a template in pieces. A piece never ends inside a
//                         surrogate pair.
if (schema.serialization && typeof schema.serialization._serialization === 'string') {
    var serializedText = schema.serialization._serialization, serializedPieces = [], serializedFrom = 0, serializedTo;
    while (serializedFrom < serializedText.length) {
        serializedTo = Math.min(serializedFrom + 3000, serializedText.length);
        if (serializedTo < serializedText.length && /[\uD800-\uDBFF]/.test(serializedText.charAt(serializedTo - 1)))
            serializedTo--;
        serializedPieces.push({ text: serializedText.substring(serializedFrom, serializedTo) });
        serializedFrom = serializedTo;
    }
    schema.serialization.chunks = serializedPieces;
}
// ---- end schema tracking ----

// ---- bi-crt attributes: restatement constraints ----
//   hasHistorizedAttributes  whether some attribute, of an anchor or a nexus, is historized (crt: the restatement
//                            finder functions are made for every one of them; bi uses hasUnrestatableAttributes)
(function () {
    var attribute;
    schema.hasHistorizedAttributes = false;
    while (attribute = schema.nextAttribute())
        if (attribute.isHistorized())
            schema.hasHistorizedAttributes = true;
})();
// ---- end bi-crt attributes ----

// ---- bi-crt tieviews: tie restatement constraints ----
//   hasHistorizedTiesWithValues  whether some historized tie has roles outside of its identifier (crt writes a
//                                restatement finder for each, whether or not it may store restatements)
(function () {
    var tie;
    schema.hasHistorizedTiesWithValues = false;
    while (tie = schema.nextHistorizedTie())
        if (tie.values.length > 0)
            schema.hasHistorizedTiesWithValues = true;
})();
// ---- end bi-crt tieviews ----
