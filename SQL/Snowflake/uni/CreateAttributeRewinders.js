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
var attribute;
while (attribute = schema.nextAttribute()) {
    if(attribute.isHistorized()) {
        var parent = attribute.parent;
        var equivalentSource = attribute.isEquivalent() && !attribute.isKnotted();
/*~
-- Attribute rewinder -------------------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.r$attribute.name (
    $(equivalentSource)? equivalent $schema.metadata.equivalentRange,
    changingTimepoint $attribute.timeRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
    $(!attribute.isKnotted() && attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $attribute.dataRange,
    $attribute.changingColumnName $attribute.timeRange
)
AS
$$$$
    SELECT
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.entityReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(!attribute.isKnotted() && attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        $(equivalentSource)? TABLE(${attribute.capsule}$.e$attribute.name(equivalent)) : ${attribute.capsule}$.$attribute.name
    WHERE
        $attribute.changingColumnName <= changingTimepoint
$$$$
;
~*/
    }
}
