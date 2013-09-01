var anchor, knot, attribute, restatements = false;
while (anchor = schema.nextAnchor())
    while(attribute = anchor.nextAttribute())
        if(attribute.isHistorized() && !attribute.isRestatable())
            restatements = true;

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
-- @posit       the id of the posit that should be checked
-- @posited     the time when this posit was made
-- @positor     the one who made the posit
-- @reliable    whether this posit is considered reliable (1) or unreliable (0)
--
~*/
    while (anchor = schema.nextAnchor()) {
        while(attribute = anchor.nextAttribute()) {
            if((!attribute.isRestatable() || attribute.isIdempotent()) && attribute.isHistorized()) {
                var valueColumn, valueType;
                if(!attribute.isKnotted()) {
                    valueColumn = attribute.valueColumnName;
                    valueType = attribute.dataRange;
                }
                else {
                    knot = attribute.knot;
                    valueColumn = attribute.knotReferenceName;
                    valueType = knot.identity;
                }
/*~
-- Restatement Finder Function and Constraint -------------------------------------------------------------------------
-- rf$attribute.name restatement finder, also used by the insert and update triggers for idempotent attributes
-- rc$attribute.name restatement constraint, with checking made by the finder function
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('rf$attribute.name', 'FN') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[rf$attribute.name] (
        @posit $anchor.identity,
        @posited $schema.positingRange,
        @positor $schema.positorRange,
        @reliable tinyint
    )
    RETURNS tinyint AS
    BEGIN
    DECLARE @id $anchor.identity;
    DECLARE @value $valueType;
    DECLARE @changed $attribute.timeRange;
    SELECT
        @id = $attribute.anchorReferenceName,
        @value = $attribute.valueColumnName,
        @changed = $attribute.changingColumnName
    FROM
        [$attribute.capsule].[$attribute.positName]
    WHERE
        $attribute.identityColumnName = @posit;
    RETURN (
        CASE WHEN @value IN ((
            SELECT TOP 1
                pre.$valueColumn
            FROM
                [$attribute.capsule].[$attribute.name] pre
            WHERE
                pre.$attribute.anchorReferenceName = @id
            AND
                pre.$attribute.changingColumnName < @changed
            AND
                pre.$attribute.positingColumnName <= @posited
            AND
                pre.$attribute.positorColumnName = @positor
            AND
                pre.$attribute.reliableColumnName = @reliable
            ORDER BY
                pre.$attribute.changingColumnName DESC,
                pre.$attribute.positingColumnName DESC
        ),(
            SELECT TOP 1
                fol.$valueColumn
            FROM
                [$attribute.capsule].[$attribute.name] fol
            WHERE
                fol.$attribute.anchorReferenceName = @id
            AND
                fol.$attribute.changingColumnName > @changed
            AND
                fol.$attribute.positingColumnName <= @posited
            AND
                fol.$attribute.positorColumnName = @positor
            AND
                fol.$attribute.reliableColumnName = @reliable
            ORDER BY
                fol.$attribute.changingColumnName ASC,
                fol.$attribute.positingColumnName DESC
        ))
        THEN 1
        ELSE 0
        END
    );
    END
    ');
~*/
                if(!attribute.isRestatable()) {
/*~
    ALTER TABLE [$attribute.capsule].[$attribute.annexName]
    ADD CONSTRAINT [rc$attribute.annexName] CHECK (
        [$attribute.capsule].[rf$attribute.name] (
            $attribute.identityColumnName,
            $attribute.positingColumnName,
            $attribute.positorColumnName,
            $attribute.reliableColumnName
        ) = 0
    );
END
GO
~*/
                }
            }
        }
    }
}

