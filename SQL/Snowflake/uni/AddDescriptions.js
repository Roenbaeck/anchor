/*~
-- DESCRIPTIONS -------------------------------------------------------------------------------------------------------
~*/
var knot;
while (knot = schema.nextKnot()) {
    var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
    if(knot.description &&
       knot.description._description &&
       knot.description._description.length > 0) {
/*~
COMMENT ON TABLE ${knot.capsule}$.$knotTableName IS '$knot.description._description';
~*/
    }
}
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.description &&
       anchor.description._description &&
       anchor.description._description.length > 0) {
/*~
COMMENT ON TABLE ${anchor.capsule}$.$anchor.name IS '$anchor.description._description';
~*/
    }
}
var attribute;
while (attribute = schema.nextAttribute()) {
    if(attribute.description &&
       attribute.description._description &&
       attribute.description._description.length > 0) {
/*~
COMMENT ON TABLE ${attribute.capsule}$.$attribute.name IS '$attribute.description._description';
~*/
    }
}
var nexus;
while (nexus = schema.nextNexus()) {
    if(nexus.description &&
       nexus.description._description &&
       nexus.description._description.length > 0) {
/*~
COMMENT ON TABLE ${nexus.capsule}$.$nexus.name IS '$nexus.description._description';
~*/
    }
}
var tie;
while (tie = schema.nextTie()) {
    if(tie.description &&
       tie.description._description &&
       tie.description._description.length > 0) {
/*~
COMMENT ON TABLE ${tie.capsule}$.$tie.name IS '$tie.description._description';
~*/
    }
    var role;
    while (role = tie.nextRole()) {
        if(role.description &&
           role.description._description &&
           role.description._description.length > 0) {
/*~
COMMENT ON COLUMN ${tie.capsule}$.${tie.name}$.$role.columnName IS '$role.description._description';
~*/
        }
    }
}
