/*~
-- TIE TEMPORAL PERSPECTIVES ------------------------------------------------------------------------------------------
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
IF Object_ID('d$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[d$tie.name];
IF Object_ID('n$tie.name', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[n$tie.name];
IF Object_ID('p$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[p$tie.name];
IF Object_ID('l$tie.name', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[l$tie.name];
GO
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$tie.capsule].[l$tie.name] WITH SCHEMABINDING AS
SELECT
    $(METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
ON
    [$role.name].$knot.identityColumnName = tie.$role.columnName~*/
        }
        if(tie.isHistorized()) {
/*~
WHERE
    tie.$tie.changingColumnName = (
        SELECT
            max(sub.$tie.changingColumnName)
        FROM
            [$tie.capsule].[$tie.name] sub
        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while (role = tie.nextIdentifier()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreIdentifiers())? AND
~*/
                }
            }
            else {
                while (role = tie.nextValue()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreValues())? OR
~*/
                }
            }
/*~
   )~*/
        }
/*~;
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[p$tie.name] ﻿(
    @changingTimepoint $schema.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    $(METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
ON
    [$role.name].$knot.identityColumnName = tie.$role.columnName~*/
        }
        if(tie.isHistorized()) {
/*~
WHERE
    tie.$tie.changingColumnName = (
        SELECT
            max(sub.$tie.changingColumnName)
        FROM
            [$tie.capsule].[$tie.name] sub
        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while (role = tie.nextIdentifier()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        AND
~*/
                }
            }
            else {
/*~
        (
~*/
                while (role = tie.nextValue()) {
/*~
                sub.$role.columnName = tie.$role.columnName
            $(tie.hasMoreValues())? OR
~*/
                }
/*~
        )
        AND
~*/
            }
/*~
            sub.$tie.changingColumnName <= @changingTimepoint
   )~*/
        }
/*~;
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$tie.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$tie.capsule].[n$tie.name]
AS
SELECT
    *
FROM
    [$tie.capsule].[p$tie.name]($schema.now);
GO
~*/
        if(tie.isHistorized()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$tie.name showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[d$tie.name] (
    @intervalStart $schema.chronon,
    @intervalEnd $schema.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
ON
    [$role.name].$knot.identityColumnName = tie.$role.columnName
~*/
        }
/*~
WHERE
    tie.$tie.changingColumnName BETWEEN @intervalStart AND @intervalEnd;
GO
~*/
    }
}