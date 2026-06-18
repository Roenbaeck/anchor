/*~
-- ATTRIBUTE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------
--
-- BI rewinders over changing and positing time.
--
~*/
var attribute, parent;
while (attribute = schema.nextAttribute()) {
    parent = attribute.parent;
    var returnType = attribute.isKnotted() ? attribute.knot.identity : (attribute.hasChecksum() ? 'numeric(19,0)' : attribute.dataRange);
    if(attribute.isHistorized()) {
/*~
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.r$attribute.positName (
    changingTimepoint $attribute.timeRange
)
RETURNS TABLE (
    $attribute.identityColumnName $attribute.identity,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange,
    $attribute.changingColumnName $attribute.timeRange
)
AS
$$$$
SELECT
    $attribute.identityColumnName,
    $attribute.entityReferenceName,
    $(attribute.hasChecksum())? $attribute.checksumColumnName,
    $attribute.valueColumnName,
    $attribute.changingColumnName
FROM
    ${attribute.capsule}$.$attribute.positName
WHERE
    $attribute.changingColumnName <= changingTimepoint
$$$$
;

CREATE OR REPLACE FUNCTION ${attribute.capsule}$.f$attribute.positName (
    changingTimepoint $attribute.timeRange
)
RETURNS TABLE (
    $attribute.identityColumnName $attribute.identity,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange,
    $attribute.changingColumnName $attribute.timeRange
)
AS
$$$$
SELECT
    $attribute.identityColumnName,
    $attribute.entityReferenceName,
    $(attribute.hasChecksum())? $attribute.checksumColumnName,
    $attribute.valueColumnName,
    $attribute.changingColumnName
FROM
    ${attribute.capsule}$.$attribute.positName
WHERE
    $attribute.changingColumnName > changingTimepoint
$$$$
;
~*/
    }
/*~
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.r$attribute.annexName (
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange
)
AS
$$$$
SELECT
    $(schema.METADATA)? $attribute.metadataColumnName,
    $attribute.identityColumnName,
    $attribute.positingColumnName,
    $attribute.reliabilityColumnName
FROM
    ${attribute.capsule}$.$attribute.annexName
WHERE
    $attribute.positingColumnName <= positingTimepoint
$$$$
;
~*/
    if(attribute.isHistorized()) {
/*~
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.r$attribute.name (
    changingTimepoint $attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange,
    $attribute.changingColumnName $attribute.timeRange
)
AS
$$$$
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.reliabilityColumnName,
    p.$attribute.entityReferenceName,
    $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
    p.$attribute.valueColumnName,
    p.$attribute.changingColumnName
FROM
    TABLE(${attribute.capsule}$.r$attribute.positName(changingTimepoint)) p
JOIN
    TABLE(${attribute.capsule}$.r$attribute.annexName(positingTimepoint)) a
ON
    a.$attribute.identityColumnName = p.$attribute.identityColumnName
QUALIFY
    row_number() OVER (
        PARTITION BY p.$attribute.identityColumnName
        ORDER BY a.$attribute.positingColumnName DESC
    ) = 1
$$$$
;

CREATE OR REPLACE FUNCTION ${attribute.capsule}$.f$attribute.name (
    changingTimepoint $attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange,
    $attribute.changingColumnName $attribute.timeRange
)
AS
$$$$
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.reliabilityColumnName,
    p.$attribute.entityReferenceName,
    $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
    p.$attribute.valueColumnName,
    p.$attribute.changingColumnName
FROM
    TABLE(${attribute.capsule}$.f$attribute.positName(changingTimepoint)) p
JOIN
    TABLE(${attribute.capsule}$.r$attribute.annexName(positingTimepoint)) a
ON
    a.$attribute.identityColumnName = p.$attribute.identityColumnName
QUALIFY
    row_number() OVER (
        PARTITION BY p.$attribute.identityColumnName
        ORDER BY a.$attribute.positingColumnName DESC
    ) = 1
$$$$
;

CREATE OR REPLACE FUNCTION ${attribute.capsule}$.pre$attribute.name (
    id $parent.identity,
    changingTimepoint $attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS $returnType
AS
$$$$
SELECT
    $(attribute.hasChecksum())? pre.$attribute.checksumColumnName : pre.$attribute.valueColumnName
FROM
    TABLE(${attribute.capsule}$.r$attribute.name(changingTimepoint, positingTimepoint)) pre
WHERE
    pre.$attribute.entityReferenceName = id
AND
    pre.$attribute.changingColumnName < changingTimepoint
AND
    pre.$attribute.reliabilityColumnName = 1
ORDER BY
    pre.$attribute.changingColumnName DESC,
    pre.$attribute.positingColumnName DESC
LIMIT 1
$$$$
;

CREATE OR REPLACE FUNCTION ${attribute.capsule}$.fol$attribute.name (
    id $parent.identity,
    changingTimepoint $attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS $returnType
AS
$$$$
SELECT
    $(attribute.hasChecksum())? fol.$attribute.checksumColumnName : fol.$attribute.valueColumnName
FROM
    TABLE(${attribute.capsule}$.f$attribute.name(changingTimepoint, positingTimepoint)) fol
WHERE
    fol.$attribute.entityReferenceName = id
AND
    fol.$attribute.changingColumnName > changingTimepoint
AND
    fol.$attribute.reliabilityColumnName = 1
ORDER BY
    fol.$attribute.changingColumnName ASC,
    fol.$attribute.positingColumnName DESC
LIMIT 1
$$$$
;
~*/
    }
    else {
/*~
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.r$attribute.name (
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
)
AS
$$$$
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.reliabilityColumnName,
    p.$attribute.entityReferenceName,
    $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
    p.$attribute.valueColumnName
FROM
    ${attribute.capsule}$.$attribute.positName p
JOIN
    TABLE(${attribute.capsule}$.r$attribute.annexName(positingTimepoint)) a
ON
    a.$attribute.identityColumnName = p.$attribute.identityColumnName
QUALIFY
    row_number() OVER (
        PARTITION BY p.$attribute.identityColumnName
        ORDER BY a.$attribute.positingColumnName DESC
    ) = 1
$$$$
;
~*/
    }
}
