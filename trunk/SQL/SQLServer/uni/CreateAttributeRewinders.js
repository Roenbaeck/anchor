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
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.isHistorized()) {
            if(!attribute.isKnotted()) {
/*~
-- Attribute rewinder -------------------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.name] (
        @changingTimepoint $attribute.timeRange
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        [$attribute.capsule].[$attribute.name]
    WHERE
        $attribute.changingColumnName <= @changingTimepoint;
    ');
END
GO
~*/
            }
            else {
/*~
-- Attribute rewinder -------------------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.name] (
        @changingTimepoint $attribute.timeRange
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $attribute.knotReferenceName,
        $attribute.changingColumnName
    FROM
        [$attribute.capsule].[$attribute.name]
    WHERE
        $attribute.changingColumnName <= @changingTimepoint;
    ');
END
GO
~*/
            }
        }
    }
}
