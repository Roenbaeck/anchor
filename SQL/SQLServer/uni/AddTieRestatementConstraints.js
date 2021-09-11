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

CREATE TRIGGER [$tie.capsule$].[rt_$tie.name] ON [$tie.capsule].[$tie.name]
AFTER INSERT, UPDATE
AS 
BEGIN
    SET NOCOUNT ON;
    DECLARE @message varchar(555);
    DECLARE @id varchar(555);

    -- check previous values
    SET @id = (
        SELECT TOP 1
            'X' -- TODO: concat the offending values here
        FROM 
            inserted i
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
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                h.$role.columnName = i.$role.columnName
            AND
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
                h.$role.columnName = i.$role.columnName
            AND
~*/
                }
            }
/*~
                h.$tie.changingColumnName < i.$tie.changingColumnName
            ORDER BY 
                h.$tie.changingColumnName DESC
        ) pre        
        WHERE
~*/
            while(role = tie.nextRole()) {
/*~
            i.$role.columnName = pre.$role.columnName
        $(tie.hasMoreRoles())? AND
~*/
            }
/*~
    );
    IF @id is not null
    BEGIN
        SET @message = '$tie.name has a clash with an identical previous value';
        RAISERROR(@message, 16, 1);
        ROLLBACK;
    END

    -- check following values
    SET @id = (
        SELECT TOP 1
            'X' -- TODO: concat the offending values here
        FROM 
            inserted i
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
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                h.$role.columnName = i.$role.columnName
            AND
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
                h.$role.columnName = i.$role.columnName
            AND
~*/
                }
            }
/*~
                h.$tie.changingColumnName > i.$tie.changingColumnName
            ORDER BY 
                h.$tie.changingColumnName ASC
        ) fol        
        WHERE
~*/
            while(role = tie.nextRole()) {
/*~
            i.$role.columnName = fol.$role.columnName
        $(tie.hasMoreRoles())? AND
~*/
            }
/*~
    );
    IF @id is not null
    BEGIN
        SET @message = '$tie.name has a clash with an identical following value';
        RAISERROR(@message, 16, 1);
        ROLLBACK;
    END
END
GO
~*/
        }
    }
}
