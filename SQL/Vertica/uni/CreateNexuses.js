/*~
-- NEXUSES ------------------------------------------------------------------------------------------------------------
--
-- Nexuses are used to store identities for event-like entities.
-- Nexuses are immutable.
-- (Attribute tables moved to CreateAttributes.js.)
--
~*/
var nexus;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.isGenerator())
        nexus.identityGenerator = 'IDENTITY(1,1)';
/*~
-- Nexus table --------------------------------------------------------------------------------------------------------
-- $nexus.name table (with ${(nexus.attributes ? nexus.attributes.length : 0)}$ attributes and ${(nexus.roles ? nexus.roles.length : 0)}$ roles)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${nexus.capsule}$.$nexus.name (
    $nexus.identityColumnName $(nexus.isGenerator())? $nexus.identityGenerator not null, : $nexus.identity not null,
~*/
    var role;
    while (role = nexus.nextRole()) {
/*~
    $role.columnName $(role.entity)? $role.entity.identity not null, : $role.knot.identity not null,~*/
        if(!nexus.hasMoreRoles()) {
/*~
~*/
        }
    }
    while (role = nexus.nextRole()) {
        var knotReference = '';
        if(role.knot) {
            knotReference += role.knot.capsule + '.' + (role.knot.isEquivalent() ? role.knot.identityName : role.knot.name);
        }
/*~
    constraint ${(nexus.name + '_fk' + role.name)}$ foreign key (
        $role.columnName
    ) references $(role.entity)? ${role.entity.capsule}$.$role.entity.name($role.entity.identityColumnName), : $knotReference($role.knot.identityColumnName),~*/
        if(!nexus.hasMoreRoles()) {
/*~
~*/
        }
    }
/*~
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType not null, : $nexus.dummyColumnName bit null,
    constraint pk$nexus.name primary key (
        $nexus.identityColumnName
    )
) ORDER BY $nexus.identityColumnName SEGMENTED BY MODULARHASH($nexus.identityColumnName) ALL NODES;
~*/
}
