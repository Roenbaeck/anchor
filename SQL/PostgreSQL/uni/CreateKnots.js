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
        switch (knot.identity) {
            case 'smallint': knot.identityGenerator = 'smallserial'; break;
            case 'bigint': knot.identityGenerator = 'bigserial'; break;
            default: knot.identityGenerator = 'serial'; break;
        }
    }
    
    if(schema.EQUIVALENCE && knot.isEquivalent()) {
        var scheme = schema.PARTITIONING ? ' ON EquivalenceScheme(' + knot.equivalentColumnName + ')' : '';
/*~
-- Knot identity table ------------------------------------------------------------------------------------------------
-- $knot.identityName table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS _$knot.identityName (
    $knot.identityColumnName $(knot.isGenerator())? $knot.identityGenerator not null, : $knot.identity not null,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null, : $knot.dummyColumnName boolean null,
    constraint pk$knot.identityName primary key (
        $knot.identityColumnName
    )
);

ALTER TABLE IF EXISTS ONLY _$knot.identityName CLUSTER ON pk$knot.identityName;

CREATE OR REPLACE VIEW $knot.identityName AS SELECT * FROM _$knot.identityName;

-- Knot value table ---------------------------------------------------------------------------------------------------
-- $knot.equivalentName table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS _$knot.equivalentName (
    $knot.identityColumnName $knot.identity not null,
    $knot.equivalentColumnName $schema.metadata.equivalentRange not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName bytea not null,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null, : $knot.dummyColumnName boolean null,
    constraint fk$knot.equivalentName foreign key (
        $knot.identityColumnName
    ) references _$knot.identityName($knot.identityColumnName) 
    MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE,
    constraint pk$knot.equivalentName primary key (
        $knot.equivalentColumnName,
        $knot.identityColumnName
    ),
    constraint uq$knot.equivalentName unique (
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
)$scheme;

ALTER TABLE IF EXISTS ONLY _$knot.equivalentName CLUSTER ON pk$knot.equivalentName;

CREATE OR REPLACE VIEW $knot.equivalentName AS SELECT * FROM _$knot.equivalentName;
~*/
    } // end of equivalent knot
    else { // start of regular knot
/*~
-- Knot table ---------------------------------------------------------------------------------------------------------
-- $knot.name table
-----------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS _$knot.name (
    $knot.identityColumnName $(knot.isGenerator())? $knot.identityGenerator not null, : $knot.identity not null,
    $knot.valueColumnName $knot.dataRange not null,
    $(knot.hasChecksum())? $knot.checksumColumnName bytea not null,
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType not null,
    constraint pk$knot.name primary key (
        $knot.identityColumnName
    ),
    constraint uq$knot.name unique (
        $(knot.hasChecksum())? $knot.checksumColumnName : $knot.valueColumnName
    )
);

ALTER TABLE IF EXISTS ONLY _$knot.name CLUSTER ON pk$knot.name;

CREATE OR REPLACE VIEW $knot.name AS SELECT * FROM _$knot.name;
~*/
    } // end of regular knot
}
