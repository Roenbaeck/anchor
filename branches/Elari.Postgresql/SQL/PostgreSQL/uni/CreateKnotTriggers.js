/*~
-- KNOT TRIGGERS ---------------------------------------------------------------------------------------------------
--
-- The following triggers enable column casting and storing checksum values.
--
~*/
var knot;

while (knot = schema.nextKnot()) {
    if(knot.hasChecksum()) {
    	if(schema.EQUIVALENCE && knot.isEquivalent()) {
/*~
-- INSERT/UPDATE trigger ---------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tcs$knot.equivalentName ON $knot.equivalentName;

CREATE OR REPLACE FUNCTION tcs$knot.equivalentName() RETURNS trigger AS '
    BEGIN
        IF pg_trigger_depth() <> 1 THEN
            RETURN NEW;
        END IF;

        UPDATE $knot.equivalentName SET 
            $knot.checksumColumnName = cast(substring(MD5(cast(NEW.$knot.valueColumnName as bytea)) for 16) as bytea)
        WHERE $knot.identityColumnName = NEW.$knot.identityColumnName;
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcs$knot.equivalentName 
AFTER INSERT OR UPDATE ON $knot.equivalentName
FOR EACH ROW EXECUTE PROCEDURE tcs$knot.equivalentName();
~*/
    	} else {
/*~
-- INSERT/UPDATE trigger ---------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tcs$knot.name ON $knot.name;

CREATE OR REPLACE FUNCTION tcs$knot.name() RETURNS trigger AS '
    BEGIN
        IF pg_trigger_depth() <> 1 THEN
            RETURN NEW;
        END IF;

        UPDATE $knot.name SET 
            $knot.checksumColumnName = cast(substring(MD5(cast(NEW.$knot.valueColumnName as bytea)) for 16) as bytea)
        WHERE $knot.identityColumnName = NEW.$knot.identityColumnName;
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcs$knot.name 
AFTER INSERT OR UPDATE ON $knot.name
FOR EACH ROW EXECUTE PROCEDURE tcs$knot.name();
~*/
        }
    }
}
