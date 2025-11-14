if(schema.BUSINESS_VIEWS) {
/*~
-- NEXUS TEMPORAL BUSINESS PERSPECTIVES -----------------------------------------------------------------------------
--
-- These views and functions provide business friendly temporal perspectives over each nexus
-- paralleling the anchor and tie business perspectives. A nexus base row is immutable; only
-- its historized attributes vary over time. Roles (anchor/nexus/knot foreign keys) project
-- as business columns without historization logic.
--
-- Four base perspectives: Latest_, Point_, Difference_, Current_  (l / p / d / n)
-- Under equivalence: EQ_Latest_, EQ_Point_, EQ_Difference_, EQ_Current_ (el / ep / ed / en)
--
-- @changingTimepoint   point in changing time for point-in-time functions
-- @intervalStart       interval start (difference)
-- @intervalEnd         interval end (difference)
-- @selection           list of attribute mnemonics to filter differences (null = all)
-- @equivalent          equivalence key (equivalence variants)
--
-- Generation is skipped for nexuses without attributes to avoid trivial duplication of the base table.
-- Knot value columns respect schema.KNOT_ALIASES for presentable naming; both alias and knot value
-- are exposed analogous to anchor business perspectives when aliases are disabled.
--
~*/
var nexus, role, knot;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) { // only if attributes exist
/*~
-- Latest perspective ------------------------------------------------------------------------------------------------
-- Latest_$nexus.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[Latest_$nexus.businessName] AS
SELECT
    $(schema.CRT)? [$nexus.mnemonic].Positor,
    [$nexus.mnemonic].$nexus.identityColumnName as [$nexus.businessIdentityColumnName],
~*/
        // project role columns
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    [$nexus.mnemonic].$role.knotValueColumnName AS [$role.businessName]$(nexus.hasMoreRoles())?,
~*/
            }
            else {
/*~
    [$nexus.mnemonic].$role.columnName as [$role.businessColumnName]$(nexus.hasMoreRoles())?,
~*/
            }
        }
        var attribute, knotPresentableName;
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
                if(schema.KNOT_ALIASES)
                    knotPresentableName = attribute.businessName;
                else
                    knotPresentableName = attribute.knotBusinessName;
/*~
    [$nexus.mnemonic].$attribute.knotValueColumnName as [$knotPresentableName]$(nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$nexus.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(nexus.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$nexus.capsule].[l$nexus.name] [$nexus.mnemonic];
GO
-- Point-in-time perspective -----------------------------------------------------------------------------------------
-- Point_$nexus.businessName viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[Point_$nexus.businessName] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? [$nexus.mnemonic].Positor,
    [$nexus.mnemonic].$nexus.identityColumnName as [$nexus.businessIdentityColumnName],
~*/
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    [$nexus.mnemonic].$role.knotValueColumnName AS [$role.businessName]$(nexus.hasMoreRoles())?,
~*/
            }
            else {
/*~
    [$nexus.mnemonic].$role.columnName as [$role.businessColumnName]$(nexus.hasMoreRoles())?,
~*/
            }
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(schema.KNOT_ALIASES)? [$nexus.mnemonic].$attribute.knotValueColumnName as [$attribute.businessName],
    [$nexus.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(nexus.hasMoreAttributes())?,
~*/
            }
            else {
/*~
    [$nexus.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(nexus.hasMoreAttributes())?,
~*/
            }
        }
/*~
FROM
    [$nexus.capsule].[p$nexus.name](@changingTimepoint) [$nexus.mnemonic]
GO
-- Now perspective ---------------------------------------------------------------------------------------------------
-- Current_$nexus.businessName viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[Current_$nexus.businessName]
AS
SELECT
    *
FROM
    [$nexus.capsule].[Point_$nexus.businessName]($schema.metadata.now);
GO
~*/
        if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective --------------------------------------------------------------------------------------------
-- Difference_$nexus.businessName showing differences between timepoints (optionally subset of attributes)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[Difference_$nexus.businessName] (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.[Time_of_Change],
    timepoints.[Subject_of_Change],
    [p$nexus.mnemonic].*
FROM (
~*/
            while (attribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $nexus.identityColumnName,
        $attribute.changingColumnName AS [Time_of_Change],
        '$attribute.businessName' AS [Subject_of_Change]
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](0) : [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
    $(nexus.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) timepoints
CROSS APPLY
    [$nexus.capsule].[Point_$nexus.businessName](timepoints.[Time_of_Change]) [p$nexus.mnemonic]
WHERE
    [p$nexus.mnemonic].$nexus.businessIdentityColumnName = timepoints.$nexus.identityColumnName;
GO
~*/
        }
// ---------------------------------------------- EQUIVALENCE -------------------------------------------------------
        if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective ------------------------------------------------------------------------------------
-- EQ_Latest_$nexus.businessName viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[EQ_Latest_$nexus.businessName] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? [$nexus.mnemonic].Positor,
    [$nexus.mnemonic].$nexus.identityColumnName as [$nexus.businessIdentityColumnName],
~*/
            while (role = nexus.nextRole && nexus.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    [$nexus.mnemonic].$role.knotValueColumnName AS [$role.businessName]$(nexus.hasMoreRoles())?,
~*/
                }
                else {
/*~
    [$nexus.mnemonic].$role.columnName as [$role.businessColumnName]$(nexus.hasMoreRoles())?,
~*/
                }
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
                if(attribute.isKnotted && attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(schema.KNOT_ALIASES)? [$nexus.mnemonic].$attribute.knotValueColumnName as [$attribute.businessName],
    [$nexus.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(nexus.hasMoreAttributes())?,
~*/
                }
                else {
/*~
    [$nexus.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(nexus.hasMoreAttributes())?,
~*/
                }
            }
/*~
FROM
    [$nexus.capsule].[el$nexus.name](@equivalent) [$nexus.mnemonic];
GO
-- Point-in-time equivalence perspective -----------------------------------------------------------------------------
-- EQ_Point_$nexus.businessName viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[EQ_Point_$nexus.businessName] (
    @equivalent $schema.metadata.equivalentRange,
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.CRT)? [$nexus.mnemonic].Positor,
    [$nexus.mnemonic].$nexus.identityColumnName as [$nexus.businessIdentityColumnName],
~*/
            while (role = nexus.nextRole && nexus.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    [$nexus.mnemonic].$role.knotValueColumnName AS [$role.businessName]$(nexus.hasMoreRoles())?,
~*/
                }
                else {
/*~
    [$nexus.mnemonic].$role.columnName as [$role.businessColumnName]$(nexus.hasMoreRoles())?,
~*/
                }
            }
            while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
                if(attribute.isKnotted && attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(schema.KNOT_ALIASES)? [$nexus.mnemonic].$attribute.knotValueColumnName as [$attribute.businessName],
    [$nexus.mnemonic].$attribute.knotValueColumnName as [$attribute.knotBusinessName]$(nexus.hasMoreAttributes())?,
~*/
                }
                else {
/*~
    [$nexus.mnemonic].$attribute.valueColumnName as [$attribute.businessName]$(nexus.hasMoreAttributes())?,
~*/
                }
            }
/*~
FROM
    [$nexus.capsule].[ep$nexus.name](@equivalent, @changingTimepoint) [$nexus.mnemonic]
GO
-- Now equivalence perspective ---------------------------------------------------------------------------------------
-- EQ_Current_$nexus.businessName viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[EQ_Current_$nexus.businessName] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE AS RETURN
SELECT
    *
FROM
    [$nexus.capsule].[EQ_Point_$nexus.businessName](@equivalent, $schema.metadata.now);
GO
~*/
            if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
-- Difference equivalence perspective -------------------------------------------------------------------------------
-- EQ_Difference_$nexus.businessName showing differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[EQ_Difference_$nexus.businessName] (
    @equivalent $schema.metadata.equivalentRange,
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.[Time_of_Change],
    timepoints.[Subject_of_Change],
    [p$nexus.mnemonic].*
FROM (
~*/
                while (attribute = nexus.nextHistorizedAttribute && nexus.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $nexus.identityColumnName,
        $attribute.changingColumnName AS [Time_of_Change],
        '$attribute.businessName' AS [Subject_of_Change]
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) : [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
    $(nexus.hasMoreHistorizedAttributes())? UNION
~*/
                }
/*~
) timepoints
CROSS APPLY
    [$nexus.capsule].[EQ_Point_$nexus.businessName](@equivalent, timepoints.[Time_of_Change]) [p$nexus.mnemonic]
WHERE
    [p$nexus.mnemonic].$nexus.businessIdentityColumnName = timepoints.$nexus.identityColumnName;
GO
~*/
            }
        } // end equivalence
    } // end has attributes
} // loop nexuses
}
