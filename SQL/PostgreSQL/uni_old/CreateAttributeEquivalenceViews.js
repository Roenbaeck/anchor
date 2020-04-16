/*~
-- ATTRIBUTE EQUIVALENCE VIEWS ----------------------------------------------------------------------------------------
--
-- Equivalence views of attributes make it possible to retrieve data for only the given equivalent.
--
-- equivalent  the equivalent that you want to retrieve data for
--
 ~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        if(schema.EQUIVALENCE && attribute.isEquivalent()) {
/*~
-- Attribute equivalence view -----------------------------------------------------------------------------------------
-- $attribute.name parametrized view
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION e$attribute.name (
    equivalent $schema.metadata.equivalentRange
) RETURNS TABLE (
    $anchor.identity,
    $(attribute.isEquivalent())? $schema.metadata.equivalentRange,
    $(attribute.hasChecksum())? bytea,
    $(attribute.isHistorized())? $attribute.timeRange,
    $(schema.METADATA)? $schema.metadata.metadataType,
    $attribute.dataRange
) AS '
    SELECT
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.valueColumnName
    FROM
        $attribute.name
    WHERE
        $attribute.equivalentColumnName = equivalent;
' LANGUAGE SQL;
~*/
        }
    }
}