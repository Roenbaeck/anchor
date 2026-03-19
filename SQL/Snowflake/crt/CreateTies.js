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
var tie;
while (tie = schema.nextTie()) {
    if(schema.METADATA)
        tie.metadataDefinition = tie.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null,';
    if(tie.isGenerator())
        tie.identityGenerator = 'IDENTITY(1,1)';
    if(tie.isHistorized() && tie.isKnotted()) {
/*~
-- Knotted historized tie table ---------------------------------------------------------------------------------------
~*/
    }
    else if(tie.isHistorized()) {
/*~
-- Historized tie table -----------------------------------------------------------------------------------------------
~*/
    }
    else if(tie.isKnotted()) {
/*~
-- Knotted static tie table -------------------------------------------------------------------------------------------
~*/
    }
    else {
/*~
-- Static tie table ---------------------------------------------------------------------------------------------------
~*/
    }
/*~
-- $tie.positName table (having $tie.roles.length roles)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${tie.capsule}$.$tie.positName (
    $tie.identityColumnName $(tie.isGenerator())? $tie.identity $tie.identityGenerator not null, : $tie.identity not null,
~*/
    var role;
    while (role = tie.nextRole()) {
/*~
    $role.columnName $(role.entity)? $role.entity.identity not null, : $role.knot.identity not null,
~*/
    }
/*~
    $(tie.timeRange)? $tie.changingColumnName $tie.timeRange not null,
~*/
    while (role = tie.nextRole()) {
        var knotTableName = role.knot ? (role.knot.isEquivalent() ? role.knot.identityName : role.knot.name) : '';
/*~
    constraint ${(tie.positName + '_fk' + role.name)}$ foreign key (
        $role.columnName
    ) references $(role.entity)? ${role.entity.capsule}$.$role.entity.name($role.entity.identityColumnName), : ${role.knot.capsule}$.$knotTableName($role.knot.identityColumnName),
 ~*/
    }
    // one-to-one and we need additional constraints
    if(!tie.hasMoreIdentifiers()) {
        while (role = tie.nextRole()) {
            if(role.isAnchorRole()) {
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
                constraint pk$tie.positName primary key (
                    $tie.identityColumnName
    ),
                constraint uq$tie.name unique (
                }
            }
        }
                    $role.columnName~*/
/*~
    constraint pk$tie.positName primary key nonclustered (
        $tie.identityColumnName asc
    ),
    constraint uq$tie.name unique clustered (
~*/
                    $tie.changingColumnName~*/
/*~
        $role.columnName asc~*/
        if(tie.hasMoreIdentifiers() || tie.hasMoreValues() || tie.isHistorized()) {
            /*~,~*/
        }
    }
                    $role.columnName~*/
/*~
        $tie.changingColumnName desc~*/
        if(tie.hasMoreValues()) {
            /*~,~*/
        }
    }
            );
        for(r = 0; role = otherRoles[r]; r++) {
/*~
    $role.columnName$(r != otherRoles.length - 1)?,
~*/
        }
/*~
SEGMENTED BY MODULARHASH(${segmentationRole.columnName}$) ALL NODES;
~*/
    }
/*~
                $tie.assertionColumnName string default (
-- $tie.annexName table
                        when $tie.reliabilityColumnName > $schema.metadata.deleteReliability then '+'
                        when $tie.reliabilityColumnName = $schema.metadata.deleteReliability then '?'
                        else '-'
    $tie.identityColumnName $tie.identity not null,
                ),
                $tie.reliableColumnName int default (
                    case
                        when $tie.reliabilityColumnName < $schema.metadata.reliableCutoff then 0
                        else 1
                    end
                ),
    $tie.positorColumnName $schema.metadata.positorRange not null,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $tie.reliableColumnName as isnull(cast(
        case
                constraint pk$tie.annexName primary key (
                    $tie.identityColumnName,
                    $tie.positorColumnName,
                    $tie.positingColumnName
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
            ) CLUSTER BY ($tie.identityColumnName, $tie.positorColumnName, $tie.positingColumnName);
    ) references ${tie.capsule}$.$tie.positName($tie.identityColumnName),
    constraint pk$tie.annexName primary key clustered (
        $tie.identityColumnName asc,
        $tie.positorColumnName asc,
        $tie.positingColumnName desc
    )
) ORDER BY $tie.identityColumnName, $tie.positorColumnName, $tie.positingColumnName SEGMENTED BY MODULARHASH($tie.identityColumnName) ALL NODES
PARTITION BY ($tie.positorColumnName);
~*/
}
