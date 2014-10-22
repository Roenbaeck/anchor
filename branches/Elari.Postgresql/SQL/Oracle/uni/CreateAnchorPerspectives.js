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
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
CREATE OR REPLACE VIEW l$anchor.name AS
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
SELECT
    $anchor.mnemonic\.$anchor.identityColumnName,
    $(schema.METADATA)? $anchor.mnemonic\.$anchor.metadataColumnName,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.mnemonic\.$attribute.anchorReferenceName,
    $(schema.METADATA)? $attribute.mnemonic\.$attribute.metadataColumnName,
    $(attribute.timeRange)? $attribute.mnemonic\.$attribute.changingColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    k$attribute.mnemonic\.$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? k$attribute.mnemonic\.$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $attribute.mnemonic\.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM $anchor.name $anchor.mnemonic
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
LEFT JOIN $attribute.name $attribute.mnemonic ON $attribute.mnemonic\.$attribute.anchorReferenceName = $anchor.mnemonic\.$anchor.identityColumnName~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN $knot.name k$attribute.mnemonic ON k$attribute.mnemonic\.$knot.identityColumnName = $attribute.mnemonic\.$attribute.knotReferenceName~*/
            }
        }
/*~ 
WHERE 1=1 
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isHistorized()) {
/*~
AND (
    $attribute.mnemonic\.$attribute.changingColumnName = (
        SELECT max(sub.$attribute.changingColumnName)
        FROM $attribute.name sub
        WHERE sub.$attribute.anchorReferenceName = $anchor.mnemonic\.$anchor.identityColumnName
    ) 
    OR $attribute.mnemonic\.$attribute.changingColumnName is null
)
~*/
            }
            if(!anchor.hasMoreAttributes()) {
/*~;~*/
            }
        }
    
/*~    
/*
CREATE FUNCTION [$anchor.capsule].[p$anchor.name] ﻿(
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$anchor.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
    @changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
    $(schema.METADATA)? [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    [$attribute.mnemonic].$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isHistorized()) {
/*~
LEFT JOIN
    [$attribute.capsule].[r$attribute.name](@changingTimepoint) [$attribute.mnemonic]
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
AND
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
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
            }
            if(!anchor.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
GO 

CREATE VIEW [$anchor.capsule].[n$anchor.name]
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
AS
SELECT
    *
FROM
    [$anchor.capsule].[p$anchor.name]($schema.metadata.now);
GO
~*/
        if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[d$anchor.name] (
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    [p$anchor.mnemonic].*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.changingColumnName AS inspectedTimepoint
    FROM
        [$attribute.capsule].[$attribute.name]
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
    [$anchor.capsule].[p$anchor.name](timepoints.inspectedTimepoint) [p$anchor.mnemonic];
GO 

~*/
        }
/*~ */ -- TEST
~*/
    } else {
/*~
CREATE OR REPLACE VIEW l$anchor.name AS
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
    SELECT * FROM $anchor.name $anchor.mnemonic
;
~*/
    }
}
