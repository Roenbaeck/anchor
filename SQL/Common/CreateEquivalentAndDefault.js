var tableOptions, ifNotExists, createTablePre, tableType, createTablePost, fromDummy;
if(schema.EQUIVALENCE) {
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
select create_reference_table('${schema.metadata.encapsulation}._${schema.metadata.equivalentSuffix}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${schema.metadata.encapsulation}._${schema.metadata.equivalentSuffix}'::regclass 
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
            tableOptions = `DISTSTYLE ALL SORTKEY(${schema.metadata.equivalentSuffix})`;
        break;         
        case 'Teradata':
            // Teradata has no IF NOT EXIST for tables. We check the catalog if the table exists.
            // Then if it returns rows we skip the create table.
            createTablePre = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${schema.metadata.encapsulation.toUpperCase()}' AND TableName = '_${schema.metadata.equivalentSuffix.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${schema.metadata.encapsulation.toUpperCase()}_${schema.metadata.equivalentSuffix.toUpperCase()};
`;
            createTablePost = `
.LABEL SKIP_${schema.metadata.encapsulation.toUpperCase()}_${schema.metadata.equivalentSuffix.toUpperCase()};
`;   
            ifNotExists = ''; 
            tableType = 'MULTISET';
            tableOptions = `UNIQUE PRIMARY INDEX (${schema.metadata.equivalentSuffix})` ;
         
        break;             
        case 'Vertica':
            tableOptions = `ORDER BY ${schema.metadata.equivalentSuffix} UNSEGMENTED ALL NODES`;
        break;                
        case 'Snowflake':
            tableOptions = `CLUSTER BY (${schema.metadata.equivalentSuffix})` ;
        break;
    }
/*~
-- EQUIVALENTS METADATA -----------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available equivalents. Since at least one equivalent
-- must be available the table is set up with a default equivalent with identity 0.
--
-- Equivalent table ---------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $schema.metadata.encapsulation\._$schema.metadata.equivalentSuffix (
    $schema.metadata.equivalentSuffix $schema.metadata.equivalentRange not null,
    constraint pk_$schema.metadata.equivalentSuffix primary key (
        $schema.metadata.equivalentSuffix
    )
) $tableOptions
;
$createTablePost

-- If the default value already exists do nothing.
INSERT INTO $schema.metadata.encapsulation\._$schema.metadata.equivalentSuffix (
    $schema.metadata.equivalentSuffix
) SELECT d.default_Equivalent 
    FROM (SELECT 0 AS default_Equivalent $fromDummy) d 
   WHERE NOT EXISTS (SELECT 1 
                       FROM $schema.metadata.encapsulation\._$schema.metadata.equivalentSuffix AS e 
                      WHERE d.default_Equivalent = e.$schema.metadata.equivalentSuffix
                    ) 
;
~*/
}
