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
-- in changing time. Note that restatement checking is not done for
-- unreliable information as this could prevent demotion.
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
        @posit $anchor.identity,
        @posited $schema.metadata.positingRange,
        @positor $schema.metadata.positorRange,
        @reliable tinyint
    )
    RETURNS tinyint AS
    BEGIN
    DECLARE @id $anchor.identity;
    DECLARE @value $valueType;
    DECLARE @changed $attribute.timeRange;
    SELECT
        @id = $attribute.anchorReferenceName,
        @value = $valueColumn,
        @changed = $attribute.changingColumnName
    FROM
        [$attribute.capsule].[$attribute.positName]
    WHERE
        $attribute.identityColumnName = @posit;
    RETURN (
        CASE
        WHEN @reliable = 0
        THEN 0
        WHEN EXISTS (
            SELECT
                @value
            WHERE
                @value = (
                    SELECT TOP 1
                        pre.$valueColumn
                    FROM
                        [$attribute.capsule].[r$attribute.name](
                            @positor,
                            @changed,
                            @posited
                        ) pre
                    WHERE
                        pre.$attribute.anchorReferenceName = @id
                    AND
                        pre.$attribute.changingColumnName < @changed
                    AND
                        pre.$attribute.reliableColumnName = 1
                    ORDER BY
                        pre.$attribute.changingColumnName DESC,
                        pre.$attribute.positingColumnName DESC
                )
        ) OR EXISTS (
            SELECT
                @value
            WHERE
                @value = (        
                    SELECT TOP 1
                        fol.$valueColumn
                    FROM
                        [$attribute.capsule].[f$attribute.name](
                            @positor,
                            @changed,
                            @posited
                        ) fol
                    WHERE
                        fol.$attribute.anchorReferenceName = @id
                    AND
                        fol.$attribute.changingColumnName > @changed
                    AND
                        fol.$attribute.reliableColumnName = 1
                    ORDER BY
                        fol.$attribute.changingColumnName ASC,
                        fol.$attribute.positingColumnName DESC
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
    ALTER TABLE [$attribute.capsule].[$attribute.annexName]
    ADD CONSTRAINT [rc$attribute.annexName] CHECK (
        [$attribute.capsule].[rf$attribute.name] (
            $attribute.identityColumnName,
            $attribute.positingColumnName,
            $attribute.positorColumnName,
            $attribute.reliableColumnName
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

