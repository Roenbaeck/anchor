/*~
-- ANCHOR PERSPECTIVES ------------------------------------------------------------------------------------------------
--
-- Oracle latest (l) and now (n) perspectives.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
CREATE OR REPLACE VIEW ${anchor.capsule}$.l$anchor.name AS
SELECT
    ${anchor.mnemonic}$.$anchor.identityColumnName,
    $(schema.METADATA)? ${anchor.mnemonic}$.$anchor.metadataColumnName,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    k${attribute.mnemonic}$.$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? k${attribute.mnemonic}$.$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    ${attribute.mnemonic}$.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    ${anchor.capsule}$.$anchor.name $anchor.mnemonic
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
LEFT JOIN
    ${attribute.capsule}$.$attribute.name $attribute.mnemonic
ON
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$attribute.mnemonic
ON
    k${attribute.mnemonic}$.$knot.identityColumnName = ${attribute.mnemonic}$.$attribute.knotReferenceName~*/
            }
        }
/*~
WHERE
    1 = 1
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isHistorized()) {
/*~
AND (
    ${attribute.mnemonic}$.$attribute.changingColumnName = (
        SELECT
            MAX(sub.$attribute.changingColumnName)
        FROM
            ${attribute.capsule}$.$attribute.name sub
        WHERE
            sub.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName
    )
    OR ${attribute.mnemonic}$.$attribute.changingColumnName IS NULL
)
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
~*/
            }
        }
    }
    else {
/*~
CREATE OR REPLACE VIEW ${anchor.capsule}$.l$anchor.name AS
SELECT
    *
FROM
    ${anchor.capsule}$.$anchor.name $anchor.mnemonic
;

CREATE OR REPLACE VIEW ${anchor.capsule}$.n$anchor.name AS
SELECT
    *
FROM
    ${anchor.capsule}$.l$anchor.name
;
~*/
    }
}
