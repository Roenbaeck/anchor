/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each anchor. There are four types of perspectives: latest,
-- point-in-time, difference, and now. They also denormalize the anchor, its attributes,
-- and referenced knots from sixth to third normal form.
--
-- The latest perspective shows the latest available information for each anchor.
-- The now perspective shows the information as it is right now.
-- The point-in-time perspective lets you travel through the information to the given timepoint.
--
-- @changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints, and for
-- changes in all or a selection of attributes.
--
-- @intervalStart       the start of the interval for finding changes
-- @intervalEnd         the end of the interval for finding changes
-- @selection           a list of mnemonics for tracked attributes, ie 'MNE MON ICS', or null for all
--
-- Under equivalence all these views default to equivalent = 0, however, corresponding
-- prepended-e perspectives are provided in order to select a specific equivalent.
--
-- @equivalent          the equivalent for which to retrieve data
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
~*/
    if(schema.EQUIVALENCE) {
/*~
IF Object_ID('$anchor.capsule$.ed$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[ed$anchor.name];
IF Object_ID('$anchor.capsule$.en$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[en$anchor.name];
IF Object_ID('$anchor.capsule$.ep$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[ep$anchor.name];
IF Object_ID('$anchor.capsule$.el$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[el$anchor.name];
~*/
    }
/*~
IF Object_ID('$anchor.capsule$.d$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[d$anchor.name];
IF Object_ID('$anchor.capsule$.n$anchor.name', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[n$anchor.name];
IF Object_ID('$anchor.capsule$.p$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[p$anchor.name];
IF Object_ID('$anchor.capsule$.l$anchor.name', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[l$anchor.name];
GO
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[l$anchor.name] WITH SCHEMABINDING AS
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
    $(schema.METADATA)? [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
    [$attribute.mnemonic].$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isEquivalent()) {
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
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName~*/
            if(attribute.isHistorized()) {
/*~
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](0) sub : [$attribute.capsule].[$attribute.name] sub
        WHERE
            sub.$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
   )~*/
            }
            if(attribute.isKnotted()) {
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
            if(!anchor.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$anchor.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[p$anchor.name] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
    $(schema.METADATA)? [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
    [$attribute.mnemonic].$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isHistorized()) {
                if(attribute.isEquivalent()) {
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
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[r$attribute.name](0, @changingTimepoint) sub : [$attribute.capsule].[r$attribute.name](@changingTimepoint) sub
        WHERE
            sub.$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
   )~*/
            }
            else {
                if(attribute.isEquivalent()) {
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
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName~*/
            }
            if(attribute.isKnotted()) {
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
            if(!anchor.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[n$anchor.name]
AS
SELECT
    *
FROM
    [$anchor.capsule].[p$anchor.name]($schema.metadata.now);
GO
~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[d$anchor.name] (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    timepoints.mnemonic,
    [p$anchor.mnemonic].*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](0) : [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) timepoints
CROSS APPLY
    [$anchor.capsule].[p$anchor.name](timepoints.inspectedTimepoint) [p$anchor.mnemonic]
WHERE
    [p$anchor.mnemonic].$anchor.identityColumnName = timepoints.$anchor.identityColumnName;
GO
~*/
        }
// --------------------------------------- DO THE EQUIVALENCE THING ---------------------------------------------------
        if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -------------------------------------------------------------------------------------
-- el$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[el$anchor.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
    $(schema.METADATA)? [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
            var knot, attribute;
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
                }
/*~
    $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
    [$attribute.mnemonic].$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
            }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
            while (attribute = anchor.nextAttribute()) {
                if(attribute.isEquivalent()) {
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
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName~*/
                if(attribute.isHistorized()) {
/*~
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) sub : [$attribute.capsule].[$attribute.name] sub
        WHERE
            sub.$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
   )~*/
                }
                if(attribute.isKnotted()) {
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
                if(!anchor.hasMoreAttributes()) {
                /*~;~*/
                }
            }
/*~
GO
-- Point-in-time equivalence perspective ------------------------------------------------------------------------------
-- ep$anchor.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[ep$anchor.name] (
    @equivalent $schema.metadata.equivalentRange,
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
    $(schema.METADATA)? [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
                }
/*~
    $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
    [$attribute.mnemonic].$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
            }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
            while (attribute = anchor.nextAttribute()) {
                if(attribute.isHistorized()) {
                    if(attribute.isEquivalent()) {
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
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[r$attribute.name](@equivalent, @changingTimepoint) sub : [$attribute.capsule].[r$attribute.name](@changingTimepoint) sub
        WHERE
            sub.$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
   )~*/
                }
                else {
                    if(attribute.isEquivalent()) {
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
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName~*/
                }
                if(attribute.isKnotted()) {
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
                if(!anchor.hasMoreAttributes()) {
                /*~;~*/
                }
            }
/*~
GO
-- Now equivalence perspective ----------------------------------------------------------------------------------------
-- en$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[en$anchor.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$anchor.capsule].[ep$anchor.name](@equivalent, $schema.metadata.now);
GO
~*/
            if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference equivalence perspective ---------------------------------------------------------------------------------
-- ed$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[ed$anchor.name] (
    @equivalent $schema.metadata.equivalentRange,
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    timepoints.mnemonic,
    [p$anchor.mnemonic].*
FROM (
~*/
                while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) : [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
                }
/*~
) timepoints
CROSS APPLY
    [$anchor.capsule].[ep$anchor.name](@equivalent, timepoints.inspectedTimepoint) [p$anchor.mnemonic]
WHERE
    [p$anchor.mnemonic].$anchor.identityColumnName = timepoints.$anchor.identityColumnName;
GO
~*/
            }
        } // end of if equivalence
    } // end of if anchor has any attributes
}