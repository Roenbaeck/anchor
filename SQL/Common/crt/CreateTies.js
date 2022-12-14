/*~
-- TIES ---------------------------------------------------------------------------------------------------------------
--
-- Ties are used to represent relationships between entities.
-- They come in four flavors: static, historized, knotted static, and knotted historized.
-- Ties have cardinality, constraining how members may participate in the relationship.
-- Every entity that is a member in a tie has a specified role in the relationship.
-- Ties must have at least two anchor roles and zero or more knot roles.
--
~*/
var tie, tieType, firstIdentifierRole, tieFk, tieUq, tableOptions, tableType, ifNotExists, 
    createTablePre, createTablePost, assertionOptions, assertionOptionsDefault, indexOptions;
while (tie = schema.nextTie()) {
    firstIdentifierRole = null
    tie.metadataDefinition = schema.METADATA 
                           ? `${tie.metadataColumnName} ${schema.metadata.metadataType} NOT NULL`
                           : `${tie.recordingColumnName} ${schema.metadata.chronon} DEFAULT ${schema.metadata.now}`;
    if(tie.isHistorized() && tie.isKnotted()) { 
        tieType = 'Knotted historized tie table '; 
    } else if(tie.isHistorized()) { 
        tieType = 'Historized tie table --------'; 
    } else if(tie.isKnotted()) { 
        tieType = 'Knotted tie table -----------';     
    } else {
        tieType = 'Static tie table ------------'; 
    }
    // createTablePre and other create options per dialect
    createTablePre = '';
    tableType = '';
    ifNotExists = 'IF NOT EXISTS'; // default for all PostgreSQL derived dialects
    tableOptions = '';
    createTablePost = '';
    tieFk = true; 
    tieUq = true;
    switch (schema.metadata.databaseTarget) {
        case 'Citus':
            // distributed tables kan only have uq on distribution key and fk's on distribution key!
            tieFk = false; 
            tieUq = false;
        break;   
        case 'Oracle':
            // Oracle has no IF NOT EXIST for tables. We wrap it in an execute immediate.
            // Then catch the -995 error of existing objects to mimic the IF NOT EXIST.
            createTablePre = `
BEGIN 
EXECUTE IMMEDIATE 
'
`;
            ifNotExists = ''; 
        break;            
        case 'Teradata':
            // Teradata has no IF NOT EXIST for tables. We check the catalog if the table exists.
            // Then if it returns rows we skip the create table.
            createTablePre = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${tie.capsule.toUpperCase()}' AND TableName = '${tie.positName.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${tie.capsule.toUpperCase()}_${tie.positName.toUpperCase()};
`;
            ifNotExists = ''; 
            tableType = 'MULTISET';
        break; 

    }  
/*~
-- $tieType---------------------------------------------------------------------------------------
-- $tie.positName table (having $tie.roles.length roles)
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $tie.capsule\.$tie.positName (
    $tie.identityColumnName $tie.identity $tie.identityGenerator not null,
~*/
    var role, anchorRoles = [], anchorRolesColumnNames = [];
    while (role = tie.nextRole()) {
        if(role.anchor) {
            anchorRoles.push(role);
            anchorRolesColumnNames.push(role.columnName);
        }
/*~
    $role.columnName $(role.anchor)? $role.anchor.identity not null, : $role.knot.identity not null,
~*/
    }
/*~
    $(tie.timeRange)? $tie.changingColumnName $tie.timeRange not null,
~*/
    while (role = tie.nextRole()) {
        var knotReference = '';
        if(role.knot) {
            knotReference += role.knot.capsule + '.' + (role.knot.isEquivalent() ? role.knot.identityName : role.knot.name);
        }
        if (tieFk) {
/*~
    constraint ${(tie.positName + '_fk' + role.name)}$ foreign key (
        $role.columnName
    ) references $(role.anchor)? $role.anchor.capsule\.$role.anchor.name($role.anchor.identityColumnName), : $knotReference($role.knot.identityColumnName),
~*/
        }
    }
    // one-to-one and we need additional constraints
    if(!tie.hasMoreIdentifiers()) {
        while (role = tie.nextRole()) {
            if(role.isAnchorRole() && tieUq) {
                if(tie.isHistorized()) {
/*~
    constraint ${tie.positName + '_uq' + role.name}$ unique (
        $role.columnName,
        $tie.changingColumnName
    ),
~*/
                }
                else {
/*~
    constraint ${tie.positName + '_uq' + role.name}$ unique (
        $role.columnName
    ),
~*/
                }
            }
        }
    }
    if(tieUq) {
/*~
    constraint uq_$tie.positName unique (
            $tie.identityColumnName
    ),
~*/
    }
/*~
    constraint pk_$tie.name primary key (    
~*/
    if(tie.hasMoreIdentifiers()) {
        while (role = tie.nextIdentifier()) {
            if (firstIdentifierRole == null) firstIdentifierRole = role;
/*~
        $role.columnName~*/
            if(tie.hasMoreIdentifiers() || tie.isHistorized()) {
                /*~,~*/
            }
        }
    }
    else {
        while (role = tie.nextRole()) {
/*~
        $role.columnName~*/
            if(tie.hasMoreRoles() || tie.isHistorized()) {
                /*~,~*/
            }
        }
    }
    if(tie.isHistorized()) {
/*~
        $tie.changingColumnName
~*/
    }
    // dialect specific table options & createTablePost options
    switch (schema.metadata.databaseTarget) {
        case 'Citus':
            // other option could be distribute on the generated id? But then we need an other PK or skip the PK! But it creates a round robin distribution!
            // pk can only be placed if distribution key is part of the pk. If no first identifier then pick the first anchor role.
            if (firstIdentifierRole == null) firstIdentifierRole = anchorRoles[0];
            createTablePost = `
select create_distributed_table('${tie.capsule}.${tie.positName}', '${firstIdentifierRole.columnName.toLowerCase()}', colocate_with => '${firstIdentifierRole.anchor.capsule}.${firstIdentifierRole.anchor.name}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${tie.capsule}.${tie.positName}'::regclass 
                       and citus_table_type = 'distributed'
                  ) 
;`;
        break;
        case 'Oracle':
            // Oracle has no IF NOT EXIST for tables. We wrap it in an execute immediate.
            // Then catch the -995 error of existing objects to mimic the IF NOT EXIST.
            createTablePost = `
EXCEPTION WHEN OTHERS THEN
IF SQLCODE = -955 THEN NULL;
ELSE RAISE;
END IF;
END;
`;
            // We have to add the table option to create an index organized table aka clustered table.
            tableOptions = `ORGANIZATION INDEX 
'`;            
        break;                
        case 'Redshift':  
            //tableOptions = `DISTSTYLE EVEN INTERLEAVED SORTKEY(${anchorRolesColumnNames.join(', ')})`;
            // or by tie id? 
            tableOptions = `DISTSTYLE KEY DISTKEY(${tie.identityColumnName}) INTERLEAVED SORTKEY(${anchorRolesColumnNames.join(', ')})`;
            // TO DO, check if we can do the same as the Vertica projections but then with materialized views with different distribution keys.
        break;    
        case 'Teradata':
            // Teradata has no IF NOT EXIST for tables. We check the catalog if the table exists.
            // Then if it returns rows we skip the create table.
            createTablePost = `
.LABEL SKIP_${tie.capsule.toUpperCase()}_${tie.positName.toUpperCase()};
`;   
            tableOptions = `PRIMARY INDEX (${tie.identityColumnName})` ;
            // TO DO, check if we can do the same as the Vertica projections but then with join indexes with different distribution keys.
         
        break;              
        case 'Snowflake': 
            tableOptions = `CLUSTER BY ${tie.identityColumnName}, ${anchorRolesColumnNames.join(', ')}`;
        break;        
        case 'Vertica':  
            tableOptions = `ORDER BY ${anchorRolesColumnNames.join(', ')} SEGMENTED BY MODULARHASH(${tie.identityColumnName}) ALL NODES`;
        break;
        default:
            tableOptions = '';
    }    
/*~
    )
) $tableOptions
;
$createTablePost
~*/
   // dialect specific options annex table
   createTablePre = '';
   tableType = '';
   ifNotExists = 'IF NOT EXISTS'; // default for all PostgreSQL derived dialects
   tableOptions = '';
   createTablePost = '';
   assertionOptions = `char(1) NULL`; // create the column, the ETL should load the +,?,- indication!
   assertionOptionsDefault = `char(1) DEFAULT case when ${tie.reliabilityColumnName} > ${schema.metadata.deleteReliability} then '+' when ${tie.reliabilityColumnName} = ${schema.metadata.deleteReliability} then '?' when ${tie.reliabilityColumnName} < ${schema.metadata.deleteReliability} then '-' end`;
   indexOptions = '';
    switch (schema.metadata.databaseTarget) {
        case 'Citus':
            // other option could be distribute on the generated id? But then we need an other PK or skip the PK! But it creates a round robin distribution!
            createTablePost = `
select create_distributed_table('${tie.capsule}.${tie.annexName}', '${tie.identityColumnName.toLowerCase()}') 
where not exists ( select 1 
                from citus_tables 
                where table_name = '${tie.capsule}.${tie.annexName}'::regclass 
                and citus_table_type = 'distributed'
            ) 
;`;
            assertionOptions =`char(1) generated always as (
                case
                    when ${tie.reliabilityColumnName} > ${schema.metadata.deleteReliability} then '+'
                    when ${tie.reliabilityColumnName} = ${schema.metadata.deleteReliability} then '?'
                    when ${tie.reliabilityColumnName} < ${schema.metadata.deleteReliability} then '-'
                end ) stored`;                
            indexOptions = `INCLUDE (${tie.reliabilityColumnName})`; // indexOptions for the Annex!  
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
        case 'PostgreSQL':
            assertionOptions =`char(1) generated always as (
                case
                    when ${tie.reliabilityColumnName} > ${schema.metadata.deleteReliability} then '+'
                    when ${tie.reliabilityColumnName} = ${schema.metadata.deleteReliability} then '?'
                    when ${tie.reliabilityColumnName} < ${schema.metadata.deleteReliability} then '-'
                end ) stored`;                
            indexOptions = `INCLUDE (${tie.reliabilityColumnName})`; // indexOptions for the Annex!  
        break;
        case 'Redshift':  
            //tableOptions = `DISTSTYLE EVEN INTERLEAVED SORTKEY(${anchorRolesColumnNames.join(', ')})`;
            // or by tie id? 
            tableOptions = `DISTSTYLE KEY DISTKEY(${tie.identityColumnName}) INTERLEAVED SORTKEY(${tie.identityColumnName}, ${tie.positorColumnName}, ${tie.positingColumnName})`;
            // TO DO, check if we can do the same as the Vertica projections but then with materialized views with different distribution keys.
        break;    
        case 'Teradata':
            // Teradata has no IF NOT EXIST for tables. We check the catalog if the table exists.
            // Then if it returns rows we skip the create table.
            createTablePre = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${tie.capsule.toUpperCase()}' AND TableName = '${tie.annexName.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${tie.capsule.toUpperCase()}_${tie.annexName.toUpperCase()};
`;
            ifNotExists = ''; 
            tableType = 'MULTISET';
            createTablePost = `
.LABEL SKIP_${tie.capsule.toUpperCase()}_${tie.annexName.toUpperCase()};
`;   
            tableOptions = `PRIMARY INDEX (${tie.identityColumnName})` ;
            // TO DO, check if we can do the same as the Vertica projections but then with join indexes with different distribution keys.
        
        break;              
        case 'Snowflake': 
            assertionOptions = assertionOptionsDefault;
            tableOptions = `CLUSTER BY ${tie.identityColumnName}, ${tie.positorColumnName}, ${tie.positingColumnName}`;
        break;        
        case 'Vertica':  
            assertionOptions = assertionOptionsDefault;
            tableOptions = `ORDER BY ${tie.identityColumnName}, ${tie.positorColumnName}, ${tie.positingColumnName} SEGMENTED BY MODULARHASH(${tie.identityColumnName}) ALL NODES`;
        break;

    }       

/*~
-- Tie annex table ----------------------------------------------------------------------------------------------------
-- $tie.annexName table
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists ${tie.capsule}$.$tie.annexName (
    $tie.identityColumnName $tie.identity not null,
    $tie.positingColumnName $schema.metadata.positingRange not null,
    $tie.positorColumnName $schema.metadata.positorRange not null,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $tie.assertionColumnName $assertionOptions,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_$tie.annexName foreign key (
        $tie.identityColumnName
    ) references ${tie.capsule}$.$tie.positName($tie.identityColumnName),
    constraint pk_$tie.annexName primary key clustered (
        $tie.identityColumnName asc,
        $tie.positorColumnName asc,
        $tie.positingColumnName desc
    ) $indexOptions
) $tableOptions
;
$createTablePost
~*/
}
