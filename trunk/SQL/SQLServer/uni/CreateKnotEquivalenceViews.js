/*~
-- KNOT EQUIVALENCE VIEWS ---------------------------------------------------------------------------------------------
--
-- Equivalence views combine the identity and equivalent parts of a knot into a single view, making
-- it look and behave like a regular knot. They also make it possible to retrieve data for only the
-- given equivalent.
--
-- @equivalent  the equivalent that you want to retrieve data for
--
~*/
var knot;
while (knot = schema.nextKnot()) {
    if(schema.EQUIVALENCE && knot.isEquivalent()) {
/*~
-- Knot equivalence view ----------------------------------------------------------------------------------------------
-- $knot.name view and parametrized view
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$knot.capsule$.$knot.name', 'V') IS NULL
BEGIN
    EXEC('
    CREATE VIEW [$knot.capsule].[$knot.name] WITH SCHEMABINDING
    AS
    SELECT
        $(schema.METADATA)? v.$knot.metadataColumnName,
        i.$knot.identityColumnName,
        v.$knot.equivalentColumnName,
        $(knot.hasChecksum())? v.$knot.checksumColumnName,
        v.$knot.valueColumnName
    FROM
        [$knot.capsule].[$knot.identityName] i
    JOIN
        [$knot.capsule].[$knot.equivalentName] v
    ON
        v.$knot.identityColumnName = i.$knot.identityColumnName;
    ');
END
GO
IF Object_ID('$knot.capsule$.e$knot.name', 'IF') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$knot.capsule].[e$knot.name] (
        @equivalent $schema.metadata.equivalentRange
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(schema.METADATA)? $knot.metadataColumnName,
        $knot.identityColumnName,
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName,
        $knot.valueColumnName
    FROM
        [$knot.capsule].[$knot.name]
    WHERE
        $knot.equivalentColumnName = @equivalent;
    ');
END
GO
~*/

    }
}