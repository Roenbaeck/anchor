var anchor, knot, attribute, restatements = false;
while (anchor = schema.nextAnchor())
    while(attribute = anchor.nextAttribute())
        if(attribute.isHistorized())
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
-- @id          the identity of the anchored entity
-- @eq          the equivalent (when applicable)
-- @value       the value of the attribute
-- @changed     the point in time from which this value shall represent a change
--
~*/
    while (anchor = schema.nextAnchor()) {
        while(attribute = anchor.nextAttribute()) {
            if(attribute.isHistorized()) {
                var valueColumn, valueType;
                if(!attribute.isKnotted()) {
                    if(attribute.hasChecksum()) {
                        valueColumn = attribute.checksumColumnName;
                        valueType = 'varbinary(16)';
                    }
                    else {
                        valueColumn = attribute.valueColumnName;
                        valueType = attribute.dataRange;
                    }
                }
                else {
                    knot = attribute.knot;
                    valueColumn = attribute.knotReferenceName;
                    valueType = knot.identity;
                }
/*~
-- Restatement Finder Function and Constraint -------------------------------------------------------------------------
-- rf$attribute.name restatement finder, also used by the insert and update triggers for idempotent attributes
-- rc$attribute.name restatement constraint (available only in attributes that cannot have restatements)
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.rf$attribute.name', 'FN') IS NULL
BEGIN
    EXEC('
    CREATE FUNCTION [$attribute.capsule].[rf$attribute.name] (
        @id $anchor.identity,
        $(attribute.isEquivalent())? @eq $schema.metadata.equivalentRange,
        @value $valueType,
        @changed $attribute.timeRange
    )
    RETURNS tinyint AS
    BEGIN RETURN (
        CASE WHEN EXISTS (
            SELECT
                @value 
            WHERE
                @value = (
                    SELECT TOP 1
                        pre.$valueColumn
                    FROM
                        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@eq) pre : [$attribute.capsule].[$attribute.name] pre
                    WHERE
                        pre.$attribute.anchorReferenceName = @id
                    AND
                        pre.$attribute.changingColumnName < @changed
                    ORDER BY
                        pre.$attribute.changingColumnName DESC
                )
        ) OR EXISTS (
            SELECT
                @value 
            WHERE
                @value = (
                    SELECT TOP 1
                        fol.$valueColumn
                    FROM
                        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@eq) fol : [$attribute.capsule].[$attribute.name] fol
                    WHERE
                        fol.$attribute.anchorReferenceName = @id
                    AND
                        fol.$attribute.changingColumnName > @changed
                    ORDER BY
                        fol.$attribute.changingColumnName ASC
                )
        )
        THEN 1
        ELSE 0
        END
    );
    END
    ');
~*/
                if(!attribute.isRestatable()) {
/*~
    ALTER TABLE [$attribute.capsule].[$attribute.name]
    ADD CONSTRAINT [rc$attribute.name] CHECK (
        [$attribute.capsule].[rf$attribute.name] (
            $attribute.anchorReferenceName,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
            $valueColumn,
            $attribute.changingColumnName
        ) = 0
    );
~*/
                }
/*~
END
GO
~*/
            }
        }
    }
}

