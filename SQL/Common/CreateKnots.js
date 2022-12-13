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
var knot, checksumOptions, tableType, ifNotExists,
    tableOptions, tableOptionsEquivalent,
    createTablePre, createTablePreIdentity, createTablePreEquivalent, 
    createTablePost, createTablePostIdentity, createTablePostEquivalent;
while (knot = schema.nextKnot()) {
    if(knot.isGenerator())
        knot.identityGenerator = schema.metadata.identityProperty;
    // set options per dialect
    createTablePre = '';
    createTablePreIdentity = '';
    createTablePreEquivalent = '';
    checksumOptions = `varchar(36) NULL`; // create the column, the ETL should load the MD5 hash!
    tableType = '';
    tableOptionsEquivalent = '';
    ifNotExists = 'IF NOT EXISTS'; // default for all PostgreSQL derived dialects
    tableOptions = '';
    createTablePost = '';
    createTablePostIdentity = '';
    createTablePostEquivalent = '';
    switch (schema.metadata.databaseTarget) {
        case 'Citus':
            checksumOptions = `bytea generated always as (cast(MD5(cast(${knot.valueColumnName} as text)) as bytea)) stored`;
            createTablePostIdentity = `
select create_reference_table('${knot.capsule}.${knot.identityName}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${knot.capsule}.${knot.identityName}'::regclass 
                       and citus_table_type = 'reference'
                  ) 
;`;
            createTablePostEquivalent = `
select create_reference_table('${knot.capsule}.${knot.equivalentName}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${knot.capsule}.${knot.equivalentName}'::regclass 
                       and citus_table_type = 'reference'
                  ) 
;`;
            createTablePost = `
select create_reference_table('${knot.capsule}.${knot.name}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${knot.capsule}.${knot.name}'::regclass 
                       and citus_table_type = 'reference'
                  ) 
;`;
        break;        
        case 'Oracle':
            // Oracle has no IF NOT EXIST for tables. We wrap it in an execute immediate.
            // Then catch the -995 error of existing objects to mimic the IF NOT EXIST.
            createTablePre = `
BEGIN 
EXECUTE IMMEDIATE 
'
`;
            createTablePreEquivalent = createTablePre;
            createTablePostIdentity = createTablePre;
            createTablePost = `
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -955 THEN NULL;
    ELSE RAISE;
    END IF;
END;
`;
            createTablePostEquivalent = createTablePost;
            createTablePostIdentity = createTablePost;
            ifNotExists = ''; 
            // We have to add the table option to create an index organized table aka clustered table.
            tableOptions = `ORGANIZATION INDEX 
'`;
            tableOptionsEquivalent = tableOptions;
        break;        
        case 'PostgreSQL':
            checksumOptions = `bytea generated always as (cast(MD5(cast(${knot.valueColumnName} as text)) as bytea)) stored`;
        break;
        case 'Redshift':
            checksumOptions = `varbyte(16) DEFAULT cast(MD5(cast(${knot.valueColumnName} as text)) as varbyte(16))`;
            tableOptions = `DISTSTYLE ALL SORTKEY(${knot.identityColumnName})`;
            tableOptionsEquivalent = tableOptions;
        break;  
        case 'Snowflake':
            checksumOptions = `numeric(19,0) DEFAULT hash(${knot.valueColumnName})`;
            tableOptions = `CLUSTER BY (${knot.identityColumnName})` ;
            tableOptionsEquivalent = tableOptions;
        break;  
        case 'Teradata':
            // Teradata has no IF NOT EXIST for tables. We check the catalog if the table exists.
            // Then if it returns rows we skip the create table.
            createTablePre = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${knot.capsule.toUpperCase()}' AND TableName = '${knot.name.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${knot.capsule.toUpperCase()}_${knot.name.toUpperCase()};
`;
            createTablePreIdentity = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${knot.capsule.toUpperCase()}' AND TableName = '${knot.identityName.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${knot.capsule.toUpperCase()}_${knot.identityName.toUpperCase()};
`;
            createTablePreEquivalent = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${knot.capsule.toUpperCase()}' AND TableName = '${knot.equivalentName.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${knot.capsule.toUpperCase()}_${knot.equivalentName.toUpperCase()};
`;
            createTablePost = `
.LABEL SKIP_${knot.capsule.toUpperCase()}_${knot.name.toUpperCase()};
`;   
            createTablePostIdentity = `
.LABEL SKIP_${knot.capsule.toUpperCase()}_${knot.identityName.toUpperCase()};
`; 
            createTablePostEquivalent = `
.LABEL SKIP_${knot.capsule.toUpperCase()}_${knot.equivalentName.toUpperCase()};
`; 
            ifNotExists = ''; 
            tableType = 'MULTISET';
            tableOptions = `UNIQUE PRIMARY INDEX (${knot.identityColumnName})` ;
            tableOptionsEquivalent = `PRIMARY INDEX (${knot.identityColumnName})` ;
        break;                
        case 'Vertica':
            checksumOptions = `int DEFAULT hash(${knot.valueColumnName})`;
            tableOptions = `ORDER BY ${knot.identityColumnName} UNSEGMENTED ALL NODES`
                         + schema.PARTITIONING ? ` PARTITION BY (${knot.equivalentColumnName})` : '' ;
            tableOptionsEquivalent = tableOptions;             
        break;                
           
    }

    if(schema.EQUIVALENCE && knot.isEquivalent()) {
/*~
-- Knot identity table ------------------------------------------------------------------------------------------------
-- $knot.identityName table
-----------------------------------------------------------------------------------------------------------------------
$createTablePreIdentity
CREATE $tableType TABLE $ifNotExists $knot.capsule\.$knot.identityName (
    $knot.identityColumnName $knot.identity $(knot.isGenerator())? $knot.identityGenerator NOT NULL, : NOT NULL,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType NOT NULL, : $knot.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint pk_$knot.identityName primary key (
        $knot.identityColumnName
    )
) $tableOptions
;
$createTablePostIdentity
-- Knot value table ---------------------------------------------------------------------------------------------------
-- $knot.equivalentName table
-----------------------------------------------------------------------------------------------------------------------
$createTablePreEquivalent
CREATE $tableType TABLE $ifNotExists $knot.capsule\.$knot.equivalentName (
    $knot.identityColumnName $knot.identity NOT NULL,
    $knot.equivalentColumnName $schema.metadata.equivalentRange NOT NULL,
    $knot.valueColumnName $knot.dataRange NOT NULL,
    $(knot.hasChecksum())? $knot.checksumColumnName $checksumOptions,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType NOT NULL, : $knot.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint fk_$knot.equivalentName foreign key (
        $knot.identityColumnName
    ) references $knot.capsule\.$knot.identityName($knot.identityColumnName),
    constraint pk_$knot.equivalentName primary key (
        $knot.equivalentColumnName ,
        $knot.identityColumnName 
    ),
    constraint uq_$knot.equivalentName unique (
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
) $tableOptionsEquivalent 
;
$createTablePostEquivalent
~*/

    } // end of equivalent knot
    else { // start of regular knot
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $knot.capsule\.$knot.name (
    $knot.identityColumnName $knot.identity $knot.identityGenerator NOT NULL,
    $knot.valueColumnName $knot.dataRange NOT NULL,
    $(knot.hasChecksum())? $knot.checksumColumnName $checksumOptions,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType NOT NULL, : $knot.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint pk_$knot.name primary key (
        $knot.identityColumnName 
    ),
    constraint uq_$knot.name unique (
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
) $tableOptions
;
$createTablePost
~*/
    } // end of regular knot
}
