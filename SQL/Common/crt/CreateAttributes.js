/*~
-- ATTRIBUTES ---------------------------------------------------------------------------------------------------------
--
-- Attributes are used to store values for properties of entities.
-- Attributes are mutable, their values may change over one or more types of time.
-- Attributes have four flavors: static, historized, knotted static, and knotted historized.
-- Anchors may have zero or more adjoined attributes.
--
~*/
var anchor, tableOptions, tableOptionsAnnex, tableType, ifNotExists, createTablePre, createTablePost, nonDistributionKeysAllowed = true, isSharedNoting = false, isAnnex;
while (anchor = schema.nextAnchor()) {
    var knot, attribute, indexOptions, partitionOptions, sortColumns, checksumOptions;
    while (attribute = anchor.nextAttribute()) {
        // set options per dialect
        createTablePre = '';
        tableType = '';
        ifNotExists = 'IF NOT EXISTS'; // default for all PostgreSQL derived dialects
        tableOptions = '';
        tableOptionsAnnex = '';
        createTablePost = '';
        indexOptions = '';
        sortColumns = attribute.anchorReferenceName + (attribute.isHistorized() ? `, ${attribute.changingColumnName}` : '');
        switch (schema.metadata.databaseTarget) {
            case 'Citus':
                isSharedNoting = true;
                nonDistributionKeysAllowed = false; // FK between reference/local (knot) and distributed tables (anchor and attribute) are not (yet) supported! 
                //  partitioning in PG is not dydnamic! Citus has the create_time_partitions, can maybe used for this.
                //  partition = schema.PARTITIONING ? ` PARTITION BY LIST (${attribute.equivalentColumnName})` : '' ;
                //  partition = schema.PARTITIONING ? ` PARTITION BY RANGE (${attribute.equivalentColumnName})` : '' ;
                checksumOptions = `bytea generated always as (cast(MD5(cast(${attribute.valueColumnName} as text)) as bytea)) stored`;
                indexOptions = attribute.isKnotted()  
                             ? `INCLUDE (${attribute.knotReferenceName})` 
                             : `INCLUDE (${attribute.hasChecksum() ? attribute.checksumColumnName : attribute.valueColumnName})`;
                createTablePost = `
select create_distributed_table('${attribute.capsule}.${attribute.positName}', '${attribute.anchorReferenceName.toLowerCase()}', colocate_with => '${anchor.capsule}.${anchor.name}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${attribute.capsule}.${attribute.positName}'::regclass 
                       and citus_table_type = 'distributed'
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
            break;
            case 'PostgreSQL':
                //  partitioning in PG is not dydnamic!
                //  partition = schema.PARTITIONING ? ` PARTITION BY LIST (${attribute.equivalentColumnName})` : '' ;
                //  partition = schema.PARTITIONING ? ` PARTITION BY RANGE (${attribute.equivalentColumnName})` : '' ;
                checksumOptions = `bytea generated always as (cast(MD5(cast(${attribute.valueColumnName} as text)) as bytea)) stored`;
                indexOptions = attribute.isKnotted()  
                             ? `INCLUDE (${attribute.knotReferenceName})` 
                             : `INCLUDE (${attribute.hasChecksum() ? attribute.checksumColumnName : attribute.valueColumnName})`;
            break;
            case 'Redshift':
                isSharedNoting = true;
                checksumOptions = `varbyte(16) DEFAULT cast(MD5(cast(${attribute.valueColumnName} as text)) as varbyte(16))`;
                tableOptions = `DISTSTYLE KEY DISTKEY(${attribute.anchorReferenceName}) SORTKEY(${sortColumns})`
            break; 
            case 'Teradata':
                isSharedNoting = true;
                // Teradata has no IF NOT EXIST for tables. We check the catalog if the table exists.
                // Then if it returns rows we skip the create table.
                createTablePre = `
SELECT 1 FROM DBC.TablesV WHERE TableKind = 'T' AND DatabaseName = '${attribute.capsule.toUpperCase()}' AND TableName = '${attribute.positName.toUpperCase()}';
.IF ACTIVITYCOUNT > 0 THEN .GOTO SKIP_${attribute.capsule.toUpperCase()}_${attribute.positName.toUpperCase()};
`;
                createTablePost = `
.LABEL SKIP_${attribute.capsule.toUpperCase()}_${attribute.positName.toUpperCase()};
`;   
                ifNotExists = ''; 
                tableType = 'MULTISET';
                tableOptions = `${attribute.isHistorized() ? '' : 'UNIQUE'} PRIMARY INDEX (${attribute.anchorReferenceName})` ;
             
            break;  
            case 'Snowflake':
                checksumOptions = `numeric(19,0) DEFAULT hash(${attribute.valueColumnName})`;
                tableOptions = `CLUSTER BY (${sortColumns})` ;
            break;                         
            case 'Vertica':
                isSharedNoting = true;
                checksumOptions = `int DEFAULT hash(${attribute.valueColumnName})`;
                tableOptions = `ORDER BY ${sortColumns} SEGMENTED BY MODULARHASH(${attribute.anchorReferenceName}) ALL NODES`
                             + (schema.PARTITIONING && attribute.isEquivalent()) ? `PARTITION BY (${attribute.equivalentColumnName})` : '' ;
            break;                
            default:
                checksumOptions = `varchar(36) NULL`; // create the column, the ETL should load the MD5 hash!
        }
        
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $attribute.capsule\.$attribute.positName (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity NOT NULL,
    $attribute.valueColumnName $attribute.dataRange NOT NULL,
    $(attribute.hasChecksum())? $attribute.checksumColumnName $checksumOptions,
    $attribute.changingColumnName $attribute.timeRange NOT NULL,
    constraint fk_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
~*/     
        if (nonDistributionKeysAllowed) { 
/*~  
    constraint uq_$attribute.positName unique (
        $attribute.identityColumnName 
    ),
~*/ 
        } 
/*~  
    constraint pk_$attribute.positName primary key (
        $attribute.anchorReferenceName ,
        $attribute.changingColumnName ,
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName 
    ) 
) $tableOptions 
;
$createTablePost
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted historized attribute posit table ---------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $attribute.capsule\.$attribute.positName (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity NOT NULL,
    $attribute.knotReferenceName $knot.identity NOT NULL,
    $attribute.changingColumnName $attribute.timeRange NOT NULL,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
 ~*/     
        if (nonDistributionKeysAllowed) { 
/*~  
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule\.$knotTableName ($knot.identityColumnName),
    constraint uq_$attribute.positName unique (
        $attribute.identityColumnName 
    ),
~*/ 
        } 
/*~  
    constraint pk_$attribute.positName primary key (
        $attribute.anchorReferenceName ,
        $attribute.changingColumnName ,
        $attribute.knotReferenceName
    ) 
) $tableOptions
;
$createTablePost
~*/

    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;

/*~
-- Knotted static attribute posit table -------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $attribute.capsule\.$attribute.positName (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity NOT NULL,
    $attribute.knotReferenceName $knot.identity NOT NULL,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
~*/     
        if (nonDistributionKeysAllowed) { 
/*~    
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule\.$knotTableName ($knot.identityColumnName),
    constraint uq_$attribute.positName unique (
        $attribute.identityColumnName asc
    ),
~*/ 
        } 
/*~    
    constraint pk_$attribute.positName primary key (
        $attribute.anchorReferenceName ,
        $attribute.knotReferenceName
    ) 
) $tableOptions
;
$createTablePost
~*/

    }
    else {
/*~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $attribute.capsule\.$attribute.positName (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity NOT NULL,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange NOT NULL,
    $attribute.valueColumnName $attribute.dataRange NOT NULL,
    $(attribute.hasChecksum())? $attribute.checksumColumnName $checksumOptions,
    constraint fk_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references $anchor.capsule\.$anchor.name ($anchor.identityColumnName),
 ~*/     
            if (nonDistributionKeysAllowed) { 
/*~  
    constraint uq_$attribute.positName unique (
        $attribute.identityColumnName 
    ),
~*/ 
            } 
/*~      
    constraint pk_$attribute.positName primary key (
        $attribute.anchorReferenceName ,
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName
    ) 
) $tableOptions 
;
$createTablePost
~*/

    }

/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attribute.annexName table (of $attribute.positName on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
$createTablePre
CREATE $tableType TABLE $ifNotExists $attribute.capsule\.$attribute.annexName (
    $(isSharedNoting)? $attribute.anchorReferenceName $anchor.identity NOT NULL, -- added to have the attribute annex distibuted on the same key as the Anchor and Posit tables!
    $attribute.identityColumnName $attribute.identity not null,
    $attribute.positingColumnName $schema.metadata.positingRange not null,
    $attribute.positorColumnName $schema.metadata.positorRange not null,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $attribute.assertionColumnName as cast(
        case
            when $attribute.reliabilityColumnName > $schema.metadata.deleteReliability then '+'
            when $attribute.reliabilityColumnName = $schema.metadata.deleteReliability then '?'
            when $attribute.reliabilityColumnName < $schema.metadata.deleteReliability then '-'
        end
    as char(1)) persisted,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType NOT NULL, : $attribute.recordingColumnName $schema.metadata.chronon DEFAULT $schema.metadata.now,
 ~*/     
 if (nonDistributionKeysAllowed) { 
 /*~      
    constraint fk_$attribute.annexName foreign key (
        $attribute.identityColumnName
    ) references $attribute.capsule\.$attribute.positName($attribute.identityColumnName),
~*/ 
} 
/*~      
    constraint pk_$attribute.annexName primary key  (
        $(isSharedNoting)? $attribute.anchorReferenceName, -- added to have the attribute annex distibuted on the same key as the Anchor and Posit tables!
        $attribute.identityColumnName ,
        $attribute.positorColumnName ,
        $attribute.positingColumnName 
    )
) $tableOptionsAnnex 
;
$createTablePost
~*/    
}}