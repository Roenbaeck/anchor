/*~
-- TIE ASSEMBLED VIEWS ------------------------------------------------------------------------------------------------
--
-- The assembled view of a tie combines its posit and annex tables. It has the name that the tie table has
-- in uni-temporal modeling, and the difference perspectives read it.
--
~*/
var tie, role;
while (tie = schema.nextTie()) {
/*~
CREATE OR REPLACE VIEW ${tie.capsule}$.$tie.name COPY GRANTS AS
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
    $(tie.timeRange)? p.$tie.changingColumnName,
    a.$tie.positingColumnName,
    a.$tie.positorColumnName,
    a.$tie.reliabilityColumnName,
    a.$tie.assertionColumnName
FROM
    ${tie.capsule}$.$tie.positName p
JOIN
    ${tie.capsule}$.$tie.annexName a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
;
~*/
}
