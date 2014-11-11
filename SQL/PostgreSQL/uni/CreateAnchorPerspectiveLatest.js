/*~
-- ANCHOR TEMPORAL PERSPECTIVES ---------------------------------------------------------------------------------------
--
-- These functions simplify temporal querying by providing a temporal
-- perspective of each anchor. There are four types of perspectives: latest,
-- point-in-time, difference, and now. They also denormalize the anchor, its attributes,
-- and referenced knots from sixth to third normal form.
--
-- The latest perspective shows the latest available information for each anchor.
-- The now perspective shows the information as it is right now.
-- The point-in-time perspective lets you travel through the information to the given timepoint.
--
-- changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints, and for
-- changes in all or a selection of attributes.
--
-- intervalStart       the start of the interval for finding changes
-- intervalEnd         the end of the interval for finding changes
-- selection           a list of mnemonics for tracked attributes, ie 'MNE MON ICS', or null for all
--
-- Under equivalence all these views default to equivalent = 0, however, corresponding
-- prepended-e perspectives are provided in order to select a specific equivalent.
--
-- equivalent          the equivalent for which to retrieve data
--
~*/
var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW \"l$anchor.name\" AS
SELECT
    \"$anchor.mnemonic\"\.\"$anchor.identityColumnName\",
    $(schema.METADATA)? \"$anchor.mnemonic\"\.\"$anchor.metadataColumnName\",
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? \"$attribute.mnemonic\"\.\"$attribute.anchorReferenceName\",
    $(schema.METADATA)? \"$attribute.mnemonic\"\.\"$attribute.metadataColumnName\",
    $(attribute.timeRange)? \"$attribute.mnemonic\"\.\"$attribute.changingColumnName\",
    $(attribute.isEquivalent())? \"$attribute.mnemonic\"\.\"$attribute.equivalentColumnName\",
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? \"k$attribute.mnemonic\"\.\"$knot.checksumColumnName\" AS \"$attribute.knotChecksumColumnName\",
    $(knot.isEquivalent())? \"k$attribute.mnemonic\"\.\"$knot.equivalentColumnName\" AS \"$attribute.knotEquivalentColumnName\",
    \"k$attribute.mnemonic\"\.\"$knot.valueColumnName\" AS \"$attribute.knotValueColumnName\",
    $(schema.METADATA)? \"k$attribute.mnemonic\"\.\"$knot.metadataColumnName\" AS \"$attribute.knotMetadataColumnName\",
~*/
            }
/*~
    $(attribute.hasChecksum())? \"$attribute.mnemonic\"\.\"$attribute.checksumColumnName\",
    \"$attribute.mnemonic\"\.\"$attribute.valueColumnName\"$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    \"$anchor.name\" \"$anchor.mnemonic\"
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isEquivalent()) {
/*~
LEFT JOIN
    \"e$attribute.name\"(0) \"$attribute.mnemonic\"
~*/
            }
            else {
/*~
LEFT JOIN
    \"$attribute.name\" \"$attribute.mnemonic\"
~*/
            }
/*~
ON
    \"$attribute.mnemonic\"\.\"$attribute.anchorReferenceName\" = \"$anchor.mnemonic\"\.\"$anchor.identityColumnName\"~*/
            if(attribute.isHistorized()) {
/*~
AND
    \"$attribute.mnemonic\"\.\"$attribute.changingColumnName\" = (
        SELECT
            max(sub.\"$attribute.changingColumnName\")
        FROM
            $(attribute.isEquivalent())? \"e$attribute.name\"(0) sub : \"$attribute.name\" sub
        WHERE
            sub.\"$attribute.anchorReferenceName\" = \"$anchor.mnemonic\"\.\"$anchor.identityColumnName\"
   )~*/
            }
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    \"e$knot.name\"(0) \"k$attribute.mnemonic\"
~*/
                }
                else {
/*~
LEFT JOIN
    \"$knot.name\" \"k$attribute.mnemonic\"
~*/
                }
/*~
ON
    \"k$attribute.mnemonic\"\.\"$knot.identityColumnName\" = \"$attribute.mnemonic\"\.\"$attribute.knotReferenceName\"~*/
            }
        }
/*~;~*/
    } // end of if anchor has any attributes
}