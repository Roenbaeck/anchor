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
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it$anchor.name instead of INSERT trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[it$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.chronon = $schema.now;
    DECLARE @maxVersion int;
    DECLARE @currentVersion int;
    DECLARE @$anchor.mnemonic TABLE (
        Row bigint IDENTITY(1,1) not null primary key,
        $anchor.identityColumnName $anchor.identity not null
    );
    INSERT INTO [$anchor.capsule].[$anchor.name] (
        $(METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName
    )
    OUTPUT
        inserted.$anchor.identityColumnName
    INTO
        @$anchor.mnemonic
    SELECT
        $(METADATA)? $anchor.metadataColumnName : null
    FROM
        inserted
    WHERE
        inserted.$anchor.identityColumnName is null;
    DECLARE @inserted TABLE (
        $anchor.identityColumnName $anchor.identity not null,
        $(METADATA)? $anchor.metadataColumnName $schema.metadataType not null,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
        $(IMPROVED)? $attribute.anchorReferenceName $anchor.identity null,
        $(METADATA)? $attribute.metadataColumnName $schema.metadataType null,
        $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        $attribute.knotValueColumnName $knot.dataRange null,
        $(knot.hasChecksum())? $attribute.knotChecksumColumnName varbinary(16) null,
        $(METADATA)? $attribute.knotMetadataColumnName $schema.metadataType null,
        $attribute.valueColumnName $knot.identity null$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) null,
        $attribute.valueColumnName $attribute.dataRange null$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
    );
    INSERT INTO @inserted
    SELECT
        ISNULL(i.$anchor.identityColumnName, a.$anchor.identityColumnName),
        $(METADATA)? i.$anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
        $(IMPROVED)? ISNULL(ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName), a.$anchor.identityColumnName),
        $(METADATA)? ISNULL(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
        $(attribute.timeRange)? ISNULL(i.$attribute.changingColumnName, @now),
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        i.$attribute.knotValueColumnName,
        $(knot.hasChecksum())? i.$attribute.knotChecksumColumnName,
        $(METADATA)? ISNULL(i.$attribute.knotMetadataColumnName, i.$anchor.metadataColumnName),
~*/
            }
/*~
        $(attribute.hasChecksum())? i.$attribute.checksumColumnName,
        i.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
    FROM (
        SELECT
            $anchor.identityColumnName,
            $(METADATA)? $anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(IMPROVED)? $attribute.anchorReferenceName,
            $(METADATA)? $attribute.metadataColumnName,
            $(attribute.timeRange)? $attribute.changingColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            $attribute.knotValueColumnName,
            $(knot.hasChecksum())? $attribute.knotChecksumColumnName,
            $(METADATA)? $attribute.knotMetadataColumnName,
~*/
            }
/*~
            $(attribute.hasChecksum())? $attribute.checksumColumnName,
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
            if(attribute.isHistorized()) {
                var statementTypes = "'N'";
                if(!attribute.isIdempotent())
                    statementTypes += ",'R'";
/*~
    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(METADATA)? $attribute.metadataColumnName $schema.metadataType not null,
        $attribute.changingColumnName $attribute.timeRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        $attribute.versionColumnName bigint not null,
        $attribute.statementTypeColumnName char(1) not null,
        primary key(
            $attribute.versionColumnName,
            $attribute.anchorReferenceName
        )
    );
    INSERT INTO @$attribute.name
    SELECT
        i.$attribute.anchorReferenceName,
        $(METADATA)? i.$attribute.metadataColumnName,
        i.$attribute.changingColumnName,
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName), : i.$attribute.valueColumnName,
        $(attribute.hasChecksum())? i.$attribute.checksumColumnName,
        DENSE_RANK() OVER (
            PARTITION BY
                i.$attribute.anchorReferenceName
            ORDER BY
                i.$attribute.changingColumnName ASC
        ),
        'X'
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
/*~
    SELECT
        @maxVersion = max($attribute.versionColumnName),
        @currentVersion = 0
    FROM
        @$attribute.name;
    WHILE (@currentVersion < @maxVersion)
    BEGIN
        SET @currentVersion = @currentVersion + 1;
        UPDATE v
        SET
            v.$attribute.statementTypeColumnName =
                CASE
                    WHEN [$attribute.capsule].[rf$attribute.name](
                        v.$attribute.anchorReferenceName,
                        $(attribute.hasChecksum())? v.$attribute.checksumColumnName, : v.$attribute.valueColumnName,
                        v.$attribute.changingColumnName
                    ) = 1
                    THEN 'R' -- restatement
                    WHEN [$attribute.mnemonic].$attribute.anchorReferenceName is not null
                    THEN 'D' -- duplicate
                    ELSE 'N' -- new statement
                END
        FROM
            @$attribute.name v
        LEFT JOIN
            [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
        ON
            [$attribute.mnemonic].$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
        AND
            [$attribute.mnemonic].$attribute.changingColumnName = v.$attribute.changingColumnName
        AND
            $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName = v.$attribute.checksumColumnName : [$attribute.mnemonic].$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = @currentVersion;
        INSERT INTO [$attribute.capsule].[$attribute.name] (
            $attribute.anchorReferenceName,
            $(METADATA)? $attribute.metadataColumnName,
            $attribute.changingColumnName,
            $attribute.valueColumnName
        )
        SELECT
            $attribute.anchorReferenceName,
            $(METADATA)? $attribute.metadataColumnName,
            $attribute.changingColumnName,
            $attribute.valueColumnName
        FROM
            @$attribute.name
        WHERE
            $attribute.versionColumnName = @currentVersion
        AND
            $attribute.statementTypeColumnName in ($statementTypes);
    END
~*/
            }
            else {
/*~
    INSERT INTO [$attribute.capsule].[$attribute.name] (
        $attribute.anchorReferenceName,
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.valueColumnName
    )
    SELECT
        i.$attribute.anchorReferenceName,
        $(METADATA)? i.$attribute.metadataColumnName,
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) : i.$attribute.valueColumnName
    FROM
        @inserted i
    LEFT JOIN
        [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
    ON
        [$attribute.mnemonic].$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = i.$attribute.knotChecksumColumnName : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
    WHERE
        ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) is not null
 ~*/
                }
/*~
    $(attribute.knotRange)? AND : WHERE
        [$attribute.mnemonic].$attribute.anchorReferenceName is null
    AND
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) is not null; : i.$attribute.valueColumnName is not null;
~*/
            }
        }
/*~
END
GO
~*/
    }
    if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut$anchor.name instead of UPDATE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[ut$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.chronon = $schema.now;
    IF(UPDATE($anchor.identityColumnName))
        RAISERROR('The identity column $anchor.identityColumnName is not updatable.', 16, 1);
~*/
        while (attribute = anchor.nextHistorizedAttribute()) {
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    IF(UPDATE($attribute.valueColumnName) OR UPDATE($attribute.knotValueColumnName))
    INSERT INTO [$attribute.capsule].[$attribute.name] (
        $attribute.anchorReferenceName,
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.changingColumnName,
        $attribute.valueColumnName
    )
    SELECT
        i.$attribute.anchorReferenceName,
        $(METADATA)? CASE WHEN UPDATE($attribute.metadataColumnName) THEN i.$attribute.metadataColumnName ELSE 0 END,
        CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END,
        CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END
    FROM
        inserted i
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = i.$attribute.knotChecksumColumnName : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName~*/
                if(attribute.isIdempotent()) {
/*~
    LEFT JOIN
        [$attribute.capsule].[$attribute.name] b
    ON
        b.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    AND
        b.$attribute.valueColumnName = CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END
    AND
        b.$attribute.changingColumnName = i.$attribute.changingColumnName
    WHERE
        b.$attribute.anchorReferenceName is null
    AND
        [$attribute.capsule].[rf$attribute.name](
            i.$attribute.anchorReferenceName,
            i.$attribute.valueColumnName,
            i.$attribute.changingColumnName
        ) = 0~*/
                }
            /*~;~*/
            }
            else {
/*~
    IF(UPDATE($attribute.valueColumnName))
    INSERT INTO [$attribute.capsule].[$attribute.name] (
        $attribute.anchorReferenceName,
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.changingColumnName,
        $attribute.valueColumnName
    )
    SELECT
        i.$attribute.anchorReferenceName,
        $(METADATA)? CASE WHEN UPDATE($attribute.metadataColumnName) THEN i.$attribute.metadataColumnName ELSE 0 END,
        CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END,
        i.$attribute.valueColumnName
    FROM
        inserted i~*/
                if(attribute.isIdempotent()) {
/*~
    LEFT JOIN
        [$attribute.capsule].[$attribute.name] b
    ON
        b.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    AND
        $(attribute.hasChecksum())? b.$attribute.checksumColumnName = i.$attribute.checksumColumnName : b.$attribute.valueColumnName = i.$attribute.valueColumnName
    AND
        b.$attribute.changingColumnName = i.$attribute.changingColumnName
    WHERE
        b.$attribute.anchorReferenceName is null
    AND
        [$attribute.capsule].[rf$attribute.name](
            i.$attribute.anchorReferenceName,
            $(attribute.hasChecksum())? i.$attribute.checksumColumnName, : i.$attribute.valueColumnName,
            i.$attribute.changingColumnName
        ) = 0~*/
                }
            /*~;~*/
            }
        }
/*~
END
GO
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt$anchor.name instead of DELETE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[dt$anchor.name] ON [$anchor.capsule].[l$anchor.name]
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
        d.$attribute.anchorReferenceName = [$attribute.mnemonic].$attribute.anchorReferenceName
    $(attribute.timeRange)? AND
        $(attribute.timeRange)? d.$attribute.changingColumnName = [$attribute.mnemonic].$attribute.changingColumnName;
~*/
        }
/*~
    DELETE [$anchor.mnemonic]
    FROM
        [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    LEFT JOIN
        [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
    ON
        [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
~*/
        }
/*~
    $(anchor.hasMoreAttributes())? WHERE
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
        [$attribute.mnemonic].$attribute.anchorReferenceName is null~*/
            if(anchor.hasMoreAttributes()) {
/*~
    AND
~*/
            }
        }
/*~;
END
GO
~*/
    }
}
