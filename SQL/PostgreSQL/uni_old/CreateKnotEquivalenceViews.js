var knot;

while (knot = schema.nextKnot()) {
    if(schema.EQUIVALENCE && knot.isEquivalent()) {
/*~

-- KNOT EQUIVALENCE VIEWS ---------------------------------------------------------------------------------------------
--
-- Equivalence views combine the identity and equivalent parts of a knot into a single view, making
-- it look and behave like a regular knot. They also make it possible to retrieve data for only the
-- given equivalent.
--
-- equivalent  the equivalent that you want to retrieve data for
--
-- Knot equivalence view ----------------------------------------------------------------------------------------------
-- $knot.name view and parametrized view
-----------------------------------------------------------------------------------------------------------------------

CREATE OR REPLACE VIEW $knot.name AS
    SELECT
        $(schema.METADATA)? v.$knot.metadataColumnName,
        i.$knot.identityColumnName,
        v.$knot.equivalentColumnName,
        $(knot.hasChecksum())? v.$knot.checksumColumnName,
        v.$knot.valueColumnName
    FROM
        $knot.identityName i
    JOIN
        $knot.equivalentName v
    ON
        v.$knot.identityColumnName = i.$knot.identityColumnName;

CREATE OR REPLACE FUNCTION e$knot.name (
    equivalent $schema.metadata.equivalentRange
) RETURNS TABLE (
    $(schema.METADATA)? $knot.metadataColumnName $schema.metadata.metadataType,
    $knot.identityColumnName $knot.identity, 
    $knot.equivalentColumnName $schema.metadata.equivalentRange,
    $(knot.hasChecksum())? $knot.checksumColumnName bytea,
    $knot.valueColumnName $knot.dataRange
) AS '
    SELECT
        $(schema.METADATA)? $knot.metadataColumnName,
        $knot.identityColumnName,
        $knot.equivalentColumnName,
        $(knot.hasChecksum())? $knot.checksumColumnName,
        $knot.valueColumnName
    FROM
        $knot.name
    WHERE
        $knot.equivalentColumnName = equivalent;
' LANGUAGE SQL;
~*/
    }
}