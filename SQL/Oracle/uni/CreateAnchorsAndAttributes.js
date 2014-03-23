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
begin -- Create sequences if not exist
    execute immediate 'create sequence ${(anchor.name + '_' + anchor.identityColumnName).substr(0,26) + '_SEQ'}$ start with 10000 increment by 1 cache 20 nocycle ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/

begin -- Create table with pk column
    execute immediate '
        CREATE TABLE $anchor.name (
            $anchor.identityColumnName $anchor.identity not null,
            $(schema.METADATA)? ${anchor.metadataColumnName.substr(0,30)}$ $schema.metadata.metadataType not null, : $anchor.dummyColumnName bit null,
            constraint ${('PK_' + anchor.name).substr(0,30)}$ primary key (
                $anchor.identityColumnName 
            )
        ) ORGANIZATION INDEX
    ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/
~*/
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
        if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
-- Historized attribute table -----------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
begin -- Create table with pk column
    execute immediate '
        CREATE TABLE $attribute.name (
            $attribute.anchorReferenceName $anchor.identity not null,
            $attribute.valueColumnName $attribute.dataRange not null,
            $attribute.changingColumnName $attribute.timeRange not null,
            $(schema.METADATA)? ${attribute.metadataColumnName.substr(0,30)}$ $schema.metadata.metadataType not null,
            constraint ${('FK_' + attribute.name).substr(0,30)}$ foreign key (
                $attribute.anchorReferenceName
            ) references $anchor.name($anchor.identityColumnName),
            constraint ${('PK_' + attribute.name).substr(0,30)}$ primary key (
                $attribute.anchorReferenceName,
                $attribute.changingColumnName
            )
        ) ORGANIZATION INDEX
    ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted historized attribute table ---------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
begin -- Create table with pk column
    execute immediate '
        CREATE TABLE $attribute.name (
            $attribute.anchorReferenceName $anchor.identity not null,
            $attribute.knotReferenceName $knot.identity not null,
            $attribute.changingColumnName $attribute.timeRange not null,
            $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
            constraint ${('FK1_' + attribute.name).substr(0,30)}$ foreign key (
                $attribute.anchorReferenceName
            ) references $anchor.name($anchor.identityColumnName),
            constraint ${('FK2_' + attribute.name).substr(0,30)}$ foreign key (
                $attribute.knotReferenceName
            ) references $knot.name($knot.identityColumnName),
            constraint ${('PK_' + attribute.name).substr(0,30)}$ primary key (
                $attribute.anchorReferenceName,
                $attribute.changingColumnName
            )
        ) ORGANIZATION INDEX
    ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
/*~
-- Knotted static attribute table -------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
begin -- Create table with pk column
    execute immediate '
        CREATE TABLE $attribute.name (
            $attribute.anchorReferenceName $anchor.identity not null,
            $attribute.knotReferenceName $knot.identity not null,
            $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
            constraint ${('FK1_' + attribute.name).substr(0,30)}$ foreign key (
                $attribute.anchorReferenceName
            ) references $anchor.name($anchor.identityColumnName),
            constraint ${('FK2_' + attribute.name).substr(0,30)}$ foreign key (
                $attribute.knotReferenceName
            ) references $knot.name($knot.identityColumnName),
            constraint ${('PK_' + attribute.name).substr(0,30)}$ primary key (
                $attribute.anchorReferenceName
            )
        ) ORGANIZATION INDEX
    ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/
~*/
    }
    else {
/*~
-- Static attribute table ---------------------------------------------------------------------------------------------
-- $attribute.name table (on $anchor.name)
-----------------------------------------------------------------------------------------------------------------------
begin -- Create table with pk column
    execute immediate '
        CREATE TABLE $attribute.name (
            $attribute.anchorReferenceName $anchor.identity not null,
            $attribute.valueColumnName $attribute.dataRange not null,
            $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
            constraint ${('FK_' + attribute.name).substr(0,30)}$ foreign key (
                $attribute.anchorReferenceName
            ) references $anchor.name($anchor.identityColumnName),
            constraint ${('PK_' + attribute.name).substr(0,30)}$ primary key (
                $attribute.anchorReferenceName
            )
        ) ORGANIZATION INDEX
    ';
exception when others then 
    if sqlcode = -955 then NULL; else RAISE; end if;
end;
/
~*/
    }
}}