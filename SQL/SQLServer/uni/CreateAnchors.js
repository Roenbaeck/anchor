/*~
-- ANCHORS -----------------------------------------------------------------------------------------------------------
--
-- Anchors store the identities of entities and are immutable.
-- (Attribute tables moved to CreateAttributes.js.)
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.isGenerator())
        anchor.identityGenerator = 'IDENTITY(1,1)';
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with ${(anchor.attributes ? anchor.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$anchor.capsule$.$anchor.name', 'U') IS NULL
CREATE TABLE [$anchor.capsule].[$anchor.name] (
    $anchor.identityColumnName $anchor.identity $anchor.identityGenerator not null,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null, : $anchor.dummyColumnName bit null,
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName asc
    )
);
GO
~*/
}
