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
// ---- end triggers-a ----

// ---- triggers-b: nexus and tie triggers, key generators ----
// ---- end triggers-b ----

// ---- perspectives-a: anchor and nexus perspectives ----
// ---- end perspectives-a ----

// ---- perspectives-b: tie perspectives, keys ----
// ---- end perspectives-b ----

// ---- business: the business perspectives ----
// ---- end business ----

// ---- schema tracking ----
// ---- end schema tracking ----
