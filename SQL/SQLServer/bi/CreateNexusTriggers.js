if(schema.TRIGGERS) {
/*~
-- NEXUS TRIGGERS ---------------------------------------------------------------------------------------------------
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
var nexus, knot, attribute, role;
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
        $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange null,
        $attribute.positingColumnName $schema.metadata.positingRange null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange null,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        $attribute.knotValueColumnName $knot.dataRange null,
        $(knot.hasChecksum())? $attribute.knotChecksumColumnName varbinary(16) null,
        $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType null,
        $attribute.valueColumnName $knot.identity null$(nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
        $attribute.valueColumnName $attribute.dataRange null$(nexus.hasMoreAttributes())?,
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
        $(schema.IMPROVED)? ISNULL(ISNULL(i.$attribute.entityReferenceName, i.$nexus.identityColumnName), a.$nexus.identityColumnName),
        $(schema.METADATA)? ISNULL(i.$attribute.metadataColumnName, i.$nexus.metadataColumnName),
        $(attribute.isHistorized())? ISNULL(i.$attribute.changingColumnName, @now),
        ISNULL(i.$attribute.positingColumnName, @now),
        ISNULL(ISNULL(i.$attribute.reliabilityColumnName, i.$schema.metadata.reliabilitySuffix), 1),
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        i.$attribute.knotValueColumnName,
        $(knot.hasChecksum())? ISNULL(i.$attribute.knotChecksumColumnName, ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.knotValueColumnName as varbinary(max)))),
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
            $schema.metadata.reliabilitySuffix,
            $nexus.identityColumnName,
            $(schema.METADATA)? $nexus.metadataColumnName,
 ~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
            $(schema.IMPROVED)? $attribute.entityReferenceName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.positingColumnName,
            $attribute.reliabilityColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            $attribute.knotValueColumnName,
            $(knot.hasChecksum())? $attribute.knotChecksumColumnName,
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
        $attribute.entityReferenceName,
        $attribute.valueColumnName,
        $(attribute.timeRange)? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        i.$attribute.entityReferenceName,
        $(attribute.isKnotted && attribute.isKnotted())? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName), : i.$attribute.valueColumnName,
        $(attribute.timeRange)? i.$attribute.changingColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.reliabilityColumnName
    FROM
        @inserted i
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
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
        }
/*~
END
GO
~*/
	}
}
}
