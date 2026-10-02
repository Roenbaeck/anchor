/*~
-- TIES ---------------------------------------------------------------------------------------------------------------
--
-- CRT ties use posit and annex split with changing/positing time, positor, reliability, and assertion.
--
~*/
var tie;
while (tie = schema.nextTie()) {
    if(tie.isGenerator())
        tie.identityGenerator = 'IDENTITY(1,1)';
/*~
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
        var knotTableName = role.knot ? role.knot.name : '';
/*~
    constraint ${(tie.positName + '_fk' + role.name)}$ foreign key (
        $role.columnName
    ) references $(role.entity)? ${role.entity.capsule}$.$role.entity.name($role.entity.identityColumnName) RELY, : ${role.knot.capsule}$.$knotTableName($role.knot.identityColumnName) RELY,
~*/
    }
    if(!tie.hasMoreIdentifiers()) {
        while (role = tie.nextRole()) {
            if(role.isAnchorRole()) {
                if(tie.isHistorized()) {
/*~
    constraint ${tie.positName + '_uq' + role.name}$ unique (
        $role.columnName,
        $tie.changingColumnName
    ) RELY,
~*/
                }
                else {
/*~
    constraint ${tie.positName + '_uq' + role.name}$ unique (
        $role.columnName
    ) RELY,
~*/
                }
            }
        }
    }
/*~
    constraint pk$tie.positName primary key (
        $tie.identityColumnName
    ) RELY,
    constraint uq$tie.name unique (
~*/
    while (role = tie.nextIdentifier()) {
/*~
        $role.columnName~*/
        if(tie.hasMoreIdentifiers() || tie.hasMoreValues() || tie.isHistorized()) {
            /*~,~*/
        }
    }
    if(tie.isHistorized()) {
/*~
        $tie.changingColumnName~*/
        if(tie.hasMoreValues()) {
            /*~,~*/
        }
    }
    while (role = tie.nextValue()) {
/*~
        $role.columnName~*/
        if(tie.hasMoreValues()) {
            /*~,~*/
        }
    }
/*~
    ) RELY
) CLUSTER BY (
~*/
    while (role = tie.nextIdentifier()) {
/*~
    $role.columnName$(tie.hasMoreIdentifiers() || tie.isHistorized())?,
~*/
    }
/*~
    $(tie.isHistorized())? $tie.changingColumnName
);

CREATE TABLE IF NOT EXISTS ${tie.capsule}$.$tie.annexName (
    $tie.identityColumnName $tie.identity not null,
    $tie.positingColumnName $schema.metadata.positingRange not null,
    $tie.positorColumnName $schema.metadata.positorRange not null,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $tie.assertionColumnName string default (
        case
            when $tie.reliabilityColumnName > $schema.metadata.deleteReliability then '+'
            when $tie.reliabilityColumnName = $schema.metadata.deleteReliability then '?'
            else '-'
        end
    ),

    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$tie.annexName foreign key (
        $tie.identityColumnName
    ) references ${tie.capsule}$.$tie.positName($tie.identityColumnName) RELY,
    constraint pk$tie.annexName primary key (
        $tie.identityColumnName,
        $tie.positorColumnName,
        $tie.positingColumnName
    ) RELY
) CLUSTER BY ($tie.identityColumnName, $tie.positorColumnName, $tie.positingColumnName);
~*/
}
