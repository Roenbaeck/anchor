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
var anchor, attribute;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        var statementTypes = "'N'";
        if(attribute.isHistorized() && !attribute.isIdempotent())
            statementTypes += ",'R'";
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
    DECLARE @maxVersion int;
    DECLARE @currentVersion int;

    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
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
        $(attribute.isEquivalent())? i.$attribute.equivalentColumnName,
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        $(attribute.isHistorized())? i.$attribute.changingColumnName,
        i.$attribute.valueColumnName,
        $(attribute.hasChecksum())? ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.valueColumnName as varbinary(max))),
~*/
        if(attribute.isHistorized()) {
/*~
        DENSE_RANK() OVER (
            PARTITION BY
                $(attribute.isEquivalent())? i.$attribute.equivalentColumnName,
                i.$attribute.anchorReferenceName
            ORDER BY
                i.$attribute.changingColumnName ASC
        ),
~*/
        }
        else {
/*~
        ROW_NUMBER() OVER (
            PARTITION BY
                $(attribute.isEquivalent())? i.$attribute.equivalentColumnName,
                i.$attribute.anchorReferenceName
            ORDER BY
                (SELECT 1) ASC -- some undefined order
        ),
~*/
        }
/*~
        'X'
    FROM
        inserted i;

    SELECT
        @maxVersion = $(attribute.isHistorized())? max($attribute.versionColumnName), : 1,
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
~*/
        if(attribute.isHistorized()) {
/*~
                    WHEN [$attribute.capsule].[rf$attribute.name](
                        v.$attribute.anchorReferenceName,
                        $(attribute.isEquivalent())? v.$attribute.equivalentColumnName,
                        $(attribute.hasChecksum())? v.$attribute.checksumColumnName, : v.$attribute.valueColumnName,
                        v.$attribute.changingColumnName
                    ) = 1
                    THEN 'R' -- restatement
~*/
        }
/*~
                    ELSE 'N' -- new statement
                END
        FROM
            @$attribute.name v
        LEFT JOIN
            [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
        ON
            [$attribute.mnemonic].$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
        $(attribute.isHistorized())? AND
            $(attribute.isHistorized())? [$attribute.mnemonic].$attribute.changingColumnName = v.$attribute.changingColumnName
        $(attribute.isEquivalent())? AND
            $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName = v.$attribute.equivalentColumnName
        AND
            $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName = v.$attribute.checksumColumnName : [$attribute.mnemonic].$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = @currentVersion;

        INSERT INTO [$attribute.capsule].[$attribute.name] (
            $attribute.anchorReferenceName,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.valueColumnName
        )
        SELECT
            $attribute.anchorReferenceName,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.valueColumnName
        FROM
            @$attribute.name
        WHERE
            $attribute.versionColumnName = @currentVersion
        AND
            $attribute.statementTypeColumnName in ($statementTypes);
    END
END
GO
~*/
    } // end of loop over attributes
}
