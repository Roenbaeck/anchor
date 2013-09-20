/*~
-- ATTRIBUTE ASSEMBLED VIEWS ------------------------------------------------------------------------------------------
--
-- The assembled view of an attribute combines the posit and annex table of the attribute.
-- It can be used to maintain entity integrity through a primary key, which cannot be
-- defined elsewhere.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextAttribute()) {
/*~
-- Attribute assembled view -------------------------------------------------------------------------------------------
-- $attribute.name assembled view of the posit and annex tables,
-- pk$attribute.name optional temporal consistency constraint
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.name', 'V') IS NULL
BEGIN
    EXEC('
    CREATE VIEW [$attribute.capsule].[$attribute.name]
    WITH SCHEMABINDING AS
    SELECT
        $(METADATA)? a.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        p.$attribute.anchorReferenceName,
        p.$attribute.valueColumnName,
        $(attribute.timeRange)? p.$attribute.changingColumnName,
        a.$attribute.positingColumnName,
        a.$attribute.positorColumnName,
        a.$attribute.reliabilityColumnName,
        a.$attribute.reliableColumnName
    FROM
        [$attribute.capsule].[$attribute.positName] p
    JOIN
        [$attribute.capsule].[$attribute.annexName] a
    ON
        a.$attribute.identityColumnName = p.$attribute.identityColumnName;
    ');
~*/
        if(INTEGRITY) {
            var scheme = PARTITIONING ? ' ON PositorScheme(' + attribute.positorColumnName + ')' : '';
/*~
    -- Constraint ensuring that recorded and erased posits are temporally consistent
    EXEC('
    CREATE UNIQUE CLUSTERED INDEX [pk$attribute.name]
    ON [$attribute.capsule].[$attribute.name] (
        $attribute.anchorReferenceName asc,
        $(attribute.timeRange)? $attribute.changingColumnName desc,
        $attribute.positingColumnName desc,
        $attribute.positorColumnName asc
    )$scheme;
    ');
~*/
        }
/*~
END
GO
~*/
    }
}