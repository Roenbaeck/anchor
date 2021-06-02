/*~
-- ATTRIBUTE ASSEMBLED PROJECTIONS ------------------------------------------------------------------------------------
--
-- The assembled projection of an attribute combines the posit and annex table of the attribute.
-- It can be used to maintain entity integrity through a primary key, which cannot be
-- defined elsewhere (if constraints on projections were allowed in Vertica).
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
/*~
-- Attribute assembled projection -------------------------------------------------------------------------------------
-- $attribute.name assembled projection of the posit and annex tables
-----------------------------------------------------------------------------------------------------------------------
CREATE PROJECTION IF NOT EXISTS ${attribute.capsule}$.$attribute.name
AS
SELECT
    $(schema.METADATA)? a.$attribute.metadataColumnName,
    p.$attribute.identityColumnName,
    p.$attribute.anchorReferenceName,
    $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
    p.$attribute.valueColumnName,
    $(attribute.timeRange)? p.$attribute.changingColumnName,
    a.$attribute.positingColumnName,
    a.$attribute.positorColumnName,
    a.$attribute.reliabilityColumnName,
    a.$attribute.reliableColumnName
FROM
    ${attribute.capsule}$.$attribute.positName p
JOIN
    ${attribute.capsule}$.$attribute.annexName a
ON
    a.$attribute.identityColumnName = p.$attribute.identityColumnName
ORDER BY p.$attribute.anchorReferenceName$(attribute.timeRange)?, p.$attribute.changingColumnName
SEGMENTED BY MODULARHASH(p.$attribute.anchorReferenceName) ALL NODES
PARTITION BY(a.$attribute.positorColumnName);
~*/
    }
}
