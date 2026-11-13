// derive.js: the values the Oracle templates need that Anchor's sisulets computed with helper functions or small expressions at
// generation time. The resolver runs it after Helpers.js and the naming conventions, in the same scope, so it can use their
// helpers and iterators.
//
// Only facts are derived here, never SQL.
//
//   comment         the description as the body of an Oracle string literal in single quotes (a quote is doubled), or null
//   hasComment      whether there is one. Tested instead of `comment`, which a template would read as false for a
//                   description that is literally "0", "false" or "null".
//   attributeCount  the number of attributes of an anchor or nexus
//   roleCount       the number of roles of a nexus or tie
//
// The counts are data because a path in a template reaches only what the JSON holds. A template cannot ask an array for its
// length: JSON has no such member, and the JSON functions of SQL Server, which run the same templates, do not either.
//
// The rest are names that the original sisulets cut to 30 characters, the longest that Oracle took before 12.2, and the
// pieces of text that they built with String.fromCharCode(58) because the original engine read a colon in a template.

// returns the description of a construct as an escaped string literal body, or null if it has none
var describe = function(construct) {
    if(!construct || !construct.description || !construct.description._description)
        return null;
    var text = String(construct.description._description).replace(/\s+/g, ' ').trim();
    if(text.length == 0)
        return null;
    return text.replace(/'/g, "''");
};

function deriveComment(construct) {
    var comment = describe(construct);
    construct.comment = comment;
    construct.hasComment = comment !== null;
}

deriveComment(schema);

var knot;
while (knot = schema.nextKnot()) {
    deriveComment(knot);
}

var anchor;
while (anchor = schema.nextAnchor()) {
    deriveComment(anchor);
    anchor.attributeCount = anchor.attributes ? anchor.attributes.length : 0;
}

var attribute;
while (attribute = schema.nextAttribute()) {
    deriveComment(attribute);
}

var nexus, role;
while (nexus = schema.nextNexus()) {
    deriveComment(nexus);
    nexus.attributeCount = nexus.attributes ? nexus.attributes.length : 0;
    nexus.roleCount = nexus.roles ? nexus.roles.length : 0;
    while (role = nexus.nextRole()) deriveComment(role);
}

var tie;
while (tie = schema.nextTie()) {
    deriveComment(tie);
    tie.roleCount = tie.roles ? tie.roles.length : 0;
    while (role = tie.nextRole()) deriveComment(role);
}
