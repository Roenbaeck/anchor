/*~
-- DESCRIPTIONS -------------------------------------------------------------------------------------------------------
--
-- Descriptions in the model are added as comments on the schema, tables, latest perspectives, and the columns
-- holding values and references, making them available to catalogs and semantic layers.
--
~*/
// returns the description of a construct as an escaped string literal body, or null if it has none
var describe = function(construct) {
    if(!construct || !construct.description || !construct.description._description)
        return null;
    var text = String(construct.description._description).replace(/\s+/g, ' ').trim();
    if(text.length == 0)
        return null;
    return text.replace(/\\/g, '\\\\').replace(/'/g, "''");
};
var comment, viewComment;
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
        else if(schema.EQUIVALENCE) {
/*~
COMMENT ON VIEW ${knot.capsule}$.$knot.name IS '$comment';
ALTER VIEW ${knot.capsule}$.$knot.name ALTER COLUMN $knot.valueColumnName COMMENT '$comment';
~*/
        }
    }
}
// attribute descriptions belong on the column holding the value (or the knot reference for knotted attributes)
var attribute;
while (attribute = schema.nextAttribute()) {
    if(comment = describe(attribute)) {
/*~
COMMENT ON COLUMN ${attribute.capsule}$.${attribute.name}$.$attribute.valueColumnName IS '$comment';
~*/
    }
}
var anchor;
while (anchor = schema.nextAnchor()) {
    viewComment = describe(anchor);
    if(viewComment) {
/*~
COMMENT ON TABLE ${anchor.capsule}$.$anchor.name IS '$viewComment';
~*/
    }
    // the latest perspective only exists for anchors with attributes
    if(anchor.hasMoreAttributes()) {
        if(viewComment) {
/*~
COMMENT ON VIEW ${anchor.capsule}$.l$anchor.name IS '$viewComment';
~*/
        }
        while (attribute = anchor.nextAttribute()) {
            if(comment = describe(attribute)) {
/*~
ALTER VIEW ${anchor.capsule}$.l$anchor.name ALTER COLUMN $attribute.valueColumnName COMMENT '$comment';
~*/
                if(attribute.isKnotted()) {
/*~
ALTER VIEW ${anchor.capsule}$.l$anchor.name ALTER COLUMN $attribute.knotValueColumnName COMMENT '$comment';
~*/
                }
            }
        }
    }
}
var nexus, role;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    viewComment = describe(nexus);
    if(viewComment) {
/*~
COMMENT ON TABLE ${nexus.capsule}$.$nexus.name IS '$viewComment';
~*/
    }
    while (role = nexus.nextRole && nexus.nextRole()) {
        if(comment = describe(role)) {
/*~
COMMENT ON COLUMN ${nexus.capsule}$.${nexus.name}$.$role.columnName IS '$comment';
~*/
        }
    }
    // the latest perspective only exists for nexuses with attributes
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
        if(viewComment) {
/*~
COMMENT ON VIEW ${nexus.capsule}$.l$nexus.name IS '$viewComment';
~*/
        }
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(comment = describe(role)) {
/*~
ALTER VIEW ${nexus.capsule}$.l$nexus.name ALTER COLUMN $role.columnName COMMENT '$comment';
~*/
                if(role.knot) {
/*~
ALTER VIEW ${nexus.capsule}$.l$nexus.name ALTER COLUMN $role.knotValueColumnName COMMENT '$comment';
~*/
                }
            }
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
            if(comment = describe(attribute)) {
/*~
ALTER VIEW ${nexus.capsule}$.l$nexus.name ALTER COLUMN $attribute.valueColumnName COMMENT '$comment';
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
/*~
ALTER VIEW ${nexus.capsule}$.l$nexus.name ALTER COLUMN $attribute.knotValueColumnName COMMENT '$comment';
~*/
                }
            }
        }
    }
}
var tie;
while (tie = schema.nextTie()) {
    viewComment = describe(tie);
    if(viewComment) {
/*~
COMMENT ON TABLE ${tie.capsule}$.$tie.name IS '$viewComment';
COMMENT ON VIEW ${tie.capsule}$.l$tie.name IS '$viewComment';
~*/
    }
    while (role = tie.nextRole()) {
        if(comment = describe(role)) {
/*~
COMMENT ON COLUMN ${tie.capsule}$.${tie.name}$.$role.columnName IS '$comment';
ALTER VIEW ${tie.capsule}$.l$tie.name ALTER COLUMN $role.columnName COMMENT '$comment';
~*/
            if(role.knot) {
/*~
ALTER VIEW ${tie.capsule}$.l$tie.name ALTER COLUMN $role.knotValueColumnName COMMENT '$comment';
~*/
            }
        }
    }
}
