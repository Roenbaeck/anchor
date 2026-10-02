/*~
-- ATTRIBUTE ASSEMBLED VIEWS ------------------------------------------------------------------------------------------
--
-- The assembled view of an attribute combines its posit and annex tables. It has the name that the
-- attribute table has in uni-temporal modeling, and the difference perspectives read it.
--
~*/
var attribute;
while (attribute = schema.nextAttribute()) {
/*~
CREATE OR REPLACE VIEW ${attribute.capsule}$.$attribute.name COPY GRANTS AS
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    p.$attribute.entityReferenceName,
    $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
    p.$attribute.valueColumnName,
    $(attribute.timeRange)? p.$attribute.changingColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.reliabilityColumnName
FROM
    ${attribute.capsule}$.$attribute.positName p
JOIN
    ${attribute.capsule}$.$attribute.annexName a
ON
    a.$attribute.identityColumnName = p.$attribute.identityColumnName
;
~*/
}
