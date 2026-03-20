if(schema.EQUIVALENCE) {
/*~
-- EQUIVALENTS METADATA -----------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available equivalents. Since at least one equivalent
-- must be available the table is set up with a default equivalent with identity 0.
--
-- Equivalent table ---------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $schema.metadata.encapsulation._$schema.metadata.equivalentSuffix (
    $schema.metadata.equivalentSuffix $schema.metadata.equivalentRange not null,
    constraint pk_$schema.metadata.equivalentSuffix primary key (
        $schema.metadata.equivalentSuffix 
    )
);
MERGE INTO $schema.metadata.encapsulation._$schema.metadata.equivalentSuffix e
USING ( SELECT 0 AS _defaultEquivalent ) d
ON (
    d._defaultEquivalent = e.$schema.metadata.equivalentSuffix
)
WHEN NOT MATCHED THEN
INSERT (
    $schema.metadata.equivalentSuffix
)
VALUES (
    d._defaultEquivalent
);
~*/
}
