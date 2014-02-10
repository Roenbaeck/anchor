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
-- Historized attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $anchor.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(HashBytes('MD5', cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) PERSISTED,
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.positName primary key nonclustered (
        $attribute.identityColumnName asc
    ),
    constraint uq$attribute.positName unique clustered (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc,
        $(attribute.hasChecksum())? $attribute.checksumColumnName asc : $attribute.valueColumnName asc
    )
);
GO
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted historized attribute posit table ---------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $anchor.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.positName primary key nonclustered (
        $attribute.identityColumnName asc
    ),
    constraint uq$attribute.positName unique clustered (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc,
        $attribute.knotReferenceName asc
    )
);
GO
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted static attribute posit table -------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $anchor.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.positName primary key nonclustered (
        $attribute.identityColumnName asc
    ),
    constraint uq$attribute.positName unique clustered (
        $attribute.anchorReferenceName asc,
        $attribute.knotReferenceName asc
    )
);
GO
~*/
    }
    else {
/*~
-- Static attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $anchor.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(HashBytes('MD5', cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) PERSISTED,
    constraint fk$attribute.positName foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.positName primary key nonclustered (
        $attribute.identityColumnName asc
    ),
    constraint uq$attribute.positName unique clustered (
        $attribute.anchorReferenceName asc,
        $(attribute.hasChecksum())? $attribute.checksumColumnName asc : $attribute.valueColumnName asc
    )
);
GO
~*/
    }
    var scheme = PARTITIONING ? ' ON PositorScheme(' + attribute.positorColumnName + ')' : '';
/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attribute.annexName table (of $attribute.positName on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.annexName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.annexName] (
    $attribute.identityColumnName $attribute.identity not null,
    $attribute.positingColumnName $schema.positingRange not null,
    $attribute.positorColumnName $schema.positorRange not null,
    $attribute.reliabilityColumnName $schema.reliabilityRange not null,
    $attribute.reliableColumnName as isnull(cast(
        case
            when $attribute.reliabilityColumnName < $schema.reliableCutoff then 0
            else 1
        end
    as tinyint), 1) persisted,
    $(METADATA)? $attribute.metadataColumnName $schema.metadataType not null,
    constraint fk$attribute.annexName foreign key (
        $attribute.identityColumnName
    ) references [$attribute.capsule].[$attribute.positName]($attribute.identityColumnName),
    constraint pk$attribute.annexName primary key clustered (
        $attribute.identityColumnName asc,
        $attribute.positorColumnName asc,
        $attribute.positingColumnName desc
    )
)$scheme;
GO
~*/
}}