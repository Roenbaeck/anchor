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
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
IF Object_ID('Difference_$anchor.descriptor', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[Difference_$anchor.descriptor];
IF Object_ID('Current_$anchor.descriptor', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[Current_$anchor.descriptor];
IF Object_ID('Point_$anchor.descriptor', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[Point_$anchor.descriptor];
IF Object_ID('Latest_$anchor.descriptor', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[Latest_$anchor.descriptor];
GO
~*/
}
}