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
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
    if(anchor.attributes.length > 0) {
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
~*/
        if(schema.metadataUsage = 'true') {
/*~
        $anchor.metadataColumnName
~*/
        }
        else {
/*~
        $anchor.dummyColumnName
~*/
        }
/*~
    )
    OUTPUT
        inserted.$anchor.identityColumnName
    INTO
        @$anchor.mnemonic
    SELECT
~*/
        if(schema.metadataUsage = 'true') {
/*~
        $anchor.metadataColumnName
~*/
        }
        else {
/*~
        null
~*/
        }
/*~
    FROM
        inserted
    WHERE
        inserted.$anchor.identityColumnName is null;
    DECLARE @inserted TABLE (
        $anchor.identityColumnName $anchor.identity not null,
~*/
        if(schema.metadataUsage = 'true') {
/*~
        $anchor.metadataColumnName $schema.metadataType not null
~*/
        }
        var b, knot, attribute;
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(schema.naming == 'improved') {
/*~
        $attribute.anchorReferenceName $anchor.identity null,
~*/
            }
            if(schema.metadataUsage == 'true') {
/*~
        $attribute.metadataColumnName $schema.metadataType null,
~*/
            }
            if(attribute.timeRange) {
/*~
        $attribute.changingColumnName $attribute.timeRange null,
~*/
            }
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
/*~
        $attribute.knotValueColumnName $knot.identity null,
~*/
                if(schema.metadataUsage == 'true') {
/*~
        $attribute.knotMetadataColumnName $schema.metadataType null,
~*/
                }
            }
            if(b == anchor.attributes.length - 1) {
/*~
        $attribute.valueColumnName $attribute.dataRange null
~*/
            }
            else {
/*~
        $attribute.valueColumnName $attribute.dataRange null,
~*/
            }
        }
/*~
    );
    INSERT INTO @inserted
    SELECT
        ISNULL(i.$anchor.identityColumnName, a.$anchor.identityColumnName),
 ~*/
        if(schema.metadataUsage = 'true') {
/*~
        i.$anchor.metadataColumnName,
 ~*/
        }
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(schema.naming == 'improved') {
/*~
        ISNULL(i.$attribute.anchorReferenceName, a.$anchor.identityColumnName),
~*/
            }
            if(schema.metadataUsage == 'true') {
/*~
        ISNULL(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
~*/
            }
            if(attribute.timeRange) {
/*~
        ISNULL(i.$attribute.changingColumnName, @now),
~*/
            }
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
/*~
        i.$attribute.knotValueColumnName,
~*/
                if(schema.metadataUsage == 'true') {
/*~
        ISNULL(i.$attribute.knotMetadataColumnName, i.$anchor.metadataColumnName),
~*/
                }
            }
            if(b == anchor.attributes.length - 1) {
/*~
        i.$attribute.valueColumnName
~*/
            }
            else {
/*~
        i.$attribute.valueColumnName,
~*/
            }
        }
/*~
    FROM (
        SELECT
            $anchor.identityColumnName,
 ~*/
        if(schema.metadataUsage = 'true') {
/*~
            $anchor.metadataColumnName,
 ~*/
        }
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(schema.naming == 'improved') {
/*~
            $attribute.anchorReferenceName,
~*/
            }
            if(schema.metadataUsage == 'true') {
/*~
            $attribute.metadataColumnName,
~*/
            }
            if(attribute.timeRange) {
/*~
            $attribute.changingColumnName,
~*/
            }
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
/*~
            $attribute.knotValueColumnName,
~*/
                if(schema.metadataUsage == 'true') {
/*~
            $attribute.knotMetadataColumnName,
~*/
                }
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
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(attribute.timeRange) {
                var statementTypes = "'N'";
                if(attribute.metadata.restatable == 'true')
                    statementTypes += ",'R'";
/*~
    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
~*/

                if(schema.metadataUsage == 'true') {
/*~
        $attribute.metadataColumnName $schema.metadataType not null,
~*/
                }
/*~
        $attribute.changingColumnName $attribute.timeRange not null,
~*/
                if(attribute.knotRange) {
                    knot = schema.knot[attribute.knotRange];
/*~
        $attribute.knotValueColumnName $knot.identity not null,
~*/
                }
                else {
/*~
        $attribute.valueColumnName $attribute.dataRange not null,
~*/
                }
/*~
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
~*/
                if(schema.metadataUsage == 'true') {
/*~
        $attribute.metadataColumnName,
~*/
                }
/*~
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
~*/
                if(schema.metadataUsage == 'true') {
/*~
            $attribute.metadataColumnName,
~*/
                }
/*~
            $attribute.changingColumnName,
            $attribute.valueColumnName
        )
        SELECT
            $attribute.anchorReferenceName,
~*/
                if(schema.metadataUsage == 'true') {
/*~
            $attribute.metadataColumnName,
~*/
                }
/*~
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
        }
/*~
END
GO
~*/
    }
}
