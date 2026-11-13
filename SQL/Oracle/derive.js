// derive.js: the values the Oracle templates need that cannot be read from the model as it is. The resolver runs it after
// Helpers.js and the naming conventions, in the same scope, so it can use their helpers and iterators.
//
// Only facts are derived here, never SQL.
//
//   comment         the description as the body of an Oracle string literal in single quotes (a quote is doubled), or null
//   hasComment      whether there is one. Tested instead of `comment`, which a template would read as false for a
//                   description that is literally "0", "false" or "null".
//   attributeCount  the number of attributes of an anchor or nexus
//   roleCount       the number of roles of a nexus or tie
//   historizedAttributeCount   the number of historized attributes of an anchor or nexus (a template cannot filter and count)
//   uniqueColumnName       the column that a knot is unique on: its checksum if it has one, else its value
//   comparedColumnName     the column that tells whether an attribute has changed: its checksum if it has one,
//                          else its value (a knotted attribute's value column is the reference to the knot)
//   isComparable           whether two values of the attribute can be compared with =: a LOB (clob, nclob, blob, bfile), a long,
//                          xmltype or json cannot, unless there is a checksum to compare
//   isLob                  the value is a clob, nclob or blob, which DBMS_LOB.COMPARE compares
//   isXml                  the value is an xmltype, which XMLSERIALIZE(CONTENT value AS CLOB) turns into a clob to compare
//   schema.metadata.positorTableName   the name of the table of positors in crt, Positor_ (PostgreSQL has _Positor); written
//                          $schema.metadata.qualifier$$schema.metadata.positorTableName$
//   qualifier              what a name of the construct is written after, in a script: the schema and a dot, or nothing. A schema
//   compareByChecksum, compareAsLob, compareAsXml, compareAsIs   how two values of the attribute are compared: exactly one is true.
//                          By the checksum (STANDARD_HASH of the value, MD5); with DBMS_LOB.COMPARE; as XMLSERIALIZE(CONTENT value AS CLOB) with
//                          DBMS_LOB.COMPARE; or with = and <>. A LOB or xmltype with a checksum is compared by the checksum, which
//                          STANDARD_HASH cannot make of a LOB, so such a model does not work.
//                          is a user in Oracle and has to exist; a schema called public, or none, stands for the schema that the
//                          script is run in, since Oracle has no schema of that name that holds tables. The same on the
//                          anchors, nexuses, knots, attributes and ties, and schema.metadata.qualifier for the schema of the model.
//
// The counts are data because a path in a template reaches only what the JSON holds. A template cannot ask an array for its
// length: JSON has no such member, and the JSON functions of SQL Server, which run the same templates, do not either.

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

// the schema of a name in a script: written in front of it, with its dot, or left out
function qualify(capsule) {
    if (capsule === undefined || capsule === null || /^\s*$/.test(capsule) || /^public$/i.test(capsule)) return '';
    return capsule + '.';
}
schema.metadata.qualifier = qualify(schema.metadata.encapsulation);
// the table of positors (crt): PostgreSQL calls it _Positor, but an Oracle name cannot start with an underscore, so the underscore goes last
schema.metadata.positorTableName = schema.metadata.positorSuffix + '_';

// a data type as a parameter of a function can have no length, precision or scale in Oracle: timestamp(9) is timestamp, number(10) is number
function unconstrained(type) {
    if (type === undefined || type === null) return type;
    return String(type).replace(/\(\s*\d+\s*(,\s*\d+\s*)?\)/g, '').replace(/\s+/g, ' ').trim();
}
schema.metadata.chrononType = unconstrained(schema.metadata.chronon);
schema.metadata.metadataTypeType = unconstrained(schema.metadata.metadataType);
schema.metadata.positingRangeType = unconstrained(schema.metadata.positingRange);
schema.metadata.positorRangeType = unconstrained(schema.metadata.positorRange);
schema.metadata.reliabilityRangeType = unconstrained(schema.metadata.reliabilityRange);

deriveComment(schema);

var knot;
while (knot = schema.nextKnot()) {
    deriveComment(knot);
    knot.qualifier = qualify(knot.capsule);
    knot.uniqueColumnName = knot.hasChecksum() ? knot.checksumColumnName : knot.valueColumnName;
}

var anchor;
while (anchor = schema.nextAnchor()) {
    deriveComment(anchor);
    anchor.qualifier = qualify(anchor.capsule);
    anchor.attributeCount = anchor.attributes ? anchor.attributes.length : 0;
    anchor.historizedAttributeCount = 0;
}

var attribute;
while (attribute = schema.nextAttribute()) {
    deriveComment(attribute);
    attribute.qualifier = qualify(attribute.capsule);
    attribute.timeRangeType = unconstrained(attribute.timeRange);
    var dataType = String(attribute.dataRange || '');
    // STANDARD_HASH cannot hash a LOB, a long, an xmltype or a json: the checksum of such an attribute is left out, as if it had none
    if (!attribute.isKnotted() && attribute.hasChecksum() && /^\s*(clob|nclob|blob|bfile|long|xmltype|json)\b/i.test(dataType)) {
        attribute.checksumIgnored = true;
        attribute.hasChecksum = function() { return false; };
    }
    var checksummed = !attribute.isKnotted() && attribute.hasChecksum();
    attribute.comparedColumnName = checksummed ? attribute.checksumColumnName : attribute.valueColumnName;
    attribute.isLob = !attribute.isKnotted() && /^\s*(clob|nclob|blob)\b/i.test(dataType);
    attribute.isXml = !attribute.isKnotted() && /^\s*xmltype\b/i.test(dataType);
    attribute.isComparable = checksummed || attribute.isKnotted() || !/^\s*(clob|nclob|blob|bfile|long|xmltype|json)\b/i.test(dataType);
    attribute.compareByChecksum = checksummed;
    attribute.compareAsLob = !checksummed && attribute.isLob;
    attribute.compareAsXml = !checksummed && attribute.isXml;
    attribute.compareAsIs = !checksummed && !attribute.isLob && !attribute.isXml;
}

var nexus, role;
while (nexus = schema.nextNexus()) {
    deriveComment(nexus);
    nexus.qualifier = qualify(nexus.capsule);
    nexus.attributeCount = nexus.attributes ? nexus.attributes.length : 0;
    nexus.roleCount = nexus.roles ? nexus.roles.length : 0;
    nexus.historizedAttributeCount = 0;
    while (role = nexus.nextRole()) deriveComment(role);
}

var tie;
while (tie = schema.nextTie()) {
    deriveComment(tie);
    tie.qualifier = qualify(tie.capsule);
    tie.timeRangeType = unconstrained(tie.timeRange);
    tie.roleCount = tie.roles ? tie.roles.length : 0;
    while (role = tie.nextRole()) deriveComment(role);
}

var historizedOwner, historizedAttribute;
while (historizedOwner = schema.nextAnchor())
    while (historizedAttribute = historizedOwner.nextAttribute())
        if (historizedAttribute.isHistorized()) historizedOwner.historizedAttributeCount++;
while (historizedOwner = schema.nextNexus())
    while (historizedAttribute = historizedOwner.nextAttribute())
        if (historizedAttribute.isHistorized()) historizedOwner.historizedAttributeCount++;

// Natural keys: the routes of every anchor and nexus, from naturalKeys() in Helpers.js. A checksum is a raw(16), like the column
// it is read from (STANDARD_HASH with MD5). A value is compared with = when a key is looked up and when the integrity check looks
// for a key that two identities have; a LOB, a long, xmltype and json cannot be, so a route with such a value and no checksum
// on it is not usable.
//
//   schema.naturalKeys   one item for each route, as naturalKeys() describes it, with qualifier on it and on each of its joins
schema.naturalKeys = naturalKeys();
var naturalKey, naturalKeyColumn;
for (var nk = 0; nk < schema.naturalKeys.length; nk++) {
    naturalKey = schema.naturalKeys[nk];
    naturalKey.qualifier = qualify(naturalKey.capsule);
    for (var nj = 0; nj < naturalKey.joins.length; nj++) naturalKey.joins[nj].qualifier = qualify(naturalKey.joins[nj].capsule);
    for (var nc = 0; nc < naturalKey.columns.length; nc++) {
        naturalKeyColumn = naturalKey.columns[nc];
        if (naturalKeyColumn.isChecksum) naturalKeyColumn.type = 'raw(16)';
    }
    for (nc = 0; nc < naturalKey.matches.length; nc++) {
        naturalKeyColumn = naturalKey.matches[nc];
        if (naturalKeyColumn.isChecksum) naturalKeyColumn.type = 'raw(16)';
        else if (naturalKey.usable && /^\s*(clob|nclob|blob|bfile|long|xmltype|json)\b/i.test(naturalKeyColumn.type || '')) {
            naturalKey.usable = false;
            naturalKey.problem = naturalKeyColumn.name + ' is a ' + naturalKeyColumn.type + ', which cannot be compared, and it has no checksum';
        }
    }
    if (!naturalKey.usable) {
        naturalKey.notes = [];
        naturalKey.joins = [];
        naturalKey.columns = [];
        naturalKey.matches = [];
    }
}

// ---- schemas, from the keys templates ------------------------------------------------------------------------------------
//
//   schema.capsules   one item {name} for each schema (an Oracle user) that the model puts objects in, once each, in the order they
//                     are first met: the encapsulation of the model and the capsule of every knot, anchor, nexus, attribute and tie.
//                     A schema called public, or none, stands for the schema the script is run in and is left out; two names that
//                     differ only in case are one schema, since Oracle folds unquoted names to upper case.
var unikeysCapsules = [];
var unikeysSeen = {};
var unikeysAddCapsule = function(name) {
    if (name === undefined || name === null) return;
    var text = String(name);
    if (/^\s*$/.test(text) || /^\s*public\s*$/i.test(text)) return;
    var key = text.toUpperCase();
    if (unikeysSeen[key]) return;
    unikeysSeen[key] = true;
    unikeysCapsules.push({ name: text });
};
var unikeysOwner;
unikeysAddCapsule(schema.metadata.encapsulation);
while (unikeysOwner = schema.nextKnot()) unikeysAddCapsule(unikeysOwner.capsule);
while (unikeysOwner = schema.nextAnchor()) unikeysAddCapsule(unikeysOwner.capsule);
while (unikeysOwner = schema.nextNexus()) unikeysAddCapsule(unikeysOwner.capsule);
while (unikeysOwner = schema.nextAttribute()) unikeysAddCapsule(unikeysOwner.capsule);
while (unikeysOwner = schema.nextTie()) unikeysAddCapsule(unikeysOwner.capsule);
schema.capsules = unikeysCapsules;
//   schema.hasCapsules   whether there is any (tested instead of the list, which a template cannot ask for its length)
schema.hasCapsules = unikeysCapsules.length > 0;

// ---- how a value of a knot is compared, from the crt trigger templates ------------------------------------------------------
//
//   knot.compareByChecksum   a value of the knot is looked up by its checksum (the knot has one)
//   knot.compareAsLob        a value of the knot is a clob, nclob or blob without a checksum: it cannot be compared with =, and is
//                            looked up and compared with DBMS_LOB.COMPARE
//   knot.compareAsIs         a value of the knot is compared with = and <>
//                            (exactly one of the three is true; the tie and nexus triggers look up the knot of a role in a latest view
//                            by the value that is given, and tell whether a given knot value is another than the one the row has)
var compareKnot;
while (compareKnot = schema.nextKnot()) {
    var compareKnotType = String(compareKnot.dataRange || '');
    var compareKnotLob = /^\s*(clob|nclob|blob)\b/i.test(compareKnotType);
    compareKnot.compareByChecksum = compareKnot.hasChecksum() ? true : false;
    compareKnot.compareAsLob = !compareKnot.compareByChecksum && compareKnotLob;
    compareKnot.compareAsIs = !compareKnot.compareByChecksum && !compareKnotLob;
}

// ---- End of Time, from the crt perspective templates ----------------------------------------------------------------------
//
//   schema.EOTValue   End of Time (schema.EOT in Helpers.js is the quoted string '9999-12-31', which Oracle reads as a timestamp
//                     only if NLS_TIMESTAMP_FORMAT says so) as an ISO date and time that follows TIMESTAMP in a literal that
//                     does not depend on the session: 9999-12-31 00:00:00
var endOfTime = String(schema.EOT).replace(/'/g, '').trim();
if (/^\d{4}-\d{2}-\d{2}$/.test(endOfTime)) endOfTime += ' 00:00:00';
schema.EOTValue = endOfTime;
