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
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        var scheme = schema.PARTITIONING ? ' ON EquivalenceScheme(' + attribute.equivalentColumnName + ')' : '';
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName asc,
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc
    )
)$(attribute.isEquivalent())? $scheme; : ;
GO
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knotTableName]($knot.identityColumnName),
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
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;

/*~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knotTableName]($knot.identityColumnName),
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
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName asc,
        $attribute.anchorReferenceName asc
    )
)$(attribute.isEquivalent())? $scheme; : ;
GO
~*/
    }
}}