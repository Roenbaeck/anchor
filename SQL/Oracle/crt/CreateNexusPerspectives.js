/*~
-- NEXUS CRT PERSPECTIVES ---------------------------------------------------------------------------------------------
--
-- Oracle-compatible latest and now perspectives for CRT nexuses.
--
~*/
var nexus, role, knot, attribute;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
/*~
CREATE OR REPLACE VIEW ${nexus.capsule}$.l$nexus.name AS
SELECT
    n.$nexus.identityColumnName,
    $(schema.METADATA)? n.$nexus.metadataColumnName,
~*/
        while (role = nexus.nextRole && nexus.nextRole()) {
/*~
    n.$role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    r$attribute.mnemonic.$attribute.valueColumnName,
    $(attribute.isHistorized())? r$attribute.mnemonic.$attribute.changingColumnName,
    r$attribute.mnemonic.$attribute.positingColumnName,
    r$attribute.mnemonic.$attribute.positorColumnName,
    r$attribute.mnemonic.$attribute.reliabilityColumnName,
    r$attribute.mnemonic.$attribute.assertionColumnName,
    r$attribute.mnemonic.$attribute.reliableColumnName$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    ${nexus.capsule}$.$nexus.name n
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
LEFT JOIN
    ${attribute.capsule}$.r$attribute.name r$attribute.mnemonic
ON
    r$attribute.mnemonic.$attribute.entityReferenceName = n.$nexus.identityColumnName
~*/
        }
/*~
;

CREATE OR REPLACE VIEW ${nexus.capsule}$.n$nexus.name AS
SELECT
    *
FROM
    ${nexus.capsule}$.l$nexus.name
;

CREATE OR REPLACE FUNCTION ${nexus.capsule}$.t$nexus.name (
    positor $schema.metadata.positorRange,
    changingTimepoint $schema.metadata.chronon,
    positingTimepoint $schema.metadata.positingRange,
    assertion varchar2(4000)
)
RETURN varchar2 SQL_MACRO(TABLE)
IS
BEGIN
    RETURN q'[
        SELECT
            t.*
        FROM
            ${nexus.capsule}$.l$nexus.name t
        WHERE
            (
                positor IS NULL
                OR (
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
                    t.$attribute.positorColumnName = positor$(nexus.hasMoreAttributes())? OR
~*/
        }
/*~
                )
            )
        AND
            (
                assertion IS NULL
                OR (
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
                    t.$attribute.assertionColumnName = assertion$(nexus.hasMoreAttributes())? OR
~*/
        }
/*~
                )
            )
        AND
            (
                changingTimepoint IS NULL
                $(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes())? OR (
~*/
        while (attribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
/*~
                    t.$attribute.changingColumnName <= changingTimepoint$(nexus.hasMoreHistorizedAttributes())? OR
~*/
        }
/*~
                )
            )
        AND
            (
                positingTimepoint IS NULL
                OR (
~*/
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
                    t.$attribute.positingColumnName <= positingTimepoint$(nexus.hasMoreAttributes())? OR
~*/
        }
/*~
                )
            )
    ]';
END;
/

CREATE OR REPLACE FUNCTION ${nexus.capsule}$.p$nexus.name (
    changingTimepoint $schema.metadata.chronon
)
RETURN varchar2 SQL_MACRO(TABLE)
IS
BEGIN
    RETURN q'[
        SELECT
            t.*
        FROM
            ${nexus.capsule}$.l$nexus.name t
        WHERE
            (
                changingTimepoint IS NULL
                $(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes())? OR (
~*/
        while (attribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
/*~
                    t.$attribute.changingColumnName <= changingTimepoint$(nexus.hasMoreHistorizedAttributes())? OR
~*/
        }
/*~
            ) : OR 1 = 1
            )
    ]';
END;
/

CREATE OR REPLACE FUNCTION ${nexus.capsule}$.d$nexus.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection varchar2(4000)
)
RETURN varchar2 SQL_MACRO(TABLE)
IS
BEGIN
    RETURN q'[
        SELECT
            t.*
        FROM
            ${nexus.capsule}$.l$nexus.name t
        WHERE
            (
                intervalStart IS NULL
                OR intervalEnd IS NULL
                $(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes())? OR (
~*/
        while (attribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
/*~
                    t.$attribute.changingColumnName BETWEEN intervalStart AND intervalEnd$(nexus.hasMoreHistorizedAttributes())? OR
~*/
        }
/*~
                ) : OR 1 = 1
            )
    ]';
END;
/
    }
}
