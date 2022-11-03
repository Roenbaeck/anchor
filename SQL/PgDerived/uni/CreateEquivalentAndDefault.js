if(schema.EQUIVALENCE) {
    // set table options per dialect
    switch (schema.metadata.databaseTarget) {
        case 'Citus':
            tableOptions = `
; 
select create_reference_table('${schema.metadata.encapsulation}._${schema.metadata.equivalentSuffix}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${schema.metadata.encapsulation}._${schema.metadata.equivalentSuffix}'::regclass 
                       and citus_table_type = 'reference'
                  ) `;
        break; 
        case 'Redshift':
            tableOptions = `DISTSTYLE ALL SORTKEY(${schema.metadata.equivalentSuffix})`;
        break;            
        case 'Vertica':
            tableOptions = `ORDER BY ${schema.metadata.equivalentSuffix} UNSEGMENTED ALL NODES`;
        break;                
        case 'Snowflake':
            tableOptions = `CLUSTER BY (${schema.metadata.equivalentSuffix})` ;
        break;
        default:
            tableOptions = '';
    }
/*~
-- EQUIVALENTS METADATA -----------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available equivalents. Since at least one equivalent
-- must be available the table is set up with a default equivalent with identity 0.
--
-- Equivalent table ---------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $schema.metadata.encapsulation\._$schema.metadata.equivalentSuffix (
    $schema.metadata.equivalentSuffix $schema.metadata.equivalentRange not null,
    constraint pk_$schema.metadata.equivalentSuffix primary key (
        $schema.metadata.equivalentSuffix
    )
) $tableOptions
;

-- If the default value already exists do nothing.
INSERT INTO $schema.metadata.encapsulation\._$schema.metadata.equivalentSuffix (
    $schema.metadata.equivalentSuffix
) SELECT d._defaultEquivalent 
    FROM (SELECT 0 AS _defaultEquivalent) d 
   WHERE NOT EXISTS (SELECT 1 
                       FROM $schema.metadata.encapsulation\._$schema.metadata.equivalentSuffix AS e 
                      WHERE d._defaultEquivalent = e.$schema.metadata.equivalentSuffix
                    ) 
;
~*/
}
