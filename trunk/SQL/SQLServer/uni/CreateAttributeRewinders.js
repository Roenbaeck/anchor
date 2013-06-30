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
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
    var knot, attribute;
    for(var b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
        if(attribute.timeRange) {
            if(attribute.dataRange) {
/*~
-- Attribute rewinder -------------------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.name] (
        @changingTimepoint $attribute.timeRange
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        ${(schema.metadataUsage == 'true' ? attribute.metadataColumnName + ',' : '')}$
        $attribute.anchorReferenceName,
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
            else if(attribute.knotRange) {
/*~
-- Attribute rewinder -------------------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.name] (
        @changingTimepoint $attribute.timeRange
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        ${(schema.metadataUsage == 'true' ? attribute.metadataColumnName + ',' : '')}$
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
