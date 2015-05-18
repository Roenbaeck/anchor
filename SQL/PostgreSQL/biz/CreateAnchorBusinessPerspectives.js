if(schema.BUSINESS_VIEWS) {
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
-- Under equivalence all these views default to equivalent = 0, however, corresponding
-- prepended-EQ perspectives are provided in order to select a specific equivalent.
--
-- @equivalent          the equivalent for which to retrieve data
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- Latest_$anchor.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[Latest_$anchor.businessName] AS
SELECT
    $(schema.CRT)? [$anchor.mnemonic].Positor,
    [$anchor.mnemonic].$anchor.identityColumnName as [$anchor.businessIdentityColumnName],
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    [$anchor.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$anchor.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$anchor.capsule].[l$anchor.name] [$anchor.mnemonic];
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- Point_$anchor.businessName viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[Point_$anchor.businessName] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? [$anchor.mnemonic].Positor,
    [$anchor.mnemonic].$anchor.identityColumnName as [$anchor.businessIdentityColumnName],
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    [$anchor.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$anchor.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$anchor.capsule].[p$anchor.name](@changingTimepoint) [$anchor.mnemonic]
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- Current_$anchor.businessName viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[Current_$anchor.businessName]
AS
SELECT
    *
FROM
    [$anchor.capsule].[Point_$anchor.businessName]($schema.metadata.now);
GO
~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- Difference_$anchor.businessName showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[Difference_$anchor.businessName] (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.[Time_of_Change],
    timepoints.[Subject_of_Change],
    [p$anchor.mnemonic].*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName AS [Time_of_Change],
        '$attribute.businessName' AS [Subject_of_Change]
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
    [$anchor.capsule].[Point_$anchor.businessName](timepoints.[Time_of_Change]) [p$anchor.mnemonic]
WHERE
    [p$anchor.mnemonic].$anchor.businessIdentityColumnName = timepoints.$anchor.identityColumnName;
GO
~*/
        }
// ------------------------------------------------ EQUIVALENCE -------------------------------------------------------
        if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -------------------------------------------------------------------------------------
-- EQ_Latest_$anchor.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[EQ_Latest_$anchor.businessName] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? [$anchor.mnemonic].Positor,
    [$anchor.mnemonic].$anchor.identityColumnName as [$anchor.businessIdentityColumnName],
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    [$anchor.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$anchor.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$anchor.capsule].[el$anchor.name](@equivalent) [$anchor.mnemonic];
GO
-- Point-in-time equivalence perspective ------------------------------------------------------------------------------
-- EQ_Point_$anchor.businessName viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[EQ_Point_$anchor.businessName] (
    @equivalent $schema.metadata.equivalentRange,
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? [$anchor.mnemonic].Positor,
    [$anchor.mnemonic].$anchor.identityColumnName as [$anchor.businessIdentityColumnName],
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    [$anchor.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$anchor.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$anchor.capsule].[ep$anchor.name](@equivalent, @changingTimepoint) [$anchor.mnemonic]
GO
-- Now equivalence perspective ----------------------------------------------------------------------------------------
-- EQ_Current_$anchor.businessName viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[EQ_Current_$anchor.businessName] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$anchor.capsule].[EQ_Point_$anchor.businessName](@equivalent, $schema.metadata.now);
GO
~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference equivalence perspective ---------------------------------------------------------------------------------
-- EQ_Difference_$anchor.businessName showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[EQ_Difference_$anchor.businessName] (
    @equivalent $schema.metadata.equivalentRange,
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.[Time_of_Change],
    timepoints.[Subject_of_Change],
    [p$anchor.mnemonic].*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName AS [Time_of_Change],
        '$attribute.businessName' AS [Subject_of_Change]
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
    [$anchor.capsule].[EQ_Point_$anchor.businessName](@equivalent, timepoints.[Time_of_Change]) [p$anchor.mnemonic]
WHERE
    [p$anchor.mnemonic].$anchor.businessIdentityColumnName = timepoints.$anchor.identityColumnName;
GO
~*/
        }
        } // end of if equivalence
    } // end of has any attributes
}
}