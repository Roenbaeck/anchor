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
for(var k = 0; knot = schema.knot[schema.knots[k]]; k++) {
    if(knot.metadata.generator == 'true')
        knot.identityGenerator = 'IDENTITY(1,1)';
    if(schema.metadataUsage == 'true')
        knot.metadataDefinition = knot.metadataColumnName + ' ' + schema.metadataType + ' not null,';
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table (number ${(knot.position + 1)}$ of $schema.knots.length)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$knot.name', 'U') IS NULL
CREATE TABLE [$knot.capsule].[$knot.name] (
    $knot.identityColumnName $knot.identity $knot.identityGenerator not null,
    $knot.name $knot.dataRange not null,
    $knot.metadataDefinition
    constraint pk$knot.name primary key (
        $knot.identityColumnName asc
    ),
    constraint uq$knot.name unique (
        $knot.name
    )
);
GO
~*/
}
