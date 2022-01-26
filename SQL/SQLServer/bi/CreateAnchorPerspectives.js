/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each anchor. There are five types of perspectives: time traveling, latest,
-- point-in-time, difference, and now. They also denormalize the anchor, its attributes,
-- and referenced knots from sixth to third normal form.
--
-- The time traveling perspective shows information as it was or will be based on a number
-- of input parameters.
--
-- @changingTimepoint   the point in changing time to travel to (defaults to End of Time)
-- @positingTimepoint   the point in positing time to travel to (defaults to End of Time)
--
-- The latest perspective shows the latest available (changing & positing) information for each anchor.
-- The now perspective shows the information as it is right now, with latest positing time.
-- The point-in-time perspective lets you travel through the information to the given timepoint,
-- with latest positing time and the given point in changing time.
--
-- @changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints, and for
-- changes in all or a selection of attributes, with latest positing time.
--
-- @intervalStart       the start of the interval for finding changes
-- @intervalEnd         the end of the interval for finding changes
-- @selection           a list of mnemonics for tracked attributes, ie 'MNE MON ICS', or null for all
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
IF Object_ID('$anchor.capsule$.d$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[d$anchor.name];
IF Object_ID('$anchor.capsule$.n$anchor.name', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[n$anchor.name];
IF Object_ID('$anchor.capsule$.p$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[p$anchor.name];
IF Object_ID('$anchor.capsule$.l$anchor.name', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[l$anchor.name];
IF Object_ID('$anchor.capsule$.t$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[t$anchor.name];
GO
~*/
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Time traveling perspective -----------------------------------------------------------------------------------------
-- t$anchor.name viewed as given by the input parameters
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[t$anchor.name] (
    @changingTimepoint $schema.metadata.chronon = $schema.EOT,
    @positingTimepoint $schema.metadata.positingRange = $schema.EOT
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
    [$attribute.mnemonic].$attribute.identityColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    [$attribute.mnemonic].$attribute.positingColumnName,
    [$attribute.mnemonic].$attribute.reliabilityColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(schema.KNOT_ALIASES)? [$attribute.mnemonic].$knot.valueColumnName AS $attribute.name,
    [$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
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
/*~
OUTER APPLY (
    SELECT TOP 1
        $(schema.IMPROVED)? [r$attribute.mnemonic].$attribute.anchorReferenceName,
        $(schema.METADATA)? [r$attribute.mnemonic].$attribute.metadataColumnName,
        [r$attribute.mnemonic].$attribute.identityColumnName,
        $(attribute.timeRange)? [r$attribute.mnemonic].$attribute.changingColumnName,
        [r$attribute.mnemonic].$attribute.positingColumnName,
        [r$attribute.mnemonic].$attribute.reliabilityColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName,
        $(schema.KNOT_ALIASES)? [k$attribute.mnemonic].$knot.valueColumnName,
        [k$attribute.mnemonic].$knot.valueColumnName,
        $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName,
~*/
            }
/*~
        $(attribute.hasChecksum())? [r$attribute.mnemonic].$attribute.checksumColumnName,
        [r$attribute.mnemonic].$attribute.valueColumnName
    FROM
        [$attribute.capsule].[r$attribute.name](
            $(attribute.isHistorized())? @changingTimepoint,
            @positingTimepoint
        ) [r$attribute.mnemonic]
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    JOIN
        [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
    ON
        [k$attribute.mnemonic].$knot.identityColumnName = [r$attribute.mnemonic].$attribute.knotReferenceName
~*/
            }
/*~
    WHERE
		[r$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
	AND 
		[r$attribute.mnemonic].$attribute.reliabilityColumnName = 1
	ORDER BY
        $(attribute.isHistorized())? [r$attribute.mnemonic].$attribute.changingColumnName DESC,
        [r$attribute.mnemonic].$attribute.positingColumnName DESC
) [$attribute.mnemonic]~*/
            if(!anchor.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
GO

-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[l$anchor.name]
AS
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$anchor.mnemonic].*
FROM
    [$anchor.capsule].[t$anchor.name] (
        DEFAULT,
        DEFAULT
    ) [$anchor.mnemonic];
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$anchor.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[p$anchor.name] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$anchor.mnemonic].*
FROM
    [$anchor.capsule].[t$anchor.name] (
        @changingTimepoint,
        DEFAULT
    ) [$anchor.mnemonic];
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[n$anchor.name]
AS
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$anchor.mnemonic].*
FROM
    [$anchor.capsule].[t$anchor.name] (
        $schema.metadata.now,
        DEFAULT
    ) [$anchor.mnemonic];
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
    [$anchor.mnemonic].*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        [$attribute.capsule].[$attribute.name]
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
    [$anchor.capsule].[t$anchor.name] (
        timepoints.inspectedTimepoint,
        DEFAULT
    ) [$anchor.mnemonic]
 WHERE
    [$anchor.mnemonic].$anchor.identityColumnName = timepoints.$anchor.identityColumnName;
GO
~*/
        }
    }
}