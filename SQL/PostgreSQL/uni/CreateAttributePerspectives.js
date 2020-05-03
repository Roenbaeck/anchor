/*~
-- ATTRIBUTE REWINDERS ------------------------------------------------------------------------------------------------
--
-- These table valued functions rewind an attribute table to the given
-- point in changing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time.
--
-- @changingTimepoint   the point in changing time to rewind to
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
-- Attribute Point-in-time perspective -------------------------------------------------------------------------------------------------
-- p$attribute.name iewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $attribute.capsule\.p$attribute.name(
    $(attribute.isEquivalent())? equivalent $schema.metadata.equivalentRange,
    changingTimepoint $attribute.timeRange
) RETURNS TABLE(
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.anchorReferenceName $anchor.identity,
    $(attribute.isEquivalent() && !attribute.isKnotted())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
    $(!attribute.isKnotted() && attribute.hasChecksum())? $attribute.checksumColumnName bytea,
    $attribute.valueColumnName $attributeValueColumnType,
    $attribute.changingColumnName $attribute.timeRange
) AS '
    SELECT DISTINCT ON ($attribute.anchorReferenceName) $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isEquivalent() && !attribute.isKnotted())? $attribute.equivalentColumnName,
        $(!attribute.isKnotted() && attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        $(attribute.isEquivalent() && !attribute.isKnotted())? $attribute.capsule\.e$attribute.name(equivalent) : $attribute.capsule\.$attribute.name
    WHERE
        $attribute.changingColumnName <= changingTimepoint
    ORDER BY
        $attribute.anchorReferenceName DESC,
        $attribute.changingColumnName DESC     
    ;
' LANGUAGE SQL STABLE;
~*/
        }
    }
}
