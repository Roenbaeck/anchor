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
-- Latest perspective -------------------------------------------------------------------------------------------------
-- Latest_$tie.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$tie.capsule].[Latest_$tie.businessName] WITH SCHEMABINDING AS
SELECT
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$knot.descriptor]$(tie.hasMoreRoles())?,
~*/
            }
            else {
/*~
    tie.$role.columnName as [$role.businessColumnName]$(tie.hasMoreRoles())?,
~*/
            }
        }
/*~
FROM
    [$tie.capsule].[l$tie.name] tie;
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- Point_$tie.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[Point_$tie.businessName] ﻿(
    @changingTimepoint $schema.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$knot.descriptor]$(tie.hasMoreRoles())?,
~*/
            }
            else {
/*~
    tie.$role.columnName as [$role.businessColumnName]$(tie.hasMoreRoles())?,
~*/
            }
        }
/*~
FROM
    [$tie.capsule].[p$tie.name](@changingTimepoint) tie
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- Current_$tie.businessName viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$tie.capsule].[Current_$tie.businessName]
AS
SELECT
    *
FROM
    [$tie.capsule].[Point_$tie.businessName]($schema.now);
GO
~*/
        if(tie.isHistorized()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- Difference_$tie.businessName showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[Difference_$tie.businessName] (
    @intervalStart $schema.chronon,
    @intervalEnd $schema.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(tie.isHistorized())? tie.$tie.changingColumnName as [Time_of_Change],
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$knot.descriptor]$(tie.hasMoreRoles())?,
~*/
            }
            else {
/*~
    tie.$role.columnName as [$role.businessColumnName]$(tie.hasMoreRoles())?,
~*/
            }
        }
/*~
FROM
    [$tie.capsule].[d$tie.name](@intervalStart, @intervalEnd) tie;
GO
~*/
    }
}
}