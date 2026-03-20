/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- Snowflake-native anchor perspectives: latest (l), point-in-time (p), now (n), difference (d),
-- and their equivalence variants (el, ep, en, ed).
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${anchor.capsule}$.l$anchor.name AS
SELECT
    ${anchor.mnemonic}$.$anchor.identityColumnName,
    $(schema.METADATA)? ${anchor.mnemonic}$.$anchor.metadataColumnName,
~*/
        var attribute, knot;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? ${attribute.mnemonic}$.$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? k${attribute.mnemonic}$.$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? k${attribute.mnemonic}$.$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
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
            var attributeEquivalent = attribute.isEquivalent() && !attribute.isKnotted();
            if(attributeEquivalent) {
/*~
LEFT JOIN
    TABLE(${attribute.capsule}$.e$attribute.name(0)) $attribute.mnemonic
~*/
            }
            else {
/*~
LEFT JOIN
    ${attribute.capsule}$.$attribute.name $attribute.mnemonic
~*/
            }
/*~
ON
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName~*/
            if(attribute.isHistorized()) {
/*~
AND
    ${attribute.mnemonic}$.$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attributeEquivalent)? TABLE(${attribute.capsule}$.e$attribute.name(0)) sub : ${attribute.capsule}$.$attribute.name sub
        WHERE
            sub.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName
   )~*/
            }
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(0)) k$attribute.mnemonic
~*/
                }
                else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$attribute.mnemonic
~*/
                }
/*~
ON
    k${attribute.mnemonic}$.$knot.identityColumnName = ${attribute.mnemonic}$.$attribute.knotReferenceName~*/
            }
            if(!anchor.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~

-- Point-in-time perspective ------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.p$anchor.name (
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $(knot.isEquivalent())? $attribute.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
)
AS
$$
SELECT
    ${anchor.mnemonic}$.$anchor.identityColumnName,
    $(schema.METADATA)? ${anchor.mnemonic}$.$anchor.metadataColumnName,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? ${attribute.mnemonic}$.$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? k${attribute.mnemonic}$.$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? k${attribute.mnemonic}$.$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
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
            var historizedEquivalent = attribute.isEquivalent() && !attribute.isKnotted();
            if(attribute.isHistorized()) {
                if(historizedEquivalent) {
/*~
LEFT JOIN
    TABLE(${attribute.capsule}$.r$attribute.name(0, changingTimepoint::$attribute.timeRange)) $attribute.mnemonic
~*/
                }
                else {
/*~
LEFT JOIN
    TABLE(${attribute.capsule}$.r$attribute.name(changingTimepoint::$attribute.timeRange)) $attribute.mnemonic
~*/
                }
/*~
ON
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName
AND
    ${attribute.mnemonic}$.$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
~*/
                if(historizedEquivalent) {
/*~
            TABLE(${attribute.capsule}$.r$attribute.name(0, changingTimepoint::$attribute.timeRange)) sub
~*/
                }
                else {
/*~
            TABLE(${attribute.capsule}$.r$attribute.name(changingTimepoint::$attribute.timeRange)) sub
~*/
                }
/*~
        WHERE
            sub.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName
   )~*/
            }
            else {
                if(historizedEquivalent) {
/*~
LEFT JOIN
    TABLE(${attribute.capsule}$.e$attribute.name(0)) $attribute.mnemonic
~*/
                }
                else {
/*~
LEFT JOIN
    ${attribute.capsule}$.$attribute.name $attribute.mnemonic
~*/
                }
/*~
ON
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName~*/
            }
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(0)) k$attribute.mnemonic
~*/
                }
                else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$attribute.mnemonic
~*/
                }
/*~
ON
    k${attribute.mnemonic}$.$knot.identityColumnName = ${attribute.mnemonic}$.$attribute.knotReferenceName~*/
            }
            if(!anchor.hasMoreAttributes()) {
                /*~
$$
;
~*/
            }
        }
/*~

-- Now perspective ----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${anchor.capsule}$.n$anchor.name
AS
SELECT
    *
FROM
    TABLE(${anchor.capsule}$.p$anchor.name($schema.metadata.now::$schema.metadata.chronon))
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
    inspectedTimepoint $schema.metadata.chronon,
    mnemonic string,
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $(knot.isEquivalent())? $attribute.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$
SELECT
    timepoints.inspectedTimepoint,
    timepoints.mnemonic,
    p${anchor.mnemonic}$.*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
                var historizedEquivalentAttribute = attribute.isEquivalent() && !attribute.isKnotted();
/*~
    SELECT DISTINCT
        $attribute.entityReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName::$schema.metadata.chronon AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        $(historizedEquivalentAttribute)? TABLE(${attribute.capsule}$.e$attribute.name(0)) : ${attribute.capsule}$.$attribute.name
    WHERE
        (selection IS NULL OR selection LIKE '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN intervalStart AND intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) timepoints
CROSS JOIN LATERAL
    TABLE(${anchor.capsule}$.p$anchor.name(timepoints.inspectedTimepoint)) p$anchor.mnemonic
WHERE
    p${anchor.mnemonic}$.$anchor.identityColumnName = timepoints.$anchor.identityColumnName
$$
;
~*/
        }

        if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.el$anchor.name (
    equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE (
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $(knot.isEquivalent())? $attribute.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$
SELECT
    *
FROM
    TABLE(${anchor.capsule}$.ep$anchor.name(equivalent, $schema.metadata.now::$schema.metadata.chronon))
$$
;

-- Point-in-time equivalence perspective ------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.ep$anchor.name (
    equivalent $schema.metadata.equivalentRange,
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $(knot.isEquivalent())? $attribute.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$
SELECT
    ${anchor.mnemonic}$.$anchor.identityColumnName,
    $(schema.METADATA)? ${anchor.mnemonic}$.$anchor.metadataColumnName,
~*/
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? ${attribute.mnemonic}$.$attribute.equivalentColumnName,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? k${attribute.mnemonic}$.$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? k${attribute.mnemonic}$.$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
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
                var hasEquivalent = attribute.isEquivalent() && !attribute.isKnotted();
                if(attribute.isHistorized()) {
                    if(hasEquivalent) {
/*~
LEFT JOIN
    TABLE(${attribute.capsule}$.r$attribute.name(equivalent, changingTimepoint::$attribute.timeRange)) $attribute.mnemonic
~*/
                    }
                    else {
/*~
LEFT JOIN
    TABLE(${attribute.capsule}$.r$attribute.name(changingTimepoint::$attribute.timeRange)) $attribute.mnemonic
~*/
                    }
/*~
ON
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName
AND
    ${attribute.mnemonic}$.$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
~*/
                    if(hasEquivalent) {
/*~
            TABLE(${attribute.capsule}$.r$attribute.name(equivalent, changingTimepoint::$attribute.timeRange)) sub
~*/
                    }
                    else {
/*~
            TABLE(${attribute.capsule}$.r$attribute.name(changingTimepoint::$attribute.timeRange)) sub
~*/
                    }
/*~
        WHERE
            sub.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName
   )~*/
                }
                else {
                    if(hasEquivalent) {
/*~
LEFT JOIN
    TABLE(${attribute.capsule}$.e$attribute.name(equivalent)) $attribute.mnemonic
~*/
                    }
                    else {
/*~
LEFT JOIN
    ${attribute.capsule}$.$attribute.name $attribute.mnemonic
~*/
                    }
/*~
ON
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${anchor.mnemonic}$.$anchor.identityColumnName~*/
                }
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
                    if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(equivalent)) k$attribute.mnemonic
~*/
                    }
                    else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$attribute.mnemonic
~*/
                    }
/*~
ON
    k${attribute.mnemonic}$.$knot.identityColumnName = ${attribute.mnemonic}$.$attribute.knotReferenceName~*/
                }
                if(!anchor.hasMoreAttributes()) {
                    /*~
$$
;
~*/
                }
            }
/*~

-- Now equivalence perspective ----------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.en$anchor.name (
    equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE (
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $(knot.isEquivalent())? $attribute.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$
SELECT
    *
FROM
    TABLE(${anchor.capsule}$.ep$anchor.name(equivalent, $schema.metadata.now::$schema.metadata.chronon))
$$
;
~*/
            if(anchor.hasMoreHistorizedAttributes()) {
/*~

-- Difference equivalence perspective ---------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${anchor.capsule}$.ed$anchor.name (
    equivalent $schema.metadata.equivalentRange,
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection string
)
RETURNS TABLE (
    inspectedTimepoint $schema.metadata.chronon,
    mnemonic string,
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,
~*/
                while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                    if(attribute.isKnotted()) {
                        knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $(knot.isEquivalent())? $attribute.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                    }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(anchor.hasMoreAttributes())?,
~*/
                }
/*~
)
AS
$$
SELECT
    timepoints.inspectedTimepoint,
    timepoints.mnemonic,
    p${anchor.mnemonic}$.*
FROM (
~*/
                while (attribute = anchor.nextHistorizedAttribute()) {
                    var hasEquivalentHistorized = attribute.isEquivalent() && !attribute.isKnotted();
/*~
    SELECT DISTINCT
        $attribute.entityReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName::$schema.metadata.chronon AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        $(hasEquivalentHistorized)? TABLE(${attribute.capsule}$.e$attribute.name(equivalent)) : ${attribute.capsule}$.$attribute.name
    WHERE
        (selection IS NULL OR selection LIKE '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN intervalStart AND intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
                }
/*~
) timepoints
CROSS JOIN LATERAL
    TABLE(${anchor.capsule}$.ep$anchor.name(equivalent, timepoints.inspectedTimepoint)) p$anchor.mnemonic
WHERE
    p${anchor.mnemonic}$.$anchor.identityColumnName = timepoints.$anchor.identityColumnName
$$
;
~*/
            }
        }
    }
}
