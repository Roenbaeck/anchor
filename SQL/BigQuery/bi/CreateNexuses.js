/*~
-- NEXUSES ------------------------------------------------------------------------------------------------------------
--
-- Nexuses store immutable identities for event-like entities.
--
~*/
var nexus;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.isGenerator())
        nexus.identityGenerator = 'IDENTITY(1,1)';
/*~
-- Nexus table --------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${nexus.capsule}$.$nexus.name (
    $nexus.identityColumnName $(nexus.isGenerator())? $nexus.identity $nexus.identityGenerator not null, : $nexus.identity not null,
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
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType not null, : $nexus.dummyColumnName boolean null,
    constraint pk$nexus.name primary key (
        $nexus.identityColumnName
    )
) CLUSTER BY ($nexus.identityColumnName);
~*/
}
