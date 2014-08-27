/*~
-- ATTRIBUTE EQUIVALENCE VIEWS ----------------------------------------------------------------------------------------
--
-- Equivalence views of attributes make it possible to retrieve data for only the given equivalent.
--
-- @equivalent  the equivalent that you want to retrieve data for
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
IF Object_ID('$attribute.capsule$.e$attribute.name', 'IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[e$attribute.name] (
        @equivalent $schema.metadata.equivalentRange
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $attribute.anchorReferenceName,
        $(attribute.isEquivalent())? $attribute.equivalentColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.valueColumnName
    FROM
        [$attribute.capsule].[$attribute.name]
    WHERE
        $attribute.equivalentColumnName = @equivalent;
    ');
END
GO
~*/
        }
    }
}