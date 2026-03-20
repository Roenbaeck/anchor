/*~
-- ANCHOR CRT PERSPECTIVES --------------------------------------------------------------------------------------------
--
-- Oracle-compatible latest and now perspectives for CRT anchors.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
CREATE OR REPLACE VIEW ${anchor.capsule}$.l$anchor.name AS
SELECT
    a.$anchor.identityColumnName,
    $(schema.METADATA)? a.$anchor.metadataColumnName,
~*/
        var attribute, knot;
        while (attribute = anchor.nextAttribute()) {
/*~
    r$attribute.mnemonic.$attribute.valueColumnName,
    $(attribute.isHistorized())? r$attribute.mnemonic.$attribute.changingColumnName,
    r$attribute.mnemonic.$attribute.positingColumnName,
    r$attribute.mnemonic.$attribute.positorColumnName,
    r$attribute.mnemonic.$attribute.reliabilityColumnName,
    r$attribute.mnemonic.$attribute.assertionColumnName,
    r$attribute.mnemonic.$attribute.reliableColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    ${anchor.capsule}$.$anchor.name a
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
LEFT JOIN
    ${attribute.capsule}$.r$attribute.name r$attribute.mnemonic
ON
    r$attribute.mnemonic.$attribute.entityReferenceName = a.$anchor.identityColumnName
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$attribute.mnemonic
ON
    k$attribute.mnemonic.$knot.identityColumnName = r$attribute.mnemonic.$attribute.knotReferenceName
~*/
            }
            if(!anchor.hasMoreAttributes()) {
/*~
;

CREATE OR REPLACE VIEW ${anchor.capsule}$.n$anchor.name AS
SELECT
    *
FROM
    ${anchor.capsule}$.l$anchor.name
;

CREATE OR REPLACE FUNCTION ${anchor.capsule}$.t$anchor.name (
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
            ${anchor.capsule}$.l$anchor.name t
        WHERE
            (
                positor IS NULL
                OR (
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
                    t.$attribute.positorColumnName = positor$(anchor.hasMoreAttributes())? OR
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
        while (attribute = anchor.nextAttribute()) {
/*~
                    t.$attribute.assertionColumnName = assertion$(anchor.hasMoreAttributes())? OR
~*/
        }
/*~
                )
            )
        AND
            (
                changingTimepoint IS NULL
                $(anchor.hasMoreHistorizedAttributes())? OR (
~*/
        while (attribute = anchor.nextHistorizedAttribute()) {
/*~
                    t.$attribute.changingColumnName <= changingTimepoint$(anchor.hasMoreHistorizedAttributes())? OR
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
        while (attribute = anchor.nextAttribute()) {
/*~
                    t.$attribute.positingColumnName <= positingTimepoint$(anchor.hasMoreAttributes())? OR
~*/
        }
/*~
                )
            )
    ]';
END;
/

CREATE OR REPLACE FUNCTION ${anchor.capsule}$.p$anchor.name (
    changingTimepoint $schema.metadata.chronon
)
RETURN varchar2 SQL_MACRO(TABLE)
IS
BEGIN
    RETURN q'[
        SELECT
            t.*
        FROM
            ${anchor.capsule}$.l$anchor.name t
        WHERE
            (
                changingTimepoint IS NULL
                $(anchor.hasMoreHistorizedAttributes())? OR (
~*/
        while (attribute = anchor.nextHistorizedAttribute()) {
/*~
                    t.$attribute.changingColumnName <= changingTimepoint$(anchor.hasMoreHistorizedAttributes())? OR
~*/
        }
/*~
            ) : OR 1 = 1
            )
    ]';
END;
/

CREATE OR REPLACE FUNCTION ${anchor.capsule}$.d$anchor.name (
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
            ${anchor.capsule}$.l$anchor.name t
        WHERE
            (
                intervalStart IS NULL
                OR intervalEnd IS NULL
                $(anchor.hasMoreHistorizedAttributes())? OR (
~*/
        while (attribute = anchor.nextHistorizedAttribute()) {
/*~
                    t.$attribute.changingColumnName BETWEEN intervalStart AND intervalEnd$(anchor.hasMoreHistorizedAttributes())? OR
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
    }
}