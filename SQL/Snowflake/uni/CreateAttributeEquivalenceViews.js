/*~
-- ATTRIBUTE EQUIVALENCE VIEWS ----------------------------------------------------------------------------------------
--
-- Equivalence views of attributes make it possible to retrieve data for only the given equivalent.
--
-- @equivalent  the equivalent that you want to retrieve data for
--
 ~*/
var attribute;
while (attribute = schema.nextAttribute()) {
    if(schema.EQUIVALENCE && attribute.isEquivalent() && !attribute.isKnotted()) {
        var parent = attribute.parent;
/*~
-- Attribute equivalence view -----------------------------------------------------------------------------------------
-- $attribute.name parametrized view
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${attribute.capsule}$.e$attribute.name (
    equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE (
    $attribute.entityReferenceName $parent.identity,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
    $(attribute.hasChecksum())? $attribute.checksumColumnName numeric(19,0),
    $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $attribute.valueColumnName $attribute.dataRange
)
AS
$$$$
    SELECT
        $attribute.entityReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.valueColumnName
    FROM
        ${attribute.capsule}$.$attribute.name
    WHERE
        $attribute.equivalentColumnName = equivalent
$$$$
;
~*/
    }
}
