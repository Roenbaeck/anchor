if(schema.TRIGGERS) {
/*~
-- ANCHOR TRIGGERS ---------------------------------------------------------------------------------------------------
--
-- The following triggers on the latest view make it behave like a table.
-- There are three different 'instead of' triggers: insert, update, and delete.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor, knot, attribute, equivalent;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$anchor.name instead of INSERT trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[it_l$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    DECLARE @$anchor.mnemonic TABLE (
        Row bigint IDENTITY(1,1) not null primary key,
        $anchor.identityColumnName $anchor.identity not null
    );
    INSERT INTO [$anchor.capsule].[$anchor.name] (
        $(schema.METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName
    )
    OUTPUT
        inserted.$anchor.identityColumnName
    INTO
        @$anchor.mnemonic
    SELECT
        $(schema.METADATA)? $anchor.metadataColumnName : null
    FROM
        inserted
    WHERE
        inserted.$anchor.identityColumnName is null;
    DECLARE @inserted TABLE (
        $anchor.identityColumnName $anchor.identity not null,
        $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
        $(schema.IMPROVED)? $attribute.anchorReferenceName $anchor.identity null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType null,
        $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange null,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
        $attribute.knotValueColumnName $knot.dataRange null,
        $(knot.hasChecksum())? $attribute.knotChecksumColumnName varbinary(16) null,
        $(knot.isEquivalent())? $equivalent $schema.metadata.equivalentRange null,
        $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType null,
        $attribute.valueColumnName $knot.identity null$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
                var dataRange = attribute.getEncryptionGroup() ? attribute.originalDataRange : attribute.dataRange;
/*~
        $attribute.valueColumnName $dataRange null$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
    );
    INSERT INTO @inserted
    SELECT
        ISNULL(i.$anchor.identityColumnName, a.$anchor.identityColumnName),
        $(schema.METADATA)? i.$anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
        $(schema.IMPROVED)? ISNULL(ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName), a.$anchor.identityColumnName),
        $(schema.METADATA)? ISNULL(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
        $(attribute.timeRange)? ISNULL(i.$attribute.changingColumnName, @now),
        $(attribute.isEquivalent())? ISNULL(i.$attribute.equivalentColumnName, 0),
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
        i.$attribute.knotValueColumnName,
        $(knot.hasChecksum())? ISNULL(i.$attribute.knotChecksumColumnName, ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.knotValueColumnName as varbinary(max)))),
        $(knot.isEquivalent())? ISNULL(i.$equivalent, 0),
        $(schema.METADATA)? ISNULL(i.$attribute.knotMetadataColumnName, i.$anchor.metadataColumnName),
~*/
            }
/*~
        i.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
    FROM (
        SELECT
            $anchor.identityColumnName,
            $(schema.METADATA)? $anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(schema.IMPROVED)? $attribute.anchorReferenceName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.timeRange)? $attribute.changingColumnName,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
            $attribute.knotValueColumnName,
            $(knot.hasChecksum())? $attribute.knotChecksumColumnName,
            $(knot.isEquivalent())? $equivalent,
            $(schema.METADATA)? $attribute.knotMetadataColumnName,
~*/
            }
/*~
            $attribute.valueColumnName,
~*/
        }
/*~
            ROW_NUMBER() OVER (PARTITION BY $anchor.identityColumnName ORDER BY $anchor.identityColumnName) AS Row
        FROM
            inserted
    ) i
    LEFT JOIN
        @$anchor.mnemonic a
    ON
        a.Row = i.Row;
~*/
        while (attribute = anchor.nextAttribute()) {
            knot = attribute.knot;
/*~
    INSERT INTO [$attribute.capsule].[$attribute.name] (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.timeRange)? $attribute.changingColumnName,
        $attribute.valueColumnName
    )
    SELECT $(!attribute.hasChecksum())?DISTINCT
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        i.$attribute.anchorReferenceName,
        $(attribute.timeRange)? i.$attribute.changingColumnName,
~*/
            if(attribute.getEncryptionGroup()) {
/*~
        ENCRYPTBYKEY(KEY_GUID('${attribute.getEncryptionGroup()}$'), cast(i.$attribute.valueColumnName as varbinary(max)))        
~*/
            }
            else {
/*~
        $(attribute.isKnotted())? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) : i.$attribute.valueColumnName
~*/
            }
/*~
    FROM
        @inserted i
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = i.$attribute.knotChecksumColumnName : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
~*/
                if(knot.isEquivalent()) {
                    equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
    AND
        [k$knot.mnemonic].$knot.equivalentColumnName = i.$equivalent
~*/
                }
/*~
    WHERE
        ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) is not null;
~*/
            }
            else {
/*~
    WHERE
        i.$attribute.valueColumnName is not null;
~*/
            }
        }
/*~
END
GO
~*/
    }
    if(anchor.hasMoreAttributes()) {
/*~
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut_l$anchor.name instead of UPDATE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[ut_l$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    IF(UPDATE($anchor.identityColumnName))
        RAISERROR('The identity column $anchor.identityColumnName is not updatable.', 16, 1);
~*/
		while (attribute = anchor.nextAttribute()) {
/*~
    IF(UPDATE($attribute.anchorReferenceName))
        RAISERROR('The foreign key column $attribute.anchorReferenceName is not updatable.', 16, 1);
~*/
			if(attribute.isKnotted()) {
				knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;

/*~
    IF(UPDATE($attribute.valueColumnName) OR UPDATE($attribute.knotValueColumnName))
    BEGIN
        INSERT INTO [$attribute.capsule].[$attribute.name] (
            $(schema.METADATA)? $attribute.metadataColumnName,
            $attribute.anchorReferenceName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.valueColumnName
        )
        SELECT $(!attribute.hasChecksum())?DISTINCT
~*/
                if(schema.METADATA) {
/*~
            ISNULL(CASE
                WHEN UPDATE($anchor.metadataColumnName) AND NOT UPDATE($attribute.metadataColumnName)
                THEN i.$anchor.metadataColumnName
                ELSE i.$attribute.metadataColumnName
            END, i.$anchor.metadataColumnName),
~*/
                }
/*~
            ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
~*/
                if (attribute.isHistorized()) {
/*~
            cast(ISNULL(CASE
                WHEN i.$attribute.valueColumnName is null AND [k$knot.mnemonic].$knot.identityColumnName is null THEN i.$attribute.changingColumnName
                WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName
            END, @now) as $attribute.timeRange),
~*/
                }
/*~
            CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END
        FROM
            inserted i
        LEFT JOIN
            [$knot.capsule].[$knot.name] [k$knot.mnemonic]
        ON
            $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.knotValueColumnName as varbinary(max))) : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
        $(knot.isEquivalent())? AND
            $(knot.isEquivalent())? [k$knot.mnemonic].$knot.equivalentColumnName = i.$equivalent
        WHERE
            CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END is not null;
~*/
                if(attribute.isDeletable()) {
                    var timeType = attribute.isHistorized() ? attribute.timeRange : schema.metadata.chronon;
/*~
        SELECT
            $(attribute.isHistorized())? cast(CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END as $attribute.timeRange) as $attribute.deletionTimeColumnName,
            i.$attribute.anchorReferenceName
        INTO
            #$attribute.uniqueMnemonic
        FROM
            inserted i
        JOIN
            deleted d
        ON
            d.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
        AND
            d.$attribute.valueColumnName is not null
        WHERE
            ((UPDATE($attribute.valueColumnName) AND i.$attribute.valueColumnName is null) OR (UPDATE($attribute.knotValueColumnName) AND i.$attribute.knotValueColumnName is null))
        AND
            i.$attribute.deletableColumnName = 1;

        IF(@@ROWCOUNT > 0)
        BEGIN
            IF OBJECT_ID('[$attribute.capsule].[$attribute.deletionName]') is null
            SELECT TOP 0 
                *, 
                CAST(null as $timeType) as $attribute.deletionTimeColumnName
            INTO 
                [$attribute.capsule].[$attribute.deletionName]
            FROM 
                [$attribute.capsule].[$attribute.name];

            DELETE [$attribute.mnemonic]
            OUTPUT
                deleted.*,
                $(attribute.isHistorized())? ISNULL(d.$attribute.deletionTimeColumnName, @now) : @now
            INTO
                [$attribute.capsule].[$attribute.deletionName]
            FROM
                [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
            JOIN
                #$attribute.uniqueMnemonic d
            ON
                d.$attribute.anchorReferenceName = [$attribute.mnemonic].$attribute.anchorReferenceName
        END
~*/
                } // end of deletable
/*~
    END
~*/
            }
			else { // not knotted
/*~
    IF(UPDATE($attribute.valueColumnName))
    BEGIN
        INSERT INTO [$attribute.capsule].[$attribute.name] (
            $(schema.METADATA)? $attribute.metadataColumnName,
            $attribute.anchorReferenceName,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.valueColumnName
        )
        SELECT $(!attribute.hasChecksum())?DISTINCT
~*/
                if(schema.METADATA) {
/*~
            ISNULL(CASE
                WHEN UPDATE($anchor.metadataColumnName) AND NOT UPDATE($attribute.metadataColumnName)
                THEN i.$anchor.metadataColumnName
                ELSE i.$attribute.metadataColumnName
            END, i.$anchor.metadataColumnName),
~*/
                }
/*~
            ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
            $(attribute.isEquivalent())? i.$attribute.equivalentColumnName,
~*/
                if(attribute.isHistorized()) {
/*~
            cast(ISNULL(CASE
                WHEN i.$attribute.valueColumnName is null THEN i.$attribute.changingColumnName
                WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName
            END, @now) as $attribute.timeRange),
~*/
                }
                if(attribute.getEncryptionGroup()) {
/*~
        ENCRYPTBYKEY(KEY_GUID('${attribute.getEncryptionGroup()}$'), cast(i.$attribute.valueColumnName as varbinary(max)))        
~*/
                }
                else {
/*~
            i.$attribute.valueColumnName
~*/
                }
/*~
        FROM
            inserted i
        WHERE
            i.$attribute.valueColumnName is not null;
~*/
                if(attribute.isDeletable()) {
                    var timeType = attribute.isHistorized() ? attribute.timeRange : schema.metadata.chronon;
/*~
        SELECT
            $(attribute.isHistorized())? cast(CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END as $attribute.timeRange) as $attribute.deletionTimeColumnName,
            i.$attribute.anchorReferenceName
        INTO
            #$attribute.uniqueMnemonic
        FROM
            inserted i
        JOIN
            deleted d
        ON
            d.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
        AND
            d.$attribute.valueColumnName is not null
        WHERE
            i.$attribute.valueColumnName is null
        AND
            i.$attribute.deletableColumnName = 1;

        IF(@@ROWCOUNT > 0)
        BEGIN
            IF OBJECT_ID('[$attribute.capsule].[$attribute.deletionName]') is null
            SELECT TOP 0 
                *, 
                CAST(null as $timeType) as $attribute.deletionTimeColumnName
            INTO 
                [$attribute.capsule].[$attribute.deletionName]
            FROM 
                [$attribute.capsule].[$attribute.name];

            DELETE [$attribute.mnemonic]
            OUTPUT
                deleted.*,
                $(attribute.isHistorized())? ISNULL(d.$attribute.deletionTimeColumnName, @now) : @now
            INTO
                [$attribute.capsule].[$attribute.deletionName]
            FROM
                [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
            JOIN
                #$attribute.uniqueMnemonic d
            ON
                d.$attribute.anchorReferenceName = [$attribute.mnemonic].$attribute.anchorReferenceName
        END
~*/
                } // end of deletable
/*~
    END
~*/
            } // end of not knotted
        } // end of while loop over attributes
/*~
END
GO
~*/
    }
    if(anchor.hasMoreAttributes()) {
/*~
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt_l$anchor.name instead of DELETE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[dt_l$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    DELETE [$attribute.mnemonic]
    FROM
        [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
    JOIN
        deleted d
    ON
        $(attribute.isEquivalent())? d.$attribute.equivalentColumnName = [$attribute.mnemonic].$attribute.equivalentColumnName
    $(attribute.isEquivalent())? AND
        $(attribute.timeRange)? d.$attribute.changingColumnName = [$attribute.mnemonic].$attribute.changingColumnName
    $(attribute.timeRange)? AND
        d.$attribute.anchorReferenceName = [$attribute.mnemonic].$attribute.anchorReferenceName;
~*/
        }
/*~
    DECLARE @deleted TABLE (
        $anchor.identityColumnName $anchor.identity NOT NULL PRIMARY KEY
    );

    INSERT INTO @deleted ($anchor.identityColumnName)
    SELECT a.$anchor.identityColumnName
    FROM (
        SELECT [$anchor.mnemonic].$anchor.identityColumnName
        FROM [$anchor.capsule].[$anchor.name] [$anchor.mnemonic] WITH(NOLOCK)
~*/
        if(anchor.hasMoreAttributes()) {
/*~
        WHERE
~*/
        }
        while (attribute = anchor.nextAttribute()) {
/*~
        NOT EXISTS (
            SELECT TOP 1 $attribute.anchorReferenceName
            FROM [$attribute.capsule].[$attribute.name] WITH(NOLOCK)
            WHERE $attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
        )
        $(anchor.hasMoreAttributes())?AND
~*/            
        }
/*~
    ) a
    JOIN deleted d
    ON d.$anchor.identityColumnName = a.$anchor.identityColumnName;

    DELETE [$anchor.mnemonic]
    FROM [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
    JOIN @deleted d
    ON d.$anchor.identityColumnName = [$anchor.mnemonic].$anchor.identityColumnName;
END
GO
~*/
    }
}
}