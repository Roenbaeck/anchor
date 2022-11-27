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
var tie, tieType, firstIdentifierRole, tieFk, tieUq;
switch (schema.metadata.databaseTarget) {
    case 'Citus':
        // distributed tables kan only have uq on distribution key and fk's on distribution key!
        tieFk = false; 
        tieUq = false;
    break;        
    default:
        tieFk = true; 
        tieUq = true;
}  
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
/*~
-- $tieType---------------------------------------------------------------------------------------
-- $tie.name table (having $tie.roles.length roles)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $tie.capsule\.$tie.name (
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
    $tie.metadataDefinition,
~*/
    while (role = tie.nextRole()) {
        var knotReference = '';
        if(role.knot) {
            knotReference += role.knot.capsule + '.' + (role.knot.isEquivalent() ? role.knot.identityName : role.knot.name);
        }
        if (tieFk) {
/*~
    constraint ${(tie.name + '_fk' + role.name)}$ foreign key (
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
    constraint ${tie.name + '_uq' + role.name}$ unique (
        $role.columnName,
        $tie.changingColumnName
    ),
~*/
                }
                else {
/*~
    constraint ${tie.name + '_uq' + role.name}$ unique (
        $role.columnName
    ),
~*/
                }
            }
        }
    }
/*~
    constraint pk$tie.name primary key (
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
    // dialect specific table options
    var tableOptions;
    switch (schema.metadata.databaseTarget) {
        case 'Citus':
            // pk can only be placed if distribution key is part of the pk. If no first identifier then pick the first anchor role.
            if (firstIdentifierRole == null) firstIdentifierRole = anchorRoles[0];
            tableOptions = `
; 
select create_distributed_table('${tie.capsule}.${tie.name}', '${firstIdentifierRole.columnName.toLowerCase()}', colocate_with => '${firstIdentifierRole.anchor.capsule}.${firstIdentifierRole.anchor.name}') 
 where not exists ( select 1 
                      from citus_tables 
                     where table_name = '${tie.capsule}.${tie.name}'::regclass 
                       and citus_table_type = 'distributed'
                  ) `;
        break;        
        case 'Redshift':  
            tableOptions = `DISTSTYLE EVEN INTERLEAVED SORTKEY(${anchorRolesColumnNames.join(', ')})`;
            // TO DO, check if we can do the same as the Vertica projections but then with materialized views with different distribution keys.
        break;        
        case 'Snowflake': 
            tableOptions = `CLUSTER BY ${anchorRolesColumnNames.join(', ')}`;
        break;        
        case 'Vertica':  
            tableOptions = `ORDER BY ${anchorRolesColumnNames.join(', ')} SEGMENTED BY MODULARHASH(${anchorRoles[0].columnName}) ALL NODES`;
        break;
        default:
            tableOptions = '';
    }    
/*~
    )
) $tableOptions
;
~*/

// dialect specific projections
    switch (schema.metadata.databaseTarget) {
        case 'Vertica':  
            var segmentationRole, otherRoles;
            for(var i = 1; segmentationRole = anchorRoles[i]; i++) {
                otherRoles = [];
                for(r = 0; role = anchorRoles[r]; r++) {
                    if(role != segmentationRole) otherRoles.push(role);
                }
/*~
CREATE PROJECTION IF NOT EXISTS ${tie.capsule}$.${tie.name}$__${segmentationRole.columnName}$
AS
SELECT
~*/
                while (role = tie.nextRole()) {
/*~
    $role.columnName$(tie.hasMoreRoles())?,
~*/
                }
/*~
FROM
    ${tie.capsule}$.$tie.name
ORDER BY
    $segmentationRole.columnName,
~*/
                for(r = 0; role = otherRoles[r]; r++) {
/*~
    $role.columnName$(r != otherRoles.length - 1)?,
~*/
                }
/*~
SEGMENTED BY MODULARHASH(${segmentationRole.columnName}$) ALL NODES;
    ~*/
            
            }
        break;
        default:
    }
}