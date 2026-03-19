/*~
-- NEXUS TEMPORAL PERSPECTIVES ----------------------------------------------------------------------------------------
--
-- Snowflake-native BI nexus perspectives: time traveling (t), latest (l), point-in-time (p),
-- now (n), and difference (d).
--
~*/
var nexus, role, knot, attribute;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
/*~
CREATE OR REPLACE FUNCTION ${nexus.capsule}$.t$nexus.name (
    changingTimepoint $schema.metadata.chronon,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $nexus.identityColumnName $nexus.identity,
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType,
~*/
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
)
AS
$$
SELECT
    ${nexus.mnemonic}$.$nexus.identityColumnName,
    $(schema.METADATA)? ${nexus.mnemonic}$.$nexus.metadataColumnName,
~*/
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? k${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    k${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? k${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    ${nexus.mnemonic}$.$role.columnName$(nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    ${attribute.mnemonic}$.$attribute.identityColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    ${attribute.mnemonic}$.$attribute.positingColumnName,
    ${attribute.mnemonic}$.$attribute.reliabilityColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? k${attribute.mnemonic}$.$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    k${attribute.mnemonic}$.$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? k${attribute.mnemonic}$.$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? ${attribute.mnemonic}$.$attribute.checksumColumnName,
    ${attribute.mnemonic}$.$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    ${nexus.capsule}$.$nexus.name $nexus.mnemonic
~*/
        while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
            knot = role.knot;
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$role.name
ON
    k${role.name}$.$knot.identityColumnName = ${nexus.mnemonic}$.$role.columnName
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
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
            sub.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName
        AND
            sub.$attribute.reliabilityColumnName = 1
        ORDER BY
            $(attribute.isHistorized())? sub.$attribute.changingColumnName DESC,
            sub.$attribute.positingColumnName DESC
        LIMIT 1
    )~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$attribute.mnemonic
ON
    k${attribute.mnemonic}$.$knot.identityColumnName = ${attribute.mnemonic}$.$attribute.knotReferenceName~*/
            }
            if(!(nexus.hasMoreAttributes && nexus.hasMoreAttributes())) {
                /*~
$$
;
~*/
            }
        }
/*~

CREATE OR REPLACE VIEW ${nexus.capsule}$.l$nexus.name AS
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    $nexus.mnemonic.*
FROM
    TABLE(${nexus.capsule}$.t$nexus.name(
        $schema.EOT::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) $nexus.mnemonic
;

CREATE OR REPLACE FUNCTION ${nexus.capsule}$.p$nexus.name (
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $schema.metadata.reliabilitySuffix $schema.metadata.reliabilityRange,
    $nexus.identityColumnName $nexus.identity,
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType,
~*/
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
)
AS
$$
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    $nexus.mnemonic.*
FROM
    TABLE(${nexus.capsule}$.t$nexus.name(
        changingTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) $nexus.mnemonic
$$
;

CREATE OR REPLACE VIEW ${nexus.capsule}$.n$nexus.name AS
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    $nexus.mnemonic.*
FROM
    TABLE(${nexus.capsule}$.t$nexus.name(
        $schema.metadata.now::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) $nexus.mnemonic
;
~*/
        if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
CREATE OR REPLACE FUNCTION ${nexus.capsule}$.d$nexus.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection string
)
RETURNS TABLE (
    inspectedTimepoint $schema.metadata.chronon,
    $nexus.identityColumnName $nexus.identity,
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType,
~*/
            while (role = nexus.nextRole && nexus.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreAttributes())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName numeric(19,0),
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$
SELECT
    tp.inspectedTimepoint,
    $nexus.mnemonic.*
FROM (
~*/
            while (attribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.entityReferenceName AS $nexus.identityColumnName,
        $attribute.changingColumnName::$schema.metadata.chronon AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        ${attribute.capsule}$.$attribute.name
    WHERE
        (selection IS NULL OR selection LIKE '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN intervalStart AND intervalEnd
    $(nexus.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) tp
CROSS JOIN LATERAL
    TABLE(${nexus.capsule}$.t$nexus.name(
        tp.inspectedTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) $nexus.mnemonic
WHERE
    ${nexus.mnemonic}$.$nexus.identityColumnName = tp.$nexus.identityColumnName
$$
;
~*/
        }
    }
}
