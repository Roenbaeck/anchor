/*~
-- KEY GENERATORS -----------------------------------------------------------------------------------------------------
--
-- These stored procedures can be used to generate identities of entities.
-- Corresponding anchors must have an incrementing identity column.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.isGenerator()) {
        if(schema.METADATA) {
/*~
-- Key Generation Stored Procedure ------------------------------------------------------------------------------------
-- k$anchor.name identity by surrogate key generation stored procedure
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule\.k$anchor.name(
    requestedNumberOfIdentities bigint,
    metadata $schema.metadata.metadataType
) RETURNS void AS '
    BEGIN
        IF requestedNumberOfIdentities > 0
        THEN
            INSERT INTO $anchor.capsule\.$anchor.name (
                $anchor.metadataColumnName
            )
            SELECT
                metadata
            FROM
                generate_series(1,requestedNumberOfIdentities);
        END IF;
    END;
' LANGUAGE plpgsql
;
~*/
        }
        else {
/*~
-- Key Generation Stored Procedure ------------------------------------------------------------------------------------
-- k$anchor.name identity by surrogate key generation stored procedure
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule\.k$anchor.name(
    requestedNumberOfIdentities bigint
) RETURNS void AS '
    BEGIN
        IF requestedNumberOfIdentities > 0
        THEN
            INSERT INTO $anchor.capsule\.$anchor.name (
                $anchor.dummyColumnName
            )
            SELECT
                null
            FROM
                generate_series(1,requestedNumberOfIdentities);
        END IF;
    END;
' LANGUAGE plpgsql
;
~*/
        }
    }
}