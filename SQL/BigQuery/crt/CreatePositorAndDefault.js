/*~
-- POSITOR METADATA ---------------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available positors. Since at least one positor
-- must be available the table is set up with a default positor with identity 0.
--
-- Positor table ------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS $schema.metadata.encapsulation._$schema.metadata.positorSuffix (
    $schema.metadata.positorSuffix $schema.metadata.positorRange not null,
    constraint pk_$schema.metadata.positorSuffix primary key (
        $schema.metadata.positorSuffix
    )
);
MERGE INTO $schema.metadata.encapsulation._$schema.metadata.positorSuffix p
USING ( SELECT 0 AS _defaultPositor ) d
ON (
    d._defaultPositor = p.$schema.metadata.positorSuffix
)
WHEN NOT MATCHED THEN
INSERT (
    $schema.metadata.positorSuffix
)
VALUES (
    d._defaultPositor
);
~*/
