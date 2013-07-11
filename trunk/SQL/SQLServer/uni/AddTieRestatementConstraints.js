var tie, role, restatements = false;
while (tie = schema.nextHistorizedTie())
    if(!tie.isRestatable() && tie.roles.length > tie.identifiers.length)
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
~*/
    while (tie = schema.nextHistorizedTie()) {
        // the tie needs to have at least one role outside of the identifier
        if(!tie.isRestatable() && tie.roles.length > tie.identifiers.length) {
/*~
-- Restatement Finder Function and Constraint -------------------------------------------------------------------------
-- rf$tie.name restatement finder
--
~*/
            while(role = tie.nextRole()) {
/*~
-- @$role.columnName $(role.isIdentifier())? primary key component : non-key value
~*/
            }
/*~
-- @changed     the point in time from which this value shall represent a change
--
-- rc$tie.name restatement constraint
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('rf$tie.name', 'FN') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$tie.capsule].[rf$tie.name] (
~*/
            while(role = tie.nextRole()) {
/*~
        @$role.columnName $(role.anchor)? $role.anchor.identity, : $role.knot.identity,
~*/
            }
/*~
        @changed $tie.timeRange
    )
    RETURNS tinyint AS
    BEGIN RETURN (
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
                [$tie.capsule].[$tie.name] pre
            WHERE
~*/
            while(role = tie.nextIdentifier()) {
/*~
                pre.$role.columnName = @$role.columnName
            AND
~*/
            }
/*~
                pre.$tie.changingColumnName <= @changed
            ORDER BY
                pre.$tie.changingColumnName DESC
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
                [$tie.capsule].[$tie.name] fol
            WHERE
~*/
            while(role = tie.nextIdentifier()) {
/*~
                fol.$role.columnName = @$role.columnName
            AND
~*/
            }
/*~
                fol.$tie.changingColumnName >= @changed
            ORDER BY
                fol.$tie.changingColumnName ASC
        ) s
        WHERE
~*/
            while(role = tie.nextValue()) {
/*~
            s.$role.columnName = @$role.columnName
        $(tie.hasMoreValues())? AND
~*/
            }
/*~
    );
    END
    ');
    ALTER TABLE [$tie.capsule].[$tie.name]
    ADD CONSTRAINT [rc$tie.name] CHECK (
        [$tie.capsule].[rf$tie.name] (
~*/
            while(role = tie.nextRole()) {
/*~
            $role.columnName,
~*/
            }
/*~
            $tie.changingColumnName
        ) = 0
    );
END
GO
~*/
        }
    }
}
