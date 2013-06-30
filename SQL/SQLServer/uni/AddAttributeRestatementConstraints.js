var a, b, anchor, knot, attribute, restatements = false;
for(a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
    for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(attribute.timeRange && attribute.metadata.restatable == 'false')
                restatements = true;
    }
}
if(restatements) {
/*~
-- ATTRIBUTE RESTATEMENT CONSTRAINTS ----------------------------------------------------------------------------------
--
-- Attributes may be prevented from storing restatements.
-- A restatement is when the same value occurs for two adjacent points
-- in changing time.
--
-- returns      1 for at least one equal surrounding value, 0 for different surrounding values
--
-- @id          the identity of the anchored entity
-- @value       the value of the attribute
-- @changed     the point in time from which this value shall represent a change
--
~*/
    for(a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
        for(b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
            if(attribute.metadata.restatable == 'false' && attribute.timeRange) {
                var valueColumn, valueType;
                if(attribute.dataRange) {
                    valueColumn = attribute.valueColumnName;
                    valueType = attribute.dataRange;
                }
                else if(attribute.knotRange) {
                    knot = schema.knot[attribute.knotRange]
                    valueColumn = attribute.knotReferenceName;
                    valueType = knot.identity;
                }
/*~
-- Restatement Finder Function and Constraint -------------------------------------------------------------------------
-- rf$attribute.name restatement finder
-- rc$attribute.name restatement constraint
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('rf$attribute.name', 'FN') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[rf$attribute.name] (
        @id $anchor.identity,
        @value $valueType,
        @changed $attribute.timeRange
    )
    RETURNS tinyint AS
    BEGIN RETURN (
        SELECT
            CASE WHEN @value IN ((
                SELECT TOP 1
                    pre.$valueColumn
                FROM
                    [$attribute.capsule].[$attribute.name] pre
                WHERE
                    pre.$attribute.anchorReferenceName = @id
                AND
                    pre.$attribute.changingColumnName <= @changed
                ORDER BY
                    pre.$attribute.changingColumnName DESC
            ),(
                SELECT TOP 1
                    fol.$valueColumn
                FROM
                    [$attribute.capsule].[$attribute.name] fol
                WHERE
                    fol.$attribute.anchorReferenceName = @id
                AND
                    fol.$attribute.changingColumnName >= @changed
                ORDER BY
                    fol.$attribute.changingColumnName ASC
            ))
            THEN 1
            ELSE 0
            END
    );
    END
    ');
    ALTER TABLE [$attribute.capsule].[$attribute.name]
    ADD CONSTRAINT [rc$attribute.name] CHECK (
        [$attribute.capsule].[rf$attribute.name] (
            $attribute.anchorReferenceName,
            $valueColumn,
            $attribute.changingColumnName
        ) = 0
    );
END
GO
~*/
            }
        }
    }
}

