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
    knot = attribute.isKnotted() ? attribute.knot : null;
    var scheme = (schema.PARTITIONING && attribute.isEquivalent()) ? ' PARTITION BY (' + attribute.equivalentColumnName + ')' : '';
    if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.entityReferenceName $parent.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName int default hash($attribute.valueColumnName),
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
) ORDER BY $attribute.entityReferenceName, $attribute.changingColumnName SEGMENTED BY MODULARHASH($attribute.entityReferenceName) ALL NODES$(attribute.isEquivalent())? $scheme; : ;
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
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
) ORDER BY $attribute.entityReferenceName, $attribute.changingColumnName SEGMENTED BY MODULARHASH($attribute.entityReferenceName) ALL NODES;
~*/
    }
    else if(attribute.isKnotted()) {
        var knotTableName2 = knot.isEquivalent() ? knot.identityName : knot.name;
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
    ) references ${knot.capsule}$.$knotTableName2($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.entityReferenceName
    )
) ORDER BY $attribute.entityReferenceName SEGMENTED BY MODULARHASH($attribute.entityReferenceName) ALL NODES;
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
    $(attribute.hasChecksum())? $attribute.checksumColumnName int default hash($attribute.valueColumnName),
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.entityReferenceName
    )
) ORDER BY $attribute.entityReferenceName SEGMENTED BY MODULARHASH($attribute.entityReferenceName) ALL NODES$(attribute.isEquivalent())? $scheme; : ;
~*/
    }
}
