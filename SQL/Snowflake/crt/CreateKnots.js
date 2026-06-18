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
        knot.identityGenerator = 'default ' + knot.capsule + '.' + knot.identitySequenceName + '.nextval';
    if(schema.METADATA)
        knot.metadataDefinition = knot.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null,';
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
~*/
    if(knot.isGenerator()) {
/*~
CREATE SEQUENCE IF NOT EXISTS ${knot.capsule}$.$knot.identitySequenceName START 1 INCREMENT 1;
~*/
    }
/*~
CREATE TABLE IF NOT EXISTS ${knot.capsule}$.$knot.name (
    $knot.identityColumnName $(knot.isGenerator())? $knot.identity $knot.identityGenerator not null, : $knot.identity not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName numeric(19,0) default hash($knot.valueColumnName),
    $knot.metadataDefinition
    constraint pk$knot.name primary key (
        $knot.identityColumnName 
    ),
    constraint uq$knot.name unique (
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
) CLUSTER BY ($knot.identityColumnName);
~*/
}
