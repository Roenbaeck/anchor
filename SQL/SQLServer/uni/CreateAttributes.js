/*~
-- ATTRIBUTES (UNIFIED FOR ANCHORS AND NEXUSES) ---------------------------------------------------------------------
--
-- Attributes are mutable properties attached to either anchors or nexuses.
-- Flavors: static, historized, knotted static, knotted historized.
-- This unified script creates all attribute tables using the global attribute iterator.
--
~*/
var attribute;
while (attribute = schema.nextAttribute()) {
    var parent = attribute.parent; // anchor or nexus
    var knot = attribute.isKnotted() ? attribute.knot : null;
    var scheme = (schema.PARTITIONING && attribute.isEquivalent && attribute.isEquivalent()) ? ' ON EquivalenceScheme(' + attribute.equivalentColumnName + ')' : '';
    if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table ----------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $parent.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$parent.capsule].[$parent.name]($parent.identityColumnName),
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
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted historized attribute table --------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$parent.capsule].[$parent.name]($parent.identityColumnName),
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
        var knotTableName2 = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted static attribute table ------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$parent.capsule].[$parent.name]($parent.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knotTableName2]($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc
    )
);
GO
~*/
    }
    else {
/*~
-- Static attribute table --------------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $parent.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$parent.capsule].[$parent.name]($parent.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName asc,
        $attribute.anchorReferenceName asc
    )
)$(attribute.isEquivalent())? $scheme; : ;
GO
~*/
    }
}
