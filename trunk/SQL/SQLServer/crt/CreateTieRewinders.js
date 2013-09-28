/*~
-- TIE REWINDERS ------------------------------------------------------------------------------------------------------
--
-- These table valued functions rewind a tie posit table to the given
-- point in changing time, or a tie annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time.
--
-- @positor             the view of which positor to adopt (defaults to 0)
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
IF Object_ID('r$tie.positName','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[r$tie.positName] (
        @changingTimepoint $tie.timeRange = '$EOT'
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
        [$tie.capsule].[r$tie.positName]
    WHERE
        $tie.changingColumnName <= @changingTimepoint;
    ');
END
GO
~*/
    }
/*~
-- Tie annex rewinder -------------------------------------------------------------------------------------------------
-- r$tie.annexName rewinding over positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$tie.annexName','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[r$tie.annexName] (
        @positingTimepoint $schema.positingRange = '$EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? $tie.metadataColumnName,
        $tie.identityColumnName,
        $tie.positingColumnName,
        $tie.positorColumnName,
        $tie.reliabilityColumnName,
        $tie.reliableColumnName
    FROM
        [$tie.capsule].[r$tie.annexName]
    WHERE
        $tie.positingColumnName <= @positingTimepoint;
    ');
END
GO
-- Tie assembled rewinder ---------------------------------------------------------------------------------------------
-- r$tie.name rewinding over changing and positing time function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('r$tie.name','IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[r$tie.name] (
        @positor $schema.positorRange = 0,
        $(tie.isHistorized())? @changingTimepoint $tie.timeRange = '$EOT',
        @positingTimepoint $schema.positingRange = '$EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(METADATA)? a.$tie.metadataColumnName,
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
        a.$tie.positorColumnName,
        a.$tie.reliabilityColumnName,
        a.$tie.reliableColumnName
    FROM
        $(tie.isHistorized())? [$tie.capsule].[r$tie.positName](@changingTimepoint) p : [$tie.capsule].[$tie.positName] p
    JOIN
        [$tie.capsule].[r$tie.annexName](@positingTimepoint) a
    ON
        a.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        a.$tie.positorColumnName = @positor
    AND
        a.$tie.positingColumnName = (
            SELECT TOP 1
                sub.$tie.positingColumnName
            FROM
                [$tie.capsule].[r$tie.annexName](@positingTimepoint) sub
            WHERE
                sub.$tie.identityColumnName = p.$tie.identityColumnName
            AND
                sub.$tie.positorColumnName = @positor
            ORDER BY
                sub.$tie.positingColumnName DESC
        )
    ');
END
GO
~*/
}