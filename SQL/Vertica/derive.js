// derive.js: the values the Vertica templates need that Anchor's sisulets compute with helper
// functions or small expressions at generation time. The resolver runs it after Helpers.js and
// the naming conventions, in the same scope, so it can use their helpers and iterators.
//
// Only facts are derived here, never SQL.
//
//   comment         the description as the body of a string literal (a quote is doubled; Vertica reads a backslash
//                   as it is), or null
//   hasComment      whether there is one. Tested instead of `comment`, which a template would read
//                   as false for a description that is literally "0", "false" or "null".
//   attributeCount  the number of attributes of an anchor or nexus
//   roleCount       the number of roles of a nexus or tie
//   uniqueColumnName       the column that a knot is unique on: its checksum if it has one, else its value
//   comparedColumnName     the column that tells whether an attribute has changed: its checksum if it has one,
//                          else its value (a knotted attribute's value column is the reference to the knot)
//   isComparable           whether two values of the attribute can be compared with =; a geography, a geometry and a long varbinary cannot, unless there is a checksum to compare
//   schema.capsules        the schemas of the model, each once, as they are written in the templates
//
// The counts are data because a path in a template reaches only what the JSON holds. A template
// cannot ask an array for its length: JSON has no such member, and the JSON functions of SQL
// Server, which run the same templates, do not either.

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
    attribute.isComparable = checksummed || attribute.isKnotted() || !/^\s*(geography|geometry|long\s+varbinary)\b/i.test(attribute.dataRange || '');
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
// national characters; a schema is written as it is here. Vertica does not tell a name written in one case from the same name written in another, quoted or not, so a name of letters,
// digits, underscores and dollar signs stays as it is, and matches the schema that someone created without quotes. Any other name has to be quoted, and then it is case sensitive, as the
// schema has to be created.
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
// the schemas that the model uses, each once, so that the script can make them before it makes anything in them
var capsules = [];
var addCapsule = function(name) {
    if (name && capsules.indexOf(name) < 0) capsules.push(name);
};
addCapsule(schema.metadata.encapsulation);
while (schemaOwner = schema.nextKnot()) addCapsule(schemaOwner.capsule);
while (schemaOwner = schema.nextAnchor()) addCapsule(schemaOwner.capsule);
while (schemaOwner = schema.nextNexus()) addCapsule(schemaOwner.capsule);
while (schemaOwner = schema.nextAttribute()) addCapsule(schemaOwner.capsule);
while (schemaOwner = schema.nextTie()) addCapsule(schemaOwner.capsule);
schema.capsules = capsules.map(function(name) { return { name: name }; });
// Vertica has no function that returns a table, so the perspectives that take a time are not made; the latest and the now
// perspectives are views, and a view is written once for each of them. Each anchor, nexus and tie lists them.
//
//   perspectives    the views of an anchor, nexus or tie: name (l or n before the name of the construct), and whether the
//                   view looks only at what has changed by now
var perspectiveOwner;
var perspectivesOf = function(construct) {
    construct.perspectives = [
        { name: 'l' + construct.name, filtered: false },
        { name: 'n' + construct.name, filtered: true }
    ];
};
while (perspectiveOwner = schema.nextAnchor()) perspectivesOf(perspectiveOwner);
while (perspectiveOwner = schema.nextNexus()) perspectivesOf(perspectiveOwner);
while (perspectiveOwner = schema.nextTie()) perspectivesOf(perspectiveOwner);
