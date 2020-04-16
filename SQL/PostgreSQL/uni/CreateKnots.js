/*~
-- KNOTS --------------------------------------------------------------------------------------------------------------
--
-- Knots are used to store finite sets of values, normally used to describe states
-- of entities (through knotted attributes) or relationships (through knotted ties).
-- Knots have their own surrogate identities and are therefore immutable.
-- Values can be added to the set over time though.
-- Knots should have values that are mutually exclusive and exhaustive.
-- Knots are unfolded when using equivalence.
--
 ~*/
var knot;
while (knot = schema.nextKnot()) {
    if(knot.isGenerator())
        knot.identityGenerator = 'IDENTITY(1,1)';
    if(schema.EQUIVALENCE && knot.isEquivalent()) {
        var scheme = schema.PARTITIONING ? ' ON EquivalenceScheme(' + knot.equivalentColumnName + ')' : '';
/*~
-- Knot identity table ------------------------------------------------------------------------------------------------
-- $knot.identityName table
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$knot.capsule$.$knot.identityName', 'U') IS NULL
CREATE TABLE [$knot.capsule].[$knot.identityName] (
    $knot.identityColumnName $knot.identity $knot.identityGenerator not null,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null, : $knot.dummyColumnName bit null,
    constraint pk$knot.identityName primary key (
        $knot.identityColumnName asc
    )
);
GO
-- Knot value table ---------------------------------------------------------------------------------------------------
-- $knot.equivalentName table
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$knot.capsule$.$knot.equivalentName', 'U') IS NULL
CREATE TABLE [$knot.capsule].[$knot.equivalentName] (
    $knot.identityColumnName $knot.identity not null,
    $knot.equivalentColumnName $schema.metadata.equivalentRange not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($knot.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null, : $knot.dummyColumnName bit null,
    constraint fk$knot.equivalentName foreign key (
        $knot.identityColumnName
    ) references [$knot.capsule].[$knot.identityName]($knot.identityColumnName),
    constraint pk$knot.equivalentName primary key (
        $knot.equivalentColumnName asc,
        $knot.identityColumnName asc
    ),
    constraint uq$knot.equivalentName unique (
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
)$scheme;
GO
~*/

    } // end of equivalent knot
    else { // start of regular knot
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$knot.capsule$.$knot.name', 'U') IS NULL
CREATE TABLE [$knot.capsule].[$knot.name] (
    $knot.identityColumnName $knot.identity $knot.identityGenerator not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($knot.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null,
    constraint pk$knot.name primary key (
        $knot.identityColumnName asc
    ),
    constraint uq$knot.name unique (
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
);
GO
~*/
    } // end of regular knot
}
