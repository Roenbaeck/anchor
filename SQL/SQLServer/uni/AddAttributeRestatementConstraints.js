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

CREATE TRIGGER [$attribute.capsule$].[rt_$attribute.name] ON [$attribute.capsule].[$attribute.name]
AFTER INSERT, UPDATE
AS 
BEGIN
    SET NOCOUNT ON;
    DECLARE @message varchar(555);
    DECLARE @id $anchor.identity;

    -- check previous values
    SET @id = (
        SELECT TOP 1
            i.$attribute.anchorReferenceName
        FROM 
            inserted i
        CROSS APPLY (
            SELECT TOP 1
                $(attribute.hasChecksum())? h.$attribute.checksumColumnName : h.$attribute.valueColumnName
            FROM 
                $attribute.name h
            WHERE
                h.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                h.$attribute.changingColumnName < i.$attribute.changingColumnName
            ORDER BY 
                h.$attribute.changingColumnName DESC
        ) pre
        WHERE
            $(attribute.hasChecksum())? i.$attribute.checksumColumnName = pre.$attribute.checksumColumnName : i.$attribute.valueColumnName = pre.$attribute.valueColumnName
    );
    IF @id is not null
    BEGIN
        SET @message = '$attribute.name ($attribute.anchorReferenceName = ' + cast(@id as varchar(42)) + ') clashes with an identical previous value';
        RAISERROR(@message, 16, 1);
        ROLLBACK;
    END

    -- check following values
    SET @id = (
        SELECT TOP 1
            i.$attribute.anchorReferenceName
        FROM 
            inserted i
        CROSS APPLY (
            SELECT TOP 1
                $(attribute.hasChecksum())? h.$attribute.checksumColumnName : h.$attribute.valueColumnName
            FROM 
                $attribute.name h
            WHERE
                h.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                h.$attribute.changingColumnName > i.$attribute.changingColumnName
            ORDER BY 
                h.$attribute.changingColumnName ASC
        ) fol
        WHERE
            $(attribute.hasChecksum())? i.$attribute.checksumColumnName = fol.$attribute.checksumColumnName : i.$attribute.valueColumnName = fol.$attribute.valueColumnName
    );
    IF @id is not null
    BEGIN
        SET @message = '$attribute.name ($attribute.anchorReferenceName = ' + cast(@id as varchar(42)) + ') clashes with an identical following value';
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

