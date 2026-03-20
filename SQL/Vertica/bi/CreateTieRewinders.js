/*~
-- TIE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------------
--
-- These table valued functions rewind a tie posit table to the given
-- point in changing time, or a tie annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time. The forwarder is the opposite of the rewinder, such that 
-- their union corresponds to all rows in the posit table.
--
-- @changingTimepoint   the point in changing time to rewind to (defaults to End of Time, no rewind)
-- @positingTimepoint   the point in positing time to rewind to (defaults to End of Time, no rewind)
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
    if(tie.isHistorized()) {
/*~
-- Tie posit rewinder -------------------------------------------------------------------------------------------------
-- r$tie.positName rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.r$tie.positName','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[r$tie.positName] (
        @changingTimepoint $tie.timeRange = '$schema.EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
        }
/*~
        $tie.changingColumnName
    FROM
        [$tie.capsule].[$tie.positName]
    WHERE
        $tie.changingColumnName <= @changingTimepoint;
    ');
END
GO
-- Tie posit forwarder ------------------------------------------------------------------------------------------------
-- f$tie.positName forwarding over changing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.f$tie.positName','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[f$tie.positName] (
        @changingTimepoint $tie.timeRange = '$schema.EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
        }
/*~
        $tie.changingColumnName
    FROM
        [$tie.capsule].[$tie.positName]
    WHERE
        $tie.changingColumnName > @changingTimepoint;
    ');
END
GO
~*/
    }
/*~
-- Tie annex rewinder -------------------------------------------------------------------------------------------------
-- r$tie.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.r$tie.annexName','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[r$tie.annexName] (
        @positingTimepoint $schema.metadata.positingRange = '$schema.EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(schema.METADATA)? $tie.metadataColumnName,
        $tie.identityColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    FROM
        [$tie.capsule].[$tie.annexName]
    WHERE
        $tie.positingColumnName <= @positingTimepoint;
    ');
END
GO
-- Tie assembled rewinder ---------------------------------------------------------------------------------------------
-- r$tie.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.r$tie.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[r$tie.name] (
        $(tie.isHistorized())? @changingTimepoint $tie.timeRange = '$schema.EOT',
        @positingTimepoint $schema.metadata.positingRange = '$schema.EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(schema.METADATA)? a.$tie.metadataColumnName,
        p.$tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        p.$role.columnName,
~*/
        }
/*~
        $(tie.isHistorized())? p.$tie.changingColumnName,
        a.$tie.positingColumnName,
        a.$tie.reliabilityColumnName
    FROM
        $(tie.isHistorized())? [$tie.capsule].[r$tie.positName](@changingTimepoint) p : [$tie.capsule].[$tie.positName] p
    JOIN
        [$tie.capsule].[r$tie.annexName](@positingTimepoint) a
    ON
        a.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        a.$tie.positingColumnName = (
            SELECT TOP 1
                sub.$tie.positingColumnName
            FROM
                [$tie.capsule].[r$tie.annexName](@positingTimepoint) sub
            WHERE
                sub.$tie.identityColumnName = p.$tie.identityColumnName
            ORDER BY
                sub.$tie.positingColumnName DESC
        )
    ');
END
GO
-- Tie assembled forwarder --------------------------------------------------------------------------------------------
-- f$tie.name forwarding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.f$tie.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[f$tie.name] (
        $(tie.isHistorized())? @changingTimepoint $tie.timeRange = '$schema.EOT',
        @positingTimepoint $schema.metadata.positingRange = '$schema.EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(schema.METADATA)? a.$tie.metadataColumnName,
        p.$tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        p.$role.columnName,
~*/
        }
/*~
        $(tie.isHistorized())? p.$tie.changingColumnName,
        a.$tie.positingColumnName,
        a.$tie.reliabilityColumnName
    FROM
        $(tie.isHistorized())? [$tie.capsule].[f$tie.positName](@changingTimepoint) p : [$tie.capsule].[$tie.positName] p
    JOIN
        [$tie.capsule].[r$tie.annexName](@positingTimepoint) a
    ON
        a.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        a.$tie.positingColumnName = (
            SELECT TOP 1
                sub.$tie.positingColumnName
            FROM
                [$tie.capsule].[r$tie.annexName](@positingTimepoint) sub
            WHERE
                sub.$tie.identityColumnName = p.$tie.identityColumnName
            ORDER BY
                sub.$tie.positingColumnName DESC
        )
    ');
END
GO
~*/
}