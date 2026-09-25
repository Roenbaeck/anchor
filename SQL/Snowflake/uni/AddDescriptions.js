/*~
-- DESCRIPTIONS -------------------------------------------------------------------------------------------------------
--
-- Descriptions in the model are added as comments on the schema, tables, and the columns holding values and
-- references, making them available to catalogs and semantic layers. Views get their comments when they are
-- created, since Snowflake does not allow comments on view columns to be added afterwards.
--
~*/
// describe() is defined in SQL/Snowflake/NamingConvention.js
var comment;
if(comment = describe(schema)) {
/*~
COMMENT ON SCHEMA $schema.metadata.encapsulation IS '$comment';
~*/
}
var knot;
while (knot = schema.nextKnot()) {
    if(comment = describe(knot)) {
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
COMMENT ON TABLE ${knot.capsule}$.$knotTableName IS '$comment';
~*/
        if(!knot.isEquivalent()) {
/*~
COMMENT ON COLUMN ${knot.capsule}$.${knot.name}$.$knot.valueColumnName IS '$comment';
~*/
        }
    }
}
// this script is shared by all temporalizations, and in crt and bi values and roles are stored in posit tables
// attribute descriptions belong on the column holding the value (or the knot reference for knotted attributes)
var attribute, attributeTableName;
while (attribute = schema.nextAttribute()) {
    if(comment = describe(attribute)) {
        attributeTableName = schema.UNI ? attribute.name : attribute.positName;
/*~
COMMENT ON COLUMN ${attribute.capsule}$.${attributeTableName}$.$attribute.valueColumnName IS '$comment';
~*/
    }
}
var anchor;
while (anchor = schema.nextAnchor()) {
    if(comment = describe(anchor)) {
/*~
COMMENT ON TABLE ${anchor.capsule}$.$anchor.name IS '$comment';
~*/
    }
}
var nexus, role;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(comment = describe(nexus)) {
/*~
COMMENT ON TABLE ${nexus.capsule}$.$nexus.name IS '$comment';
~*/
    }
    while (role = nexus.nextRole && nexus.nextRole()) {
        if(comment = describe(role)) {
/*~
COMMENT ON COLUMN ${nexus.capsule}$.${nexus.name}$.$role.columnName IS '$comment';
~*/
        }
    }
}
var tie, tieTableName;
while (tie = schema.nextTie()) {
    tieTableName = schema.UNI ? tie.name : tie.positName;
    if(comment = describe(tie)) {
/*~
COMMENT ON TABLE ${tie.capsule}$.$tieTableName IS '$comment';
~*/
    }
    while (role = tie.nextRole()) {
        if(comment = describe(role)) {
/*~
COMMENT ON COLUMN ${tie.capsule}$.${tieTableName}$.$role.columnName IS '$comment';
~*/
        }
    }
}
