/*~
-- TIE TEMPORAL PERSPECTIVES ------------------------------------------------------------------------------------------
--
-- Snowflake-native CRT tie perspectives: time traveling (t), latest (l), point-in-time (p),
-- now (n), and difference (d).
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
    if(tie.hasMoreRoles()) { // only do perspectives if there are roles
/*~
-- Time traveling perspective -----------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.t$tie.name (
    positor $schema.metadata.positorRange,
    changingTimepoint $schema.metadata.chronon,
    positingTimepoint $schema.metadata.positingRange,
    assertion string
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
~*/
        while (role = tie.nextRole()) {
            var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
        }
/*~
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
)
AS
$$$$
SELECT
    $(schema.METADATA)? t.$tie.metadataColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? k${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    k${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? k${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    t.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
    $(tie.isHistorized())? t.$tie.changingColumnName,
    t.$tie.positingColumnName,
    t.$tie.positorColumnName,
    t.$tie.reliabilityColumnName,
    t.$tie.assertionColumnName,
    t.$tie.reliableColumnName
FROM
    TABLE(${tie.capsule}$.r$tie.name(
        positor,
        $(tie.isHistorized())? changingTimepoint::$tie.timeRange,
        positingTimepoint::$schema.metadata.positingRange
    )) t
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$role.name
ON
    k${role.name}$.$knot.identityColumnName = t.$role.columnName
~*/
        }
/*~
WHERE
    t.$tie.assertionColumnName = coalesce(assertion, t.$tie.assertionColumnName)
$$$$
;

-- Latest perspective -------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${tie.capsule}$.l$tie.name AS
SELECT
    p.$schema.metadata.positorSuffix,
    $schema.metadata.reliableCutoff AS $schema.metadata.reliabilitySuffix,
    t.*
FROM
    ${schema.metadata.encapsulation}$._$schema.metadata.positorSuffix p
CROSS JOIN LATERAL
    TABLE(${tie.capsule}$.t$tie.name(
        p.$schema.metadata.positorSuffix,
        $schema.EOT::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange,
        '+'
    )) t
;

-- Point-in-time perspective ------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.p$tie.name (
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $schema.metadata.positorSuffix $schema.metadata.positorRange,
    $schema.metadata.reliabilitySuffix $schema.metadata.reliabilityRange,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
~*/
        while (role = tie.nextRole()) {
            var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
        }
/*~
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
)
AS
$$$$
SELECT
    p.$schema.metadata.positorSuffix,
    $schema.metadata.reliableCutoff AS $schema.metadata.reliabilitySuffix,
    $(schema.METADATA)? t.$tie.metadataColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? t.$role.knotChecksumColumnName,
    t.$role.knotValueColumnName,
    $(schema.METADATA)? t.$role.knotMetadataColumnName,
~*/
            }
/*~
    t.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
    $(tie.isHistorized())? t.$tie.changingColumnName,
    t.$tie.positingColumnName,
    t.$tie.positorColumnName,
    t.$tie.reliabilityColumnName,
    t.$tie.assertionColumnName,
    t.$tie.reliableColumnName
FROM
    ${schema.metadata.encapsulation}$._$schema.metadata.positorSuffix p
CROSS JOIN LATERAL
    TABLE(${tie.capsule}$.t$tie.name(
        p.$schema.metadata.positorSuffix,
        changingTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange,
        '+'
    )) t
$$$$
;

-- Now perspective ----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${tie.capsule}$.n$tie.name AS
SELECT
    p.$schema.metadata.positorSuffix,
    $schema.metadata.reliableCutoff AS $schema.metadata.reliabilitySuffix,
    t.*
FROM
    ${schema.metadata.encapsulation}$._$schema.metadata.positorSuffix p
CROSS JOIN LATERAL
    TABLE(${tie.capsule}$.t$tie.name(
        p.$schema.metadata.positorSuffix,
        $schema.metadata.now::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange,
        '+'
    )) t
;
~*/
        if(tie.isHistorized()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.d$tie.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon
)
RETURNS TABLE (
    $schema.metadata.positorSuffix $schema.metadata.positorRange,
    inspectedTimepoint $schema.metadata.chronon,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
~*/
            while (role = tie.nextRole()) {
                var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
            }
/*~
    $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
)
AS
$$$$
SELECT
    p.$schema.metadata.positorSuffix,
    tp.inspectedTimepoint,
    $(schema.METADATA)? t.$tie.metadataColumnName,
~*/
            while (role = tie.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? t.$role.knotChecksumColumnName,
    t.$role.knotValueColumnName,
    $(schema.METADATA)? t.$role.knotMetadataColumnName,
~*/
                }
/*~
    t.$role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
    t.$tie.changingColumnName,
    t.$tie.positingColumnName,
    t.$tie.positorColumnName,
    t.$tie.reliabilityColumnName,
    t.$tie.assertionColumnName,
    t.$tie.reliableColumnName
FROM
    ${schema.metadata.encapsulation}$._$schema.metadata.positorSuffix p
JOIN (
    SELECT DISTINCT
        $tie.positorColumnName AS positor,
        $tie.changingColumnName::$schema.metadata.chronon AS inspectedTimepoint
    FROM
        ${tie.capsule}$.$tie.positName
    WHERE
        $tie.changingColumnName BETWEEN intervalStart AND intervalEnd
) tp
ON
    tp.positor = p.$schema.metadata.positorSuffix
CROSS JOIN LATERAL
    TABLE(${tie.capsule}$.t$tie.name(
        tp.positor,
        tp.inspectedTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange,
        '+'
    )) t
$$$$
;
~*/
        }
    }
}
