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
CREATE TABLE IF NOT EXISTS ${anchor.capsule}$.$anchor.name (
    $anchor.identityColumnName $(anchor.isGenerator())? $anchor.identityGenerator not null, : $anchor.identity not null,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null, : $anchor.dummyColumnName bit null,
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName
    )
) ORDER BY $anchor.identityColumnName SEGMENTED BY MODULARHASH($anchor.identityColumnName) ALL NODES;
~*/
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        var scheme = schema.PARTITIONING ? ' PARTITION BY (' + attribute.equivalentColumnName + ')' : '';
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.anchorReferenceName $anchor.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName int default hash($attribute.valueColumnName),
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references ${anchor.capsule}$.$anchor.name($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.anchorReferenceName,
        $attribute.changingColumnName
    )
) ORDER BY $attribute.anchorReferenceName, $attribute.changingColumnName SEGMENTED BY MODULARHASH($attribute.anchorReferenceName) ALL NODES$(attribute.isEquivalent())? $scheme; : ;
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references ${anchor.capsule}$.$anchor.name($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references ${knot.capsule}$.$knotTableName($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName
    )
) ORDER BY $attribute.anchorReferenceName, $attribute.changingColumnName SEGMENTED BY MODULARHASH($attribute.anchorReferenceName) ALL NODES;
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;

/*~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references ${anchor.capsule}$.$anchor.name($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references ${knot.capsule}$.$knotTableName($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName
    )
) ORDER BY $attribute.anchorReferenceName SEGMENTED BY MODULARHASH($attribute.anchorReferenceName) ALL NODES;
~*/
    }
    else {
/*~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.name (
    $attribute.anchorReferenceName $anchor.identity not null,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName int default hash($attribute.valueColumnName),
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references ${anchor.capsule}$.$anchor.name($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $attribute.anchorReferenceName
    )
) ORDER BY $attribute.anchorReferenceName SEGMENTED BY MODULARHASH($attribute.anchorReferenceName) ALL NODES$(attribute.isEquivalent())? $scheme; : ;
~*/
    }
}}
