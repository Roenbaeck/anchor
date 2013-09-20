/*~
-- POSITOR METADATA ---------------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available positors. Since at least one positor
-- must be available the table is set up with a default positor with identity 0.
--
-- Positor table ------------------------------------------------------------------------------------------------------
IF Object_ID('_$schema.positorSuffix', 'U') IS NULL
BEGIN
    CREATE TABLE [$schema.defaultCapsule].[_$schema.positorSuffix] (
        $schema.positorSuffix $schema.positorRange not null,
        constraint pk_$schema.positorSuffix primary key (
            $schema.positorSuffix asc
        )
    );
    INSERT INTO [$schema.defaultCapsule].[_$schema.positorSuffix] (
        $schema.positorSuffix
    )
    VALUES (
        0 -- the default positor
    );
END
GO
~*/