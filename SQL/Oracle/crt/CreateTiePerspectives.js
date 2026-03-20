/*~
-- TIE CRT PERSPECTIVES -----------------------------------------------------------------------------------------------
--
-- Oracle-compatible latest and now perspectives for CRT ties.
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
CREATE OR REPLACE VIEW ${tie.capsule}$.l$tie.name AS
SELECT
    r.$tie.identityColumnName,
    $(schema.METADATA)? r.$tie.metadataColumnName,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
    k$role.name$.$knot.valueColumnName AS $role.knotValueColumnName,
~*/
        }
/*~
    r.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    $(tie.isHistorized())? r.$tie.changingColumnName,
    r.$tie.positingColumnName,
    r.$tie.positorColumnName,
    r.$tie.reliabilityColumnName,
    r.$tie.assertionColumnName,
    r.$tie.reliableColumnName
FROM
    ${tie.capsule}$.r$tie.name r
~*/
    while (role = tie.nextKnotRole()) {
        knot = role.knot;
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name k$role.name
ON
    k$role.name$.$knot.identityColumnName = r.$role.columnName
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

CREATE OR REPLACE FUNCTION ${tie.capsule}$.t$tie.name (
    positor $schema.metadata.positorRange,
    changingTimepoint $schema.metadata.chronon,
    positingTimepoint $schema.metadata.positingRange,
    assertion varchar2(4000)
)
RETURN varchar2 SQL_MACRO(TABLE)
IS
BEGIN
    RETURN q'[
        SELECT
            t.*
        FROM
            ${tie.capsule}$.l$tie.name t
        WHERE
            (positor IS NULL OR t.$tie.positorColumnName = positor)
        AND
            (assertion IS NULL OR t.$tie.assertionColumnName = assertion)
        AND
            (changingTimepoint IS NULL $(tie.isHistorized())? OR t.$tie.changingColumnName <= changingTimepoint : OR 1 = 1)
        AND
            (positingTimepoint IS NULL OR t.$tie.positingColumnName <= positingTimepoint)
    ]';
END;
/

CREATE OR REPLACE FUNCTION ${tie.capsule}$.p$tie.name (
    changingTimepoint $schema.metadata.chronon
)
RETURN varchar2 SQL_MACRO(TABLE)
IS
BEGIN
    RETURN q'[
        SELECT
            t.*
        FROM
            ${tie.capsule}$.l$tie.name t
        WHERE
            (changingTimepoint IS NULL $(tie.isHistorized())? OR t.$tie.changingColumnName <= changingTimepoint : OR 1 = 1)
    ]';
END;
/

CREATE OR REPLACE FUNCTION ${tie.capsule}$.d$tie.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon
)
RETURN varchar2 SQL_MACRO(TABLE)
IS
BEGIN
    RETURN q'[
        SELECT
            t.*
        FROM
            ${tie.capsule}$.l$tie.name t
        WHERE
            (intervalStart IS NULL OR intervalEnd IS NULL $(tie.isHistorized())? OR t.$tie.changingColumnName BETWEEN intervalStart AND intervalEnd : OR 1 = 1)
    ]';
END;
/
~*/
}
