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
-- @positor             the view of which positor to adopt (defaults to 0)
-- @changingTimepoint   the point in changing time to travel to (defaults to End of Time)
-- @positingTimepoint   the point in positing time to travel to (defaults to End of Time)
-- @assertion           whether to show positve, negative, uncertain, or all posits (defaults to all)
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
    @positor $schema.metadata.positorRange = 0,
    @changingTimepoint $schema.metadata.chronon = $schema.EOT,
    @positingTimepoint $schema.metadata.positingRange = $schema.EOT,
    @assertion char(1) = null
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
    [$attribute.mnemonic].$attribute.positorColumnName,
    [$attribute.mnemonic].$attribute.reliabilityColumnName,
    [$attribute.mnemonic].$attribute.assertionColumnName,
~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(schema.KNOT_ALIASES)? [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.name,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
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
LEFT JOIN
    [$attribute.capsule].[r$attribute.name](
        @positor,
        $(attribute.isHistorized())? @changingTimepoint,
        @positingTimepoint
    ) [$attribute.mnemonic]
ON
    [$attribute.mnemonic].$attribute.identityColumnName = (
        SELECT TOP 1
            sub.$attribute.identityColumnName
        FROM
            [$attribute.capsule].[r$attribute.name](
                @positor,
                $(attribute.isHistorized())? @changingTimepoint,
                @positingTimepoint
            ) sub
        WHERE
            sub.$attribute.entityReferenceName = [$nexus.mnemonic].$nexus.identityColumnName
        AND
            sub.$attribute.assertionColumnName = isnull(@assertion, sub.$attribute.assertionColumnName)
        ORDER BY
            $(attribute.isHistorized())? sub.$attribute.changingColumnName DESC,
            sub.$attribute.positingColumnName DESC,
            sub.$attribute.reliabilityColumnName DESC
    )~*/
            if(attribute.isKnotted && attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
            }
            if(!nexus.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
GO

-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$nexus.name viewed by the latest available information for all positors (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[l$nexus.name]
AS
SELECT
    p.*, 
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$nexus.mnemonic].*
FROM
    [$schema.metadata.encapsulation].[_$schema.metadata.positorSuffix] p
CROSS APPLY
    [$nexus.capsule].[t$nexus.name] (
        p.$schema.metadata.positorSuffix,
        DEFAULT,
        DEFAULT,
        '+' -- positve assertions only
    ) [$nexus.mnemonic];
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$nexus.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[p$nexus.name] (
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    p.*,
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$nexus.mnemonic].*
FROM
    [$schema.metadata.encapsulation].[_$schema.metadata.positorSuffix] p
CROSS APPLY
    [$nexus.capsule].[t$nexus.name] (
        p.$schema.metadata.positorSuffix,
        @changingTimepoint,
        DEFAULT,
        '+' -- positve assertions only
    ) [$nexus.mnemonic];
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$nexus.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$nexus.capsule].[n$nexus.name]
AS
SELECT
    p.*, 
    cast(null as $schema.metadata.reliabilityRange) as $schema.metadata.reliabilitySuffix,
    [$nexus.mnemonic].*
FROM
    [$schema.metadata.encapsulation].[_$schema.metadata.positorSuffix] p
CROSS APPLY
    [$nexus.capsule].[t$nexus.name] (
        p.$schema.metadata.positorSuffix,
        $schema.metadata.now,
        DEFAULT,
        '+' -- positve assertions only
    ) [$nexus.mnemonic];
GO
~*/
        if(nexus.hasMoreHistorizedAttributes && nexus.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$nexus.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$nexus.capsule].[d$nexus.name] (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    p.$schema.metadata.positorSuffix,
    timepoints.inspectedTimepoint,
    [$nexus.mnemonic].*
FROM
    [$schema.metadata.encapsulation].[_$schema.metadata.positorSuffix] p
CROSS JOIN
    (
        SELECT DISTINCT
            timepoint AS inspectedTimepoint
        FROM
            [$schema.metadata.encapsulation].[p$schema.metadata.positorSuffix]
        CROSS APPLY
            [$schema.metadata.encapsulation].[_AnchorTimepoints](
                @intervalStart,
                @intervalEnd
            )
    ) timepoints
CROSS APPLY
    [$nexus.capsule].[t$nexus.name](p.$schema.metadata.positorSuffix, timepoints.inspectedTimepoint, DEFAULT, '+') [$nexus.mnemonic]
WHERE
    @selection is null
OR
    EXISTS (
        SELECT
            1
        FROM
            [$schema.metadata.encapsulation].[_SplitMnemonic](@selection)
        JOIN
            [$schema.metadata.encapsulation].[_AnchorAttributes]
        ON
            mnemonic = [attribute]
        AND
            [anchor] = '$nexus.name'
        CROSS APPLY
            [$schema.metadata.encapsulation].[_AttributeTimepoints](
                [capsule],
                [attribute],
                p.$schema.metadata.positorSuffix,
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
