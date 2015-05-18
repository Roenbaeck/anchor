var tie, role, knot;

while (tie = schema.nextTie()) {
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$tie.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW $tie.capsule\.l$tie.name AS
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.name\.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    $role.name\.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? $role.name\.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? $role.name\.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    $tie.capsule\.$tie.name tie~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    $knot.capsule\.e$knot.name(0) $role.name
~*/
                }
                else {
/*~
LEFT JOIN
    $knot.capsule\.$knot.name $role.name
~*/
                }
/*~
ON
    $role.name\.$knot.identityColumnName = tie.$role.columnName~*/
        }
        if(tie.isHistorized()) {
/*~
WHERE
    tie.$tie.changingColumnName = (
        SELECT
            max(sub.$tie.changingColumnName)
        FROM
            $tie.capsule\.$tie.name sub
        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while (role = tie.nextIdentifier()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreIdentifiers())? AND
~*/
                }
            }
            else {
                while (role = tie.nextValue()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreValues())? OR
~*/
                }
            }
/*~
   )~*/
        }
/*~;
~*/
}