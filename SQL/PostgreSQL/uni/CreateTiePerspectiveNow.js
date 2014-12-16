var tie;

while (tie = schema.nextTie()) {
/*~
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$tie.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW n$tie.name AS
SELECT
    *
FROM
    p$tie.name($schema.metadata.now);
~*/
}