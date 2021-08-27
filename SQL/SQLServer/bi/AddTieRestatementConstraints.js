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
-- in changing time. Note that restatement checking is not done for
-- unreliable information as this could prevent demotion.
--
-- If actual deletes are made, the remaining information will not
-- be checked for restatements.
--
~*/
    while (tie = schema.nextHistorizedTie()) {
        // the tie needs to have at least one role outside of the identifier
        if(tie.hasMoreValues()) {
/*~
-- Restatement Checking Trigger ---------------------------------------------------------------------------------------
-- rt_$tie.name (available only in ties that cannot have restatements)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.rt_$tie.name', 'TR') IS NOT NULL
DROP TRIGGER [$tie.capsule$].[rt_$tie.name];
GO

CREATE TRIGGER [$tie.capsule$].[rt_$tie.name] ON [$tie.capsule].[$tie.annexName]
AFTER INSERT, UPDATE
AS 
BEGIN
    SET NOCOUNT ON;
    DECLARE @message varchar(555);
    DECLARE @id $tie.identity;

    -- check previous values
    SET @id = (
        SELECT TOP 1
            a.$tie.identityColumnName
        FROM 
            inserted a
        JOIN 
            $tie.positName p
        ON 
            p.$tie.identityColumnName = a.$tie.identityColumnName
        CROSS APPLY (
            SELECT TOP 1
~*/
            while(role = tie.nextRole()) {
/*~
                $role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
            FROM
                $tie.name h
            WHERE
                h.$tie.reliabilityColumnName = 1
            AND
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                h.$role.columnName = p.$role.columnName
            AND
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
                h.$role.columnName = p.$role.columnName
            AND
~*/
                }
            }
/*~
                h.$tie.changingColumnName < p.$tie.changingColumnName
            AND 
                h.$tie.positingColumnName < a.$tie.positingColumnName
            ORDER BY 
                h.$tie.changingColumnName DESC,
                h.$tie.positingColumnName DESC
        ) pre        
        WHERE
~*/
            while(role = tie.nextRole()) {
/*~
            p.$role.columnName = pre.$role.columnName
        AND
~*/
            }
/*~
        a.$tie.reliabilityColumnName = 1
    );
    IF @id is not null
    BEGIN
        SET @message = '$tie.identityColumnName = ' + cast(@id as varchar(42)) + ' clashes with an identical previous value';
        RAISERROR(@message, 16, 1);
        ROLLBACK;
    END

    -- check following values
    SET @id = (
        SELECT TOP 1
            a.$tie.identityColumnName
        FROM 
            inserted a
        JOIN 
            $tie.positName p
        ON 
            p.$tie.identityColumnName = a.$tie.identityColumnName
        CROSS APPLY (
            SELECT TOP 1
~*/
            while(role = tie.nextRole()) {
/*~
                $role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
            FROM
                $tie.name h
            WHERE
                h.$tie.reliabilityColumnName = 1
            AND
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                h.$role.columnName = p.$role.columnName
            AND
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
                h.$role.columnName = p.$role.columnName
            AND
~*/
                }
            }
/*~
                h.$tie.changingColumnName > p.$tie.changingColumnName
            AND 
                h.$tie.positingColumnName < a.$tie.positingColumnName
            ORDER BY 
                h.$tie.changingColumnName ASC,
                h.$tie.positingColumnName DESC
        ) fol        
        WHERE
~*/
            while(role = tie.nextRole()) {
/*~
            p.$role.columnName = fol.$role.columnName
        AND
~*/
            }
/*~
        a.$tie.reliabilityColumnName = 1
    );
    IF @id is not null
    BEGIN
        SET @message = '$tie.identityColumnName = ' + cast(@id as varchar(42)) + ' clashes with an identical following value';
        RAISERROR(@message, 16, 1);
        ROLLBACK;
    END
END
GO
~*/
        }
    }
}
