/*~
-- TIE PERSPECTIVES ---------------------------------------------------------------------------------------------------
--
-- Oracle latest (l) and now (n) perspectives.
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
CREATE OR REPLACE VIEW ${tie.capsule}$.l$tie.name AS
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
    $role.name$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(schema.METADATA)? $role.name$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
        }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
FROM
    ${tie.capsule}$.$tie.name tie
~*/
    while (role = tie.nextKnotRole()) {
        knot = role.knot;
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
ON
    $role.name$.$knot.identityColumnName = tie.$role.columnName
~*/
    }
    if(tie.isHistorized()) {
/*~
WHERE (
    tie.$tie.changingColumnName = (
        SELECT
            MAX(sub.$tie.changingColumnName)
        FROM
            ${tie.capsule}$.$tie.name sub
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
/*~
            (
~*/
            while (role = tie.nextValue()) {
/*~
                sub.$role.columnName = tie.$role.columnName
            $(tie.hasMoreValues())? OR
~*/
            }
/*~
            )
~*/
        }
/*~
    )
    OR tie.$tie.changingColumnName IS NULL
)
~*/
    }
/*~
;

CREATE OR REPLACE VIEW ${tie.capsule}$.n$tie.name AS
SELECT
    *
FROM
    ${tie.capsule}$.l$tie.name
;
~*/
}
