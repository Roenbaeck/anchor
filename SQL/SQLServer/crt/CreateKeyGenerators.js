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
        if(METADATA) {
/*~
-- Key Generation Stored Procedure ------------------------------------------------------------------------------------
-- k$anchor.name identity by surrogate key generation stored procedure
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('k$anchor.name', 'P') IS NULL
BEGIN
    EXEC('
    CREATE PROCEDURE [$anchor.capsule].[k$anchor.name] (
        @requestedNumberOfIdentities bigint,
        @metadata $schema.metadataType
    ) AS
    BEGIN
        SET NOCOUNT ON;
        IF @requestedNumberOfIdentities > 0
        BEGIN
            WITH idGenerator (idNumber) AS (
                SELECT
                    1
                UNION ALL
                SELECT
                    idNumber + 1
                FROM
                    idGenerator
                WHERE
                    idNumber < @requestedNumberOfIdentities
            )
            INSERT INTO [$anchor.capsule].[$anchor.name] (
                $anchor.metadataColumnName
            )
            OUTPUT
                inserted.$anchor.identityColumnName
            SELECT
                @metadata
            FROM
                idGenerator
            OPTION (maxrecursion 0);
        END
    END
    ');
END
GO
~*/
        }
        else {
/*~
-- Key Generation Stored Procedure ------------------------------------------------------------------------------------
-- k$anchor.name identity by surrogate key generation stored procedure
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('k$anchor.name', 'P') IS NULL
BEGIN
    EXEC('
    CREATE PROCEDURE [$anchor.capsule].[k$anchor.name] (
        @requestedNumberOfIdentities bigint
    ) AS
    BEGIN
        SET NOCOUNT ON;
        IF @requestedNumberOfIdentities > 0
        BEGIN
            WITH idGenerator (idNumber) AS (
                SELECT
                    1
                UNION ALL
                SELECT
                    idNumber + 1
                FROM
                    idGenerator
                WHERE
                    idNumber > @requestedNumberOfIdentities
            )
            INSERT INTO [$anchor.capsule].[$anchor.name] (
                $anchor.dummyColumnName
            )
            OUTPUT
                inserted.$anchor.identityColumnName
            SELECT
                null
            FROM
                idGenerator
            OPTION (maxrecursion 0);
        END
    END
    ');
END
GO
~*/
        }
    }
}