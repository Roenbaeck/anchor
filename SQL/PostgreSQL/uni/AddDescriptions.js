/*~
-- DESCRIPTIONS -------------------------------------------------------------------------------------------------------
~*/

var knot;

while (knot = schema.nextKnot()) {
    if(knot.description &&
       knot.description._description &&
       knot.description._description.length > 0) {
/*~
COMMENT ON TABLE 
$(knot.isEquivalent())? $knot.identityName : $knot.name
IS '$knot.description._description';
~*/
    }
}

var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.description &&
       anchor.description._description &&
       anchor.description._description.length > 0) {
/*~
COMMENT ON TABLE 
$anchor.name
IS '$anchor.description._description';
~*/
    }
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.description &&
           attribute.description._description &&
           attribute.description._description.length > 0) {
/*~
COMMENT ON TABLE 
$attribute.name
IS '$attribute.description._description';
~*/
        }
    }
}

var tie;

while (tie = schema.nextTie()) {
    if(tie.description &&
       tie.description._description &&
       tie.description._description.length > 0) {
/*~
COMMENT ON TABLE 
$tie.name
IS '$tie.description._description';
~*/
    }
    var role;
    while (role = tie.nextRole()) {
        if(role.description &&
           role.description._description &&
           role.description._description.length > 0) {
/*~
COMMENT ON COLUMN 
$tie.name\.$role.columnName
IS '$role.description._description';
~*/
        }
    }
}