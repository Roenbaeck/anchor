var tie, role, restatements = false;
while (tie = schema.nextHistorizedTie())
    if(tie.hasMoreValues())
        restatements = true;

if(restatements) {
/*~
-- TIE RESTATEMENT CONSTRAINTS ----------------------------------------------------------------------------------------
--
-- Ties may be prevented from storing restatements.
-- A restatement is when the same (non-key) values occurs for two adjacent points
-- in changing time.
--
-- returns      1 for one or two equal surrounding values, 0 for different surrounding values
--
-- @posit       the id of the posit that should be checked
-- @posited     the time when this posit was made
--
~*/
    while (tie = schema.nextHistorizedTie()) {
        // the tie needs to have at least one role outside of the identifier
        if(tie.hasMoreValues()) {
/*~
-- Restatement Finder Function and Constraint -------------------------------------------------------------------------
-- rf$tie.name restatement finder
-- rc$tie.name restatement constraint (available only in ties that cannot have restatements)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.rf$tie.name', 'FN') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[rf$tie.name] (
        @posit $tie.identity,
        @posited $schema.metadata.positingRange
    )
    RETURNS tinyint AS
    BEGIN
    DECLARE @changed $tie.timeRange;
~*/
        while(role = tie.nextRole()) {
/*~
    DECLARE @$role.name $(role.anchor)? $role.anchor.identity; : $role.knot.identity;
~*/
        }
/*~
    SELECT
~*/
        while(role = tie.nextRole()) {
/*~
        @$role.name = p.$role.columnName,
~*/
        }
/*~
        @changed = p.$tie.changingColumnName
    FROM
        [$tie.capsule].[$tie.positName] p
    WHERE
        p.$tie.identityColumnName = @posit;

    RETURN (
        SELECT
            COUNT(*)
        FROM (
            SELECT TOP 1
~*/
            while(role = tie.nextValue()) {
/*~
                pre.$role.columnName$(tie.hasMoreValues())?,
~*/
            }
/*~
            FROM
                [$tie.capsule].[r$tie.name] (
                    @changed,
                    @posited
                ) pre
            WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                pre.$role.columnName = @$role.name
            AND
~*/
                }
            }
            else {
/*~
            (
~*/
                while(role = tie.nextAnchorRole()) {
/*~
                    pre.$role.columnName = @$role.name
                $(tie.hasMoreAnchorRoles())? OR
~*/
                }
/*~
            )
            AND
~*/
            }
/*~
                pre.$tie.changingColumnName < @changed
            ORDER BY
                pre.$tie.changingColumnName DESC,
                pre.$tie.positingColumnName DESC
            UNION
            SELECT TOP 1
~*/
            while(role = tie.nextValue()) {
/*~
                fol.$role.columnName$(tie.hasMoreValues())?,
~*/
            }
/*~
            FROM
                [$tie.capsule].[f$tie.name] (
                    @changed,
                    @posited                    
                ) fol
            WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                fol.$role.columnName = @$role.name
            AND
~*/
                }
            }
            else {
/*~
            (
~*/
                while(role = tie.nextAnchorRole()) {
/*~
                    fol.$role.columnName = @$role.name
                $(tie.hasMoreAnchorRoles())? OR
~*/
                }
/*~
            )
            AND
~*/
            }
/*~
                fol.$tie.changingColumnName > @changed
            ORDER BY
                fol.$tie.changingColumnName ASC,
                fol.$tie.positingColumnName DESC
        ) s
        WHERE
~*/
            while(role = tie.nextValue()) {
/*~
            s.$role.columnName = @$role.name
        $(tie.hasMoreValues())? AND
~*/
            }
/*~
    )
    END
    ');
~*/
            if(!tie.isRestatable()) {
/*~
    ALTER TABLE [$tie.capsule].[$tie.annexName]
    ADD CONSTRAINT [rc$tie.name] CHECK (
        [$tie.capsule].[rf$tie.name] (
            $tie.identityColumnName,
            $tie.positingColumnName
        ) = 0
    );
~*/
            }
/*~
END
GO
~*/
        }
    }
}
