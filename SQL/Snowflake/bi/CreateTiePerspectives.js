/*~
-- TIE TEMPORAL PERSPECTIVES ------------------------------------------------------------------------------------------
--
-- Snowflake-native BI tie perspectives: time traveling (t), latest (l), point-in-time (p),
-- now (n), and difference (d).
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
CREATE OR REPLACE FUNCTION ${tie.capsule}$.t$tie.name (
    changingTimepoint $schema.metadata.chronon,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $tie.identityColumnName $tie.identity,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
        }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(tie.hasMoreRoles())?,
~*/
    }
/*~
)
AS
$$$$
SELECT
    t.$tie.identityColumnName,
    $(schema.METADATA)? t.$tie.metadataColumnName,
    $(tie.isHistorized())? t.$tie.changingColumnName,
    t.$tie.positingColumnName,
    t.$tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
    k${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? k${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
        }
/*~
    t.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
FROM
    TABLE(${tie.capsule}$.r$tie.name(
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
    t.$tie.reliabilityColumnName = 1
AND
    t.$tie.identityColumnName = (
        SELECT
            sub.$tie.identityColumnName
        FROM
            TABLE(${tie.capsule}$.r$tie.name(
                $(tie.isHistorized())? changingTimepoint::$tie.timeRange,
                positingTimepoint::$schema.metadata.positingRange
            )) sub
        WHERE
~*/
    if(tie.hasMoreIdentifiers()) {
        while (role = tie.nextIdentifier()) {
/*~
            sub.$role.columnName = t.$role.columnName
        $(tie.hasMoreIdentifiers())? AND
~*/
        }
    }
    else {
/*~
            (
~*/
        while (role = tie.nextAnchorRole()) {
/*~
                sub.$role.columnName = t.$role.columnName
            $(tie.hasMoreAnchorRoles())? OR
~*/
        }
/*~
            )
~*/
    }
/*~
        ORDER BY
            $(tie.isHistorized())? sub.$tie.changingColumnName DESC,
            sub.$tie.positingColumnName DESC
        LIMIT 1
    )
$$$$
;

CREATE OR REPLACE VIEW ${tie.capsule}$.l$tie.name AS
SELECT
    *
FROM
    TABLE(${tie.capsule}$.t$tie.name(
        $schema.EOT::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    ))
;

CREATE OR REPLACE FUNCTION ${tie.capsule}$.p$tie.name (
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $tie.identityColumnName $tie.identity,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
        }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(tie.hasMoreRoles())?,
~*/
    }
/*~
)
AS
$$$$
SELECT
    *
FROM
    TABLE(${tie.capsule}$.t$tie.name(
        changingTimepoint::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    ))
$$$$
;

CREATE OR REPLACE VIEW ${tie.capsule}$.n$tie.name AS
SELECT
    *
FROM
    TABLE(${tie.capsule}$.t$tie.name(
        $schema.metadata.now::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    ))
;
~*/
    if(tie.isHistorized()) {
/*~
CREATE OR REPLACE FUNCTION ${tie.capsule}$.d$tie.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon
)
RETURNS TABLE (
    $tie.identityColumnName $tie.identity,
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $role.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity$(tie.hasMoreRoles())?,
~*/
        }
/*~
)
AS
$$$$
SELECT
    *
FROM
    TABLE(${tie.capsule}$.t$tie.name(
        $schema.EOT::$schema.metadata.chronon,
        $schema.EOT::$schema.metadata.positingRange
    )) t
WHERE
    t.$tie.changingColumnName BETWEEN intervalStart AND intervalEnd
$$$$
;
~*/
    }
}
