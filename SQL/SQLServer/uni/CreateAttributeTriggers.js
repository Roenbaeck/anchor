if(schema.TRIGGERS) {
/*~
-- ATTRIBUTE TRIGGERS ------------------------------------------------------------------------------------------------
--
-- The following triggers on the attributes make them behave like tables.
-- There is one 'instead of' trigger for: insert.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor, attribute, encryptionGroup;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        if(attribute.isHistorized()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_$attribute.name instead of INSERT trigger on $attribute.name
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.it_$attribute.name', 'TR') IS NOT NULL
DROP TRIGGER [$attribute.capsule].[it_$attribute.name];
GO
CREATE TRIGGER [$attribute.capsule].[it_$attribute.name] ON [$attribute.capsule].[$attribute.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
~*/
        if(encryptionGroup = attribute.getEncryptionGroup()) {
/*~
    IF NOT EXISTS (
        SELECT * FROM sys.openkeys 
        WHERE [key_name] = '$encryptionGroup' AND [database_id] = DB_ID()
    ) AND EXISTS (
        SELECT TOP 1 $attribute.anchorReferenceName FROM inserted
    )
    BEGIN
        RAISERROR('The key [$encryptionGroup] must be open in order to modify the attribute ${attribute.name}$.', 16, 1);
    END    
~*/
        }    
/*~
    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        $attribute.statementTypeColumnName char(1) not null,
        primary key (
            $(attribute.isEquivalent())? $attribute.equivalentColumnName asc,
            $attribute.anchorReferenceName asc, 
            $(attribute.timeRange)? $attribute.changingColumnName desc
        )
    );

    INSERT INTO @$attribute.name
    SELECT
        i.$attribute.anchorReferenceName,
        $(attribute.isEquivalent())? i.$attribute.equivalentColumnName,
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        $(attribute.isHistorized())? i.$attribute.changingColumnName,
        i.$attribute.valueColumnName,
        $(attribute.hasChecksum())? ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.valueColumnName as varbinary(max))),
        'P' -- new posit
    FROM
        inserted i
    WHERE NOT EXISTS (
        SELECT 
            x.$attribute.anchorReferenceName
        FROM
            [$attribute.capsule].[$attribute.name] x
        WHERE
            $(attribute.isEquivalent())? p.$attribute.equivalentColumnName = i.$attribute.equivalentColumnName
        $(attribute.isEquivalent())? AND    
            x.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
        $(attribute.isHistorized())? AND
            $(attribute.isHistorized())? x.$attribute.changingColumnName = i.$attribute.changingColumnName
        AND
            $(attribute.hasChecksum())? x.$attribute.checksumColumnName = i.$attribute.checksumColumnName : x.$attribute.valueColumnName = i.$attribute.valueColumnName
    ); -- the posit must be different (exclude the identical)
~*/
        // fill table with entire history in these cases
        if(attribute.isIdempotent()) {
            var valueColumn = attribute.hasChecksum() ? attribute.checksumColumnName : attribute.valueColumnName;
/*~
    INSERT INTO @$attribute.name
    SELECT
        i.$attribute.anchorReferenceName,
        $(schema.METADATA)? p.$attribute.metadataColumnName,
        $(attribute.isHistorized())? p.$attribute.changingColumnName,
        p.$attribute.valueColumnName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
        'X' -- existing data
    FROM (
        SELECT DISTINCT 
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
            $attribute.anchorReferenceName 
        FROM 
            @$attribute.name
    ) i
    JOIN
        [$attribute.capsule].[$attribute.name] p
    ON
        $(attribute.isEquivalent())? p.$attribute.equivalentColumnName = i.$attribute.equivalentColumnName
    $(attribute.isEquivalent())? AND    
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName;

    DECLARE @restated TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null
    );

    INSERT INTO @restated
    SELECT 
        x.$attribute.anchorReferenceName,
        $(attribute.isEquivalent())? x.$attribute.equivalentColumnName,
        x.$attribute.changingColumnName
    FROM (
        DELETE a
        OUTPUT 
            deleted.*
        FROM 
            @$attribute.name a
        OUTER APPLY (
            SELECT TOP 1
                $(attribute.hasChecksum())? h.$attribute.checksumColumnName : h.$attribute.valueColumnName
            FROM 
                @$attribute.name h
            WHERE
                $(attribute.isEquivalent())? h.$attribute.equivalentColumnName = a.$attribute.equivalentColumnName
            $(attribute.isEquivalent())? AND    
                h.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
            AND
                h.$attribute.changingColumnName < a.$attribute.changingColumnName
            ORDER BY 
                h.$attribute.changingColumnName DESC
        ) pre
        WHERE
            $(attribute.hasChecksum())? a.$attribute.checksumColumnName = pre.$attribute.checksumColumnName : a.$attribute.valueColumnName = pre.$attribute.valueColumnName
    ) x
    WHERE
        x.$attribute.statementTypeColumnName = 'X';

    -- remove the quenches (should happen rarely)
	DELETE a
	FROM 
		[$attribute.capsule].[$attribute.name] a
	JOIN 
		@restated d
	ON 
		d.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
	AND 
        $(attribute.isEquivalent())? d.$attribute.equivalentColumnName = a.$attribute.equivalentColumnName
    $(attribute.isEquivalent())? AND    
		d.$attribute.changingColumnName = a.$attribute.changingColumnName;        
~*/
        } // end of idempotent
/*~
    INSERT INTO [$attribute.capsule].[$attribute.name] (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.valueColumnName
    )
    SELECT
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.valueColumnName
    FROM
        @$attribute.name
    WHERE
        $attribute.statementTypeColumnName = 'P';
END
GO
~*/
        } // end of historized attribute
        else if (!attribute.isHistorized() && attribute.isIdempotent()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_$attribute.name instead of INSERT trigger on $attribute.name
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.it_$attribute.name', 'TR') IS NOT NULL
DROP TRIGGER [$attribute.capsule].[it_$attribute.name];
GO
CREATE TRIGGER [$attribute.capsule].[it_$attribute.name] ON [$attribute.capsule].[$attribute.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
~*/
            if(encryptionGroup = attribute.getEncryptionGroup()) {
    /*~
        IF NOT EXISTS (
            SELECT * FROM sys.openkeys 
            WHERE [key_name] = '$encryptionGroup' AND [database_id] = DB_ID()
        ) AND EXISTS (
            SELECT TOP 1 $attribute.anchorReferenceName FROM inserted
        )
        BEGIN
            RAISERROR('The key [$encryptionGroup] must be open in order to modify the attribute ${attribute.name}$.', 16, 1);
        END    
    ~*/
            }    
    /*~
    INSERT INTO [$attribute.capsule].[$attribute.name] (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.valueColumnName
    )
    SELECT
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.valueColumnName
    FROM
        inserted i
    WHERE NOT EXISTS (
        SELECT 
            x.$attribute.anchorReferenceName
        FROM
            [$attribute.capsule].[$attribute.name] x
        WHERE
            $(attribute.isEquivalent())? p.$attribute.equivalentColumnName = i.$attribute.equivalentColumnName
        $(attribute.isEquivalent())? AND    
            x.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
        AND
            $(attribute.hasChecksum())? x.$attribute.checksumColumnName = i.$attribute.checksumColumnName : x.$attribute.valueColumnName = i.$attribute.valueColumnName
    );    
END
GO       
~*/
        } // end of static idempotent attribute
    } // end of loop over attributes
}
}