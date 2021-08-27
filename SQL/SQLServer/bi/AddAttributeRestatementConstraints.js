var anchor, knot, attribute, restatements = false;
while (anchor = schema.nextAnchor())
    while(attribute = anchor.nextAttribute())
        if(attribute.isHistorized())
            restatements = true;

if(restatements) {
/*~
-- ATTRIBUTE RESTATEMENT CONSTRAINTS ----------------------------------------------------------------------------------
--
-- Attributes may be prevented from storing restatements.
-- A restatement is when the same value occurs for two adjacent points
-- in changing time. Note that restatement checking is not done for
-- unreliable information as this could prevent demotion.
--
-- If actual deletes are made, the remaining information will not
-- be checked for restatements.
--
~*/
    while (anchor = schema.nextAnchor()) {
        while(attribute = anchor.nextAttribute()) {
            if(attribute.isHistorized()) {
                var valueColumn, valueType;
                if(!attribute.isKnotted()) {
                    if(attribute.hasChecksum()) {
                        valueColumn = attribute.checksumColumnName;
                        valueType = 'varbinary(16)';
                    }
                    else {
                        valueColumn = attribute.valueColumnName;
                        valueType = attribute.dataRange;
                    }
                }
                else {
                    knot = attribute.knot;
                    valueColumn = attribute.knotReferenceName;
                    valueType = knot.identity;
                }
                if(!attribute.isRestatable()) {
/*~
-- Restatement Checking Trigger ---------------------------------------------------------------------------------------
-- rt_$attribute.name (available only in attributes that cannot have restatements)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.rt_$attribute.name', 'TR') IS NOT NULL
DROP TRIGGER [$attribute.capsule$].[rt_$attribute.name];
GO

CREATE TRIGGER [$attribute.capsule$].[rt_$attribute.name] ON [$attribute.capsule].[$attribute.annexName]
AFTER INSERT, UPDATE
AS 
BEGIN
    SET NOCOUNT ON;
    DECLARE @message varchar(555);
    DECLARE @id $attribute.identity;

    -- check previous values
    SET @id = (
        SELECT TOP 1
            a.$attribute.identityColumnName
        FROM 
            inserted a
        JOIN 
            $attribute.positName p
        ON 
            p.$attribute.identityColumnName = a.$attribute.identityColumnName
        CROSS APPLY (
            SELECT TOP 1
                $(attribute.hasChecksum())? h.$attribute.checksumColumnName : h.$attribute.valueColumnName
            FROM 
                $attribute.name h
            WHERE
                h.$attribute.reliabilityColumnName = 1
            AND
                h.$attribute.anchorReferenceName = p.$attribute.anchorReferenceName
            AND
                h.$attribute.changingColumnName < p.$attribute.changingColumnName
            AND 
                h.$attribute.positingColumnName < a.$attribute.positingColumnName
            ORDER BY 
                h.$attribute.changingColumnName DESC,
                h.$attribute.positingColumnName DESC
        ) pre
        WHERE
            a.$attribute.reliabilityColumnName = 1
        AND
            $(attribute.hasChecksum())? p.$attribute.checksumColumnName = pre.$attribute.checksumColumnName : p.$attribute.valueColumnName = pre.$attribute.valueColumnName
    );
    IF @id is not null
    BEGIN
        SET @message = '$attribute.identityColumnName = ' + cast(@id as varchar(42)) + ' clashes with an identical previous value';
        RAISERROR(@message, 16, 1);
        ROLLBACK;
    END

    -- check following values
    SET @id = (
        SELECT TOP 1
            a.$attribute.identityColumnName
        FROM 
            inserted a
        JOIN 
            $attribute.positName p
        ON 
            p.$attribute.identityColumnName = a.$attribute.identityColumnName
        CROSS APPLY (
            SELECT TOP 1
                $(attribute.hasChecksum())? h.$attribute.checksumColumnName : h.$attribute.valueColumnName
            FROM 
                $attribute.name h
            WHERE
                h.$attribute.reliabilityColumnName = 1
            AND
                h.$attribute.anchorReferenceName = p.$attribute.anchorReferenceName
            AND
                h.$attribute.changingColumnName > p.$attribute.changingColumnName
            AND 
                h.$attribute.positingColumnName < a.$attribute.positingColumnName
            ORDER BY 
                h.$attribute.changingColumnName ASC,
                h.$attribute.positingColumnName DESC
        ) fol
        WHERE
            a.$attribute.reliabilityColumnName = 1
        AND
            $(attribute.hasChecksum())? p.$attribute.checksumColumnName = fol.$attribute.checksumColumnName : p.$attribute.valueColumnName = fol.$attribute.valueColumnName
    );
    IF @id is not null
    BEGIN
        SET @message = '$attribute.identityColumnName = ' + cast(@id as varchar(42)) + ' clashes with an identical following value';
        RAISERROR(@message, 16, 1);
        ROLLBACK;
    END
END
GO
~*/
                }
            }
        }
    }
}

