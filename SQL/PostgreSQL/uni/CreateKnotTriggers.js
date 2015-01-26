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
DROP TRIGGER IF EXISTS tcs$knot.equivalentName ON _$knot.equivalentName;

CREATE OR REPLACE FUNCTION tcs$knot.equivalentName() RETURNS trigger AS '
    BEGIN
        -- convert value into an hash
        NEW.$knot.checksumColumnName = cast(
            substring(
                MD5(
                    cast(
                        cast(NEW.$knot.valueColumnName as text) as bytea
                    )
                ) for 16
            ) as bytea
        );
        
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcs$knot.equivalentName
BEFORE INSERT OR UPDATE OF $knot.valueColumnName ON _$knot.equivalentName
FOR EACH ROW EXECUTE PROCEDURE tcs$knot.equivalentName();
~*/
        } else {
/*~
-- INSERT/UPDATE trigger ---------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tcs$knot.name ON _$knot.name;

CREATE OR REPLACE FUNCTION tcs$knot.name() RETURNS trigger AS '
    BEGIN
        -- convert value into an hash
        NEW.$knot.checksumColumnName = cast(
            substring(
                MD5(
                    cast(
                        cast(NEW.$knot.valueColumnName as text) as bytea
                    )
                ) for 16
            ) as bytea
        );
        
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcs$knot.name
BEFORE INSERT OR UPDATE OF $knot.valueColumnName ON _$knot.name
FOR EACH ROW EXECUTE PROCEDURE tcs$knot.name();
~*/
        }
    }
}
