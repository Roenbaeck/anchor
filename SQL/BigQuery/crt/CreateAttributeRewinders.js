/*~
-- ATTRIBUTE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------
--
-- These table valued functions rewind an attribute posit table to the given
-- point in changing time, or an attribute annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time. The forwarder is the opposite of the rewinder, such that the 
-- union of the two will produce all rows in a posit table.
--
-- @positor             the view of which positor to adopt (defaults to 0)
-- @changingTimepoint   the point in changing time to rewind to (defaults to End of Time, no rewind)
-- @positingTimepoint   the point in positing time to rewind to (defaults to End of Time, no rewind)
--
~*/
var attribute, parent;
while (attribute = schema.nextAttribute()) {
    parent = attribute.parent;
    var returnType = attribute.isKnotted() ? attribute.knot.identity : (attribute.hasChecksum() ? 'numeric(19,0)' : attribute.dataRange);
    if(attribute.isHistorized()) {
/*~
-- Attribute posit rewinder -------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
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
$$
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
$$
;

-- Attribute posit forwarder ------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
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
$$
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
$$
;
~*/
    }
/*~
-- Attribute annex rewinder -------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.r$attribute.annexName (
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.assertionColumnName string,
    $attribute.reliableColumnName int
)
AS
$$
SELECT
    $(schema.METADATA)? $attribute.metadataColumnName,
    $attribute.identityColumnName,
    $attribute.positingColumnName,
    $attribute.positorColumnName,
    $attribute.reliabilityColumnName,
    $attribute.assertionColumnName,
    $attribute.reliableColumnName
FROM
    ${attribute.capsule}$.$attribute.annexName
WHERE
    $attribute.positingColumnName <= positingTimepoint
$$
;
~*/
    if(attribute.isHistorized()) {
/*~
-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.r$attribute.name (
    positor $schema.metadata.positorRange,
    changingTimepoint $attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.assertionColumnName string,
    $attribute.reliableColumnName int,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange,
    $attribute.changingColumnName $attribute.timeRange
)
AS
$$
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.positorColumnName,
    a.$attribute.reliabilityColumnName,
    a.$attribute.assertionColumnName,
    a.$attribute.reliableColumnName,
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
AND
    a.$attribute.positorColumnName = positor
QUALIFY
    row_number() OVER (
        PARTITION BY p.$attribute.identityColumnName
        ORDER BY a.$attribute.positingColumnName DESC
    ) = 1
$$
;

-- Attribute assembled forwarder --------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.f$attribute.name (
    positor $schema.metadata.positorRange,
    changingTimepoint $attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.assertionColumnName string,
    $attribute.reliableColumnName int,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange,
    $attribute.changingColumnName $attribute.timeRange
)
AS
$$
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.positorColumnName,
    a.$attribute.reliabilityColumnName,
    a.$attribute.assertionColumnName,
    a.$attribute.reliableColumnName,
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
AND
    a.$attribute.positorColumnName = positor
QUALIFY
    row_number() OVER (
        PARTITION BY p.$attribute.identityColumnName
        ORDER BY a.$attribute.positingColumnName DESC
    ) = 1
$$
;

-- Attribute previous value -------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.pre$attribute.name (
    id $parent.identity,
    positor $schema.metadata.positorRange,
    changingTimepoint $attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange,
    assertion string
)
RETURNS $returnType
AS
$$
SELECT
    $(attribute.hasChecksum())? pre.$attribute.checksumColumnName : pre.$attribute.valueColumnName
FROM
    TABLE(${attribute.capsule}$.r$attribute.name(positor, changingTimepoint, positingTimepoint)) pre
WHERE
    pre.$attribute.entityReferenceName = id
AND
    pre.$attribute.changingColumnName < changingTimepoint
AND
    pre.$attribute.assertionColumnName = coalesce(assertion, pre.$attribute.assertionColumnName)
ORDER BY
    pre.$attribute.changingColumnName DESC,
    pre.$attribute.positingColumnName DESC
LIMIT 1
$$
;

-- Attribute following value ------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.fol$attribute.name (
    id $parent.identity,
    positor $schema.metadata.positorRange,
    changingTimepoint $attribute.timeRange,
    positingTimepoint $schema.metadata.positingRange,
    assertion string
)
RETURNS $returnType
AS
$$
SELECT
    $(attribute.hasChecksum())? fol.$attribute.checksumColumnName : fol.$attribute.valueColumnName
FROM
    TABLE(${attribute.capsule}$.f$attribute.name(positor, changingTimepoint, positingTimepoint)) fol
WHERE
    fol.$attribute.entityReferenceName = id
AND
    fol.$attribute.changingColumnName > changingTimepoint
AND
    fol.$attribute.assertionColumnName = coalesce(assertion, fol.$attribute.assertionColumnName)
ORDER BY
    fol.$attribute.changingColumnName ASC,
    fol.$attribute.positingColumnName DESC
LIMIT 1
$$
;
~*/
    }
    else {
/*~
-- Attribute assembled rewinder ---------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.r$attribute.name (
    positor $schema.metadata.positorRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.identityColumnName $attribute.identity,
    $attribute.positingColumnName $schema.metadata.positingRange,
    $attribute.positorColumnName $schema.metadata.positorRange,
    $attribute.reliabilityColumnName $schema.metadata.reliabilityRange,
    $attribute.assertionColumnName string,
    $attribute.reliableColumnName int,
    $attribute.entityReferenceName $parent.identity,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $attribute.valueColumnName $(attribute.isKnotted())? $attribute.knot.identity : $attribute.dataRange
)
AS
$$
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.positorColumnName,
    a.$attribute.reliabilityColumnName,
    a.$attribute.assertionColumnName,
    a.$attribute.reliableColumnName,
    p.$attribute.entityReferenceName,
    $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
    p.$attribute.valueColumnName
FROM
    ${attribute.capsule}$.$attribute.positName p
JOIN
    TABLE(${attribute.capsule}$.r$attribute.annexName(positingTimepoint)) a
ON
    a.$attribute.identityColumnName = p.$attribute.identityColumnName
AND
    a.$attribute.positorColumnName = positor
QUALIFY
    row_number() OVER (
        PARTITION BY p.$attribute.identityColumnName
        ORDER BY a.$attribute.positingColumnName DESC
    ) = 1
$$
;
~*/
    }
}
