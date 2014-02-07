if(BUSINESS_VIEWS) {
/*~
-- TIE TEMPORAL BUSINESS PERSPECTIVES ---------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each tie. There are four types of perspectives: latest,
-- point-in-time, difference, and now.
--
-- The latest perspective shows the latest available information for each tie.
-- The now perspective shows the information as it is right now.
-- The point-in-time perspective lets you travel through the information to the given timepoint.
--
-- @changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints.
--
-- @intervalStart       the start of the interval for finding changes
-- @intervalEnd         the end of the interval for finding changes
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
IF Object_ID('Difference_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[Difference_$tie.businessName];
IF Object_ID('Current_$tie.businessName', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[Current_$tie.businessName];
IF Object_ID('Point_$tie.businessName', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[Point_$tie.businessName];
IF Object_ID('Latest_$tie.businessName', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[Latest_$tie.businessName];
GO
~*/
}
}