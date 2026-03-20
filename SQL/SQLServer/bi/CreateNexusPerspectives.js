/*~
-- NEXUS TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- These table valued functions simplify temporal querying by providing a temporal
-- perspective of each nexus. There are five types of perspectives: time traveling, latest,
-- point-in-time, difference, and now. They also denormalize the nexus, its attributes,
-- and referenced knots from sixth to third normal form.
--
-- The time traveling perspective shows information as it was or will be based on a number
-- of input parameters.
--
-- @changingTimepoint   the point in changing time to travel to (defaults to End of Time)
-- @positingTimepoint   the point in positing time to travel to (defaults to End of Time)
--
-- The latest perspective shows the latest available (changing & positing) information for each nexus.
-- The now perspective shows the information as it is right now, with latest positing time.
-- The point-in-time perspective lets you travel through the information to the given timepoint,
-- with latest positing time and the given point in changing time.
--
-- @changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints, and for
-- changes in all or a selection of attributes, with latest positing time.
--
-- @intervalStart       the start of the interval for finding changes
-- @intervalEnd         the end of the interval for finding changes
-- @selection           a list of mnemonics for tracked attributes, ie 'MNE MON ICS', or null for all
--
~*/
var nexus, role, knot, attribute;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
IF Object_ID('$nexus.capsule$.d$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[d$nexus.name];
IF Object_ID('$nexus.capsule$.n$nexus.name', 'V') IS NOT NULL
DROP VIEW [$nexus.capsule].[n$nexus.name];
IF Object_ID('$nexus.capsule$.p$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[p$nexus.name];
IF Object_ID('$nexus.capsule$.l$nexus.name', 'V') IS NOT NULL
DROP VIEW [$nexus.capsule].[l$nexus.name];
IF Object_ID('$nexus.capsule$.t$nexus.name', 'IF') IS NOT NULL
DROP FUNCTION [$nexus.capsule].[t$nexus.name];
GO
~*/
    if(nexus.hasMoreAttributes && nexus.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Time traveling perspective -----------------------------------------------------------------------------------------
-- t$nexus.name viewed as given by the input parameters
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[t$nexus.name] (
    @changingTimepoint $schema.metadata.chronon = $schema.EOT,
    @positingTimepoint $schema.metadata.positingRange = $schema.EOT
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$nexus.mnemonic].$nexus.identityColumnName,
    $(schema.METADATA)? [$nexus.mnemonic].$nexus.metadataColumnName,
~*/
        while (role = nexus.nextRole && nexus.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? [$role.name].$knot.checksumColumnName AS $role.knotChecksumColumnName,
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    [$nexus.mnemonic].$role.columnName$(nexus.hasMoreAttributes())?,
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.entityReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    [$attribute.mnemonic].$attribute.identityColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    [$attribute.mnemonic].$attribute.positingColumnName,
    [$attribute.mnemonic].$attribute.reliabilityColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(schema.KNOT_ALIASES)? [$attribute.mnemonic].$knot.valueColumnName AS $attribute.name,
    [$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
    [$attribute.mnemonic].$attribute.valueColumnName$(nexus.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    [$nexus.capsule].[$nexus.name] [$nexus.mnemonic]
~*/
        while (role = nexus.nextKnotRole && nexus.nextKnotRole()) {
            knot = role.knot;
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
ON
    [$role.name].$knot.identityColumnName = [$nexus.mnemonic].$role.columnName
~*/
        }
        while (attribute = nexus.nextAttribute && nexus.nextAttribute()) {
/*~
OUTER APPLY (
    SELECT TOP 1
        $(schema.IMPROVED)? [r$attribute.mnemonic].$attribute.entityReferenceName,
        $(schema.METADATA)? [r$attribute.mnemonic].$attribute.metadataColumnName,
        [r$attribute.mnemonic].$attribute.identityColumnName,
        $(attribute.timeRange)? [r$attribute.mnemonic].$attribute.changingColumnName,
        [r$attribute.mnemonic].$attribute.positingColumnName,
        [r$attribute.mnemonic].$attribute.reliabilityColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName,
        $(schema.KNOT_ALIASES)? [k$attribute.mnemonic].$knot.valueColumnName,
        [k$attribute.mnemonic].$knot.valueColumnName,
        $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName,
~*/
            }
/*~
        $(attribute.hasChecksum())? [r$attribute.mnemonic].$attribute.checksumColumnName,
        [r$attribute.mnemonic].$attribute.valueColumnName
    FROM
        [$attribute.capsule].[r$attribute.name](
            $(attribute.isHistorized())? @changingTimepoint,
            @positingTimepoint
        ) [r$attribute.mnemonic]
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    JOIN
        [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
    ON
        [k$attribute.mnemonic].$knot.identityColumnName = [r$attribute.mnemonic].$attribute.knotReferenceName
~*/
            }
/*~
    WHERE
		[r$attribute.mnemonic].$attribute.entityReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
	AND 
		[r$attribute.mnemonic].$attribute.reliabilityColumnName = 1
	ORDER BY
        $(attribute.isHistorized())? [r$attribute.mnemonic].$attribute.changingColumnName DESC,
        [r$attribute.mnemonic].$attribute.positingColumnName DESC
) [$attribute.mnemonic]~*/
            if(!nexus.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
GO

-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$nexus.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[l$nexus.name]
AS
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$nexus.mnemonic].*
FROM
    [$nexus.capsule].t$nexus.name (
        DEFAULT,
        DEFAULT
    ) [$nexus.mnemonic];
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$nexus.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].p$nexus.name (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$nexus.mnemonic].*
FROM
    [$nexus.capsule].t$nexus.name (
        @changingTimepoint,
        DEFAULT
    ) [$nexus.mnemonic];
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$nexus.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].n$nexus.name
AS
SELECT
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$nexus.mnemonic].*
FROM
    [$nexus.capsule].t$nexus.name (
        $schema.metadata.now,
        DEFAULT
    ) [$nexus.mnemonic];
GO
~*/
        if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$nexus.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].d$nexus.name (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    [$nexus.mnemonic].*
FROM
    (
        SELECT DISTINCT
            timepoint AS inspectedTimepoint
        FROM
            [$schema.metadata.encapsulation].[_AnchorTimepoints](
                @intervalStart,
                @intervalEnd
            )
    ) timepoints
CROSS APPLY
    [$nexus.capsule].p$nexus.name(timepoints.inspectedTimepoint) [$nexus.mnemonic]
WHERE
    @selection is null
OR
    EXISTS (
        SELECT
            1
        FROM
            [$schema.metadata.encapsulation].[p$schema.metadata.positorSuffix]
        CROSS APPLY
            [$schema.metadata.encapsulation].[_SplitMnemonic](@selection)
        JOIN
            [$schema.metadata.encapsulation].[_AnchorAttributes]
        ON
            mnemonic = [attribute]
        AND
            [anchor] = '$nexus.name'
        JOIN
            [$schema.metadata.encapsulation].[p$schema.metadata.positorSuffix] positors
        ON
            positors.$schema.metadata.positorSuffix = 0
        CROSS APPLY
            [$schema.metadata.encapsulation].[_AttributeTimepoints](
                [capsule],
                [attribute],
                positors.$schema.metadata.positorSuffix,
                @intervalStart,
                @intervalEnd
            )
        WHERE
            timepoint = timepoints.inspectedTimepoint
    );
GO
~*/
        }
    }
}
