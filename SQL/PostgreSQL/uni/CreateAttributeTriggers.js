/*~
-- ATTRIBUTE TRIGGERS ------------------------------------------------------------------------------------------------
--
-- The following triggers on the attributes make them behave like tables.
-- There is one 'instead of' trigger for: insert.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor, attribute;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        if(attribute.hasChecksum()) {
/*~
-- INSERT/UPDATE trigger ---------------------------------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tcs$attribute.name ON _$attribute.name;

CREATE OR REPLACE FUNCTION tcs$attribute.name() RETURNS trigger AS '
    BEGIN
        -- convert value into an hash
        NEW.$attribute.checksumColumnName = cast(
            substring(
                MD5(
                    cast(
                        cast(NEW.$attribute.valueColumnName as text) as bytea
                    )
                ) for 16
            ) as bytea
        );
        
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcs$attribute.name
BEFORE INSERT OR UPDATE ON _$attribute.name
FOR EACH ROW EXECUTE PROCEDURE tcs$attribute.name();
~*/
        }
    } // end of loop over attributes
}