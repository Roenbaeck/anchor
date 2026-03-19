/*~
-- ATTRIBUTES (UNIFIED FOR ANCHORS AND NEXUSES) ---------------------------------------------------------------------
--
-- Attributes are mutable properties attached to either anchors or nexuses.
-- Flavors: static, historized, knotted static, knotted historized.
-- This unified script creates all attribute tables (posits and annexes) using the global attribute iterator.
--
~*/
var attribute;
while (attribute = schema.nextAttribute()) {
    var parent = attribute.parent; // anchor or nexus
    var knot = attribute.isKnotted() ? attribute.knot : null;
    if(attribute.isGenerator())
        attribute.identityGenerator = 'IDENTITY(1,1)';

    if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk$attribute.positName foreign key (
        $attribute.entityReferenceName
    ) references [$parent.capsule].[$parent.name]($parent.identityColumnName),
    constraint pk$attribute.positName primary key nonclustered (
        $attribute.identityColumnName asc
    ),
    constraint uq$attribute.positName unique clustered (
        $attribute.entityReferenceName asc,
        $attribute.changingColumnName desc,
        $(attribute.hasChecksum())? $attribute.checksumColumnName asc : $attribute.valueColumnName asc
    )
);
GO
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
/*~
-- Knotted historized attribute posit table ---------------------------------------------------------------------------
-- $attribute.positName table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.entityReferenceName
    ) references [$parent.capsule].[$parent.name]($parent.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.positName primary key nonclustered (
        $attribute.identityColumnName asc
    ),
    constraint uq$attribute.positName unique clustered (
        $attribute.entityReferenceName asc,
        $attribute.changingColumnName desc,
        $attribute.knotReferenceName asc
    )
);
GO
~*/
    }
    else if(attribute.isKnotted()) {
/*~
-- Knotted static attribute posit table -------------------------------------------------------------------------------
-- $attribute.positName table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.entityReferenceName
    ) references [$parent.capsule].[$parent.name]($parent.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.positName primary key nonclustered (
        $attribute.identityColumnName asc
    ),
    constraint uq$attribute.positName unique clustered (
        $attribute.entityReferenceName asc,
        $attribute.knotReferenceName asc
    )
);
GO
~*/
    }
    else {
/*~
-- Static attribute posit table -----------------------------------------------------------------------------------
-- $attribute.positName table (on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.positName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.positName] (
    $attribute.identityColumnName $attribute.identity $attribute.identityGenerator not null,
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName as cast(${schema.metadata.encapsulation}$.MD5(cast($attribute.valueColumnName as varbinary(max))) as varbinary(16)) persisted,
    constraint fk$attribute.positName foreign key (
        $attribute.entityReferenceName
    ) references [$parent.capsule].[$parent.name]($parent.identityColumnName),
    constraint pk$attribute.positName primary key nonclustered (
        $attribute.identityColumnName asc
    ),
    constraint uq$attribute.positName unique clustered (
        $attribute.entityReferenceName asc,
        $(attribute.hasChecksum())? $attribute.checksumColumnName asc : $attribute.valueColumnName asc
    )
);
GO
~*/
    }
/*~
-- Attribute annex table ----------------------------------------------------------------------------------------------
-- $attribute.annexName table (of $attribute.positName on $parent.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.$attribute.annexName', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.annexName] (
    $attribute.identityColumnName $attribute.identity not null,
    $attribute.positingColumnName $schema.metadata.positingRange not null,
    $attribute.reliabilityColumnName bit not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.annexName foreign key (
        $attribute.identityColumnName
    ) references [$attribute.capsule].[$attribute.positName]($attribute.identityColumnName),
    constraint pk$attribute.annexName primary key clustered (
        $attribute.identityColumnName asc,
        $attribute.positingColumnName desc
    )
);
GO
~*/
}