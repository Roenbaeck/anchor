/*~
-- ATTRIBUTE TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each attribute. There are three types of perspectives: latest,
-- point-in-time and now. 
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
var anchor;
while (anchor = schema.nextAnchor()) {
    var attribute;
    while (attribute = anchor.nextAttribute()) {
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

CREATE OR REPLACE VIEW $attribute.capsule\.l$attribute.name AS
SELECT DISTINCT ON ($attribute.anchorReferenceName) $attribute.anchorReferenceName
     , $attribute.valueColumnName
     , $attribute.changingColumnName
     $(schema.METADATA)? , $attribute.metadataColumnName
     $(attribute.isEquivalent() && !attribute.isKnotted())? , $attribute.equivalentColumnName
     $(!attribute.isKnotted() && attribute.hasChecksum())? , $attribute.checksumColumnName
  FROM $(attribute.isEquivalent() && !attribute.isKnotted())? $attribute.capsule\.e$attribute.name(equivalent) : $attribute.capsule\.$attribute.name
 ORDER 
    BY $attribute.anchorReferenceName DESC
     , $attribute.changingColumnName DESC   
;

-- Attribute Point-in-time perspective -------------------------------------------------------------------------------------------------
-- p$attribute.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
 CREATE OR REPLACE FUNCTION $attribute.capsule\.p$attribute.name
      ( changingTimepoint $attribute.timeRange
      $(attribute.isEquivalent())? , equivalent $schema.metadata.equivalentRange
      ) 
RETURNS TABLE
      ( $attribute.anchorReferenceName $anchor.identity
      , $attribute.valueColumnName $attributeValueColumnType
      , $attribute.changingColumnName $attribute.timeRange    
      $(schema.METADATA)? , $attribute.metadataColumnName $schema.metadata.metadataType
      $(attribute.isEquivalent() && !attribute.isKnotted())? , $attribute.equivalentColumnName $schema.metadata.equivalentRange
      $(!attribute.isKnotted() && attribute.hasChecksum())? , $attribute.checksumColumnName bytea
      ) 
AS 
'
 SELECT DISTINCT ON ($attribute.anchorReferenceName) $attribute.anchorReferenceName
      , $attribute.valueColumnName
      , $attribute.changingColumnName
      $(schema.METADATA)? , $attribute.metadataColumnName
      $(attribute.isEquivalent() && !attribute.isKnotted())? , $attribute.equivalentColumnName
      $(!attribute.isKnotted() && attribute.hasChecksum())? , $attribute.checksumColumnName
   FROM $(attribute.isEquivalent() && !attribute.isKnotted())? $attribute.capsule\.e$attribute.name(equivalent) : $attribute.capsule\.$attribute.name
  WHERE $attribute.changingColumnName <= changingTimepoint
  ORDER 
     BY $attribute.anchorReferenceName DESC
      , $attribute.changingColumnName DESC     
 ;
' 
LANGUAGE SQL STABLE
;

-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$attribute.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $attribute.capsule\.n$attribute.name AS
SELECT *
  FROM $attribute.capsule\.p$attribute.name($schema.metadata.now::$attribute.timeRange)
;
~*/
        }
    }
}