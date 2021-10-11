var anchor, knot, attribute, constraints = false;
while (anchor = schema.nextAnchor())
    while(attribute = anchor.nextAttribute())
        if(attribute.isHistorized() && !attribute.isRestatable())
            constraints = true;

if(constraints) {
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
AFTER INSERT
AS 
BEGIN
    SET NOCOUNT ON;
    DECLARE @message varchar(max);

    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        primary key(
            $attribute.anchorReferenceName asc, 
            $(attribute.timeRange)? $attribute.changingColumnName desc
        )
    );

    INSERT INTO @$attribute.name (
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,        
        $attribute.valueColumnName
    )
    SELECT
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,        
        $attribute.valueColumnName
    FROM 
        inserted;

    INSERT INTO @$attribute.name (
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,        
        $attribute.valueColumnName
    )
    SELECT
        p.$attribute.anchorReferenceName,
        $(attribute.isEquivalent())? p.$attribute.equivalentColumnName,
        $(schema.METADATA)? p.$attribute.metadataColumnName,
        $(attribute.isHistorized())? p.$attribute.changingColumnName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,        
        p.$attribute.valueColumnName
    FROM (
        SELECT DISTINCT 
            $(attribute.isEquivalent())? p.$attribute.equivalentColumnName,
            $attribute.anchorReferenceName 
        FROM 
            @$attribute.name
    ) i 
    JOIN
        [$attribute.capsule].[$attribute.name] p
    ON 
        $(attribute.isEquivalent())? p.$attribute.equivalentColumnName = i.$attribute.equivalentColumnName
    $(attribute.isEquivalent())? AND    
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    WHERE NOT EXISTS (
        SELECT 
            x.$attribute.anchorReferenceName
        FROM
            @$attribute.name x
        WHERE
            $(attribute.isEquivalent())? p.$attribute.equivalentColumnName = i.$attribute.equivalentColumnName
        $(attribute.isEquivalent())? AND    
            x.$attribute.anchorReferenceName = p.$attribute.anchorReferenceName
        $(attribute.isHistorized())? AND
            $(attribute.isHistorized())? x.$attribute.changingColumnName = p.$attribute.changingColumnName
    );

    -- check previous values
    SET @message = (
        SELECT TOP 1
            pre.*
        FROM 
            @$attribute.name i
        CROSS APPLY (
            SELECT TOP 1
                $(attribute.isEquivalent())? h.$attribute.equivalentColumnName,
                h.$attribute.anchorReferenceName,
                $(attribute.isHistorized())? h.$attribute.changingColumnName,
                $(attribute.hasChecksum())? h.$attribute.checksumColumnName : h.$attribute.valueColumnName
            FROM 
                @$attribute.name h
            WHERE
                $(attribute.isEquivalent())? h.$attribute.equivalentColumnName = i.$attribute.equivalentColumnName
            $(attribute.isEquivalent())? AND    
                h.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                h.$attribute.changingColumnName < i.$attribute.changingColumnName
            ORDER BY 
                h.$attribute.changingColumnName DESC
        ) pre
        WHERE
            $(attribute.hasChecksum())? i.$attribute.checksumColumnName = pre.$attribute.checksumColumnName : i.$attribute.valueColumnName = pre.$attribute.valueColumnName
        FOR XML PATH('')
    );
    IF @message is not null
    BEGIN
        SET @message = 'Restatement in $attribute.name for: ' + @message;
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

