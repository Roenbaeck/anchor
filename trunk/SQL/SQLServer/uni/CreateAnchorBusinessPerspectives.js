if(BUSINESS_VIEWS) {
    /*~
-- ANCHOR TEMPORAL BUSINESS PERSPECTIVES ------------------------------------------------------------------------------
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
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- Latest_$anchor.descriptor viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[Latest_$anchor.descriptor] WITH SCHEMABINDING AS
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName as [$anchor.businessIdentityColumnName],
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    [$anchor.mnemonic].$attribute.knotValueColumnName as [$knot.descriptor]$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$anchor.mnemonic].$attribute.valueColumnName as [$attribute.descriptor]$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$anchor.capsule].[l$anchor.name] [$anchor.mnemonic];
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- Point_$anchor.descriptor viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[Point_$anchor.descriptor] ﻿(
    @changingTimepoint $schema.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName as [$anchor.businessIdentityColumnName],
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    [$anchor.mnemonic].$attribute.knotValueColumnName as [$knot.descriptor]$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$anchor.mnemonic].$attribute.valueColumnName as [$attribute.descriptor]$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$anchor.capsule].[p$anchor.name](@changingTimepoint) [$anchor.mnemonic]
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- Current_$anchor.descriptor viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[Current_$anchor.descriptor]
AS
SELECT
    *
FROM
    [$anchor.capsule].[Point_$anchor.descriptor]($schema.now);
GO
~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- Difference_$anchor.descriptor showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[Difference_$anchor.descriptor] (
    @intervalStart $schema.chronon,
    @intervalEnd $schema.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint as [Time_of_Change],
    timepoints.descriptor as [Subject_of_Change],
    [p$anchor.mnemonic].*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName AS inspectedTimepoint,
        '$attribute.descriptor' AS descriptor
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
    [$anchor.capsule].[Point_$anchor.descriptor](timepoints.inspectedTimepoint) [p$anchor.mnemonic]
WHERE
    [p$anchor.mnemonic].$anchor.businessIdentityColumnName = timepoints.$anchor.identityColumnName;
GO
~*/
        }
    }
}
}