/*~
-- NEXUS TEMPORAL PERSPECTIVES ----------------------------------------------------------------------------------------
--
-- Snowflake-native nexus perspectives: latest (l), point-in-time (p), now (n), difference (d),
-- and equivalence variants (el, ep, en, ed).
--
~*/
var nexus, role, knot;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) {
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${nexus.capsule}$.l$nexus.name AS
SELECT
    ${nexus.mnemonic}$.$nexus.identityColumnName,
    $(schema.METADATA)? ${nexus.mnemonic}$.$nexus.metadataColumnName,
~*/
        var attribute, historizedAttribute;
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    ${nexus.mnemonic}$.$role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? ${attribute.mnemonic}$.$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
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
    ${attribute.mnemonic}$.$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    ${nexus.capsule}$.$nexus.name $nexus.mnemonic
~*/
        while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
            knot = role.knot;
            if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(0)) $role.name
~*/
            }
            else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
            }
/*~
ON
    ${role.name}$.$knot.identityColumnName = ${nexus.mnemonic}$.$role.columnName
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
            var hasEquivalent = attribute.isEquivalent && attribute.isEquivalent() && !(attribute.isKnotted && attribute.isKnotted());
            if(hasEquivalent) {
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
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName~*/
            if(attribute.isHistorized && attribute.isHistorized()) {
/*~
AND
    ${attribute.mnemonic}$.$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(hasEquivalent)? TABLE(${attribute.capsule}$.e$attribute.name(0)) sub : ${attribute.capsule}$.$attribute.name sub
        WHERE
            sub.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName
   )~*/
            }
            if(attribute.isKnotted && attribute.isKnotted()) {
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
            if(!nexus.hasMoreAttributes()) {
                /*~;~*/
            }
        }

/*~
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${nexus.capsule}$.p$nexus.name (
    changingTimepoint $schema.metadata.chronon
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
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
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
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
)
AS
$$$$
SELECT
    ${nexus.mnemonic}$.$nexus.identityColumnName,
    $(schema.METADATA)? ${nexus.mnemonic}$.$nexus.metadataColumnName,
~*/
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    ${nexus.mnemonic}$.$role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? ${attribute.mnemonic}$.$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
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
    ${attribute.mnemonic}$.$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    ${nexus.capsule}$.$nexus.name $nexus.mnemonic
~*/
        while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
            knot = role.knot;
            if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(0)) $role.name
~*/
            }
            else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
            }
/*~
ON
    ${role.name}$.$knot.identityColumnName = ${nexus.mnemonic}$.$role.columnName
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
            var equivalentHistorized = attribute.isEquivalent && attribute.isEquivalent() && !(attribute.isKnotted && attribute.isKnotted());
            if(attribute.isHistorized && attribute.isHistorized()) {
                if(equivalentHistorized) {
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
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName
AND
    ${attribute.mnemonic}$.$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
~*/
                if(equivalentHistorized) {
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
            sub.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName
   )~*/
            }
            else {
                if(equivalentHistorized) {
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
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName~*/
            }
            if(attribute.isKnotted && attribute.isKnotted()) {
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
            if(!nexus.hasMoreAttributes()) {
                /*~
$$$$
;
~*/
            }
        }
/*~

-- Now perspective ----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${nexus.capsule}$.n$nexus.name AS
SELECT
    *
FROM
    TABLE(${nexus.capsule}$.p$nexus.name($schema.metadata.now::$schema.metadata.chronon))
;
~*/
        if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${nexus.capsule}$.d$nexus.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection string
)
RETURNS TABLE (
    inspectedTimepoint $schema.metadata.chronon,
    mnemonic string,
    $nexus.identityColumnName $nexus.identity,
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType,
~*/
            while (role = nexus.nextRole && nexus.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
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
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$$$
~*/
            while (historizedAttribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
                var hasEqHist = historizedAttribute.isEquivalent && historizedAttribute.isEquivalent() && !(historizedAttribute.isKnotted && historizedAttribute.isKnotted());
/*~
SELECT DISTINCT
    h${historizedAttribute.mnemonic}$.$historizedAttribute.changingColumnName::$schema.metadata.chronon AS inspectedTimepoint,
    '$historizedAttribute.mnemonic' AS mnemonic,
    p${nexus.mnemonic}$.$nexus.identityColumnName,
    $(schema.METADATA)? p${nexus.mnemonic}$.$nexus.metadataColumnName,
~*/
                while (role = nexus.nextRole && nexus.nextRole()) {
                    if(role.knot) {
                        knot = role.knot;
/*~
    $(knot.hasChecksum())? p${nexus.mnemonic}$.$role.knotChecksumColumnName,
    p${nexus.mnemonic}$.$role.knotValueColumnName,
    $(knot.isEquivalent())? p${nexus.mnemonic}$.$role.knotEquivalentColumnName,
    $(schema.METADATA)? p${nexus.mnemonic}$.$role.knotMetadataColumnName,
~*/
                    }
/*~
    p${nexus.mnemonic}$.$role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
                }
                while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? p${nexus.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? p${nexus.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? p${nexus.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? p${nexus.mnemonic}$.$attribute.equivalentColumnName,
~*/
                    if(attribute.isKnotted && attribute.isKnotted()) {
                        knot = attribute.knot;
/*~
    $(knot.hasChecksum())? p${nexus.mnemonic}$.$attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? p${nexus.mnemonic}$.$attribute.knotEquivalentColumnName,
    p${nexus.mnemonic}$.$attribute.knotValueColumnName,
    $(schema.METADATA)? p${nexus.mnemonic}$.$attribute.knotMetadataColumnName,
~*/
                    }
/*~
    $(attribute.hasChecksum())? p${nexus.mnemonic}$.$attribute.checksumColumnName,
    p${nexus.mnemonic}$.$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
                }
/*~
FROM
    $(hasEqHist)? TABLE(${historizedAttribute.capsule}$.e$historizedAttribute.name(0)) h$historizedAttribute.mnemonic : ${historizedAttribute.capsule}$.$historizedAttribute.name h$historizedAttribute.mnemonic,
    TABLE(${nexus.capsule}$.p$nexus.name(h${historizedAttribute.mnemonic}$.$historizedAttribute.changingColumnName::$schema.metadata.chronon)) p$nexus.mnemonic
WHERE
    (selection IS NULL OR selection LIKE '%$historizedAttribute.mnemonic%')
AND
    h${historizedAttribute.mnemonic}$.$historizedAttribute.changingColumnName BETWEEN intervalStart AND intervalEnd
AND
    p${nexus.mnemonic}$.$nexus.identityColumnName = h${historizedAttribute.mnemonic}$.$historizedAttribute.entityReferenceName
$(nexus.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
$$$$
;
~*/
        }

        if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${nexus.capsule}$.el$nexus.name (
    equivalent $schema.metadata.equivalentRange
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
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
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
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$$$
SELECT
    ${nexus.mnemonic}$.$nexus.identityColumnName,
    $(schema.METADATA)? ${nexus.mnemonic}$.$nexus.metadataColumnName,
~*/
            while (role = nexus.nextRole && nexus.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
                }
/*~
    ${nexus.mnemonic}$.$role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? ${attribute.mnemonic}$.$attribute.equivalentColumnName,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
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
    ${attribute.mnemonic}$.$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
            }
/*~
FROM
    ${nexus.capsule}$.$nexus.name $nexus.mnemonic
~*/
            while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
                knot = role.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(equivalent)) $role.name
~*/
                }
                else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
                }
/*~
ON
    ${role.name}$.$knot.identityColumnName = ${nexus.mnemonic}$.$role.columnName
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
                var hasEquivalent = attribute.isEquivalent && attribute.isEquivalent() && !(attribute.isKnotted && attribute.isKnotted());
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
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName~*/
                if(attribute.isHistorized && attribute.isHistorized()) {
/*~
AND
    ${attribute.mnemonic}$.$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(hasEquivalent)? TABLE(${attribute.capsule}$.e$attribute.name(equivalent)) sub : ${attribute.capsule}$.$attribute.name sub
        WHERE
            sub.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName
   )~*/
                }
                if(attribute.isKnotted && attribute.isKnotted()) {
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
                if(!nexus.hasMoreAttributes()) {
                    /*~
$$$$
;
~*/
                }
            }

/*~
-- Point-in-time equivalence perspective ------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${nexus.capsule}$.ep$nexus.name (
    equivalent $schema.metadata.equivalentRange,
    changingTimepoint $schema.metadata.chronon
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
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
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
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$$$
SELECT
    ${nexus.mnemonic}$.$nexus.identityColumnName,
    $(schema.METADATA)? ${nexus.mnemonic}$.$nexus.metadataColumnName,
~*/
            while (role = nexus.nextRole && nexus.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
                }
/*~
    ${nexus.mnemonic}$.$role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? ${attribute.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? ${attribute.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? ${attribute.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? ${attribute.mnemonic}$.$attribute.equivalentColumnName,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
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
    ${attribute.mnemonic}$.$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
            }
/*~
FROM
    ${nexus.capsule}$.$nexus.name $nexus.mnemonic
~*/
            while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
                knot = role.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(equivalent)) $role.name
~*/
                }
                else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
                }
/*~
ON
    ${role.name}$.$knot.identityColumnName = ${nexus.mnemonic}$.$role.columnName
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
                var hasEquivalentHistorized = attribute.isEquivalent && attribute.isEquivalent() && !(attribute.isKnotted && attribute.isKnotted());
                if(attribute.isHistorized && attribute.isHistorized()) {
                    if(hasEquivalentHistorized) {
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
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName
AND
    ${attribute.mnemonic}$.$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
~*/
                    if(hasEquivalentHistorized) {
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
            sub.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName
   )~*/
                }
                else {
                    if(hasEquivalentHistorized) {
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
    ${attribute.mnemonic}$.$attribute.entityReferenceName = ${nexus.mnemonic}$.$nexus.identityColumnName~*/
                }
                if(attribute.isKnotted && attribute.isKnotted()) {
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
                if(!nexus.hasMoreAttributes()) {
                    /*~
$$$$
;
~*/
                }
            }

/*~
-- Now equivalence perspective ----------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${nexus.capsule}$.en$nexus.name (
    equivalent $schema.metadata.equivalentRange
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
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
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
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
            }
/*~
)
AS
$$$$
SELECT
    *
FROM
    TABLE(${nexus.capsule}$.ep$nexus.name(equivalent, $schema.metadata.now::$schema.metadata.chronon))
$$$$
;
~*/
            if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
-- Difference equivalence perspective ---------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${nexus.capsule}$.ed$nexus.name (
    equivalent $schema.metadata.equivalentRange,
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection string
)
RETURNS TABLE (
    inspectedTimepoint $schema.metadata.chronon,
    mnemonic string,
    $nexus.identityColumnName $nexus.identity,
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType,
~*/
                while (role = nexus.nextRole && nexus.nextRole()) {
                    if(role.knot) {
                        knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                    }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
                }
                while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.entityReferenceName $nexus.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
                    if(attribute.isKnotted && attribute.isKnotted()) {
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
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity : $attribute.dataRange$(nexus.hasMoreAttributes())?,
~*/
                }
/*~
)
AS
$$$$
~*/
                while (historizedAttribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
                    var hasEquivalentInDiff = historizedAttribute.isEquivalent && historizedAttribute.isEquivalent() && !(historizedAttribute.isKnotted && historizedAttribute.isKnotted());
/*~
SELECT DISTINCT
    h${historizedAttribute.mnemonic}$.$historizedAttribute.changingColumnName::$schema.metadata.chronon AS inspectedTimepoint,
    '$historizedAttribute.mnemonic' AS mnemonic,
    p${nexus.mnemonic}$.$nexus.identityColumnName,
    $(schema.METADATA)? p${nexus.mnemonic}$.$nexus.metadataColumnName,
~*/
                    while (role = nexus.nextRole && nexus.nextRole()) {
                        if(role.knot) {
                            knot = role.knot;
/*~
    $(knot.hasChecksum())? p${nexus.mnemonic}$.$role.knotChecksumColumnName,
    p${nexus.mnemonic}$.$role.knotValueColumnName,
    $(knot.isEquivalent())? p${nexus.mnemonic}$.$role.knotEquivalentColumnName,
    $(schema.METADATA)? p${nexus.mnemonic}$.$role.knotMetadataColumnName,
~*/
                        }
/*~
    p${nexus.mnemonic}$.$role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreAttributes())?,
~*/
                    }
                    while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? p${nexus.mnemonic}$.$attribute.entityReferenceName,
    $(schema.METADATA)? p${nexus.mnemonic}$.$attribute.metadataColumnName,
    $(attribute.timeRange)? p${nexus.mnemonic}$.$attribute.changingColumnName,
    $(attribute.isEquivalent())? p${nexus.mnemonic}$.$attribute.equivalentColumnName,
~*/
                        if(attribute.isKnotted && attribute.isKnotted()) {
                            knot = attribute.knot;
/*~
    $(knot.hasChecksum())? p${nexus.mnemonic}$.$attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? p${nexus.mnemonic}$.$attribute.knotEquivalentColumnName,
    p${nexus.mnemonic}$.$attribute.knotValueColumnName,
    $(schema.METADATA)? p${nexus.mnemonic}$.$attribute.knotMetadataColumnName,
~*/
                        }
/*~
    $(attribute.hasChecksum())? p${nexus.mnemonic}$.$attribute.checksumColumnName,
    p${nexus.mnemonic}$.$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
                    }
/*~
FROM
    $(hasEquivalentInDiff)? TABLE(${historizedAttribute.capsule}$.e$historizedAttribute.name(equivalent)) h$historizedAttribute.mnemonic : ${historizedAttribute.capsule}$.$historizedAttribute.name h$historizedAttribute.mnemonic,
    TABLE(${nexus.capsule}$.ep$nexus.name(equivalent, h${historizedAttribute.mnemonic}$.$historizedAttribute.changingColumnName::$schema.metadata.chronon)) p$nexus.mnemonic
WHERE
    (selection IS NULL OR selection LIKE '%$historizedAttribute.mnemonic%')
AND
    h${historizedAttribute.mnemonic}$.$historizedAttribute.changingColumnName BETWEEN intervalStart AND intervalEnd
AND
    p${nexus.mnemonic}$.$nexus.identityColumnName = h${historizedAttribute.mnemonic}$.$historizedAttribute.entityReferenceName
$(nexus.hasMoreHistorizedAttributes())? UNION
~*/
                }
/*~
$$$$
;
~*/
            }
        }

    }
}
