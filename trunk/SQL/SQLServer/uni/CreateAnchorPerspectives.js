/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
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
~*/
var anchor;
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
/*~
-- Drop perspectives --------------------------------------------------------------------------------------------------
IF Object_ID('d$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[d$anchor.name];
IF Object_ID('n$anchor.name', 'V') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[n$anchor.name];
IF Object_ID('p$anchor.name', 'IF') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[p$anchor.name];
IF Object_ID('l$anchor.name', 'V') IS NOT NULL
DROP FUNCTION [$anchor.capsule].[l$anchor.name];
GO
~*/
    if(anchor.attributes.length > 0) { // only do perspectives if there are attributes
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[l$anchor.name] WITH SCHEMABINDING AS
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
~*/
        if(schema.metadataUsage == 'true') {
/*~
    [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
        }
        var b, knot, attribute;
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(schema.naming == 'improved') {
/*~
    [$attribute.mnemonic].$attribute.anchorReferenceName,
~*/
            }
            if(schema.metadataUsage == 'true') {
/*~
    [$attribute.mnemonic].$attribute.metadataColumnName,
~*/
            }
            if(attribute.timeRange) {
/*~
    [$attribute.mnemonic].$attribute.changingColumnName
~*/
            }
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
/*~
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
~*/
                if(schema.metadataUsage == 'true') {
/*~
    [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
                }
            }
            if(b == anchor.attributes.length - 1) {
/*~
    [$attribute.mnemonic].$attribute.valueColumnName
~*/
            }
            else {
/*~
    [$attribute.mnemonic].$attribute.valueColumnName,
~*/
            }
        }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
/*~
LEFT JOIN
    [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName~*/
            if(attribute.timeRange) {
/*~
﻿AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            [$attribute.capsule].[$attribute.name] sub
        WHERE
            sub.$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
   )~*/
            }
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
/*~
﻿LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
            }
            if(b == anchor.attributes.length - 1) {
                /*~;~*/
            }
        }
/*~
GO
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$anchor.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[p$anchor.name] ﻿(
    @changingTimepoint $schema.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
~*/
        if(schema.metadataUsage == 'true') {
/*~
    [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
        }
        var b, knot, attribute;
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(schema.naming == 'improved') {
/*~
    [$attribute.mnemonic].$attribute.anchorReferenceName,
~*/
            }
            if(schema.metadataUsage == 'true') {
/*~
    [$attribute.mnemonic].$attribute.metadataColumnName,
~*/
            }
            if(attribute.timeRange) {
/*~
    [$attribute.mnemonic].$attribute.changingColumnName
~*/
            }
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
/*~
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
~*/
                if(schema.metadataUsage == 'true') {
/*~
    [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
                }
            }
            if(b == anchor.attributes.length - 1) {
/*~
    [$attribute.mnemonic].$attribute.valueColumnName
~*/
            }
            else {
/*~
    [$attribute.mnemonic].$attribute.valueColumnName,
~*/
            }
        }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(attribute.timeRange) {
/*~
LEFT JOIN
    [$attribute.capsule].[r$attribute.name](@changingTimepoint) [$attribute.mnemonic]
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
﻿AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            [$attribute.capsule].[r$attribute.name](@changingTimepoint) sub
        WHERE
            sub.$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
   )~*/
            }
            else {
/*~
LEFT JOIN
    [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName~*/
            }
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
/*~
﻿LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
            }
            if(b == anchor.attributes.length - 1) {
                /*~;~*/
            }
        }
/*~
GO
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE VIEW [$anchor.capsule].[n$anchor.name]
SELECT
    *
FROM
    [$anchor.capsule].[p$anchor.name](SYSDATETIME());
GO
~*/
        if(anchor.historizedAttributes.length > 0) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[d$anchor.name] (
    @intervalStart $schema.chronon,
    @intervalEnd $schema.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    [p$anchor.mnemonic].*
FROM (
~*/
        for(b = 0; attribute = anchor.attribute[anchor.historizedAttributes[b]]; b++) {
/*~
    SELECT DISTINCT
        $attribute.changingColumnName AS inspectedTimepoint
    FROM
        [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
~*/
            if(b < anchor.historizedAttributes.length - 1) {
/*~
    UNION
~*/
            }
        }
/*~
) timepoints
CROSS APPLY
    [$anchor.capsule].[p$anchor.name](timepoints.inspectedTimepoint) [p$anchor.mnemonic];
GO
~*/
        }
    }
}