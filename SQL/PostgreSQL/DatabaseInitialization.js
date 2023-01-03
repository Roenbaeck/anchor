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
/*
-- if using uuid's these can be handy.
create or replace function min(uuid, uuid)
    returns uuid
    immutable parallel safe
    language plpgsql as
$$
begin
    return least($1, $2);
end
$$;

create aggregate min(uuid) (
    sfunc = min,
    stype = uuid,
    combinefunc = min,
    parallel = safe,
    sortop = operator (<)
    );

create or replace function max(uuid, uuid)
    returns uuid
    immutable parallel safe
    language plpgsql as
$$
begin
    return greatest($1, $2);
end
$$;

create aggregate max(uuid) (
    sfunc = max,
    stype = uuid,
    combinefunc = max,
    parallel = safe,
    sortop = operator (>)
    );
*/