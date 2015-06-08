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
-- @positor     the one who made the posit
-- @reliable    whether this posit is considered reliable (1) or unreliable (0)
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
        @posited $schema.metadata.positingRange,
        @positor $schema.metadata.positorRange,
        @reliable tinyint
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

    RETURN
        CASE WHEN @reliable = 0 THEN 0
        ELSE (
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
                    @positor,
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
                while(role = tie.nextValue()) {
/*~
                    pre.$role.columnName = @$role.name
                $(tie.hasMoreValues())? OR
~*/
                }
/*~
            )
            AND
~*/
            }
/*~
                pre.$tie.changingColumnName < @changed
            AND
                pre.$tie.reliableColumnName = 1
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
                    @positor,
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
                while(role = tie.nextValue()) {
/*~
                    fol.$role.columnName = @$role.name
                $(tie.hasMoreValues())? OR
~*/
                }
/*~
            )
            AND
~*/
            }
/*~
                fol.$tie.changingColumnName > @changed
            AND
                fol.$tie.reliableColumnName = 1
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
    END;
    END
    ');
~*/
            if(!tie.isRestatable()) {
/*~
    ALTER TABLE [$tie.capsule].[$tie.annexName]
    ADD CONSTRAINT [rc$tie.name] CHECK (
        [$tie.capsule].[rf$tie.name] (
            $tie.identityColumnName,
            $tie.positingColumnName,
            $tie.positorColumnName,
            $tie.reliableColumnName
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
