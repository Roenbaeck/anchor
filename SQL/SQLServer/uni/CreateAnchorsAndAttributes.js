~
/** ANCHORS AND ATTRIBUTES ********************************************************************************************
 *
 *  Anchors are used to store the identities of entities.
 *  Attributes are used to store values for properties of entities.
 *  Anchors may have zero or more adjoined attributes.
 *
 */
~
var anchor;
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
    if(anchor.metadata.generator == 'true')
        anchor.identityGenerator = 'IDENTITY(1,1)';
    else
        anchor.identityGenerator = '';
    if(schema.metadataUsage == 'true')
        anchor.metadataDefinition = anchor.metadataColumnName + ' ' + schema.metadataType + ' not null,';
    else
        anchor.metadataDefinition = '';
// tilde delimits the sisula code
~
-- Anchor table -------------------------------------------------------------------------------------------------------
-- $anchor.name table (with $anchor.attributes.length attributes)
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = '$anchor.name' AND type LIKE '%U%')
CREATE TABLE [$anchor.capsule].[$anchor.name] (
    $anchor.identityColumnName $anchor.identity $anchor.identityGenerator not null,
    $anchor.metadataDefinition
    constraint pk$anchor.name primary key (
        $anchor.identityColumnName asc
    )
);
GO
~
var attribute;
for(var b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
    if(schema.metadataUsage == 'true')
        attribute.metadataDefinition = attribute.metadataColumnName + ' ' + schema.metadataType + ' not null,';
    else
        attribute.metadataDefinition = '';
    if(attribute.timeRange && attribute.dataRange) {

    }
    else if(attribute.timeRange && attribute.knotRange) {

    }
    else if(attribute.knotRange) {
        var knot = schema.knot[attribute.knotRange];
// inner sisula code
~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = '$attribute.name' AND type LIKE '%U%')
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.knotReferenceName $knot.dataRange not null,
    attributeMetadataDefinition,
    constraint fk_A_$attribute.name foreign key (
        $attribute.identityColumnName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint fk_K_$attribute.name foreign key (
        $attribute.knotReferenceName
    ) references [$knot.capsule].[$knot.name]($knot.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.identityColumnName asc
    )
);
GO
~
    }
    else {
// inner sisula code
~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = '$attribute.name' AND type LIKE '%U%')
CREATE TABLE [$attribute.capsule].[$attribute.name] (
    $attribute.anchorReferenceName $anchor.identity not null,
    $attribute.name $attribute.dataRange not null,
    attributeMetadataDefinition,
    constraint fk$attribute.name foreign key (
        $attribute.identityColumnName
    ) references [$anchor.capsule].[$anchor.name]($anchor.identityColumnName),
    constraint pk$attribute.name primary key (
        $attribute.identityColumnName asc
    )
);
GO
~
    }
}}