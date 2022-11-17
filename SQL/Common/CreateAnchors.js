/*~
-- ANCHORS ------------------------------------------------------------------------------------------------------------
--
-- Anchors are used to store the identities of entities.
-- Anchors are immutable.
-- Anchors may have zero or more adjoined attributes.
--
~*/
var anchor, tableOptions, tableType, ifNotExists, createTablePre, createTablePost;
while (anchor = schema.nextAnchor()) {
    if(anchor.isGenerator()) anchor.identityGenerator = schema.metadata.identityProperty;
    // set options per dialect
    createTablePre = '';
    tableType = '';
    ifNotExists = 'IF NOT EXISTS'; // default for all PostgreSQL derived dialects
    tableOptions = '';
    createTablePost = '';
    switch (schema.metadata.databaseTarget) {
        case 'Citus':
            // Citus cannot have identity colums as pk, but we can use sequences in pk's.
            anchor.identityGenerator = anchor.isGenerator() ? `DEFAULT(nextval('${anchor.name + '_' + anchor.identityColumnName}_seq'))`:'';
            createTablePre = anchor.isGenerator() ? `CREATE SEQUENCE IF NOT EXISTS ${anchor.name + '_' + anchor.identityColumnName}_seq;`:'';            
            // With a function we create a distributed table.
            createTablePost = `
select create_distributed_table('${anchor.capsule}.${anchor.name}', '${anchor.identityColumnName.toLowerCase()}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${anchor.capsule}.${anchor.name}'::regclass 
                       and citus_table_type = 'distributed'
                  ) 
;`;
        break; 
        case 'DuckDB':
            // DuckDB has no identity colums, but we can emulate with sequences.
            anchor.identityGenerator = anchor.isGenerator() ? `DEFAULT(nextval('${anchor.name + '_' + anchor.identityColumnName}_seq'))`:'';
            createTablePre = anchor.isGenerator() ? `CREATE SEQUENCE IF NOT EXISTS ${anchor.name + '_' + anchor.identityColumnName}_seq;`:'';
        break;
        case 'Oracle':
            // Oracle has no IF NOT EXIST for tables. We wrap it in an execute immediate.
            // Then catch the -995 error of existing objects to mimic the IF NOT EXIST.
            createTablePre = `
BEGIN 
EXECUTE IMMEDIATE 
'
`;

            createTablePost = `
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -955 THEN NULL;
    ELSE RAISE;
    END IF;
END;
`;
            ifNotExists = ''; 
            // We have to add the table option to create an index organized table aka clustered table.
            tableOptions = `ORGANIZATION INDEX 
'`;

        break;
        case 'Redshift':
            tableOptions = `DISTSTYLE KEY DISTKEY(${anchor.identityColumnName}) SORTKEY(${anchor.identityColumnName})`;
        break;    
        case 'Snowflake':
            tableOptions = `CLUSTER BY (${anchor.identityColumnName})` ;
        break; 
        case 'Teradata':
            // Teradata has no IF NOT EXIST for tables. We check the catalog if the table exists.
            // Then if it returns rows we skip the create table.
            createTablePre = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${anchor.capsule.toUpperCase()}' AND TableName = '${anchor.name.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${anchor.capsule.toUpperCase()}_${anchor.name.toUpperCase()};
`;
            createTablePost = `
.LABEL SKIP_${anchor.capsule.toUpperCase()}_${anchor.name.toUpperCase()};
`;   
            ifNotExists = ''; 
            tableType = 'MULTISET';
            tableOptions = `UNIQUE PRIMARY INDEX (${anchor.identityColumnName})` ;
         
        break;       
        case 'Vertica':
            tableOptions = `ORDER BY ${anchor.identityColumnName} SEGMENTED BY MODULARHASH(${anchor.identityColumnName}) ALL NODES`;
        break;                
    }
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with ${(anchor.attributes ? anchor.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $anchor.capsule\.$anchor.name (
    $anchor.identityColumnName $anchor.identity $(anchor.isGenerator())? $anchor.identityGenerator NOT NULL, : NOT NULL,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType NOT NULL, : $anchor.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
    constraint pk_$anchor.name primary key (
        $anchor.identityColumnName 
    )
) $tableOptions 
;
$createTablePost
~*/ 
}