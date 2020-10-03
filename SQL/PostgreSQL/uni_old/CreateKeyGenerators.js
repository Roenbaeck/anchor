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
--DROP FUNCTION IF EXISTS $anchor.capsule\.k$anchor.name(
--    bigint,
--    $schema.metadata.metadataType
--);

CREATE OR REPLACE FUNCTION $anchor.capsule\.k$anchor.name(
    requestedNumberOfIdentities bigint,
    metadata $schema.metadata.metadataType
) RETURNS void AS '
    BEGIN
        IF requestedNumberOfIdentities > 0
        THEN
            WITH RECURSIVE idGenerator (idNumber) AS (
                SELECT
                    1
                UNION ALL
                SELECT
                    idNumber + 1
                FROM
                    idGenerator
                WHERE
                    idNumber < requestedNumberOfIdentities
            )
            INSERT INTO $anchor.capsule\.$anchor.name (
                $anchor.metadataColumnName
            )
            SELECT
                metadata
            FROM
                idGenerator;
        END IF;
    END;
' LANGUAGE plpgsql;
~*/
        }
        else {
/*~
-- Key Generation Stored Procedure ------------------------------------------------------------------------------------
-- k$anchor.name identity by surrogate key generation stored procedure
-----------------------------------------------------------------------------------------------------------------------
--DROP FUNCTION IF EXISTS $anchor.capsule\.k$anchor.name(
--    bigint
--);

CREATE OR REPLACE FUNCTION $anchor.capsule\.k$anchor.name(
    requestedNumberOfIdentities bigint
) RETURNS void AS '
    BEGIN
        IF requestedNumberOfIdentities > 0
        THEN
            WITH RECURSIVE idGenerator (idNumber) AS (
                SELECT
                    1
                UNION ALL
                SELECT
                    idNumber + 1
                FROM
                    idGenerator
                WHERE
                    idNumber < requestedNumberOfIdentities
            )
            INSERT INTO $anchor.capsule\.$anchor.name (
                $anchor.dummyColumnName
            )
            SELECT
                null
            FROM
                idGenerator;
        END IF;
    END;
' LANGUAGE plpgsql;
~*/
        }
    }
}