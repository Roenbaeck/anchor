/*~
-- TIE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------------
--
-- BI rewinders over changing and positing time.
--
~*/
var tie, role;
while (tie = schema.nextTie()) {
    if(tie.isHistorized()) {
/*~
CREATE OR REPLACE FUNCTION ${tie.capsule}$.r$tie.positName (
    changingTimepoint $tie.timeRange
)
RETURNS TABLE (
    $tie.identityColumnName $tie.identity,
~*/
        while (role = tie.nextRole()) {
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity,
~*/
        }
/*~
    $tie.changingColumnName $tie.timeRange
)
AS
$$$$
SELECT
    $tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
    $role.columnName,
~*/
        }
/*~
    $tie.changingColumnName
FROM
    ${tie.capsule}$.$tie.positName
WHERE
    $tie.changingColumnName <= changingTimepoint
$$$$
;

CREATE OR REPLACE FUNCTION ${tie.capsule}$.f$tie.positName (
    changingTimepoint $tie.timeRange
)
RETURNS TABLE (
    $tie.identityColumnName $tie.identity,
~*/
        while (role = tie.nextRole()) {
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity,
~*/
        }
/*~
    $tie.changingColumnName $tie.timeRange
)
AS
$$$$
SELECT
    $tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
    $role.columnName,
~*/
        }
/*~
    $tie.changingColumnName
FROM
    ${tie.capsule}$.$tie.positName
WHERE
    $tie.changingColumnName > changingTimepoint
$$$$
;
~*/
    }
/*~
CREATE OR REPLACE FUNCTION ${tie.capsule}$.r$tie.annexName (
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.identityColumnName $tie.identity,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange
)
AS
$$$$
SELECT
    $(schema.METADATA)? $tie.metadataColumnName,
    $tie.identityColumnName,
    $tie.positingColumnName,
    $tie.reliabilityColumnName
FROM
    ${tie.capsule}$.$tie.annexName
WHERE
    $tie.positingColumnName <= positingTimepoint
$$$$
;

CREATE OR REPLACE FUNCTION ${tie.capsule}$.r$tie.name (
    $(tie.isHistorized())? changingTimepoint $tie.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.identityColumnName $tie.identity,
~*/
    while (role = tie.nextRole()) {
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity,
~*/
    }
/*~
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange
)
AS
$$$$
SELECT
    $(schema.METADATA)? a.$tie.metadataColumnName,
    p.$tie.identityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
    p.$role.columnName,
~*/
    }
/*~
    $(tie.isHistorized())? p.$tie.changingColumnName,
    a.$tie.positingColumnName,
    a.$tie.reliabilityColumnName
FROM
    $(tie.isHistorized())? TABLE(${tie.capsule}$.r$tie.positName(changingTimepoint)) p : ${tie.capsule}$.$tie.positName p
JOIN
    TABLE(${tie.capsule}$.r$tie.annexName(positingTimepoint)) a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
QUALIFY
    row_number() OVER (
        PARTITION BY p.$tie.identityColumnName
        ORDER BY a.$tie.positingColumnName DESC
    ) = 1
$$$$
;

CREATE OR REPLACE FUNCTION ${tie.capsule}$.f$tie.name (
    $(tie.isHistorized())? changingTimepoint $tie.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.identityColumnName $tie.identity,
~*/
    while (role = tie.nextRole()) {
/*~
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity,
~*/
    }
/*~
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange
)
AS
$$$$
SELECT
    $(schema.METADATA)? a.$tie.metadataColumnName,
    p.$tie.identityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
    p.$role.columnName,
~*/
    }
/*~
    $(tie.isHistorized())? p.$tie.changingColumnName,
    a.$tie.positingColumnName,
    a.$tie.reliabilityColumnName
FROM
    $(tie.isHistorized())? TABLE(${tie.capsule}$.f$tie.positName(changingTimepoint)) p : ${tie.capsule}$.$tie.positName p
JOIN
    TABLE(${tie.capsule}$.r$tie.annexName(positingTimepoint)) a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
QUALIFY
    row_number() OVER (
        PARTITION BY p.$tie.identityColumnName
        ORDER BY a.$tie.positingColumnName DESC
    ) = 1
$$$$
;
~*/
}
