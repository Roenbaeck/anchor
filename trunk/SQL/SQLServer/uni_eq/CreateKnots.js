/*~
-- KNOTS --------------------------------------------------------------------------------------------------------------
--
-- Knots are used to store finite sets of values, normally used to describe states
-- of entities (through knotted attributes) or relationships (through knotted ties).
-- Knots have their own surrogate identities and are therefore immutable.
-- Values can be added to the set over time though.
-- Knots should have values that are mutually exclusive and exhaustive.
--
 ~*/
var knot;
while (knot = schema.nextKnot()) {
    if(knot.isGenerator())
        knot.identityGenerator = 'IDENTITY(1,1)';
    if(schema.METADATA)
        knot.metadataDefinition = knot.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null,';
    var scheme = schema.PARTITIONING ? ' ON EquivalenceScheme(' + knot.equivalentColumnName + ')' : '';
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$knot.name', 'U') IS NULL
CREATE TABLE [$knot.capsule].[$knot.name] (
    $knot.identityColumnName $knot.identity $knot.identityGenerator not null,
    $knot.equivalentColumnName $schema.metadata.equivalentRange not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName as cast(HashBytes('MD5', cast($knot.valueColumnName as varbinary(max))) as varbinary(16)) PERSISTED,
    $knot.metadataDefinition
    constraint pk$knot.name primary key (
        $knot.equivalentColumnName asc,
        $knot.identityColumnName asc
    ),
    constraint uq$knot.name unique (
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
)$scheme;
GO
~*/
}
