/*~
-- NEXUSES AND ATTRIBUTES --------------------------------------------------------------------------------------------
--
-- Nexuses (event-like constructs) store identities of composite event instances.
-- Nexuses are immutable.
-- Attributes adjoined to a nexus store properties of those events and are mutable
-- over one or more types of time (same flavors as anchor attributes):
--   static, historized, knotted static, knotted historized.
-- Nexuses may have zero or more adjoined attributes.
-- This script creates tables for nexuses and their attributes (unitemporal variant).
--
~*/
var nexus;
while (nexus = schema.nextNexus()) {
    if(nexus.isGenerator())
        nexus.identityGenerator = 'IDENTITY(1,1)';
/*~
-- Nexus table -------------------------------------------------------------------------------------------------------
-- $nexus.name table (with ${(nexus.attributes ? nexus.attributes.length : 0)}$ attributes)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$nexus.capsule$.$nexus.name', 'U') IS NULL
CREATE TABLE [$nexus.capsule].[$nexus.name] (
    $nexus.identityColumnName $nexus.identity $nexus.identityGenerator not null,
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType not null, : $nexus.dummyColumnName bit null,
    constraint pk$nexus.name primary key (
        $nexus.identityColumnName asc
    )
);
GO
~*/
    var knot, attribute;
    while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
        var scheme = schema.PARTITIONING ? ' ON EquivalenceScheme(' + attribute.equivalentColumnName + ')' : '';
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized nexus attribute table ----------------------------------------------------------------------------------
-- $attribute.name table (on $nexus.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $nexus.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$nexus.capsule].[$nexus.name]($nexus.identityColumnName),
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
-- Knotted historized nexus attribute table --------------------------------------------------------------------------
-- $attribute.name table (on $nexus.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $nexus.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$nexus.capsule].[$nexus.name]($nexus.identityColumnName),
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
-- Knotted static nexus attribute table ------------------------------------------------------------------------------
-- $attribute.name table (on $nexus.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $nexus.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$nexus.capsule].[$nexus.name]($nexus.identityColumnName),
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
-- Static nexus attribute table --------------------------------------------------------------------------------------
-- $attribute.name table (on $nexus.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $nexus.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$nexus.capsule].[$nexus.name]($nexus.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName asc,
        $attribute.anchorReferenceName asc
    )
)$(attribute.isEquivalent())? $scheme; : ;
GO
~*/
        }
    }
}
