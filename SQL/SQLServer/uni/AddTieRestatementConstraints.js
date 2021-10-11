var tie, role, constraints = false;
while (tie = schema.nextHistorizedTie())
    if(tie.hasMoreValues() && !tie.isRestatable())
        constraints = true;

if(constraints) {
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
        if(tie.hasMoreValues() && !tie.isRestatable()) {
/*~
-- Restatement Checking Trigger ---------------------------------------------------------------------------------------
-- rt_$tie.name (available only in ties that cannot have restatements)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.rt_$tie.name', 'TR') IS NOT NULL
DROP TRIGGER [$tie.capsule$].[rt_$tie.name];
GO

CREATE TRIGGER [$tie.capsule$].[rt_$tie.name] ON [$tie.capsule].[$tie.name]
AFTER INSERT
AS 
BEGIN
    SET NOCOUNT ON;
    DECLARE @message varchar(max);

    DECLARE @inserted TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
        $role.columnName $knot.identity not null,
~*/
        }
        else {
            anchor = role.anchor;
/*~
        $role.columnName $anchor.identity not null,
~*/
        }
    }
/*~
        primary key (
~*/
    if(tie.hasMoreIdentifiers()) {
        while(role = tie.nextIdentifier()) {
/*~
            $role.columnName asc,
~*/
        }
    }
    else {
        while(role = tie.nextValue()) {
/*~
            $role.columnName asc,
~*/
        }
    }
/*~
            $tie.changingColumnName desc
        )
    );

    INSERT INTO @inserted (
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    )
    SELECT
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    FROM
        inserted;

    INSERT INTO @inserted (
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    )
    SELECT
        $(schema.METADATA)? p.$tie.metadataColumnName,
        p.$tie.changingColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        p.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    FROM (
        SELECT DISTINCT
~*/
        if(tie.hasMoreIdentifiers()) {
            while(role = tie.nextIdentifier()) {
/*~
            $role.columnName$(tie.hasMoreIdentifiers())?,
~*/
            }
        }
        else {
            while(role = tie.nextValue()) {
/*~
            $role.columnName$(tie.hasMoreValues())?,
~*/
            }
        }
/*~
        FROM 
            @inserted 
    ) i
    JOIN
        [$tie.capsule].[$tie.name] p
    ON
~*/
        if(tie.hasMoreIdentifiers()) {
            while(role = tie.nextIdentifier()) {
/*~
        p.$role.columnName = i.$role.columnName
    $(tie.hasMoreIdentifiers())? AND
~*/
            }
        }
        else {
            while(role = tie.nextValue()) {
/*~
        p.$role.columnName = i.$role.columnName
    $(tie.hasMoreValues())? AND
~*/
            }
        }
/*~
    WHERE NOT EXISTS (
        SELECT 
            42
        FROM
            @inserted x
        WHERE 
            x.$tie.changingColumnName = p.$tie.changingColumnName
~*/
        if(tie.hasMoreIdentifiers()) {
            while(role = tie.nextIdentifier()) {
/*~
        AND
            p.$role.columnName = i.$role.columnName
~*/
            }
        }
        else {
            while(role = tie.nextValue()) {
/*~
        AND
            p.$role.columnName = i.$role.columnName
~*/
            }
        }
/*~
    );

    -- check previous values
    SET @message = (
        SELECT TOP 1
            pre.*
        FROM 
            @inserted i
        CROSS APPLY (
            SELECT TOP 1
~*/
            while(role = tie.nextRole()) {
/*~
                $role.columnName,
~*/
            }
/*~
                $tie.changingColumnName
            FROM
                @inserted h
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
        FOR XML PATH('')
    );
    IF @message is not null
    BEGIN
        SET @message = 'Restatement in $tie.name for: ' + @message;
        RAISERROR(@message, 16, 1);
        ROLLBACK;
    END
END
GO
~*/
        }
    }
}
