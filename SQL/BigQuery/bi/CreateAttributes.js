/*~
-- ATTRIBUTES ---------------------------------------------------------------------------------------------------------
--
-- BI attributes use posit and annex split with changing/positing time and reliability.
--
~*/
var attribute, parent, knot;
while (attribute = schema.nextAttribute()) {
    parent = attribute.parent;
    if(attribute.isGenerator())
        attribute.identityGenerator = 'IDENTITY(1,1)';

    if(attribute.isHistorized() && !attribute.isKnotted()) {
/*~
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.positName (
    $attribute.identityColumnName $(attribute.isGenerator())? $attribute.identity $attribute.identityGenerator not null, : $attribute.identity not null,
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0) default hash($attribute.valueColumnName),
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk$attribute.positName foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.entityReferenceName,
        $attribute.changingColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName
    )
) CLUSTER BY ($attribute.entityReferenceName, $attribute.changingColumnName);
~*/
    }
    else if(attribute.isHistorized() && attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.positName (
    $attribute.identityColumnName $(attribute.isGenerator())? $attribute.identity $attribute.identityGenerator not null, : $attribute.identity not null,
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    $attribute.changingColumnName $attribute.timeRange not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references ${knot.capsule}$.$knotTableName($knot.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.entityReferenceName,
        $attribute.changingColumnName,
        $attribute.knotReferenceName
    )
) CLUSTER BY ($attribute.entityReferenceName, $attribute.changingColumnName);
~*/
    }
    else if(attribute.isKnotted()) {
        knot = attribute.knot;
        var knotTableName2 = knot.isEquivalent() ? knot.identityName : knot.name;
/*~
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.positName (
    $attribute.identityColumnName $(attribute.isGenerator())? $attribute.identity $attribute.identityGenerator not null, : $attribute.identity not null,
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.knotReferenceName $knot.identity not null,
    constraint fk_A_$attribute.positName foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint fk_K_$attribute.positName foreign key (
        $attribute.knotReferenceName
    ) references ${knot.capsule}$.$knotTableName2($knot.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.entityReferenceName,
        $attribute.knotReferenceName
    )
) CLUSTER BY ($attribute.entityReferenceName);
~*/
    }
    else {
/*~
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.positName (
    $attribute.identityColumnName $(attribute.isGenerator())? $attribute.identity $attribute.identityGenerator not null, : $attribute.identity not null,
    $attribute.entityReferenceName $parent.identity not null,
    $attribute.valueColumnName $attribute.dataRange not null,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0) default hash($attribute.valueColumnName),
    constraint fk$attribute.positName foreign key (
        $attribute.entityReferenceName
    ) references ${parent.capsule}$.$parent.name($parent.identityColumnName),
    constraint pk$attribute.positName primary key (
        $attribute.identityColumnName
    ),
    constraint uq$attribute.positName unique (
        $attribute.entityReferenceName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName : $attribute.valueColumnName
    )
) CLUSTER BY ($attribute.entityReferenceName);
~*/
    }
/*~
CREATE TABLE IF NOT EXISTS ${attribute.capsule}$.$attribute.annexName (
    $attribute.identityColumnName $attribute.identity not null,
    $attribute.positingColumnName $schema.metadata.positingRange not null,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
    constraint fk$attribute.annexName foreign key (
        $attribute.identityColumnName
    ) references ${attribute.capsule}$.$attribute.positName($attribute.identityColumnName),
    constraint pk$attribute.annexName primary key (
        $attribute.identityColumnName,
        $attribute.positingColumnName
    )
) CLUSTER BY ($attribute.identityColumnName, $attribute.positingColumnName);
~*/
}
