/*~
-- ATTRIBUTES ---------------------------------------------------------------------------------------------------------
--
-- Attributes are used to store values for properties of entities.
-- Attributes are mutable, their values may change over one or more types of time.
-- Attributes have four flavors: static, historized, knotted static, and knotted historized.
-- Attributes may belong to anchors or nexuses.
--
~*/
var attribute, parent, knot;
while (attribute = schema.nextAttribute()) {
    parent = attribute.parent;
    var scheme = schema.PARTITIONING ? ' ON EquivalenceScheme(' + attribute.equivalentColumnName + ')' : '';
    if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName bytea generated always as (cast(MD5(cast($attribute.valueColumnName as text)) as bytea)) stored,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references $parent.capsule\.$parent.name ($parent.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.entityReferenceName,
        $attribute.changingColumnName
    ) include (
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName
    )
);
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references $parent.capsule\.$parent.name ($parent.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule\.$knotTableName ($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.entityReferenceName,
        $attribute.changingColumnName
    ) include (
        $attribute.knotReferenceName
    )
);
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references $parent.capsule\.$parent.name ($parent.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references $knot.capsule\.$knotTableName ($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.entityReferenceName
    ) include (
        $attribute.knotReferenceName
    )
);
~*/
    }
    else {
/*~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $attribute.capsule\.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName bytea generated always as (cast(MD5(cast($attribute.valueColumnName as text)) as bytea)) stored,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references $parent.capsule\.$parent.name ($parent.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.entityReferenceName
    ) include (
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName
    )
);
~*/
    }
}
