if(schema.BUSINESS_VIEWS) {
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
-- Under equivalence all these views default to equivalent = 0, however, corresponding
-- prepended-e perspectives are provided in order to select a specific equivalent.
--
-- @equivalent          the equivalent for which to retrieve data
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- Latest_$tie.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$tie.capsule].[Latest_$tie.businessName] AS
SELECT
    $(schema.CRT)? tie.Positor,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$role.businessName]$(tie.hasMoreRoles())?,
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
CREATE FUNCTION [$tie.capsule].[Point_$tie.businessName] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? tie.Positor,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$role.businessName]$(tie.hasMoreRoles())?,
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
    [$tie.capsule].[Point_$tie.businessName]($schema.metadata.now);
GO
~*/
        if(tie.isHistorized()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- Difference_$tie.businessName showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[Difference_$tie.businessName] (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? tie.$tie.positorColumnName as [Positor],
    $(tie.isHistorized())? tie.$tie.changingColumnName as [Time_of_Change],
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$role.businessName]$(tie.hasMoreRoles())?,
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
// -------------------------------------------------- EQUIVALENCE -----------------------------------------------------
    if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -------------------------------------------------------------------------------------
-- EQ_Latest_$tie.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[EQ_Latest_$tie.businessName] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? tie.Positor,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$role.businessName]$(tie.hasMoreRoles())?,
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
    [$tie.capsule].[el$tie.name](@equivalent) tie;
GO
-- Point-in-time equivalence perspective ------------------------------------------------------------------------------
-- EQ_Point_$tie.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[EQ_Point_$tie.businessName] (
    @equivalent $schema.metadata.equivalentRange,
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? tie.Positor,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$role.businessName]$(tie.hasMoreRoles())?,
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
    [$tie.capsule].[ep$tie.name](@equivalent, @changingTimepoint) tie
GO
-- Now equivalence perspective ----------------------------------------------------------------------------------------
-- EQ_Current_$tie.businessName viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[EQ_Current_$tie.businessName] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$tie.capsule].[EQ_Point_$tie.businessName](@equivalent, $schema.metadata.now);
GO
~*/
        if(tie.isHistorized()) {
/*~
-- Difference equivalence perspective ---------------------------------------------------------------------------------
-- EQ_Difference_$tie.businessName showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[EQ_Difference_$tie.businessName] (
    @equivalent $schema.metadata.equivalentRange,
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? tie.$tie.positorColumnName as [Positor],
    $(tie.isHistorized())? tie.$tie.changingColumnName as [Time_of_Change],
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    tie.$role.knotValueColumnName AS [$role.businessName]$(tie.hasMoreRoles())?,
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
    [$tie.capsule].[ed$tie.name](@equivalent, @intervalStart, @intervalEnd) tie;
GO
~*/
    }
    } // end of equivalence
} // end of loop over ties
}