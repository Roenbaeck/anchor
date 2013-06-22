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
for(var t = 0; tie = schema.tie[schema.ties[t]]; t++) {
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
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = '$tie.name' and type LIKE '%U%')
CREATE TABLE [$tie.capsule].[$tie.name] (
~*/
    var key, anchorRole, knotRole, anchor, knot;
    for(var r = 0; r < tie.roles.length; r++) {
        key = tie.roles[r];
        anchorRole = tie.anchorRole ? tie.anchorRole[key] : null;
        knotRole = tie.knotRole ? tie.knotRole[key] : null;
        if(anchorRole) {
            anchor = schema.anchor[anchorRole.type];
/*~
    $anchorRole.columnName $anchor.identity not null,
~*/
        }
        else if (knotRole) {
            knot = schema.knot[knotRole.type];
/*~
    $knotRole.columnName $knot.identity not null,
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
    for(var r = 0; r < tie.roles.length; r++) {
        key = tie.roles[r];
        anchorRole = tie.anchorRole ? tie.anchorRole[key] : null;
        knotRole = tie.knotRole ? tie.knotRole[key] : null;
        if(anchorRole) {
            anchor = schema.anchor[anchorRole.type];
/*~
    constraint ${(tie.name + '_fk' + anchorRole.name)}$ (
        $anchorRole.columnName
    ) references $anchor.name($anchor.identityColumnName),
 ~*/
        }
        else if (knotRole) {
            knot = schema.knot[knotRole.type];
/*~
    constraint ${(tie.name + '_fk' + knotRole.name)}$ (
        $knotRole.columnName
    ) references $knot.name($knot.identityColumnName),
 ~*/
        }
    }
    var role;
    // one-to-one and we need additional constraints
    if(tie.identifiers.length == 0) {
        for(r = 0; r < tie.roles.length; r++) {
            key = tie.roles[r];
            anchorRole = tie.anchorRole ? tie.anchorRole[key] : null;
            knotRole = tie.knotRole ? tie.knotRole[key] : null;
            role = anchorRole || knotRole;
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
    var listOfKeys = tie.identifiers.length > 0 ? tie.identifiers : tie.roles;
    for(r = 0; r < listOfKeys.length; r++) {
        key = listOfKeys[r];
        anchorRole = tie.anchorRole ? tie.anchorRole[key] : null;
        knotRole = tie.knotRole ? tie.knotRole[key] : null;
        role = anchorRole || knotRole;
        if((r == listOfKeys.length - 1) && !tie.timeRange) {
/*~
        $role.columnName asc
~*/
        }
        else {
/*~
        $role.columnName asc,
~*/
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