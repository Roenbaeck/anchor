/*~
-- ATTRIBUTE REWINDERS ------------------------------------------------------------------------------------------------
--
-- These table valued functions rewind an attribute posit table to the given
-- point in changing time, or an attribute annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time.
--
-- @positor             the view of which positor to adopt (defaults to 0)
-- @changingTimepoint   the point in changing time to rewind to (defaults to End of Time, no rewind)
-- @positingTimepoint   the point in positing time to rewind to (defaults to End of Time, no rewind)
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.isHistorized()) {
/*~
-- Attribute posit rewinder -------------------------------------------------------------------------------------------
-- r$attribute.positName rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$attribute.positName','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.positName] (
        @changingTimepoint $attribute.timeRange = '$EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $attribute.identityColumnName,
        $attribute.anchorReferenceName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        [$attribute.capsule].[$attribute.positName]
    WHERE
        $attribute.changingColumnName <= @changingTimepoint;
    ');
END
GO
-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-- r$attribute.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$attribute.annexName','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.annexName] (
        @positingTimepoint $schema.positingRange = '$EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positingColumnName,
        $attribute.positorColumnName,
        $attribute.reliabilityColumnName,
        $attribute.reliableColumnName
    FROM
        [$attribute.capsule].[$attribute.annexName]
    WHERE
        $attribute.positingColumnName <= @positingTimepoint;
    ');
END
GO
-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.name] (
        @positor $schema.positorRange = 0,
        @changingTimepoint $attribute.timeRange = '$EOT',
        @positingTimepoint $schema.positingRange = '$EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? a.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        a.$attribute.positingColumnName,
        a.$attribute.positorColumnName,
        a.$attribute.reliabilityColumnName,
        a.$attribute.reliableColumnName,
        p.$attribute.anchorReferenceName,
        p.$attribute.valueColumnName,
        p.$attribute.changingColumnName
    FROM
        [$attribute.capsule].[r$attribute.positName](@changingTimepoint) p
    JOIN
        [$attribute.capsule].[r$attribute.annexName](@positingTimepoint) a
    ON
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.positorColumnName = @positor
    AND
        a.$attribute.positingColumnName = (
            SELECT TOP 1
                sub.$attribute.positingColumnName
            FROM
                [$attribute.capsule].[r$attribute.annexName](@positingTimepoint) sub
            WHERE
                sub.$attribute.identityColumnName = p.$attribute.identityColumnName
            AND
                sub.$attribute.positorColumnName = @positor
            ORDER BY
                sub.$attribute.positingColumnName DESC
        )
    ');
END
GO
~*/
        }
        else {
/*~
-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-- r$attribute.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$attribute.annexName','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.annexName] (
        @positingTimepoint $schema.positingRange = '$EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positingColumnName,
        $attribute.positorColumnName,
        $attribute.reliabilityColumnName,
        $attribute.reliableColumnName
    FROM
        [$attribute.capsule].[$attribute.annexName]
    WHERE
        $attribute.positingColumnName <= @positingTimepoint;
    ');
END
GO
-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-- r$attribute.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[r$attribute.name] (
        @positor $schema.positorRange = 0,
        @positingTimepoint $schema.positingRange = '$EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? a.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        a.$attribute.positingColumnName,
        a.$attribute.positorColumnName,
        a.$attribute.reliabilityColumnName,
        a.$attribute.reliableColumnName,
        p.$attribute.anchorReferenceName,
        p.$attribute.valueColumnName
    FROM
        [$attribute.capsule].[$attribute.positName] p
    JOIN
        [$attribute.capsule].[r$attribute.annexName](@positingTimepoint) a
    ON
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.positorColumnName = @positor
    AND
        a.$attribute.positingColumnName = (
            SELECT TOP 1
                sub.$attribute.positingColumnName
            FROM
                [$attribute.capsule].[r$attribute.annexName](@positingTimepoint) sub
            WHERE
                sub.$attribute.identityColumnName = p.$attribute.identityColumnName
            AND
                sub.$attribute.positorColumnName = @positor
            ORDER BY
                sub.$attribute.positingColumnName DESC
        )
    ');
END
GO
~*/
        }

    }
}
