/*~
-- TIE CRT ASSEMBLED VIEWS --------------------------------------------------------------------------------------------
--
-- Oracle-compatible CRT assembly views for ties.
--
~*/
var tie, role;
while (tie = schema.nextTie()) {
/*~
CREATE OR REPLACE VIEW ${tie.capsule}$.r$tie.name AS
SELECT
    $(schema.METADATA)? a.$tie.metadataColumnName,
    p.$tie.identityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
    p.$role.columnName,
~*/
    }
/*~
    $(tie.isHistorized())? p.$tie.changingColumnName,
    a.$tie.positingColumnName,
    a.$tie.positorColumnName,
    a.$tie.reliabilityColumnName,
    a.$tie.assertionColumnName,
    a.$tie.reliableColumnName
FROM
    ${tie.capsule}$.$tie.positName p
JOIN
    ${tie.capsule}$.$tie.annexName a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
WHERE
    a.$tie.positorColumnName = 0
AND
    a.$tie.positingColumnName = (
        SELECT
            MAX(sub.$tie.positingColumnName)
        FROM
            ${tie.capsule}$.$tie.annexName sub
        WHERE
            sub.$tie.identityColumnName = p.$tie.identityColumnName
        AND
            sub.$tie.positorColumnName = 0
    )
;
~*/
}