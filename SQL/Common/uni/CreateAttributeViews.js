/*~
-- ATTRIBUTE VIEW PERSPECTIVES ----------------------------------------------------------------------------------------
--
-- The latest perspective shows the latest available information for each attribute.
-- The now perspective shows the information as it is right now.
--
-- Under equivalence all these views default to equivalent = 0.
-- Prepended-e perspectives are provided in order to select the default equivalence in case of static attributes.
--
~*/
// latest and now views for dialects that do not support table value functions
var anchor, selectTop, orderBy, createOrReplace = 'CREATE OR REPLACE';
while (anchor = schema.nextAnchor()) {
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        // set options per dialect
        switch (schema.metadata.databaseTarget) {
            // The default PostgreSQL way with distinct on that can use the pk index in reverse        
            // DuckDB, Citus and PostgreSQL
            case 'Citus':
            case 'DuckDB':
            case 'PostgreSQL':
                selectTop  = `SELECT DISTINCT ON (${attribute.anchorReferenceName})`;
                orderBy = `ORDER BY ${attribute.anchorReferenceName} DESC, ${attribute.changingColumnName} DESC`;
            break;  
            case 'Oracle':
                // the top level query with keep aggregate 
                selectTop  = `
SELECT ${attribute.anchorReferenceName}
     , MAX(${attribute.valueColumnName}) KEEP (DENSE_RANK LAST ORDER BY ${attribute.changingColumnName}) AS ${attribute.valueColumnName}
     , MAX(${attribute.changingColumnName}) 
     ${attribute.isEquivalent() && !attribute.isKnotted() ? ', MAX(' + attribute.equivalentColumnName + ') KEEP (DENSE_RANK LAST ORDER BY ' + attribute.changingColumnName +') AS ' + attribute.equivalentColumnName : ''}
     ${!attribute.isKnotted() && attribute.hasChecksum()? ', MAX('  + attribute.checksumColumnName + ') KEEP (DENSE_RANK LAST ORDER BY ' + attribute.changingColumnName +') AS ' + attribute.checksumColumnName : ''}
     , MAX(${schema.METADATA ? attribute.metadataColumnName : attribute.recordingColumnName}) KEEP (DENSE_RANK LAST ORDER BY ${attribute.changingColumnName}) AS ${schema.METADATA ? attribute.metadataColumnName : attribute.recordingColumnName}
  FROM (
SELECT `;
                // close the sub query and group by 
                orderBy = `
       ) r
 GROUP BY ${attribute.anchorReferenceName}`;
            break;      
            // The row number variant with qualify              
            case 'Teradata': 
                createOrReplace = 'REPLACE';
            case 'Snowflake': // Snowflake also   
                selectTop  = 'SELECT';
                orderBy = `QUALIFY ROW_NUMBER() OVER (PARTITION BY ${attribute.anchorReferenceName} ORDER BY ${attribute.anchorReferenceName}, ${attribute.changingColumnName} DESC) = 1`;
            break;
            // The variant with the Vertica limit analytic function
            case 'Vertica':
                selectTop  = 'SELECT';
                orderBy = `LIMIT 1 OVER (PARTITION BY ${attribute.anchorReferenceName} ORDER BY ${attribute.anchorReferenceName}, ${attribute.changingColumnName} DESC)`;
            break;             
            default:  // the row number variant with sub query is the default variant , which is used by Redshift!
                // the top level query and the sub select with the row number window function
                selectTop  = `
SELECT ${attribute.anchorReferenceName}
     , ${attribute.valueColumnName}
     , ${attribute.changingColumnName}
     ${attribute.isEquivalent() && !attribute.isKnotted() ? ', ' + attribute.equivalentColumnName : ''}
     ${!attribute.isKnotted() && attribute.hasChecksum()? ', '  + attribute.checksumColumnName : ''}
     , ${schema.METADATA ? attribute.metadataColumnName : attribute.recordingColumnName}
  FROM (
SELECT ROW_NUMBER() OVER (PARTITION BY ${attribute.anchorReferenceName} ORDER BY ${attribute.anchorReferenceName} , ${attribute.changingColumnName} DESC)  as RN
     , `;
                // close the sub query and filter on the first row in the group
                orderBy = `
       ) r
 WHERE RN = 1`;            

        }
        if(attribute.isHistorized()) {
          
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$attribute.name viewed by the latest available information (may include future versions) $(attribute.isEquivalent() && !attribute.isKnotted())? with default equivalence
-----------------------------------------------------------------------------------------------------------------------

$createOrReplace VIEW $attribute.capsule\.l$attribute.name AS
$selectTop $attribute.anchorReferenceName
     , $attribute.valueColumnName
     , $attribute.changingColumnName
     $(attribute.isEquivalent() && !attribute.isKnotted())? , $attribute.equivalentColumnName
     $(!attribute.isKnotted() && attribute.hasChecksum())? , $attribute.checksumColumnName
     , $(schema.METADATA)? $attribute.metadataColumnName : $attribute.recordingColumnName   
  FROM $attribute.capsule\.$attribute.name
 $(attribute.isEquivalent() && !attribute.isKnotted())? WHERE $attribute.equivalentColumnName = 0 
 $orderBy 
;

-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$attribute.name viewed as it currently is (cannot include future versions) $(attribute.isEquivalent() && !attribute.isKnotted())? with default equivalence
-----------------------------------------------------------------------------------------------------------------------

$createOrReplace VIEW $attribute.capsule\.n$attribute.name AS
$selectTop $attribute.anchorReferenceName
     , $attribute.valueColumnName
     , $attribute.changingColumnName
     $(attribute.isEquivalent() && !attribute.isKnotted())? , $attribute.equivalentColumnName
     $(!attribute.isKnotted() && attribute.hasChecksum())? , $attribute.checksumColumnName
     , $(schema.METADATA)? $attribute.metadataColumnName : $attribute.recordingColumnName   
  FROM $attribute.capsule\.$attribute.name
 WHERE $attribute.changingColumnName <= cast($schema.metadata.now AS $attribute.timeRange) 
   $(attribute.isEquivalent() && !attribute.isKnotted())? AND $attribute.equivalentColumnName = 0 
 $orderBy 
;
~*/
        } else {
            if (attribute.isEquivalent() && !attribute.isKnotted()) {           
/*~
-- Default Equivalence perspective ------------------------------------------------------------------------------------
-- e$attribute.name viewed by the default equivalence information 
-----------------------------------------------------------------------------------------------------------------------

$createOrReplace VIEW e$attribute.capsule\.l$attribute.name AS
SELECT $attribute.anchorReferenceName
     , $attribute.valueColumnName
     , $attribute.equivalentColumnName
     $(attribute.hasChecksum())? , $attribute.checksumColumnName
     , $(schema.METADATA)? $attribute.metadataColumnName : $attribute.recordingColumnName   
  FROM $attribute.capsule\.$attribute.name
 WHERE $attribute.equivalentColumnName = 0 
;

~*/            
            }
        }
    }
}