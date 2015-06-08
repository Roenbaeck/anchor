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
        var scheme = schema.PARTITIONING ? ' PARTITION BY (' + knot.equivalentColumnName + ')' : '';
/*~
-- Knot identity table ------------------------------------------------------------------------------------------------
-- $knot.identityName table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${knot.capsule}$.$knot.identityName (
    $knot.identityColumnName $(knot.isGenerator())? $knot.identityGenerator not null, : $knot.identity not null,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null, : $knot.dummyColumnName bit null,
    constraint pk$knot.identityName primary key (
        $knot.identityColumnName
    )
) ORDER BY $knot.identityColumnName UNSEGMENTED ALL NODES;

-- Knot value table ---------------------------------------------------------------------------------------------------
-- $knot.equivalentName table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${knot.capsule}$.$knot.equivalentName (
    $knot.identityColumnName $knot.identity not null,
    $knot.equivalentColumnName $schema.metadata.equivalentRange not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName int default hash($knot.valueColumnName),
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null, : $knot.dummyColumnName bit null,
    constraint fk$knot.equivalentName foreign key (
        $knot.identityColumnName
    ) references ${knot.capsule}$.$knot.identityName($knot.identityColumnName),
    constraint pk$knot.equivalentName primary key (
        $knot.equivalentColumnName,
        $knot.identityColumnName
    ),
    constraint uq$knot.equivalentName unique (
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
) ORDER BY $knot.identityColumnName UNSEGMENTED ALL NODES $scheme;
~*/

    } // end of equivalent knot
    else { // start of regular knot
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${knot.capsule}$.$knot.name (
    $knot.identityColumnName $(knot.isGenerator())? $knot.identityGenerator not null, : $knot.identity not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName int default hash($knot.valueColumnName),
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null,
    constraint pk$knot.name primary key (
        $knot.identityColumnName
    ),
    constraint uq$knot.name unique (
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
) ORDER BY $knot.identityColumnName UNSEGMENTED ALL NODES;
~*/
    } // end of regular knot
}
