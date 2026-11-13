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

// ---- uni-temporal (Oracle/uni) --------------------------------------------------------------------------------------------
//
// Names cut to 30 characters, as the original sisulets cut them:
//   knot.pkName, knot.ukName, anchor.pkName, attribute.pkName, attribute.fkName (a knotted attribute has fk1Name and fk2Name),
//   tie.pkName, role.fkName and role.uqName (numbered by the position of the role in the tie, from 1)
//   tie.changingColumn30, tie.metadataColumn30 and role.columnName30, the column names of a tie cut the same way
//
// What the original test data sisulet (CreateTestData) worked out, in the order it went through the model (its values carry over
// from one attribute to the next, and from one anchor to the next, since it declared them with var):
//   knot.testValue        the value that a knot is given: its name if its data type starts with V, else 0
//   anchor.testFrom       the first and the last identity that an anchor is given, 10000000 more for each anchor (100 identities each)
//   anchor.testTo
//   attribute.testVarchar, testDate, testInteger, testOther, testNone   which kind of value an attribute is given: its data type starts
//                         with V, d or i, with another letter, or there is none (a knotted attribute has no data type)
//   attribute.testPrecision   the text of the data type after its first parenthesis, or all of it if there is none; a knotted
//                         attribute has the one of the attribute before it
//   role.testIdentity     the column of a role as the test data joins it: column name, a dot, and the identity column of what it refers to
//   role.testPrevious     that of the role before it in the tie
function cutTo30(text) { return String(text).substr(0, 30); }
var uniKnot, uniAnchor, uniAttribute, uniTie, uniRole, uniIndex, uniPrevious, uniKind, uniFirst;
var uniPrefix = 0, uniPrecision = '';
while (uniKnot = schema.nextKnot()) {
    uniKnot.pkName = cutTo30('PK_' + uniKnot.name);
    uniKnot.ukName = cutTo30('UK_' + uniKnot.name);
    uniKnot.testValue = String(uniKnot.dataRange).substr(0, 1) == 'V' ? uniKnot.name : '0';
}
while (uniAnchor = schema.nextAnchor()) {
    uniAnchor.pkName = cutTo30('PK_' + uniAnchor.name);
    uniPrefix += 10000000;
    uniAnchor.testFrom = uniPrefix;
    uniAnchor.testTo = uniPrefix + 100;
    while (uniAttribute = uniAnchor.nextAttribute()) {
        uniKind = 'none';
        if (uniAttribute.dataRange) {
            uniPrecision = uniAttribute.dataRange.substr(uniAttribute.dataRange.indexOf('(') + 1);
            uniFirst = uniAttribute.dataRange.substr(0, 1);
            uniKind = uniFirst == 'V' ? 'varchar' : uniFirst == 'd' ? 'date' : uniFirst == 'i' ? 'integer' : 'other';
        }
        uniAttribute.testVarchar = uniKind == 'varchar';
        uniAttribute.testDate = uniKind == 'date';
        uniAttribute.testInteger = uniKind == 'integer';
        uniAttribute.testOther = uniKind == 'other';
        uniAttribute.testNone = uniKind == 'none';
        uniAttribute.testPrecision = uniPrecision;
    }
}
while (uniAttribute = schema.nextAttribute()) {
    uniAttribute.pkName = cutTo30('PK_' + uniAttribute.name);
    uniAttribute.fkName = cutTo30('FK_' + uniAttribute.name);
    uniAttribute.fk1Name = cutTo30('FK1_' + uniAttribute.name);
    uniAttribute.fk2Name = cutTo30('FK2_' + uniAttribute.name);
}
while (uniTie = schema.nextTie()) {
    uniTie.pkName = cutTo30('PK_' + uniTie.name);
    if (uniTie.changingColumnName) uniTie.changingColumn30 = cutTo30(uniTie.changingColumnName);
    if (uniTie.metadataColumnName) uniTie.metadataColumn30 = cutTo30(uniTie.metadataColumnName);
    uniIndex = 0;
    uniPrevious = '';
    while (uniRole = uniTie.nextRole()) {
        uniIndex++;
        uniRole.fkName = cutTo30('FK' + uniIndex + '_' + uniTie.name + uniRole.name);
        uniRole.uqName = cutTo30('UQ' + uniIndex + '_' + uniTie.name + uniRole.name);
        uniRole.columnName30 = cutTo30(uniRole.columnName);
        uniRole.testIdentity = uniRole.columnName + '.' + (uniRole.entity ? uniRole.entity.identityColumnName : uniRole.knot.identityColumnName);
        uniRole.testPrevious = uniPrevious;
        uniPrevious = uniRole.testIdentity;
    }
}

// ---- concurrent-reliance-temporal (Oracle/crt) ----------------------------------------------------------------------------
//
//   historizedAttributeCount   the number of historized attributes of an anchor or nexus, which the time perspectives test
//                              (a template cannot filter and count; it reads 0 as false)
var historizedOwner, historizedAttribute;
while (historizedOwner = schema.nextAnchor()) {
    historizedOwner.historizedAttributeCount = 0;
    while (historizedAttribute = historizedOwner.nextAttribute())
        if (historizedAttribute.isHistorized()) historizedOwner.historizedAttributeCount++;
}
while (historizedOwner = schema.nextNexus()) {
    historizedOwner.historizedAttributeCount = 0;
    while (historizedAttribute = historizedOwner.nextAttribute())
        if (historizedAttribute.isHistorized()) historizedOwner.historizedAttributeCount++;
}
