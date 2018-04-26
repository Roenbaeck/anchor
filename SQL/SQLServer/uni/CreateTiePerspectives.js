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
-- Under equivalence all these views default to equivalent = 0, however, corresponding
-- prepended-e perspectives are provided in order to select a specific equivalent.
--
-- @equivalent          the equivalent for which to retrieve data
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
~*/
    if(schema.EQUIVALENCE) {
/*~
IF Object_ID('$tie.capsule$.ed$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[ed$tie.name];
IF Object_ID('$tie.capsule$.en$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[en$tie.name];
IF Object_ID('$tie.capsule$.ep$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[ep$tie.name];
IF Object_ID('$tie.capsule$.el$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[el$tie.name];
~*/
    }
/*~
IF Object_ID('$tie.capsule$.d$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[d$tie.name];
IF Object_ID('$tie.capsule$.n$tie.name', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[n$tie.name];
IF Object_ID('$tie.capsule$.p$tie.name', 'IF') IS NOT NULL
DROP FUNCTION [$tie.capsule].[p$tie.name];
IF Object_ID('$tie.capsule$.l$tie.name', 'V') IS NOT NULL
DROP VIEW [$tie.capsule].[l$tie.name];
GO
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$tie.capsule].[l$tie.name] WITH SCHEMABINDING AS
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isDeletable())? cast(null as bit) as $tie.deletableColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
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
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie~*/
        while (role = tie.nextKnotRole()) {
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
                while (role = tie.nextAnchorRole()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreAnchorRoles())? OR
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
CREATE FUNCTION [$tie.capsule].[p$tie.name] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
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
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie~*/
        while (role = tie.nextKnotRole()) {
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
                while (role = tie.nextAnchorRole()) {
/*~
                sub.$role.columnName = tie.$role.columnName
            $(tie.hasMoreAnchorRoles())? OR
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
    [$tie.capsule].[p$tie.name]($schema.metadata.now);
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
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
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
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie
~*/
        while (role = tie.nextKnotRole()) {
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
    [$role.name].$knot.identityColumnName = tie.$role.columnName
~*/
        }
/*~
WHERE
    tie.$tie.changingColumnName BETWEEN @intervalStart AND @intervalEnd;
GO
~*/
    }
// --------------------------------------- DO THE EQUIVALENCE THING ---------------------------------------------------
    if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -------------------------------------------------------------------------------------
-- el$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[el$tie.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
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
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie~*/
        while (role = tie.nextKnotRole()) {
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
                while (role = tie.nextAnchorRole()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreAnchorRoles())? OR
~*/
                }
            }
/*~
   )~*/
        }
/*~;
GO
-- Point-in-time equivalence perspective ------------------------------------------------------------------------------------------
-- ep$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[ep$tie.name] (
    @equivalent $schema.metadata.equivalentRange,
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
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
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie~*/
        while (role = tie.nextKnotRole()) {
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
                while (role = tie.nextAnchorRole()) {
/*~
                sub.$role.columnName = tie.$role.columnName
            $(tie.hasMoreAnchorRoles())? OR
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
-- Now equivalence perspective ----------------------------------------------------------------------------------------
-- en$tie.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[en$tie.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$tie.capsule].[ep$tie.name](@equivalent, $schema.metadata.now);
GO
~*/
        if(tie.isHistorized()) {
/*~
-- Difference equivalence perspective ---------------------------------------------------------------------------------
-- ed$tie.name showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[ed$tie.name] (
    @equivalent $schema.metadata.equivalentRange,
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
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
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie
~*/
        while (role = tie.nextKnotRole()) {
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
    [$role.name].$knot.identityColumnName = tie.$role.columnName
~*/
        }
/*~
WHERE
    tie.$tie.changingColumnName BETWEEN @intervalStart AND @intervalEnd;
GO
~*/
    }
    } // end of if equivalence
}