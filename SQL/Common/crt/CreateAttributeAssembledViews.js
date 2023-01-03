/*~
-- ATTRIBUTE ASSEMBLED VIEWS ------------------------------------------------------------------------------------------
--
-- The assembled view of an attribute combines the posit and annex table of the attribute.
-- It can be used to maintain entity integrity through a primary key, which cannot be
-- defined elsewhere.
--
~*/
var anchor, createOrReplace = 'CREATE OR REPLACE', isSharedNoting = false ;
// set create options per dialect
switch (schema.metadata.databaseTarget) {
    case 'Teradata': 
        createOrReplace = 'REPLACE';
    case 'Citus':
    case 'Redshift':
        isSharedNoting = true;
    break;
}
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
/*~
-- Attribute assembled view -------------------------------------------------------------------------------------------
-- $attribute.name assembled view of the posit and annex tables,
-- pk$attribute.name optional temporal consistency constraint
-----------------------------------------------------------------------------------------------------------------------
$createOrReplace VIEW $attribute.capsule\.$attribute.name AS
SELECT p.$attribute.identityColumnName
     , p.$attribute.anchorReferenceName
     , p.$attribute.valueColumnName
     $(attribute.hasChecksum())? , p.$attribute.checksumColumnName
     $(attribute.timeRange)? , p.$attribute.changingColumnName
     , a.$attribute.positingColumnName
     , a.$attribute.positorColumnName
     , a.$attribute.reliabilityColumnName
     , a.$attribute.assertionColumnName
     , a.$(schema.METADATA)? $attribute.metadataColumnName : $attribute.recordingColumnName         
  FROM $attribute.capsule\.$attribute.positName p
  JOIN $attribute.capsule\.$attribute.annexName a
    ON p.$attribute.identityColumnName = a.$attribute.identityColumnName
   $(isSharedNoting)? AND p.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName -- force join on same node!
;

~*/

// TODO add constraints on views? Maybe a add materialized view that acts as constraint check?
    }
}