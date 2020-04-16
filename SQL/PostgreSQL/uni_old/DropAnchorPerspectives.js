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

/*~
-- DROP ANCHOR TEMPORAL PERSPECTIVES ----------------------------------------------------------------------------------
/*
~*/

var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
        if(schema.EQUIVALENCE) {
/*~
DROP FUNCTION IF EXISTS $anchor.capsule\.ed$anchor.name(
    $schema.metadata.equivalentRange, 
    $schema.metadata.chronon, 
    $schema.metadata.chronon, 
    text
);

DROP FUNCTION IF EXISTS $anchor.capsule\.en$anchor.name(
    $schema.metadata.equivalentRange
);

DROP FUNCTION IF EXISTS $anchor.capsule\.ep$anchor.name(
    $schema.metadata.equivalentRange, 
    $schema.metadata.chronon
);

DROP FUNCTION IF EXISTS $anchor.capsule\.el$anchor.name(
    $schema.metadata.equivalentRange
);
~*/
        } // end of equivalence
        
/*~
DROP FUNCTION IF EXISTS $anchor.capsule\.d$anchor.name(
    $schema.metadata.chronon, 
    $schema.metadata.chronon, 
    text
);

DROP VIEW IF EXISTS $anchor.capsule\.n$anchor.name;

DROP FUNCTION IF EXISTS $anchor.capsule\.p$anchor.name(
    $schema.metadata.chronon
);

DROP VIEW IF EXISTS $anchor.capsule\.l$anchor.name;
~*/
    } // end of if anchor has any attributes
}

/*~
*/
~*/