/*~
-- TIE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------------
--
-- CRT rewinders over changing and positing time with positor-aware annex selection.
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
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
)
AS
$$$$
SELECT
    $(schema.METADATA)? $tie.metadataColumnName,
    $tie.identityColumnName,
    $tie.positingColumnName,
    $tie.positorColumnName,
    $tie.reliabilityColumnName,
    $tie.assertionColumnName,
    $tie.reliableColumnName
FROM
    ${tie.capsule}$.$tie.annexName
WHERE
    $tie.positingColumnName <= positingTimepoint
$$$$
;

CREATE OR REPLACE FUNCTION ${tie.capsule}$.r$tie.name (
    positor $schema.metadata.positorRange,
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
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
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
    a.$tie.positorColumnName,
    a.$tie.reliabilityColumnName,
    a.$tie.assertionColumnName,
    a.$tie.reliableColumnName
FROM
    $(tie.isHistorized())? TABLE(${tie.capsule}$.r$tie.positName(changingTimepoint)) p : ${tie.capsule}$.$tie.positName p
JOIN
    TABLE(${tie.capsule}$.r$tie.annexName(positingTimepoint)) a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
AND
    a.$tie.positorColumnName = positor
QUALIFY
    row_number() OVER (
        PARTITION BY p.$tie.identityColumnName
        ORDER BY a.$tie.positingColumnName DESC
    ) = 1
$$$$
;

CREATE OR REPLACE FUNCTION ${tie.capsule}$.f$tie.name (
    positor $schema.metadata.positorRange,
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
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
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
    a.$tie.positorColumnName,
    a.$tie.reliabilityColumnName,
    a.$tie.assertionColumnName,
    a.$tie.reliableColumnName
FROM
    $(tie.isHistorized())? TABLE(${tie.capsule}$.f$tie.positName(changingTimepoint)) p : ${tie.capsule}$.$tie.positName p
JOIN
    TABLE(${tie.capsule}$.r$tie.annexName(positingTimepoint)) a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
AND
    a.$tie.positorColumnName = positor
QUALIFY
    row_number() OVER (
        PARTITION BY p.$tie.identityColumnName
        ORDER BY a.$tie.positingColumnName DESC
    ) = 1
$$$$
;
~*/
}