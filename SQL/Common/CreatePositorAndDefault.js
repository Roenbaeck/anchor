var tableOptions, ifNotExists, createTablePre, tableType, createTablePost, fromDummy;

    // set table options per dialect
    createTablePre = '';
    tableType = '';
    ifNotExists = 'IF NOT EXISTS'; // default for all PostgreSQL derived dialects
    tableOptions = '';
    createTablePost = '';
    fromDummy = '';
    switch (schema.metadata.databaseTarget) {
        case 'Citus':
            createTablePost = `
select create_reference_table('${schema.metadata.encapsulation}._${schema.metadata.positorSuffix}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${schema.metadata.encapsulation}._${schema.metadata.positorSuffix}'::regclass 
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
            fromDummy = 'FROM DUAL'
        break;                    
        case 'Redshift':
            tableOptions = `DISTSTYLE ALL SORTKEY(${schema.metadata.positorSuffix})`;
        break;         
        case 'Teradata':
            // Teradata has no IF NOT EXIST for tables. We check the catalog if the table exists.
            // Then if it returns rows we skip the create table.
            createTablePre = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${schema.metadata.encapsulation.toUpperCase()}' AND TableName = '_${schema.metadata.positorSuffix.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${schema.metadata.encapsulation.toUpperCase()}_${schema.metadata.positorSuffix.toUpperCase()};
`;
            createTablePost = `
.LABEL SKIP_${schema.metadata.encapsulation.toUpperCase()}_${schema.metadata.positorSuffix.toUpperCase()};
`;   
            ifNotExists = ''; 
            tableType = 'MULTISET';
            tableOptions = `UNIQUE PRIMARY INDEX (${schema.metadata.positorSuffix})` ;
         
        break;             
        case 'Vertica':
            tableOptions = `ORDER BY ${schema.metadata.positorSuffix} UNSEGMENTED ALL NODES`;
        break;                
        case 'Snowflake':
            tableOptions = `CLUSTER BY (${schema.metadata.positorSuffix})` ;
        break;
    }
/*~
-- POSITOR METADATA ---------------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available positors. Since at least one positor
-- must be available the table is set up with a default positor with identity 0.
--
-- Positor table ------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $schema.metadata.encapsulation\._$schema.metadata.positorSuffix (
    $schema.metadata.positorSuffix $schema.metadata.equivalentRange not null,
    constraint pk_$schema.metadata.positorSuffix primary key (
        $schema.metadata.positorSuffix
    )
) $tableOptions
;
$createTablePost

-- If the default value already exists do nothing.
INSERT INTO $schema.metadata.encapsulation\._$schema.metadata.positorSuffix (
    $schema.metadata.positorSuffix
) SELECT d.default_Positor 
    FROM (SELECT 0 AS default_Positor $fromDummy) d 
   WHERE NOT EXISTS (SELECT 1 
                       FROM $schema.metadata.encapsulation\._$schema.metadata.positorSuffix AS e 
                      WHERE d.default_Positor = e.$schema.metadata.positorSuffix
                    ) 
;
~*/

