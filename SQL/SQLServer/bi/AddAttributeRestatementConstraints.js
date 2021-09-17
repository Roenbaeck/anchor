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

CREATE TRIGGER [$attribute.capsule$].[rt_$attribute.name] ON [$attribute.capsule].[$attribute.annexName]
AFTER INSERT 
AS 
BEGIN
    SET NOCOUNT ON;
    DECLARE @message varchar(max);

    DECLARE @$attribute.name TABLE (
        $attribute.identityColumnName $attribute.identity not null,
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        primary key (
            $attribute.anchorReferenceName asc, 
            $(attribute.timeRange)? $attribute.changingColumnName desc,
            $attribute.positingColumnName desc
        ),
        unique (
            $attribute.identityColumnName,
            $attribute.positingColumnName
        )
    );

    INSERT INTO @$attribute.name (
        $attribute.identityColumnName,
        $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName
    )
    SELECT
        i.$attribute.identityColumnName,
        p.$attribute.anchorReferenceName,
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        $(attribute.isHistorized())? p.$attribute.changingColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.reliabilityColumnName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
        p.$attribute.valueColumnName
    FROM 
        inserted i
    JOIN 
        [$attribute.capsule].[$attribute.positName] p
    ON 
        p.$attribute.identityColumnName = i.$attribute.identityColumnName; -- the posit has already been created

    INSERT INTO @$attribute.name (
        $attribute.identityColumnName,
        $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.valueColumnName
    )
    SELECT
        p.$attribute.identityColumnName,
        p.$attribute.anchorReferenceName,
        $(schema.METADATA)? p.$attribute.metadataColumnName,
        $(attribute.isHistorized())? p.$attribute.changingColumnName,
        p.$attribute.positingColumnName,
        p.$attribute.reliabilityColumnName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
        p.$attribute.valueColumnName
    FROM 
        (SELECT DISTINCT $attribute.anchorReferenceName FROM @$attribute.name) i
    JOIN
        [$attribute.capsule].[$attribute.name] p
    ON 
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    LEFT JOIN 
        @$attribute.name x
    ON
        x.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        x.$attribute.positingColumnName = p.$attribute.positingColumnName
    WHERE
        x.$attribute.identityColumnName is null;

    -- no need to check retracted information
    DELETE a 
    FROM 
        @$attribute.name a
    OUTER APPLY (
        SELECT TOP 1
            x.$attribute.reliabilityColumnName
        FROM 
            @$attribute.name x
        WHERE
            x.$attribute.identityColumnName = a.$attribute.identityColumnName
        AND
            x.$attribute.positingColumnName < a.$attribute.positingColumnName
        ORDER BY
            x.$attribute.positingColumnName DESC
    ) pre    
    OUTER APPLY (
        SELECT TOP 1
            x.$attribute.reliabilityColumnName
        FROM 
            @$attribute.name x
        WHERE
            x.$attribute.identityColumnName = a.$attribute.identityColumnName
        AND
            x.$attribute.positingColumnName > a.$attribute.positingColumnName
        ORDER BY
            x.$attribute.positingColumnName ASC
    ) fol    
    WHERE
        (a.$attribute.reliabilityColumnName = 1 AND fol.$attribute.reliabilityColumnName = 0)
    OR
        (a.$attribute.reliabilityColumnName = 0 AND pre.$attribute.reliabilityColumnName = 1);
        
    -- check previous values
    SET @message = (
        SELECT TOP 1
            pre.*
        FROM 
            @$attribute.name a
        CROSS APPLY (
            SELECT TOP 1
                h.$attribute.anchorReferenceName,
                $(attribute.isHistorized())? h.$attribute.changingColumnName,
                $(attribute.hasChecksum())? h.$attribute.checksumColumnName : h.$attribute.valueColumnName
            FROM 
                @$attribute.name h
            WHERE
                h.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
            $(attribute.isHistorized())? AND
                $(attribute.isHistorized())? h.$attribute.changingColumnName < a.$attribute.changingColumnName
            ORDER BY 
                $(attribute.isHistorized())? h.$attribute.changingColumnName DESC,
                h.$attribute.positingColumnName DESC
        ) pre
        WHERE
            $(attribute.hasChecksum())? a.$attribute.checksumColumnName = pre.$attribute.checksumColumnName : a.$attribute.valueColumnName = pre.$attribute.valueColumnName
        AND
            a.$attribute.reliabilityColumnName = 1
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

