/*~
-- KNOT TRIGGERS ---------------------------------------------------------------------------------------------------
--
-- The following triggers enable calculation and storing checksum values.
--
~*/
var knot;

while (knot = schema.nextKnot()) {
    if(knot.hasChecksum()) {
        if(schema.EQUIVALENCE && knot.isEquivalent()) {
/*~
-- DROP TRIGGER IF EXISTS tcs$knot.name ON $knot.capsule\._$knot.equivalentName;
-- DROP FUNCTION IF EXISTS $knot.capsule\.tcs$knot.name();

CREATE OR REPLACE FUNCTION $knot.capsule\.tcs$knot.name() RETURNS trigger AS '
    BEGIN
        IF (TG_OP = ''INSERT'') THEN
            IF (NEW.$knot.checksumColumnName IS NULL) THEN
                NEW.$knot.checksumColumnName = $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(
                    CAST(NEW.$knot.valueColumnName AS text)
                );
            END IF;
        ELSIF (TG_OP = ''UPDATE'') THEN
            IF (OLD.$knot.valueColumnName != NEW.$knot.valueColumnName) THEN
                NEW.$knot.checksumColumnName = $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(
                    CAST(NEW.$knot.valueColumnName AS text)
                );
            END IF;
        END IF;
        
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcs$knot.name
BEFORE INSERT OR UPDATE OF $knot.valueColumnName ON $knot.capsule\._$knot.equivalentName
FOR EACH ROW EXECUTE PROCEDURE $knot.capsule\.tcs$knot.name();
~*/
        } else {
/*~
-- DROP TRIGGER IF EXISTS tcs$knot.name ON $knot.capsule\._$knot.name;
-- DROP FUNCTION IF EXISTS $knot.capsule\.tcs$knot.name();

CREATE OR REPLACE FUNCTION $knot.capsule\.tcs$knot.name() RETURNS trigger AS '
    BEGIN
        IF (TG_OP = ''INSERT'') THEN
            IF (NEW.$knot.checksumColumnName IS NULL) THEN
                NEW.$knot.checksumColumnName = $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(
                    CAST(NEW.$knot.valueColumnName AS text)
                );
            END IF;
        ELSIF (TG_OP = ''UPDATE'') THEN
            IF (OLD.$knot.valueColumnName != NEW.$knot.valueColumnName) THEN
                NEW.$knot.checksumColumnName = $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(
                    CAST(NEW.$knot.valueColumnName AS text)
                );
            END IF;
        END IF;
        
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcs$knot.name
BEFORE INSERT OR UPDATE OF $knot.valueColumnName ON $knot.capsule\._$knot.name
FOR EACH ROW EXECUTE PROCEDURE $knot.capsule\.tcs$knot.name();
~*/
        }
    }
}