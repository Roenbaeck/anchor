/*~
-- ATTRIBUTE REWINDERS ------------------------------------------------------------------------------------------------
--
-- These table valued functions rewind an attribute posit table to the given
-- point in changing time, or an attribute annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time.
--
-- @positor             the view of which positor to adopt
-- @changingTimepoint   the point in changing time to rewind to (default to End of Time, no rewind)
-- @positingTimepoint   the point in positing time to rewind to (default to End of Time, no rewind)
-- @changingVersion     the desired changing version, where 1 is the latest, 2 the previous, ...
-- @positingVersion     the desired positing version, where 1 is the latest, 2 the previous, ...
-- @reliable            whether to look at reliable (1) or unreliable (0) information
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
        $attribute.reliableColumnName,
        row_number() over (
            partition by
                $attribute.identityColumnName,
                $attribute.positorColumnName
            order by
                $attribute.positingColumnName desc
        ) AS $attribute.versionColumnName
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
        @changingTimepoint $attribute.timeRange = '$EOT',
        @positingTimepoint $schema.positingRange = '$EOT',
        @positingVersion int = 1,
        @reliable tinyint = 1
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
        p.$attribute.changingColumnName,
        row_number() over (
            partition by
                p.$attribute.anchorReferenceName,
                a.$attribute.positorColumnName
            order by
                p.$attribute.changingColumnName desc,
                a.$attribute.positingColumnName desc
        ) as $attribute.versionColumnName
    FROM
        [$attribute.capsule].[r$attribute.positName](@changingTimepoint) p
    JOIN
        [$attribute.capsule].[r$attribute.annexName](@positingTimepoint) a
    ON
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.reliableColumnName = @reliable
    AND
        a.$attribute.versionColumnName = @positingVersion
    ');
END
GO
-- Attribute time traveler --------------------------------------------------------------------------------------------
-- t$attribute.name time traveler function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('t$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[t$attribute.name] (
        @positor $schema.positorRange,
        @changingTimepoint $attribute.timeRange = '$EOT',
        @positingTimepoint $schema.positingRange = '$EOT',
        @changingVersion int = 1,
        @positingVersion int = 1,
        @reliable tinyint = 1
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positingColumnName,
        $attribute.positorColumnName,
        $attribute.reliabilityColumnName,
        $attribute.reliableColumnName,
        $attribute.anchorReferenceName,
        $attribute.valueColumnName,
        $attribute.changingColumnName
    FROM
        [$attribute.capsule].[r$attribute.name](
            @changingTimepoint,
            @positingTimepoint,
            @positingVersion,
            @reliable
        )
    WHERE
        $attribute.versionColumnName = @changingVersion
    AND
        $attribute.positorColumnName = @positor
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
        $attribute.reliableColumnName,
        row_number() over (
            partition by
                $attribute.identityColumnName,
                $attribute.positorColumnName
            order by
                $attribute.positingColumnName desc
        ) AS $attribute.versionColumnName
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
        @positingTimepoint $schema.positingRange = '$EOT',
        @positingVersion int = 1,
        @reliable tinyint = 1
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
        a.$attribute.reliableColumnName = @reliable
    AND
        a.$attribute.versionColumnName = @positingVersion
    ');
END
GO
-- Attribute time traveler --------------------------------------------------------------------------------------------
-- t$attribute.name time traveler function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('t$attribute.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[t$attribute.name] (
        @positor $schema.positorRange,
        @positingTimepoint $schema.positingRange = '$EOT',
        @positingVersion int = 1,
        @reliable tinyint = 1
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positingColumnName,
        $attribute.positorColumnName,
        $attribute.reliabilityColumnName,
        $attribute.reliableColumnName,
        $attribute.anchorReferenceName,
        $attribute.valueColumnName
    FROM
        [$attribute.capsule].[r$attribute.name](
            @positingTimepoint,
            @positingVersion,
            @reliable
        )
    WHERE
        $attribute.positorColumnName = @positor
    ');
END
GO
~*/
        }

    }
}
