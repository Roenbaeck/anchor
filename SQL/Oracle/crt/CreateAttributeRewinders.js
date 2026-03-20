/*~
-- ATTRIBUTE CRT ASSEMBLED VIEWS --------------------------------------------------------------------------------------
--
-- Oracle-compatible CRT assembly views. These provide a stable baseline
-- for perspectives and can later be expanded to parameterized SQL macros.
--
~*/
var attribute, parent;
while (attribute = schema.nextAttribute()) {
    parent = attribute.parent;
/*~
CREATE OR REPLACE VIEW ${attribute.capsule}$.r$attribute.name AS
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.positorColumnName,
    a.$attribute.reliabilityColumnName,
    a.$attribute.assertionColumnName,
    a.$attribute.reliableColumnName,
    p.$attribute.entityReferenceName,
    $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
    p.$attribute.valueColumnName
    $(attribute.isHistorized())?, p.$attribute.changingColumnName
FROM
    ${attribute.capsule}$.$attribute.positName p
JOIN
    ${attribute.capsule}$.$attribute.annexName a
ON
    a.$attribute.identityColumnName = p.$attribute.identityColumnName
WHERE
    a.$attribute.positorColumnName = 0
AND
    a.$attribute.positingColumnName = (
        SELECT
            MAX(sub.$attribute.positingColumnName)
        FROM
            ${attribute.capsule}$.$attribute.annexName sub
        WHERE
            sub.$attribute.identityColumnName = p.$attribute.identityColumnName
        AND
            sub.$attribute.positorColumnName = 0
    )
;
~*/
}
