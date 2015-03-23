var tie;

while (tie = schema.nextTie()) {
/*~
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$tie.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $tie.capsule\.n$tie.name AS
SELECT
    *
FROM
    $tie.capsule\.p$tie.name($schema.metadata.now);
~*/
}