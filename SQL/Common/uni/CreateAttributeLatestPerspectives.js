/*~
-- ATTRIBUTE LATEST PERSPECTIVES -----------------------------------------------------------------------------------------
--
-- The latest perspective shows the latest available information for each attribute.
-- The now perspective shows the information as it is right now.
-- The point-in-time perspective lets you travel through the information to the given timepoint.
--
-- @changingTimepoint   the point in changing time to travel to
--
-- Under equivalence all these views default to equivalent = 0, however, corresponding
-- prepended-e perspectives are provided in order to select a specific equivalent.
--
-- @equivalent          the equivalent for which to retrieve data
--
~*/
// latest view for dialects that do not support table value functions
var anchor, selectTop, orderBy, createOrReplace = 'CREATE OR REPLACE';
while (anchor = schema.nextAnchor()) {
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        // set options per dialect
        switch (schema.metadata.databaseTarget) {
            // the row number variant with sub query
            case 'Redshift':
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
            break;       
            // The row number variant with qualify              
            case 'Teradata': // Snowflake also
                createOrReplace = 'REPLACE';
                selectTop  = 'SELECT';
                orderBy = `QUALIFY ROW_NUMBER() OVER (PARTITION BY ${attribute.anchorReferenceName} ORDER BY ${attribute.anchorReferenceName}, ${attribute.changingColumnName} DESC) = 1`;
            break;
            // The row number variant with the Vertica limit analytic function
            case 'Vertica':
                selectTop  = 'SELECT';
                orderBy = `LIMIT 1 OVER (PARTITION BY ${attribute.anchorReferenceName} ORDER BY ${attribute.anchorReferenceName}, ${attribute.changingColumnName} DESC) = 1`;
            break;             
            // The default PostgreSQL way with distinct on that can use the pk index in reverse
            default: // DuckDB, Citus and PostgreSQL
                selectTop  = `SELECT DISTINCT ON (${attribute.anchorReferenceName})`;
                orderBy = `ORDER BY ${attribute.anchorReferenceName} DESC, ${attribute.changingColumnName} DESC`;
        }
        if(attribute.isHistorized()) {
            var attributeValueColumnType;
        
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                attributeValueColumnType = knot.identity;
            } else {
                attributeValueColumnType = attribute.dataRange;
            }            
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$attribute.name viewed by the latest available information (may include future versions)
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
~*/
        }
    }
}