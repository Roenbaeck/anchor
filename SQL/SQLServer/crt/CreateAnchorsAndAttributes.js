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
        if(attribute.isGenerator())
            attribute.identityGenerator = 'IDENTITY(1,1)';
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
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
IF Object_ID('$attribute.capsule$.$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
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
IF Object_ID('$attribute.capsule$.$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
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
IF Object_ID('$attribute.capsule$.$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
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
    var scheme = schema.PARTITIONING ? ' ON PositorScheme(' + attribute.positorColumnName + ')' : '';
/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attribute.annexName table (of $attribute.positName on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.annexName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.annexName] (
    $attribute.identityColumnName $attribute.identity not null,
    $attribute.positingColumnName $schema.metadata.positingRange not null,
    $attribute.positorColumnName $schema.metadata.positorRange not null,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $attribute.assertionColumnName as cast(
        case
            when $attribute.reliabilityColumnName > $schema.metadata.deleteReliability then '+'
            when $attribute.reliabilityColumnName = $schema.metadata.deleteReliability then '?'
            when $attribute.reliabilityColumnName < $schema.metadata.deleteReliability then '-'
        end
    as char(1)) persisted,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
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