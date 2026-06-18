/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- Snowflake-native BI anchor perspectives: time traveling (t), latest (l), point-in-time (p),
-- now (n), and difference (d).
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.t$anchor.name (
    changingTimepoint $schema.metadata.chronon,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
~*/
            if(attribute.isKnotted()) {
/*~
    $attribute.valueColumnName $knot.identity$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    $attribute.valueColumnName $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
)
AS
$$$$
SELECT
    ${anchor.mnemonic}$.$anchor.identityColumnName,
    $(schema.METADATA)? ${anchor.mnemonic}$.$anchor.metadataColumnName,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    ${attribute.mnemonic}$.$attribute.identityColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    ${attribute.mnemonic}$.$attribute.positingColumnName,
    ${attribute.mnemonic}$.$attribute.reliabilityColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? k${attribute.mnemonic}$.$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    k${attribute.mnemonic}$.$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? k${attribute.mnemonic}$.$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? ${attribute.mnemonic}$.$attribute.checksumColumnName,
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
    TABLE(${attribute.capsule}$.r$attribute.name(
        $(attribute.isHistorized())? changingTimepoint::$attribute.timeRange,
        positingTimepoint::$schema.metadata.positingRange
    )) $attribute.mnemonic
ON
    ${attribute.mnemonic}$.$attribute.identityColumnName = (
        SELECT
            sub.$attribute.identityColumnName
        FROM
            TABLE(${attribute.capsule}$.r$attribute.name(
                $(attribute.isHistorized())? changingTimepoint::$attribute.timeRange,
                positingTimepoint::$schema.metadata.positingRange
            )) sub
        WHERE
            sub.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName
        AND
            sub.$attribute.reliabilityColumnName = 1
        ORDER BY
            $(attribute.isHistorized())? sub.$attribute.changingColumnName DESC,
            sub.$attribute.positingColumnName DESC
        LIMIT 1
    )~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$attribute.mnemonic
ON
    k${attribute.mnemonic}$.$knot.identityColumnName = ${attribute.mnemonic}$.$attribute.knotReferenceName~*/
            }
            if(!anchor.hasMoreAttributes()) {
                /*~
$$$$
;
~*/
            }
        }
/*~

CREATE OR REPLACE VIEW ${anchor.capsule}$.l$anchor.name AS
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    $anchor.mnemonic.*
FROM
    TABLE(${anchor.capsule}$.t$anchor.name(
        $schema.EOT::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) $anchor.mnemonic
;

CREATE OR REPLACE FUNCTION ${anchor.capsule}$.p$anchor.name (
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $schema.metadata.reliabilitySuffix $schema.metadata.reliabilityRange,
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
~*/
            if(attribute.isKnotted()) {
/*~
    $attribute.valueColumnName $knot.identity$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    $attribute.valueColumnName $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
)
AS
$$$$
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    $anchor.mnemonic.*
FROM
    TABLE(${anchor.capsule}$.t$anchor.name(
        changingTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) $anchor.mnemonic
$$$$
;

CREATE OR REPLACE VIEW ${anchor.capsule}$.n$anchor.name AS
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    $anchor.mnemonic.*
FROM
    TABLE(${anchor.capsule}$.t$anchor.name(
        $schema.metadata.now::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) $anchor.mnemonic
;
~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.d$anchor.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection string
)
RETURNS TABLE (
    inspectedTimepoint $schema.metadata.chronon,
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
~*/
                if(attribute.isKnotted()) {
/*~
    $attribute.valueColumnName $knot.identity$(anchor.hasMoreAttributes())?,
~*/
                }
                else {
/*~
    $attribute.valueColumnName $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
                }
            }
/*~
)
AS
$$$$
SELECT
    tp.inspectedTimepoint,
    $anchor.mnemonic.*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.entityReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName::$schema.metadata.chronon AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        ${attribute.capsule}$.$attribute.name
    WHERE
        (selection IS NULL OR selection LIKE '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN intervalStart AND intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) tp
CROSS JOIN LATERAL
    TABLE(${anchor.capsule}$.t$anchor.name(
        tp.inspectedTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) $anchor.mnemonic
WHERE
    ${anchor.mnemonic}$.$anchor.identityColumnName = tp.$anchor.identityColumnName
$$$$
;
~*/
        }
    }
}
