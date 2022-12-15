/*~
-- KNOT EQUIVALENCE VIEWS ---------------------------------------------------------------------------------------------
--
-- The assembled knot view to view all equivalence versions 
-- and the default equivalence view used in the latest and now perpective of the anchor or tie
--
~*/
var knot, createOrReplace = 'CREATE OR REPLACE';
// set options per dialect
switch (schema.metadata.databaseTarget) {
    case 'Teradata': 
        createOrReplace = 'REPLACE';
    break;
}
while (knot = schema.nextKnot()) {
    if(schema.EQUIVALENCE && knot.isEquivalent()) {
/*~
-- Knot assembled view ------------------------------------------------------------------------------------------------
-- $knot.name view 
-----------------------------------------------------------------------------------------------------------------------
$createOrReplace VIEW $knot.capsule\.$knot.name
AS
SELECT i.$knot.identityColumnName
     , v.$knot.equivalentColumnName
     , v.$knot.valueColumnName
     , v.$(schema.METADATA)? $knot.metadataColumnName : $knot.recordingColumnName 
     $(knot.hasChecksum())? , v.$knot.checksumColumnName
  FROM $knot.capsule\.$knot.identityName i
  JOIN $knot.capsule\.$knot.equivalentName v
    ON v.$knot.identityColumnName = i.$knot.identityColumnName
;
-- Knot equivalence view ----------------------------------------------------------------------------------------------
-- default equivalence e$knot.name view
-----------------------------------------------------------------------------------------------------------------------
$createOrReplace VIEW $knot.capsule\.e$knot.name 
AS
SELECT i.$knot.identityColumnName
     , v.$knot.equivalentColumnName
     , v.$knot.valueColumnName
     , v.$(schema.METADATA)? $knot.metadataColumnName : $knot.recordingColumnName 
     $(knot.hasChecksum())? , v.$knot.checksumColumnName
  FROM $knot.capsule\.$knot.identityName i
  JOIN $knot.capsule\.$knot.equivalentName v
    ON v.$knot.identityColumnName = i.$knot.identityColumnName
 WHERE v.$knot.equivalentColumnName = 0
;
~*/

    }
}