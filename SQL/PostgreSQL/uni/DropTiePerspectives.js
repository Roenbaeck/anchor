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
-- changingTimepoint   the point in changing time to travel to
--
-- The difference perspective shows changes between the two given timepoints.
--
-- intervalStart       the start of the interval for finding changes
-- intervalEnd         the end of the interval for finding changes
--
-- Under equivalence all these views default to equivalent = 0, however, corresponding
-- prepended-e perspectives are provided in order to select a specific equivalent.
--
-- equivalent          the equivalent for which to retrieve data
--
~*/

/*~
-- DROP TIE TEMPORAL PERSPECTIVES ----------------------------------------------------------------------------------
/*
~*/

var tie, role, knot;
while (tie = schema.nextTie()) {
    if(schema.EQUIVALENCE) {
/*~
DROP FUNCTION IF EXISTS $tie.capsule\.ed$tie.name(

);

DROP FUNCTION IF EXISTS $tie.capsule\.en$tie.name(

);

DROP FUNCTION IF EXISTS $tie.capsule\.ep$tie.name(

);

DROP FUNCTION IF EXISTS $tie.capsule\.el$tie.name(

);
~*/
    } // end of equivalence
    
    if(tie.isHistorized()) {
/*~
DROP FUNCTION IF EXISTS $tie.capsule\.d$tie.name(
    $schema.metadata.chronon,
    $schema.metadata.chronon
);
~*/
    }
/*~

DROP VIEW IF EXISTS $tie.capsule\.n$tie.name;

DROP FUNCTION IF EXISTS $tie.capsule\.p$tie.name(
    $schema.metadata.chronon
);

DROP VIEW IF EXISTS $tie.capsule\.l$tie.name;
~*/
}

/*~
*/
~*/