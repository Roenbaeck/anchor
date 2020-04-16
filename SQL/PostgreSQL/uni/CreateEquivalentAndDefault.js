if(schema.EQUIVALENCE) {
/*~
-- EQUIVALENTS METADATA -----------------------------------------------------------------------------------------------
--
-- Sets up a table containing the list of available equivalents. Since at least one equivalent
-- must be available the table is set up with a default equivalent with identity 0.
--
-- Equivalent table ---------------------------------------------------------------------------------------------------
IF Object_ID('$schema.metadata.encapsulation$._$schema.metadata.equivalentSuffix', 'U') IS NULL
BEGIN
    CREATE TABLE [$schema.metadata.encapsulation].[_$schema.metadata.equivalentSuffix] (
        $schema.metadata.equivalentSuffix $schema.metadata.equivalentRange not null,
        constraint pk_$schema.metadata.equivalentSuffix primary key (
            $schema.metadata.equivalentSuffix asc
        )
    );
    INSERT INTO [$schema.metadata.encapsulation].[_$schema.metadata.equivalentSuffix] (
        $schema.metadata.equivalentSuffix
    )
    VALUES (
        0 -- the default equivalent
    );
END
GO
~*/
}