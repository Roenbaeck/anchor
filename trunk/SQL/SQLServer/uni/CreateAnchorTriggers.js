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
IF Object_ID('it$anchor.name', 'TR') IS NULL
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
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
/*~
        $attribute.knotValueColumnName $knot.identity null,
        $(METADATA)? $attribute.knotMetadataColumnName $schema.metadataType null,
~*/
            }
/*~
        $attribute.valueColumnName $attribute.dataRange null$(anchor.hasMoreAttributes())?,
~*/
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
        $(IMPROVED)? ISNULL(i.$attribute.anchorReferenceName, a.$anchor.identityColumnName),
        $(METADATA)? ISNULL(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
        $(attribute.timeRange)? ISNULL(i.$attribute.changingColumnName, @now),
~*/
            if(attribute.knotRange) {
/*~
        i.$attribute.knotValueColumnName,
        $(METADATA)? ISNULL(i.$attribute.knotMetadataColumnName, i.$anchor.metadataColumnName),
        i.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
            }
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
            if(attribute.knotRange) {
/*~
            $attribute.knotValueColumnName,
            $(METADATA)? $attribute.knotMetadataColumnName,
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
            knot = schema.knot[attribute.knotRange];
            if(attribute.timeRange) {
                var statementTypes = "'N'";
                if(attribute.metadata.idempotent == 'true')
                    statementTypes += ",'R'";
/*~
    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(METADATA)? $attribute.metadataColumnName $schema.metadataType not null,
        $attribute.changingColumnName $attribute.timeRange not null,
        $(attribute.knotRange)? $attribute.knotValueColumnName $knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $attribute.versionColumnName bigint not null,
        $attribute.statementTypeColumnName char(1) not null,
        primary key(
            $attribute.versionColumnName,
            $attribute.anchorReferenceName
        )
    );
    INSERT INTO @$attribute.name
    SELECT
        $attribute.anchorReferenceName,
        $(METADATA)? $attribute.metadataColumnName,
        $attribute.changingColumnName,
        $attribute.valueColumnName,
        DENSE_RANK() OVER (PARTITION BY $attribute.anchorReferenceName ORDER BY $attribute.changingColumnName),
        'X'
    FROM
        @inserted i
    WHERE
        $attribute.valueColumnName is not null;
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
                    WHEN [$attribute.mnemonic].$attribute.anchorReferenceName is not null
                    THEN 'D' -- duplicate
                    WHEN v.$attribute.valueColumnName IN ((
                        SELECT TOP 1
                            pre.$attribute.valueColumnName
                        FROM
                            [$attribute.capsule].[$attribute.name] pre
                        WHERE
                            pre.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                        AND
                            pre.$attribute.changingColumnName <= v.$attribute.changingColumnName
                        ORDER BY
                            pre.$attribute.changingColumnName DESC
                    ),(
                        SELECT TOP 1
                            fol.$attribute.valueColumnName
                        FROM
                            [$attribute.capsule].[$attribute.name] fol
                        WHERE
                            fol.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                        AND
                            fol.$attribute.changingColumnName >= v.$attribute.changingColumnName
                        ORDER BY
                            fol.$attribute.changingColumnName ASC
                    ))
                    THEN 'R' -- restatement
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
            [$attribute.mnemonic].$attribute.valueColumnName = v.$attribute.valueColumnName
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
                // TODO: not historized attributes
            }
        }
/*~
END
GO
~*/
    }
}
