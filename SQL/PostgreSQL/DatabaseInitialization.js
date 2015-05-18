/*~
-- DATABASE INITIALIZATION -----------------------------------------------------
--
-- The following code performs the initial setup of the PostgreSQL database with
-- required objects for the anchor database.
--
--------------------------------------------------------------------------------

-- create schema
CREATE SCHEMA IF NOT EXISTS $schema.metadata.encapsulation;

-- set schema search path
SET search_path = $schema.metadata.encapsulation;

-- drop universal function that generates checksum values
-- DROP FUNCTION IF EXISTS $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(text);

-- create universal function that generates checksum values
CREATE OR REPLACE FUNCTION $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(
    value text
) RETURNS $schema.metadata.checksumType AS '
    BEGIN
        return cast(
            substring(
                MD5(value) for 16
            ) as $schema.metadata.checksumType
        );
    END;
' LANGUAGE plpgsql;

~*/