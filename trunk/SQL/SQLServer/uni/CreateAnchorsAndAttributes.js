/*~
-- ANCHORS AND ATTRIBUTES ---------------------------------------------------------------------------------------------
--
-- Anchors are used to store the identities of entities.
-- Anchors are immutable.
-- Attributes are used to store values for properties of entities.
-- Attributes are mutable, their values may change over one or more types of time.
-- Attributes have four flavors: static, historized, knotted static, and knotted historized.
-- Anchors may have zero or more adjoined attributes.
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
IF Object_ID('$anchor.name', 'U') IS NULL
CREATE TABLE [$anchor.capsule].[$anchor.name] (
    $anchor.identityColumnName $anchor.identity $anchor.identityGenerator not null,
    $(METADATA)? $anchor.metadataColumnName $schema.metadataType not null, : $anchor.dummyColumnName bit null,
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName asc
    )
);
GO
~*/
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(HashBytes('MD5', cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)),
    $attribute.changingColumnName $attribute.timeRange not null,
    $(METADATA)? $attribute.metadataColumnName $schema.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc
    )
);
GO
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(METADATA)? $attribute.metadataColumnName $schema.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc
    )
);
GO
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $(METADATA)? $attribute.metadataColumnName $schema.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc
    )
);
GO
~*/
    }
    else {
/*~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(HashBytes('MD5', cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)),
    $(METADATA)? $attribute.metadataColumnName $schema.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc
    )
);
GO
~*/
    }
}}