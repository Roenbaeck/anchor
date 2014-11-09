/*~
-- DROP ANCHOR TEMPORAL PERSPECTIVES --------------------------------------------------------------------------------------------------
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
        if(schema.EQUIVALENCE) {
/*~
DROP FUNCTION IF EXISTS ed$anchor.name($schema.metadata.equivalentRange, $schema.metadata.chronon, $schema.metadata.chronon, text);
DROP FUNCTION IF EXISTS en$anchor.name($schema.metadata.equivalentRange);
DROP FUNCTION IF EXISTS ep$anchor.name($schema.metadata.equivalentRange, $schema.metadata.chronon);
DROP FUNCTION IF EXISTS el$anchor.name($schema.metadata.equivalentRange);
~*/
        }
/*~
DROP FUNCTION IF EXISTS d$anchor.name($schema.metadata.chronon, $schema.metadata.chronon, text);
DROP VIEW IF EXISTS n$anchor.name;
DROP FUNCTION IF EXISTS p$anchor.name($schema.metadata.chronon);
DROP VIEW IF EXISTS l$anchor.name;
~*/
    } // end of if anchor has any attributes
}