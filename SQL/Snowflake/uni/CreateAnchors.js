/*~
-- ANCHORS ------------------------------------------------------------------------------------------------------------
--
-- Anchors are used to store the identities of entities.
-- Anchors are immutable.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.isGenerator())
        anchor.identityGenerator = 'default ' + anchor.capsule + '.' + anchor.identitySequenceName + '.nextval';
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with ${(anchor.attributes ? anchor.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
~*/
    if(anchor.isGenerator()) {
/*~
CREATE SEQUENCE IF NOT EXISTS ${anchor.capsule}$.$anchor.identitySequenceName START 1 INCREMENT 1;
~*/
    }
/*~
CREATE TABLE IF NOT EXISTS ${anchor.capsule}$.$anchor.name (
    $anchor.identityColumnName $(anchor.isGenerator())? $anchor.identity $anchor.identityGenerator not null, : $anchor.identity not null,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null,
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName
    )
) CLUSTER BY ($anchor.identityColumnName);
~*/
}
