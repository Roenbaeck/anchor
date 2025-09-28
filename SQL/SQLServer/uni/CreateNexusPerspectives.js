/*~
-- NEXUS TEMPORAL PERSPECTIVES --------------------------------------------------------------------------------------
--
-- These views and table valued functions provide temporal perspectives over each nexus,
-- denormalizing the nexus, its adjoined attributes, and any referenced knots (both from
-- roles and from knotted attributes) from sixth to third normal form.
--
-- Four types of perspectives are provided (mirroring anchors):
--   latest (l), point-in-time (p), difference (d), and now (n).
-- Under equivalence, corresponding e-prefixed variants (el, ep, ed, en) are generated.
--
-- The nexus base row is immutable; only its historized attributes change over time. Roles
-- (anchor/nexus/knot foreign keys stored in the base nexus table) are therefore treated as
-- static within temporal selection logic. Historization logic only applies to historized
-- attributes.
--
-- @changingTimepoint   the point in changing time to travel to (for point-in-time functions)
-- @intervalStart       the start of the interval for finding changes (difference)
-- @intervalEnd         the end of the interval for finding changes (difference)
-- @selection           list of mnemonics for tracked attributes, e.g. 'ABC DEF', or null for all (difference)
-- @equivalent          the equivalent for which to retrieve data (equivalence variants)
--
-- Perspective generation is skipped for nexuses without attributes (to avoid redundant
-- projections identical to the base nexus table).
--
~*/
var nexus, role, knot;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) { // only if there are attributes
/*~
-- Drop perspectives ------------------------------------------------------------------------------------------------
~*/
        if(schema.EQUIVALENCE) {
/*~
IF Object_ID('$nexus.capsule$.ed$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[ed$nexus.name];
IF Object_ID('$nexus.capsule$.en$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[en$nexus.name];
IF Object_ID('$nexus.capsule$.ep$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[ep$nexus.name];
IF Object_ID('$nexus.capsule$.el$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[el$nexus.name];
~*/
        }
/*~
IF Object_ID('$nexus.capsule$.d$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[d$nexus.name];
IF Object_ID('$nexus.capsule$.n$nexus.name', 'V') IS NOT NULL
DROP VIEW [$nexus.capsule].[n$nexus.name];
IF Object_ID('$nexus.capsule$.p$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[p$nexus.name];
IF Object_ID('$nexus.capsule$.l$nexus.name', 'V') IS NOT NULL
DROP VIEW [$nexus.capsule].[l$nexus.name];
GO
~*/
        // Chronicle uniqueness projection (roles + chronicle static attributes)
        if(nexus.hasMoreChronicles && nexus.hasMoreChronicles()) {
/*~
IF OBJECT_ID('$nexus.capsule$.uq$nexus.name', 'V') IS NOT NULL
DROP VIEW [$nexus.capsule].[uq$nexus.name];
GO
CREATE VIEW [$nexus.capsule].[uq$nexus.name] WITH SCHEMABINDING AS
SELECT
~*/
            // Project role foreign keys
            while(role = nexus.nextRole && nexus.nextRole()) {
/*~    [$nexus.mnemonic].$role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreChronicles()? , : )
~*/
            }
            // Project chronicle value columns
            var chron;
            while(chron = nexus.nextChronicle && nexus.nextChronicle()) {
/*~    [$chron.mnemonic].$chron.valueColumnName$(nexus.hasMoreChronicles()? , : )
~*/
            }
/*~FROM
    [$nexus.capsule].[$nexus.name] [$nexus.mnemonic]
~*/
            // Join chronicle attribute tables (inner join guarantees presence)
            while(chron = nexus.nextChronicle && nexus.nextChronicle()) {
/*~INNER JOIN [$chron.capsule].[$chron.name] [$chron.mnemonic]
    ON [$chron.mnemonic].$chron.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
~*/
            }
/*~GO
CREATE UNIQUE NONCLUSTERED INDEX UQ_$nexus.name
ON [$nexus.capsule].[uq$nexus.name](
~*/
            // Index columns: roles first, then chronicle values
            while(role = nexus.nextRole && nexus.nextRole()) {
/*~    $role.columnName$(nexus.hasMoreRoles() || nexus.hasMoreChronicles()? , : )
~*/
            }
            while(chron = nexus.nextChronicle && nexus.nextChronicle()) {
/*~    $chron.valueColumnName$(nexus.hasMoreChronicles()? , : )
~*/
            }
/*~);
GO
~*/
        }
/*~
-- Latest perspective -----------------------------------------------------------------------------------------------
-- l$nexus.name viewed by the latest available information (may include future versions)
----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[l$nexus.name] WITH SCHEMABINDING AS
SELECT
    [$nexus.mnemonic].$nexus.identityColumnName,
    $(schema.METADATA)? [$nexus.mnemonic].$nexus.metadataColumnName,
~*/
        var attribute;
        // Role columns (static for all temporal perspectives)
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? [$role.name].$knot.checksumColumnName AS $role.knotChecksumColumnName,
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? [$role.name].$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    [$nexus.mnemonic].$role.columnName$(nexus.hasMoreAttributes())?,
~*/
        }
        // Attribute projections
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.isDeletable())? cast(null as bit) as $attribute.deletableColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    $(schema.KNOT_ALIASES)? [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.name,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
~*/
            if(attribute.getEncryptionGroup && attribute.getEncryptionGroup()) {
/*~
    CAST(DECRYPTBYKEY([$attribute.mnemonic].$attribute.valueColumnName) AS $attribute.originalDataRange) AS $attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$attribute.mnemonic].$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/                
            }
        }
/*~
FROM
    [$nexus.capsule].[$nexus.name] [$nexus.mnemonic]
~*/
        // Knot role joins
        while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
            knot = role.knot;
            if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](0) [$role.name]
~*/
            }
            else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
~*/
            }
/*~
ON
    [$role.name].$knot.identityColumnName = [$nexus.mnemonic].$role.columnName
~*/
        }
        // Attribute joins (copy of anchor style)
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
            if(attribute.isEquivalent && attribute.isEquivalent()) {
/*~
LEFT JOIN
    [$attribute.capsule].[e$attribute.name](0) [$attribute.mnemonic]
~*/
            }
            else {
/*~
LEFT JOIN
    [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
~*/
            }
/*~
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName~*/
            if(attribute.isHistorized && attribute.isHistorized()) {
/*~
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](0) sub : [$attribute.capsule].[$attribute.name] sub
        WHERE
            sub.$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
   )~*/
            }
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](0) [k$attribute.mnemonic]
~*/
                }
                else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
~*/
                }
/*~
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
            }
            if(!nexus.hasMoreAttributes()) { /*~;~*/ }
        }
/*~
GO
-- Point-in-time perspective -----------------------------------------------------------------------------------------
-- p$nexus.name viewed as it was on the given timepoint
----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[p$nexus.name] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$nexus.mnemonic].$nexus.identityColumnName,
    $(schema.METADATA)? [$nexus.mnemonic].$nexus.metadataColumnName,
~*/
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? [$role.name].$knot.checksumColumnName AS $role.knotChecksumColumnName,
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? [$role.name].$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    [$nexus.mnemonic].$role.columnName$(nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    $(schema.KNOT_ALIASES)? [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.name,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
~*/
            if(attribute.getEncryptionGroup && attribute.getEncryptionGroup()) {
/*~
    CAST(DECRYPTBYKEY([$attribute.mnemonic].$attribute.valueColumnName) AS $attribute.originalDataRange) AS $attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$attribute.mnemonic].$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/                
            }
        }
/*~
FROM
    [$nexus.capsule].[$nexus.name] [$nexus.mnemonic]
~*/
        while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
            knot = role.knot;
            if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](0) [$role.name]
~*/
            }
            else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
~*/
            }
/*~
ON
    [$role.name].$knot.identityColumnName = [$nexus.mnemonic].$role.columnName
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
            if(attribute.isHistorized && attribute.isHistorized()) {
                if(attribute.isEquivalent && attribute.isEquivalent()) {
/*~
LEFT JOIN
    [$attribute.capsule].[r$attribute.name](0, @changingTimepoint) [$attribute.mnemonic]
~*/
                }
                else {
/*~
LEFT JOIN
    [$attribute.capsule].[r$attribute.name](@changingTimepoint) [$attribute.mnemonic]
~*/
                }
/*~
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[r$attribute.name](0, @changingTimepoint) sub : [$attribute.capsule].[r$attribute.name](@changingTimepoint) sub
        WHERE
            sub.$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
   )~*/
            }
            else {
                if(attribute.isEquivalent && attribute.isEquivalent()) {
/*~
LEFT JOIN
    [$attribute.capsule].[e$attribute.name](0) [$attribute.mnemonic]
~*/
                }
                else {
/*~
LEFT JOIN
    [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
~*/
                }
/*~
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName~*/
            }
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](0) [k$attribute.mnemonic]
~*/
                }
                else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
~*/
                }
/*~
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
            }
            if(!nexus.hasMoreAttributes()) { /*~;~*/ }
        }
/*~
GO
-- Now perspective --------------------------------------------------------------------------------------------------
-- n$nexus.name viewed as it currently is (cannot include future versions)
----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[n$nexus.name]
AS
SELECT
    *
FROM
    [$nexus.capsule].[p$nexus.name]($schema.metadata.now);
GO
~*/
        if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective -------------------------------------------------------------------------------------------
-- d$nexus.name showing all differences between the given timepoints and optionally for a subset of attributes
----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[d$nexus.name] (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    timepoints.mnemonic,
    [p$nexus.mnemonic].*
FROM (
~*/
            while (attribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $nexus.identityColumnName,
        $attribute.changingColumnName AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](0) : [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
    $(nexus.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) timepoints
CROSS APPLY
    [$nexus.capsule].[p$nexus.name](timepoints.inspectedTimepoint) [p$nexus.mnemonic]
WHERE
    [p$nexus.mnemonic].$nexus.identityColumnName = timepoints.$nexus.identityColumnName;
GO
~*/
        }
// --------------------------------------- EQUIVALENCE VARIANTS -----------------------------------------------------
        if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -----------------------------------------------------------------------------------
-- el$nexus.name viewed by the latest available information (may include future versions)
----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[el$nexus.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$nexus.mnemonic].$nexus.identityColumnName,
    $(schema.METADATA)? [$nexus.mnemonic].$nexus.metadataColumnName,
~*/
            while (role = nexus.nextRole && nexus.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? [$role.name].$knot.checksumColumnName AS $role.knotChecksumColumnName,
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? [$role.name].$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
                }
/*~
    [$nexus.mnemonic].$role.columnName$(nexus.hasMoreRoles())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    $(schema.KNOT_ALIASES)? [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.name,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
                }
/*~
    $(attribute.hasChecksum && attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
~*/
                if(attribute.getEncryptionGroup && attribute.getEncryptionGroup()) {
/*~
    CAST(DECRYPTBYKEY([$attribute.mnemonic].$attribute.valueColumnName) AS $attribute.originalDataRange) AS $attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
                }
                else {
/*~
    [$attribute.mnemonic].$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/                
                }
            }
/*~
FROM
    [$nexus.capsule].[$nexus.name] [$nexus.mnemonic]
~*/
            while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
                knot = role.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](@equivalent) [$role.name]
~*/
                }
                else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
~*/
                }
/*~
ON
    [$role.name].$knot.identityColumnName = [$nexus.mnemonic].$role.columnName
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
                if(attribute.isEquivalent && attribute.isEquivalent()) {
/*~
LEFT JOIN
    [$attribute.capsule].[e$attribute.name](@equivalent) [$attribute.mnemonic]
~*/
                }
                else {
/*~
LEFT JOIN
    [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
~*/
                }
/*~
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName~*/
                if(attribute.isHistorized && attribute.isHistorized()) {
/*~
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) sub : [$attribute.capsule].[$attribute.name] sub
        WHERE
            sub.$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
   )~*/
                }
                if(attribute.isKnotted && attribute.isKnotted()) {
                    knot = attribute.knot;
                    if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](@equivalent) [k$attribute.mnemonic]
~*/
                    }
                    else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
~*/
                    }
/*~
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
                }
                if(!nexus.hasMoreAttributes()) { /*~;~*/ }
            }
/*~
GO
-- Point-in-time equivalence perspective -----------------------------------------------------------------------------
-- ep$nexus.name viewed as it was on the given timepoint
----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[ep$nexus.name] (
    @equivalent $schema.metadata.equivalentRange,
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$nexus.mnemonic].$nexus.identityColumnName,
    $(schema.METADATA)? [$nexus.mnemonic].$nexus.metadataColumnName,
~*/
            while (role = nexus.nextRole && nexus.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? [$role.name].$knot.checksumColumnName AS $role.knotChecksumColumnName,
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? [$role.name].$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
                }
/*~
    [$nexus.mnemonic].$role.columnName$(nexus.hasMoreRoles())?,
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
                if(attribute.isKnotted && attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    $(schema.KNOT_ALIASES)? [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.name,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
                }
/*~
    $(attribute.hasChecksum && attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
~*/
                if(attribute.getEncryptionGroup && attribute.getEncryptionGroup()) {
/*~
    CAST(DECRYPTBYKEY([$attribute.mnemonic].$attribute.valueColumnName) AS $attribute.originalDataRange) AS $attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
                }
                else {
/*~
    [$attribute.mnemonic].$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/                
                }
            }
/*~
FROM
    [$nexus.capsule].[$nexus.name] [$nexus.mnemonic]
~*/
            while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
                knot = role.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](@equivalent) [$role.name]
~*/
                }
                else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
~*/
                }
/*~
ON
    [$role.name].$knot.identityColumnName = [$nexus.mnemonic].$role.columnName
~*/
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
                if(attribute.isHistorized && attribute.isHistorized()) {
                    if(attribute.isEquivalent && attribute.isEquivalent()) {
/*~
LEFT JOIN
    [$attribute.capsule].[r$attribute.name](@equivalent, @changingTimepoint) [$attribute.mnemonic]
~*/
                    }
                    else {
/*~
LEFT JOIN
    [$attribute.capsule].[r$attribute.name](@changingTimepoint) [$attribute.mnemonic]
~*/
                    }
/*~
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[r$attribute.name](@equivalent, @changingTimepoint) sub : [$attribute.capsule].[r$attribute.name](@changingTimepoint) sub
        WHERE
            sub.$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
   )~*/
                }
                else {
                    if(attribute.isEquivalent && attribute.isEquivalent()) {
/*~
LEFT JOIN
    [$attribute.capsule].[e$attribute.name](@equivalent) [$attribute.mnemonic]
~*/
                    }
                    else {
/*~
LEFT JOIN
    [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
~*/
                    }
/*~
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName~*/
                }
                if(attribute.isKnotted && attribute.isKnotted()) {
                    knot = attribute.knot;
                    if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](@equivalent) [k$attribute.mnemonic]
~*/
                    }
                    else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
~*/
                    }
/*~
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
                }
                if(!nexus.hasMoreAttributes()) { /*~;~*/ }
            }
/*~
GO
-- Now equivalence perspective --------------------------------------------------------------------------------------
-- en$nexus.name viewed as it currently is (cannot include future versions)
----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[en$nexus.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$nexus.capsule].[ep$nexus.name](@equivalent, $schema.metadata.now);
GO
~*/
            if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
-- Difference equivalence perspective -------------------------------------------------------------------------------
-- ed$nexus.name showing all differences between the given timepoints and optionally for a subset of attributes
----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[ed$nexus.name] (
    @equivalent $schema.metadata.equivalentRange,
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    timepoints.mnemonic,
    [p$nexus.mnemonic].*
FROM (
~*/
                while (attribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $nexus.identityColumnName,
        $attribute.changingColumnName AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) : [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
    $(nexus.hasMoreHistorizedAttributes())? UNION
~*/
                }
/*~
) timepoints
CROSS APPLY
    [$nexus.capsule].[ep$nexus.name](@equivalent, timepoints.inspectedTimepoint) [p$nexus.mnemonic]
WHERE
    [p$nexus.mnemonic].$nexus.identityColumnName = timepoints.$nexus.identityColumnName;
GO
~*/
            }
        } // end equivalence variants
    } // end if nexus has attributes
}
