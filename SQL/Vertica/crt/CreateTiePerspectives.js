/*~
-- TIE TEMPORAL PERSPECTIVES ------------------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each tie. There are four types of perspectives: latest,
-- point-in-time, difference, and now.
--
-- The time traveling perspective shows information as it was or will be based on a number
-- of input parameters.
--
-- @positor             the view of which positor to adopt (defaults to 0)
-- @changingTimepoint   the point in changing time to travel to (defaults to End of Time)
-- @positingTimepoint   the point in positing time to travel to (defaults to End of Time)
-- @reliable            whether to show reliable (1) or unreliable (0) results
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
IF Object_ID('$tie.capsule$.d$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[d$tie.name];
IF Object_ID('$tie.capsule$.n$tie.name', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[n$tie.name];
IF Object_ID('$tie.capsule$.p$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[p$tie.name];
IF Object_ID('$tie.capsule$.l$tie.name', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[l$tie.name];
IF Object_ID('$tie.capsule$.t$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[t$tie.name];
GO
-- Time traveling perspective -----------------------------------------------------------------------------------------
-- t$tie.name viewed as given by the input parameters
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[t$tie.name] (
    @positor $schema.metadata.positorRange = 0,
    @changingTimepoint $schema.metadata.chronon = $schema.EOT,
    @positingTimepoint $schema.metadata.positingRange = $schema.EOT,
    @reliable tinyint = 1
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    tie.$tie.identityColumnName,
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    tie.$tie.positorColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
    tie.$tie.positingColumnName,
    tie.$tie.reliabilityColumnName,
    tie.$tie.reliableColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[r$tie.name](
        @positor,
        $(tie.isHistorized())? @changingTimepoint,
        @positingTimepoint
    ) tie
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
    tie.$tie.identityColumnName = (
        SELECT TOP 1
            sub.$tie.identityColumnName
        FROM
            [$tie.capsule].[r$tie.name](
                @positor,
                $(tie.isHistorized())? @changingTimepoint,
                @positingTimepoint
            ) sub
        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
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
                while(role = tie.nextValue()) {
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
            sub.$tie.reliableColumnName = @reliable
        ORDER BY
            $(tie.isHistorized())? sub.$tie.changingColumnName DESC,
            sub.$tie.positingColumnName DESC
    );
GO
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$tie.capsule].[l$tie.name] AS
SELECT
    *
FROM
    [$schema.metadata.encapsulation].[_$schema.metadata.positorSuffix] p
CROSS APPLY
    [$tie.capsule].[t$tie.name] (
        p.$schema.metadata.positorSuffix,
        DEFAULT,
        DEFAULT,
        DEFAULT
    ) tie;
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[p$tie.name] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$schema.metadata.encapsulation].[_$schema.metadata.positorSuffix] p
CROSS APPLY
    [$tie.capsule].[t$tie.name] (
        p.$schema.metadata.positorSuffix,
        @changingTimepoint,
        DEFAULT,
        DEFAULT
    ) tie;
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$tie.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$tie.capsule].[n$tie.name]
AS
SELECT
    *
FROM
    [$schema.metadata.encapsulation].[_$schema.metadata.positorSuffix] p
CROSS APPLY
    [$tie.capsule].[t$tie.name] (
        p.$schema.metadata.positorSuffix,
        $schema.metadata.now,
        DEFAULT,
        DEFAULT
    ) tie;
GO
~*/
        if(tie.isHistorized()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$tie.name showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[d$tie.name] (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
        }
/*~
    tie.*
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