if(schema.TRIGGERS) {
/*~
-- NEXUS TRIGGERS ---------------------------------------------------------------------------------------------------
--
-- The following triggers on the latest nexus perspective make it behave like a table for CRUD
-- operations over the nexus and its attributes. A nexus base row is immutable apart from its metadata dummy column;
-- historization only applies to its historized attributes (the base row has no changing column). Roles (anchor/nexus
-- /knot foreign keys) are part of the immutable nexus identity row and therefore are not updatable once set.
--
-- Three INSTEAD OF triggers are created when a nexus has attributes: insert, update, delete.
-- Insert: creates base nexus rows for NULL identity inputs and inserts attribute rows (knotted or not) with defaults.
-- Update: only allows changing attribute values (including knotted values); role foreign keys and identity are not
--         updatable. Historized attributes get a new version row; non-historized ones behave idempotently.
-- Delete: deletes attribute rows and conditionally deletes the base nexus row if it becomes orphaned (no attributes).
--
-- Deletable attributes (soft delete semantics) follow the same pattern as anchors: if attribute value set to NULL and
-- deletable flag = 1, a deletion record is stored in a parallel deletion table capturing deletion time.
--
~*/
var nexus, attribute, knot, equivalent, role;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$nexus.name instead of INSERT trigger on l$nexus.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$nexus.capsule].[it_l$nexus.name] ON [$nexus.capsule].[l$nexus.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    DECLARE @$nexus.mnemonic TABLE (
        Row bigint IDENTITY(1,1) not null primary key,
        $nexus.identityColumnName $nexus.identity not null
    );
    INSERT INTO [$nexus.capsule].[$nexus.name] (
        $(schema.METADATA)? $nexus.metadataColumnName : $nexus.dummyColumnName
    )
    OUTPUT
        inserted.$nexus.identityColumnName
    INTO
        @$nexus.mnemonic
    SELECT
        $(schema.METADATA)? $nexus.metadataColumnName : null
    FROM
        inserted
    WHERE
        inserted.$nexus.identityColumnName is null;
    DECLARE @inserted TABLE (
        $nexus.identityColumnName $nexus.identity not null,
        $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType not null,
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
        $(schema.IMPROVED)? $attribute.anchorReferenceName $nexus.identity null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType null,
        $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange null,
        $(attribute.isEquivalent && attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange null,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
        $attribute.knotValueColumnName $knot.dataRange null,
        $(knot.hasChecksum())? $attribute.knotChecksumColumnName varbinary(16) null,
        $(knot.isEquivalent())? $equivalent $schema.metadata.equivalentRange null,
        $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType null,
        $attribute.valueColumnName $knot.identity null$(nexus.hasMoreAttributes())?,
~*/
            }
            else {
                var dataRange = attribute.getEncryptionGroup && attribute.getEncryptionGroup() ? attribute.originalDataRange : attribute.dataRange;
/*~
        $attribute.valueColumnName $dataRange null$(nexus.hasMoreAttributes())?,
~*/
            }
        }
/*~
    );
    INSERT INTO @inserted
    SELECT
        ISNULL(i.$nexus.identityColumnName, a.$nexus.identityColumnName),
        $(schema.METADATA)? i.$nexus.metadataColumnName,
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
        $(schema.IMPROVED)? ISNULL(ISNULL(i.$attribute.anchorReferenceName, i.$nexus.identityColumnName), a.$nexus.identityColumnName),
        $(schema.METADATA)? ISNULL(i.$attribute.metadataColumnName, i.$nexus.metadataColumnName),
        $(attribute.timeRange)? ISNULL(i.$attribute.changingColumnName, @now),
        $(attribute.isEquivalent && attribute.isEquivalent())? ISNULL(i.$attribute.equivalentColumnName, 0),
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
        i.$attribute.knotValueColumnName,
        $(knot.hasChecksum())? ISNULL(i.$attribute.knotChecksumColumnName, ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.knotValueColumnName as varbinary(max)))),
        $(knot.isEquivalent())? ISNULL(i.$equivalent, 0),
        $(schema.METADATA)? ISNULL(i.$attribute.knotMetadataColumnName, i.$nexus.metadataColumnName),
~*/
            }
/*~
        i.$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
    FROM (
        SELECT
            $nexus.identityColumnName,
            $(schema.METADATA)? $nexus.metadataColumnName,
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
            $(schema.IMPROVED)? $attribute.anchorReferenceName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.timeRange)? $attribute.changingColumnName,
            $(attribute.isEquivalent && attribute.isEquivalent())? $attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
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
            ROW_NUMBER() OVER (PARTITION BY $nexus.identityColumnName ORDER BY $nexus.identityColumnName) AS Row
        FROM
            inserted
    ) i
    LEFT JOIN
        @$nexus.mnemonic a
    ON
        a.Row = i.Row;
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
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
            if(attribute.getEncryptionGroup && attribute.getEncryptionGroup()) {
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
            if(attribute.isKnotted && attribute.isKnotted()) {
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
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
/*~
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut_l$nexus.name instead of UPDATE trigger on l$nexus.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$nexus.capsule].[ut_l$nexus.name] ON [$nexus.capsule].[l$nexus.name]
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    IF(UPDATE($nexus.identityColumnName))
        RAISERROR('The identity column $nexus.identityColumnName is not updatable.', 16, 1);
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    IF(UPDATE($attribute.anchorReferenceName))
        RAISERROR('The foreign key column $attribute.anchorReferenceName is not updatable.', 16, 1);
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
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
                WHEN UPDATE($nexus.metadataColumnName) AND NOT UPDATE($attribute.metadataColumnName)
                THEN i.$nexus.metadataColumnName
                ELSE i.$attribute.metadataColumnName
            END, i.$nexus.metadataColumnName),
~*/
                }
/*~
            ISNULL(i.$attribute.anchorReferenceName, i.$nexus.identityColumnName),
~*/
                if (attribute.isHistorized && attribute.isHistorized()) {
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
                if(attribute.isDeletable && attribute.isDeletable()) {
                    var timeType = attribute.isHistorized && attribute.isHistorized() ? attribute.timeRange : schema.metadata.chronon;
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
                }
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
                WHEN UPDATE($nexus.metadataColumnName) AND NOT UPDATE($attribute.metadataColumnName)
                THEN i.$nexus.metadataColumnName
                ELSE i.$attribute.metadataColumnName
            END, i.$nexus.metadataColumnName),
~*/
                }
/*~
            ISNULL(i.$attribute.anchorReferenceName, i.$nexus.identityColumnName),
            $(attribute.isEquivalent())? i.$attribute.equivalentColumnName,
~*/
                if(attribute.isHistorized && attribute.isHistorized()) {
/*~
            cast(ISNULL(CASE
                WHEN i.$attribute.valueColumnName is null THEN i.$attribute.changingColumnName
                WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName
            END, @now) as $attribute.timeRange),
~*/
                }
                if(attribute.getEncryptionGroup && attribute.getEncryptionGroup()) {
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
                if(attribute.isDeletable && attribute.isDeletable()) {
                    var timeType = attribute.isHistorized && attribute.isHistorized() ? attribute.timeRange : schema.metadata.chronon;
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
                }
/*~
    END
~*/
            }
        }
/*~
END
GO
~*/
    }
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
/*~
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt_l$nexus.name instead of DELETE trigger on l$nexus.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$nexus.capsule].[dt_l$nexus.name] ON [$nexus.capsule].[l$nexus.name]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
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
        $nexus.identityColumnName $nexus.identity NOT NULL PRIMARY KEY
    );

    INSERT INTO @deleted ($nexus.identityColumnName)
    SELECT a.$nexus.identityColumnName
    FROM (
        SELECT [$nexus.mnemonic].$nexus.identityColumnName
        FROM [$nexus.capsule].[$nexus.name] [$nexus.mnemonic] WITH(NOLOCK)
~*/
        if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
/*~
        WHERE
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
        NOT EXISTS (
            SELECT TOP 1 $attribute.anchorReferenceName
            FROM [$attribute.capsule].[$attribute.name] WITH(NOLOCK)
            WHERE $attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
        )
        $(nexus.hasMoreAttributes())?AND
~*/            
        }
/*~
    ) a
    JOIN deleted d
    ON d.$nexus.identityColumnName = a.$nexus.identityColumnName;

    DELETE [$nexus.mnemonic]
    FROM [$nexus.capsule].[$nexus.name] [$nexus.mnemonic]
    JOIN @deleted d
    ON d.$nexus.identityColumnName = [$nexus.mnemonic].$nexus.identityColumnName;
END
GO
~*/
    }
}
}
