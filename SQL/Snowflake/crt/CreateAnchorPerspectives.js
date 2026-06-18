/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- Snowflake-native CRT anchor perspectives: time traveling (t), latest (l), point-in-time (p),
-- now (n), and difference (d).
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
-- Time traveling perspective -----------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.t$anchor.name (
    positor $schema.metadata.positorRange,
    changingTimepoint $schema.metadata.chronon,
    positingTimepoint $schema.metadata.positingRange,
    assertion string
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
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.assertionColumnName string,
    $attribute.reliableColumnName int,
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
    ${attribute.mnemonic}$.$attribute.positorColumnName,
    ${attribute.mnemonic}$.$attribute.reliabilityColumnName,
    ${attribute.mnemonic}$.$attribute.assertionColumnName,
    ${attribute.mnemonic}$.$attribute.reliableColumnName,
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
        positor,
        $(attribute.isHistorized())? changingTimepoint::$attribute.timeRange,
        positingTimepoint::$schema.metadata.positingRange
    )) $attribute.mnemonic
ON
    ${attribute.mnemonic}$.$attribute.identityColumnName = (
        SELECT
            sub.$attribute.identityColumnName
        FROM
            TABLE(${attribute.capsule}$.r$attribute.name(
                positor,
                $(attribute.isHistorized())? changingTimepoint::$attribute.timeRange,
                positingTimepoint::$schema.metadata.positingRange
            )) sub
        WHERE
            sub.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName
        AND
            sub.$attribute.assertionColumnName = coalesce(assertion, sub.$attribute.assertionColumnName)
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

-- Latest perspective -------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${anchor.capsule}$.l$anchor.name AS
SELECT
    p.$schema.metadata.positorSuffix,
    $schema.metadata.reliableCutoff as $schema.metadata.reliabilitySuffix,
    $anchor.mnemonic.*
FROM
    ${schema.metadata.encapsulation}$._$schema.metadata.positorSuffix p
CROSS JOIN LATERAL
    TABLE(${anchor.capsule}$.t$anchor.name(
        p.$schema.metadata.positorSuffix,
        $schema.EOT::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange,
        '+'
    )) $anchor.mnemonic
;

-- Point-in-time perspective ------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.p$anchor.name (
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $schema.metadata.positorSuffix $schema.metadata.positorRange,
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
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.assertionColumnName string,
    $attribute.reliableColumnName int,
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
    p.$schema.metadata.positorSuffix,
    $schema.metadata.reliableCutoff as $schema.metadata.reliabilitySuffix,
    $anchor.mnemonic.*
FROM
    ${schema.metadata.encapsulation}$._$schema.metadata.positorSuffix p
CROSS JOIN LATERAL
    TABLE(${anchor.capsule}$.t$anchor.name(
        p.$schema.metadata.positorSuffix,
        changingTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange,
        '+'
    )) $anchor.mnemonic
$$$$
;

-- Now perspective ----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${anchor.capsule}$.n$anchor.name AS
SELECT
    p.$schema.metadata.positorSuffix,
    $schema.metadata.reliableCutoff as $schema.metadata.reliabilitySuffix,
    $anchor.mnemonic.*
FROM
    ${schema.metadata.encapsulation}$._$schema.metadata.positorSuffix p
CROSS JOIN LATERAL
    TABLE(${anchor.capsule}$.t$anchor.name(
        p.$schema.metadata.positorSuffix,
        $schema.metadata.now::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange,
        '+'
    )) $anchor.mnemonic
;
~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.d$anchor.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection string
)
RETURNS TABLE (
    $schema.metadata.positorSuffix $schema.metadata.positorRange,
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
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.assertionColumnName string,
    $attribute.reliableColumnName int,
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
    p.$schema.metadata.positorSuffix,
    timepoints.inspectedTimepoint,
    $anchor.mnemonic.*
FROM
    ${schema.metadata.encapsulation}$._$schema.metadata.positorSuffix p
JOIN
(
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.positorColumnName AS positor,
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
) timepoints
ON
    timepoints.positor = p.$schema.metadata.positorSuffix
CROSS JOIN LATERAL
    TABLE(${anchor.capsule}$.t$anchor.name(
        timepoints.positor,
        timepoints.inspectedTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange,
        '+'
    )) $anchor.mnemonic
WHERE
    ${anchor.mnemonic}$.$anchor.identityColumnName = timepoints.$anchor.identityColumnName
$$$$
;
~*/
        }
    }
}