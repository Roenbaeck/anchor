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
    if(schema.METADATA)
       knot.metadataDefinition = knot.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null';
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
begin -- Create sequences if not exist
    execute immediate 'create sequence ${(knot.name + '_' + knot.identityColumnName).substr(0,26) + '_SEQ'}$ start with 10000 increment by 1 cache 20 nocycle ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/

begin -- Create table with pk column
    execute immediate '
        CREATE TABLE $knot.name (
            $knot.identityColumnName $knot.identity not null,
            $knot.valueColumnName $knot.dataRange not null,
            $knot.metadataDefinition,
            constraint ${('PK_' + knot.name).substr(0,30)}$ primary key (
                $knot.identityColumnName 
            ),
            constraint ${('UK_' + knot.name).substr(0,30)}$ unique (
                $knot.valueColumnName
            )
      ) ORGANIZATION INDEX
    ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/
~*/
}
