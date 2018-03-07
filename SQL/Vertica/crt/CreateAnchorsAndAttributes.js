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
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null, : $anchor.dummyColumnName boolean null,
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName
    )
) ORDER BY $anchor.identityColumnName SEGMENTED BY MODULARHASH($anchor.identityColumnName) ALL NODES;
~*/
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.isGenerator())
            attribute.identityGenerator = 'IDENTITY(1,1)';
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.positName (
    $attribute.identityColumnName $(attribute.isGenerator())? $attribute.identityGenerator not null, : $attribute.identity not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName int default hash($attribute.valueColumnName),
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references ${anchor.capsule}$.$anchor.name($anchor.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc,
        $(attribute.hasChecksum())? $attribute.checksumColumnName asc : $attribute.valueColumnName asc
    )
) ORDER BY $attribute.anchorReferenceName, $attribute.changingColumnName SEGMENTED BY MODULARHASH($attribute.anchorReferenceName) ALL NODES;
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted historized attribute posit table ---------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.positName (
    $attribute.identityColumnName $(attribute.isGenerator())? $attribute.identityGenerator not null, : $attribute.identity not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references ${anchor.capsule}$.$anchor.name($anchor.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references ${knot.capsule}$.$knot.name($knot.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName,
        $attribute.knotReferenceName
    )
) ORDER BY $attribute.anchorReferenceName, $attribute.changingColumnName SEGMENTED BY MODULARHASH($attribute.anchorReferenceName) ALL NODES;
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted static attribute posit table -------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.positName (
    $attribute.identityColumnName $(attribute.isGenerator())? $attribute.identityGenerator not null, : $attribute.identity not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references ${anchor.capsule}$.$anchor.name($anchor.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references ${knot.capsule}$.$knot.name($knot.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName,
        $attribute.knotReferenceName
    )
) ORDER BY $attribute.anchorReferenceName SEGMENTED BY MODULARHASH($attribute.anchorReferenceName) ALL NODES;
~*/
    }
    else {
/*~
-- Static attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.positName (
    $attribute.identityColumnName $(attribute.isGenerator())? $attribute.identityGenerator not null, : $attribute.identity not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName int default hash($attribute.valueColumnName),
    constraint fk$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references ${anchor.capsule}$.$anchor.name($anchor.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.anchorReferenceName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName asc : $attribute.valueColumnName asc
    )
) ORDER BY $attribute.anchorReferenceName SEGMENTED BY MODULARHASH($attribute.anchorReferenceName) ALL NODES;
~*/
    }
/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attribute.annexName table (of $attribute.positName on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.annexName (
    $attribute.identityColumnName $attribute.identity not null,
    $attribute.positingColumnName $schema.metadata.positingRange not null,
    $attribute.positorColumnName $schema.metadata.positorRange not null,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $attribute.reliableColumnName int default isnull(
        case
            when $attribute.reliabilityColumnName < $schema.metadata.reliableCutoff then 0
            else 1
        end
    , 1),
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.annexName foreign key (
        $attribute.identityColumnName
    ) references ${attribute.capsule}$.$attribute.positName($attribute.identityColumnName),
    constraint pk$attribute.annexName primary key (
        $attribute.identityColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName
    )
) ORDER BY $attribute.identityColumnName, $attribute.positorColumnName, $attribute.positingColumnName SEGMENTED BY MODULARHASH($attribute.identityColumnName) ALL NODES
PARTITION BY ($attribute.positorColumnName);
~*/
}}
