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

CREATE TRIGGER [$tie.capsule$].[rt_$tie.name] ON [$tie.capsule].[$tie.annexName]
AFTER INSERT
AS 
BEGIN
    SET NOCOUNT ON;
    DECLARE @message varchar(max);

    DECLARE @inserted TABLE (
        $tie.identityColumnName $tie.identity not null,
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
        $tie.positingColumnName $schema.metadata.positingRange not null,
        $tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
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
            $(tie.isHistorized())? $tie.changingColumnName desc,
            $tie.positingColumnName desc
        ), 
        unique (   
            $tie.identityColumnName,
            $tie.positingColumnName
        )
    );

    INSERT INTO @inserted (
        $tie.identityColumnName,
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    ) 
    SELECT
        i.$tie.identityColumnName,
        $(schema.METADATA)? i.$tie.metadataColumnName,
        $(tie.isHistorized())? p.$tie.changingColumnName,
        i.$tie.positingColumnName,
        i.$tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        p.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    FROM
        inserted i
    JOIN 
        [$tie.capsule].[$tie.positName] p
    ON 
        p.$tie.identityColumnName = i.$tie.identityColumnName; -- the posit has already been created
    
    INSERT INTO @inserted (
        $tie.identityColumnName,
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    ) 
    SELECT
        p.$tie.identityColumnName,
        $(schema.METADATA)? p.$tie.metadataColumnName,
        $(tie.isHistorized())? p.$tie.changingColumnName,
        p.$tie.positingColumnName,
        p.$tie.reliabilityColumnName,
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
    LEFT JOIN 
        @inserted x
    ON
        x.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        x.$tie.positingColumnName = p.$tie.positingColumnName
    WHERE
        x.$tie.identityColumnName is null;

    -- no need to check retracted information
    DELETE a 
    FROM 
        @inserted a
    OUTER APPLY (
        SELECT TOP 1
            x.$tie.reliabilityColumnName
        FROM 
            @inserted x
        WHERE
            x.$tie.identityColumnName = a.$tie.identityColumnName
        AND
            x.$tie.positingColumnName < a.$tie.positingColumnName
        ORDER BY
            x.$tie.positingColumnName DESC
    ) pre    
    OUTER APPLY (
        SELECT TOP 1
            x.$tie.reliabilityColumnName
        FROM 
            @inserted x
        WHERE
            x.$tie.identityColumnName = a.$tie.identityColumnName
        AND
            x.$tie.positingColumnName > a.$tie.positingColumnName
        ORDER BY
            x.$tie.positingColumnName ASC
    ) fol    
    WHERE
        (a.$tie.reliabilityColumnName = 1 AND fol.$tie.reliabilityColumnName = 0)
    OR
        (a.$tie.reliabilityColumnName = 0 AND pre.$tie.reliabilityColumnName = 1);

    -- check previous values
    SET @message = (
        SELECT TOP 1
            pre.*
        FROM 
            @inserted a
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
                $tie.name h
            WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                h.$role.columnName = a.$role.columnName
            AND
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
                h.$role.columnName = a.$role.columnName
            AND
~*/
                }
            }
/*~
                h.$tie.changingColumnName < a.$tie.changingColumnName
            ORDER BY 
                h.$tie.changingColumnName DESC,
                h.$tie.positingColumnName DESC
        ) pre        
        WHERE
~*/
            while(role = tie.nextRole()) {
/*~
            a.$role.columnName = pre.$role.columnName
        AND
~*/
            }
/*~
            a.$tie.reliabilityColumnName = 1
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
