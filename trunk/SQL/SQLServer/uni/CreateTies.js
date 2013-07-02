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
    if(schema.metadataUsage == 'true')
        tie.metadataDefinition = tie.metadataColumnName + ' ' + schema.metadataType + ' not null,';
    if(tie.timeRange && tie.knotRole) {
/*~
-- Knotted historized tie table ---------------------------------------------------------------------------------------
~*/
    }
    else if(tie.timeRange) {
/*~
-- Historized tie table -----------------------------------------------------------------------------------------------
~*/
    }
    else if(tie.knotRole) {
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
IF Object_ID('$tie.name', 'U') IS NULL
CREATE TABLE [$tie.capsule].[$tie.name] (
~*/
    var role, anchor, knot;
    while (role = tie.nextRole()) {
        if(role.anchor) {
            anchor = schema.anchor[role.anchor];
/*~
    $role.columnName $anchor.identity not null,
~*/
        }
        else if (role.knot) {
            knot = schema.knot[role.knot];
/*~
    $role.columnName $knot.identity not null,
~*/
        }
    }
    if(tie.timeRange) {
/*~
    $tie.changingColumnName $tie.timeRange not null,
~*/
    }
/*~
    $tie.metadataDefinition
~*/
    while (role = tie.nextRole()) {
        if(role.anchor) {
            anchor = schema.anchor[role.anchor];
/*~
    constraint ${(tie.name + '_fk' + role.name)}$ foreign key (
        $role.columnName
    ) references $anchor.name($anchor.identityColumnName),
 ~*/
        }
        else if (role.knot) {
            knot = schema.knot[role.knot];
/*~
    constraint ${(tie.name + '_fk' + role.name)}$ foreign key (
        $role.columnName
    ) references $knot.name($knot.identityColumnName),
 ~*/
        }
    }
    // one-to-one and we need additional constraints
    if(tie.identifiers.length == 0) {
        while (role = tie.nextRole()) {
            if(tie.timeRange) {
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
/*~
    constraint pk$tie.name primary key (
~*/
    if(tie.identifiers.length > 0) {
        while (role = tie.nextIdentifier()) {
/*~
        $role.columnName asc~*/
            if(tie.hasMoreIdentifiers() || tie.timeRange) {
                /*~,~*/
            }
        }
    }
    else {
        while (role = tie.nextRole()) {
/*~
        $role.columnName asc~*/
            if(tie.hasMoreRoles() || tie.timeRange) {
                /*~,~*/
            }
        }
    }
    if(tie.timeRange) {
/*~
        $tie.changingColumnName desc
~*/
    }
/*~
    )
);
GO
~*/
}