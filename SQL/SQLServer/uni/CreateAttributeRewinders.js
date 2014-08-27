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
/*~
-- Attribute rewinder -------------------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.r$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.name] (
        $(attribute.isEquivalent())? @equivalent $schema.metadata.equivalentRange,
        @changingTimepoint $attribute.timeRange
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(!attribute.isKnotted() && attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) : [$attribute.capsule].[$attribute.name]
    WHERE
        $attribute.changingColumnName <= @changingTimepoint;
    ');
END
GO
~*/
        }
    }
}
