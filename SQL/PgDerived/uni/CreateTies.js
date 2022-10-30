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
var tie, tieType;
while (tie = schema.nextTie()) {
    if(schema.METADATA)
        tie.metadataDefinition = tie.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null,';
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
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
~*/
    while (role = tie.nextRole()) {
        var knotReference = '';
        if(role.knot) {
            knotReference += role.knot.capsule + '.' + (role.knot.isEquivalent() ? role.knot.identityName : role.knot.name);
        }
/*~
    constraint ${(tie.name + '_fk' + role.name)}$ foreign key (
        $role.columnName
    ) references $(role.anchor)? $role.anchor.capsule\.$role.anchor.name($role.anchor.identityColumnName), : $knotReference($role.knot.identityColumnName),
~*/
    }
    // one-to-one and we need additional constraints
    if(!tie.hasMoreIdentifiers()) {
        while (role = tie.nextRole()) {
            if(role.isAnchorRole()) {
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
