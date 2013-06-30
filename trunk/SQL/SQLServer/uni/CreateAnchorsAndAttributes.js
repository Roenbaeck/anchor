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
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
    if(anchor.metadata.generator == 'true')
        anchor.identityGenerator = 'IDENTITY(1,1)';
    if(schema.metadataUsage == 'true')
        anchor.metadataDefinition = anchor.metadataColumnName + ' ' + schema.metadataType + ' not null,';
    else
        anchor.metadataDefinition = anchor.dummyColumnName + ' bit null,';
/*~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with $anchor.attributes.length attributes)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$anchor.name', 'U') IS NULL
CREATE TABLE [$anchor.capsule].[$anchor.name] (
    $anchor.identityColumnName $anchor.identity $anchor.identityGenerator not null,
    $anchor.metadataDefinition
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName asc
    )
);
GO
~*/
    var knot, attribute;
    for(var b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
        if(schema.metadataUsage == 'true')
            attribute.metadataDefinition = attribute.metadataColumnName + ' ' + schema.metadataType + ' not null,';
        if(attribute.timeRange && attribute.dataRange) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $attribute.metadataDefinition
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc
    )
);
GO
~*/
    }
    else if(attribute.timeRange && attribute.knotRange) {
        knot = schema.knot[attribute.knotRange];
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    $attribute.metadataDefinition
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc,
        $attribute.changingColumnName desc
    )
);
GO
~*/
    }
    else if(attribute.knotRange) {
        knot = schema.knot[attribute.knotRange];
/*~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.metadataDefinition
    constraint fk_A_$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc
    )
);
GO
~*/
    }
    else {
/*~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'U') IS NULL
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $attribute.metadataDefinition
    constraint fk$attribute.name foreign key (
        $attribute.anchorReferenceName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.anchorReferenceName asc
    )
);
GO
~*/
    }
}}