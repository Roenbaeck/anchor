/*~
-- KNOTS --------------------------------------------------------------------------------------------------------------
--
-- Knots are used to store finite sets of values, normally used to describe states
-- of entities (through knotted attributes) or relationships (through knotted ties).
-- Knots have their own surrogate identities and are therefore immutable.
-- Values can be added to the set over time though.
-- Knots should have values that are mutually exclusive and exhaustive.
-- Knots are unfolded when using equivalence.
--
 ~*/
var knot;

while (knot = schema.nextKnot()) {
    if(knot.isGenerator()) {
    	schema.setIdentityGenerator(knot);
    }
    
    if(schema.EQUIVALENCE && knot.isEquivalent()) {
/*~
-- Knot identity table ------------------------------------------------------------------------------------------------
-- $knot.identityName table
-----------------------------------------------------------------------------------------------------------------------
-- DROP TABLE IF EXISTS $knot.capsule\._$knot.identityName;

CREATE TABLE IF NOT EXISTS $knot.capsule\._$knot.identityName (
    $knot.identityColumnName $(knot.isGenerator())? $knot.identityGenerator not null, : $knot.identity not null,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null, : $knot.dummyColumnName boolean null,
    constraint pk$knot.identityName primary key (
        $knot.identityColumnName
    )
);

ALTER TABLE IF EXISTS ONLY $knot.capsule\._$knot.identityName CLUSTER ON pk$knot.identityName;

-- DROP VIEW IF EXISTS $knot.capsule\.$knot.identityName;

CREATE OR REPLACE VIEW $knot.capsule\.$knot.identityName AS SELECT
    $knot.identityColumnName$(schema.METADATA)?,
    $(schema.METADATA)? $knot.metadataColumnName
FROM $knot.capsule\._$knot.identityName;


-- Knot value table ---------------------------------------------------------------------------------------------------
-- $knot.equivalentName table
-----------------------------------------------------------------------------------------------------------------------
-- DROP TABLE IF EXISTS $knot.capsule\._$knot.equivalentName;

CREATE TABLE IF NOT EXISTS $knot.capsule\._$knot.equivalentName (
    $knot.identityColumnName $knot.identity not null,
    $knot.equivalentColumnName $schema.metadata.equivalentRange not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName $schema.metadata.checksumType not null,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null, : $knot.dummyColumnName boolean null,
    constraint fk$knot.equivalentName foreign key (
        $knot.identityColumnName
    ) references $knot.capsule\._$knot.identityName($knot.identityColumnName) 
    MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    constraint pk$knot.equivalentName primary key (
        $knot.equivalentColumnName,
        $knot.identityColumnName
    ),
    constraint uq$knot.equivalentName unique (
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
);

ALTER TABLE IF EXISTS ONLY $knot.capsule\._$knot.equivalentName CLUSTER ON pk$knot.equivalentName;

-- DROP VIEW IF EXISTS $knot.capsule\.$knot.equivalentName;

CREATE OR REPLACE VIEW $knot.capsule\.$knot.equivalentName AS SELECT
    $knot.identityColumnName,
    $knot.equivalentColumnName,
    $knot.valueColumnName$(knot.hasChecksum() || schema.METADATA)?,
    $(knot.hasChecksum())? $knot.checksumColumnName~*//*~$(knot.hasChecksum() && schema.METADATA)?,
    $(schema.METADATA)? $knot.metadataColumnName
FROM $knot.capsule\._$knot.equivalentName;
~*/
    } // end of equivalent knot
    else { // start of regular knot
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
-- DROP TABLE IF EXISTS $knot.capsule\._$knot.name;

CREATE TABLE IF NOT EXISTS $knot.capsule\._$knot.name (
    $knot.identityColumnName $(knot.isGenerator())? $knot.identityGenerator not null, : $knot.identity not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName $schema.metadata.checksumType not null,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null,
    constraint pk$knot.name primary key (
        $knot.identityColumnName
    ),
    constraint uq$knot.name unique (
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
);

ALTER TABLE IF EXISTS ONLY $knot.capsule\._$knot.name CLUSTER ON pk$knot.name;

-- DROP VIEW IF EXISTS $knot.capsule\.$knot.name;

CREATE OR REPLACE VIEW $knot.capsule\.$knot.name AS SELECT
    $knot.identityColumnName,
    $knot.valueColumnName$(knot.hasChecksum() || schema.METADATA)?,
    $(knot.hasChecksum())? $knot.checksumColumnName~*//*~$(knot.hasChecksum() && schema.METADATA)?,
    $(schema.METADATA)? $knot.metadataColumnName
FROM $knot.capsule\._$knot.name;
~*/
    } // end of regular knot
}