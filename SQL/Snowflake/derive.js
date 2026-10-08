// derive.js: the values the Snowflake templates need that Anchor's sisulets compute with helper
// functions or small expressions at generation time. The resolver runs it after Helpers.js and
// the naming conventions, in the same scope, so it can use their helpers and iterators.
//
// Only facts are derived here, never SQL. Where a sisulet calls columnCommentClause(x) or
// viewCommentClause(x), both thin wrappers over describe(x) in SQL/Snowflake/NamingConvention.js,
// the template reads x.comment and writes the COMMENT clause itself.
//
//   comment         the description as the body of a Snowflake string literal (describe(x)), or null
//   hasComment      whether there is one. Tested instead of `comment`, which a template would read
//                   as false for a description that is literally "0", "false" or "null".
//   attributeCount  the number of attributes of an anchor or nexus
//   roleCount       the number of roles of a nexus or tie
//   uniqueColumnName       the column that a knot is unique on: its checksum if it has one, else its value
//   comparedColumnName     the column that tells whether an attribute has changed: its checksum if it has one,
//                          else its value (a knotted attribute's value column is the reference to the knot)
//   isComparable           whether two values of the attribute can be compared with =; a geography, a geometry
//                          and the semi-structured types cannot, unless there is a checksum to compare
//
// The counts are data because a path in a template reaches only what the JSON holds. A template
// cannot ask an array for its length: JSON has no such member, and the JSON functions of SQL
// Server, which run the same templates, do not either.

function deriveComment(construct) {
    var comment = describe(construct);
    construct.comment = comment;
    construct.hasComment = comment !== null;
}

deriveComment(schema);

var knot;
while (knot = schema.nextKnot()) {
    deriveComment(knot);
    knot.uniqueColumnName = knot.hasChecksum() ? knot.checksumColumnName : knot.valueColumnName;
}

var anchor;
while (anchor = schema.nextAnchor()) {
    deriveComment(anchor);
    anchor.attributeCount = anchor.attributes ? anchor.attributes.length : 0;
}

var attribute;
while (attribute = schema.nextAttribute()) {
    deriveComment(attribute);
    var checksummed = !attribute.isKnotted() && attribute.hasChecksum();
    attribute.comparedColumnName = checksummed ? attribute.checksumColumnName : attribute.valueColumnName;
    attribute.isComparable = checksummed || attribute.isKnotted() || !/^\s*(geography|geometry|variant|object|array)\b/i.test(attribute.dataRange || '');
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
// Schema names. The templates write every other name inside double quotes, which keeps its case and lets it hold
// national characters; a schema is written as it is here. Snowflake accepts an unquoted name of letters (A-Z, a-z),
// digits, underscores and dollar signs, which it reads as upper case, so a schema like that stays as it is and
// matches the schema that someone created without quotes. Any other name has to be quoted, and then it is case
// sensitive, as the schema has to be created.
//
//   capsule         the schema of a knot, anchor, nexus, attribute or tie, quoted if it has to be
//   encapsulation   the schema in schema.metadata, the same
function quoteSchemaName(name) {
    if (name === undefined || name === null || /^[A-Za-z_][A-Za-z0-9_$]*$/.test(name)) return name;
    return '"' + String(name).replace(/"/g, '""') + '"';
}
schema.metadata.encapsulation = quoteSchemaName(schema.metadata.encapsulation);
var schemaOwner;
while (schemaOwner = schema.nextKnot()) schemaOwner.capsule = quoteSchemaName(schemaOwner.capsule);
while (schemaOwner = schema.nextAnchor()) schemaOwner.capsule = quoteSchemaName(schemaOwner.capsule);
while (schemaOwner = schema.nextNexus()) schemaOwner.capsule = quoteSchemaName(schemaOwner.capsule);
while (schemaOwner = schema.nextAttribute()) schemaOwner.capsule = quoteSchemaName(schemaOwner.capsule);
while (schemaOwner = schema.nextTie()) schemaOwner.capsule = quoteSchemaName(schemaOwner.capsule);
