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
begin -- Create table with pk column
    execute immediate '
        CREATE TABLE $tie.name (
~*/
    var role;
    while (role = tie.nextRole()) {
/*~
            $role.columnName $(role.anchor)? $role.anchor.identity not null, : $role.knot.identity not null,
~*/
    }
/*~
            $(tie.timeRange)? ${tie.changingColumnName.substr(0,30)}$ $tie.timeRange not null,
            $(schema.METADATA)? ${tie.metadataColumnName.substr(0,30)}$ $schema.metadata.metadataType not null,
~*/
    var i = 0
    while (role = tie.nextRole()) {
        i++
/*~
            constraint ${('FK' + i + '_' + tie.name + role.name).substr(0,30)}$ foreign key (
                $role.columnName
            ) references $(role.anchor)? $role.anchor.name($role.anchor.identityColumnName), : $role.knot.name($role.knot.identityColumnName),
 ~*/
    }
    // one-to-one and we need additional constraints
    if(!tie.hasMoreIdentifiers()) {
        var i = 0
        while (role = tie.nextRole()) {
            i++
            if(tie.isHistorized()) {
/*~
            constraint ${('UQ' + i + '_' + tie.name + role.name).substr(0,30)}$ unique (
                $role.columnName,
                ${tie.changingColumnName.substr(0,30)}$
            ),
~*/
            }
            else {
/*~
            constraint ${('UQ' + i + '_' + tie.name + role.name).substr(0,30)}$ unique (
                $role.columnName
            ),
~*/
            }
        }
    }
/*~
            constraint ${('PK' + '_' + tie.name).substr(0,30)}$ primary key (
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
                ${tie.changingColumnName.substr(0,30)}$
~*/
    }
/*~
            )
        ) ORGANIZATION INDEX
    ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/
~*/
}