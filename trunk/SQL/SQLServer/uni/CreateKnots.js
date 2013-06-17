~
/*
 *  Knots are used to store finite sets of values, normally used to describe states
 *  of entities (through knotted attributes) or relationships (through knotted ties).
 */
~
var knot, metadataDefinition;
for(var k = 0; knot = schema.knot[schema.knots[k]]; k++) {
    if(knot.metadata.generator == 'true')
        knot.identityGenerator = 'IDENTITY(1,1)';
    else
        knot.identityGenerator = '';
    if(schema.metadataUsage == 'true')
        metadataDefinition = knot.metadataColumnName + ' ' + $schema.metadataType + ' not null,';
    else
        metadataDefinition = '';
~
----------------------------------- [Knot Table] -------------------------------------
-- $knot.name table (number ${(knot.position + 1)}$ of $schema.knots.length)
--------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = $knot.name and type LIKE '%U%')
CREATE TABLE [$knot.capsule].[$knot.name] (
    $knot.identityColumnName $knot.identity $knot.identityGenerator not null,
    $knot.name $knot.dataRange not null,
    $metadataDefinition
    constraint pk$knot.name primary key (
        $knot.identityColumnName asc
    ),
    constraint uq$knot.name unique (
        $knot.name
    )
);
GO
~
}
