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
var knot, checksumOptions, tableOptions, partitionOptions;
while (knot = schema.nextKnot()) {
    if(knot.isGenerator())
        knot.identityGenerator = schema.metadata.identityProperty;
    // set options per dialect
    switch (schema.metadata.databaseTarget) {
        case 'PostgreSQL':
            checksumOptions = `bytea generated always as (cast(MD5(cast(${knot.valueColumnName} as text)) as bytea)) stored`;
            tableOptions = '';
            partitionOptions = '';
        break;
        case 'Redshift':
            checksumOptions = `varbyte(16) DEFAULT cast(MD5(cast(${knot.valueColumnName} as text)) as varbyte(16))`;
            tableOptions = `DISTSTYLE ALL SORTKEY(${knot.identityColumnName})`;
            partitionOptions = '';
        break;  
        case 'Vertica':
            checksumOptions = `int DEFAULT hash(${knot.valueColumnName})`;
            tableOptions = `ORDER BY ${knot.identityColumnName} UNSEGMENTED ALL NODES`;
            partitionOptions = schema.PARTITIONING ? `PARTITION BY (${knot.equivalentColumnName})` : '' ;
        break;                
        case 'Snowflake':
            checksumOptions = `numeric(19,0) DEFAULT hash(${knot.valueColumnName})`;
            tableOptions = `CLUSTER BY (${knot.identityColumnName})` ;
            partitionOptions = '';
        break;
        default:
            checksumOptions = `varchar(36) NULL`; // create the column, the ETL should load the MD5 hash!
            tableOptions = '';
            partitionOptions = '';
    }

    if(schema.EQUIVALENCE && knot.isEquivalent()) {
/*~
-- Knot identity table ------------------------------------------------------------------------------------------------
-- $knot.identityName table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $knot.capsule\.$knot.identityName (
    $knot.identityColumnName $knot.identity $(knot.isGenerator())? $knot.identityGenerator NOT NULL, : NOT NULL,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType NOT NULL, : $knot.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint pk$knot.identityName primary key (
        $knot.identityColumnName
    )
) $tableOptions
;
-- Knot value table ---------------------------------------------------------------------------------------------------
-- $knot.equivalentName table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $knot.capsule\.$knot.equivalentName (
    $knot.identityColumnName $knot.identity NOT NULL,
    $knot.equivalentColumnName $schema.metadata.equivalentRange NOT NULL,
    $knot.valueColumnName $knot.dataRange NOT NULL,
    $(knot.hasChecksum())? $knot.checksumColumnName $checksumOptions,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType NOT NULL, : $knot.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint fk$knot.equivalentName foreign key (
        $knot.identityColumnName
    ) references $knot.capsule\.$knot.identityName($knot.identityColumnName),
    constraint pk$knot.equivalentName primary key (
        $knot.equivalentColumnName ,
        $knot.identityColumnName 
    ),
    constraint uq$knot.equivalentName unique (
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
) $tableOptions $partitionOptions
;
~*/

    } // end of equivalent knot
    else { // start of regular knot
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $knot.capsule\.$knot.name (
    $knot.identityColumnName $knot.identity $knot.identityGenerator NOT NULL,
    $knot.valueColumnName $knot.dataRange NOT NULL,
    $(knot.hasChecksum())? $knot.checksumColumnName $checksumOptions,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType NOT NULL, : $knot.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint pk$knot.name primary key (
        $knot.identityColumnName 
    ),
    constraint uq$knot.name unique (
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
) $tableOptions
;
~*/
    } // end of regular knot
}
