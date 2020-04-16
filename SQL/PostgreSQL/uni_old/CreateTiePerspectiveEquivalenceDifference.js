var tie, role, knot;

while (tie = schema.nextTie()) {
    if(schema.EQUIVALENCE) {
        if(tie.isHistorized()) {
/*~
-- Difference equivalence perspective ---------------------------------------------------------------------------------
-- ed$tie.name showing all differences between the given timepoints
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$tie.capsule].[ed$tie.name] (
    @equivalent $schema.metadata.equivalentRange,
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon
)
RETURNS TABLE AS RETURN
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? [$role.name].$knot.checksumColumnName AS $role.knotChecksumColumnName,
    [$role.name].$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? [$role.name].$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? [$role.name].$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    [$tie.capsule].[$tie.name] tie
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](@equivalent) [$role.name]
~*/
                }
                else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [$role.name]
~*/
                }
/*~
ON
    [$role.name].$knot.identityColumnName = tie.$role.columnName
~*/
        }
/*~
WHERE
    tie.$tie.changingColumnName BETWEEN @intervalStart AND @intervalEnd;
GO
~*/
    }
    } // end of if equivalence
}