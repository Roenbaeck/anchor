/*~
-- TIE ASSEMBLED VIEWS ------------------------------------------------------------------------------------------------
--
-- The assembled view of a tie combines the posit and annex table of the tie.
-- It can be used to maintain entity integrity through a primary key, which cannot be
-- defined elsewhere.
--
~*/
var tie, createOrReplace = 'CREATE OR REPLACE';
// set create options per dialect
switch (schema.metadata.databaseTarget) {
    case 'Teradata': 
        createOrReplace = 'REPLACE';
    break;
}
while (tie = schema.nextTie()) {
/*~
-- Tie assembled view -------------------------------------------------------------------------------------------------
-- $tie.name assembled view of the posit and annex tables,
-- pk$tie.name optional temporal consistency constraint
-----------------------------------------------------------------------------------------------------------------------
$createOrReplace VIEW $tie.capsule\.$tie.name AS
SELECT p.$tie.identityColumnName
~*/
    var role;
    while (role = tie.nextRole()) {
/*~
     , p.$role.columnName
~*/
    }
/*~
     $(tie.timeRange)? , p.$tie.changingColumnName
     , a.$tie.positingColumnName
     , a.$tie.positorColumnName
     , a.$tie.reliabilityColumnName
     , a.$tie.assertionColumnName
     , a.$(schema.METADATA)? $tie.metadataColumnName : $tie.recordingColumnName     
  FROM $tie.capsule\.$tie.positName p
  JOIN $tie.capsule\.$tie.annexName a
    ON a.$tie.identityColumnName = p.$tie.identityColumnName
;
~*/

// TODO add constraints on views? Maybe a add materialized view that acts as constraint check?
}