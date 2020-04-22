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

~*/