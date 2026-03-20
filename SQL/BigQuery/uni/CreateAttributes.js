/*~
-- ATTRIBUTES ---------------------------------------------------------------------------------------------------------
--
-- Attributes are mutable properties on anchors or nexuses.
-- Attributes have four flavors: static, historized, knotted static, and knotted historized.
--
~*/
var attribute, parent, knot;
while (attribute = schema.nextAttribute()) {
    parent = attribute.parent;
    if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0) default hash($attribute.valueColumnName),
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.entityReferenceName,
        $attribute.changingColumnName
    )
) CLUSTER BY ($attribute.entityReferenceName, $attribute.changingColumnName);
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references ${knot.capsule}$.$knotTableName($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.entityReferenceName,
        $attribute.changingColumnName
    )
) CLUSTER BY ($attribute.entityReferenceName, $attribute.changingColumnName);
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references ${knot.capsule}$.$knotTableName($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.entityReferenceName
    )
) CLUSTER BY ($attribute.entityReferenceName);
~*/
    }
    else {
/*~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0) default hash($attribute.valueColumnName),
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.entityReferenceName
    )
) CLUSTER BY ($attribute.entityReferenceName);
~*/
    }
}
