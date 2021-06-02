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
-- $tie.name table (having $tie.roles.length roles)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${tie.capsule}$.$tie.name (
~*/
    var role, anchorRoles = [];
    while (role = tie.nextRole()) {
        if(role.anchor) anchorRoles.push(role);
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
    ) references $(role.anchor)? ${role.anchor.capsule}$.$role.anchor.name($role.anchor.identityColumnName), : $knotReference($role.knot.identityColumnName),
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
/*~
    )
) CLUSTER BY (
~*/
    var r;
    for(r = 0; role = anchorRoles[r]; r++) {
/*~
    $role.columnName$(r != anchorRoles.length - 1)?,
~*/
    }
/*~
);
~*/
}
