if(schema.TRIGGERS) {
/*~
-- ATTRIBUTE TRIGGERS ------------------------------------------------------------------------------------------------
--
-- The following triggers on the assembled views make them behave like tables.
-- There is one 'instead of' trigger for: insert.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor, attribute;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_$attribute.name instead of INSERT trigger on $attribute.name
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.it_$attribute.name', 'TR') IS NOT NULL
DROP TRIGGER [$attribute.capsule].[it_$attribute.name];
GO
CREATE TRIGGER [$attribute.capsule].[it_$attribute.name] ON [$attribute.capsule].[$attribute.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;

    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        $attribute.statementTypeColumnName char(1) not null,
        primary key(
            $attribute.anchorReferenceName asc, 
            $(attribute.timeRange)? $attribute.changingColumnName desc,
            $attribute.positingColumnName desc
        )
    );

    INSERT INTO @$attribute.name
    SELECT
        i.$attribute.anchorReferenceName,
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        $(attribute.isHistorized())? i.$attribute.changingColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.reliabilityColumnName,
        i.$attribute.valueColumnName,
        $(attribute.hasChecksum())? ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.valueColumnName as varbinary(max))),
        CASE   
            WHEN p.$attribute.identityColumnName is null 
            THEN 'P' -- new posit
            WHEN a.$attribute.identityColumnName is null
            THEN 'A' -- new assertion
        END
    FROM
        inserted i
    LEFT JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    $(attribute.isHistorized())? AND
        $(attribute.isHistorized())? p.$attribute.changingColumnName = i.$attribute.changingColumnName
    AND
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName = ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.valueColumnName as varbinary(max))) : p.$attribute.valueColumnName = i.$attribute.valueColumnName
    LEFT JOIN 
        [$attribute.capsule].[$attribute.annexName] a
    ON 
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.positingColumnName = i.$attribute.positingColumnName
    WHERE -- either the posit or the assertion must be different (exclude the identical)
        (p.$attribute.identityColumnName is null OR a.$attribute.identityColumnName is null);
~*/
        // fill table with entire history in these cases
        if(!attribute.isAssertive() || attribute.isIdempotent()) {
/*~
    INSERT INTO @$attribute.name
    SELECT
        i.$attribute.anchorReferenceName,
        $(schema.METADATA)? a.$attribute.metadataColumnName,
        $(attribute.isHistorized())? p.$attribute.changingColumnName,
        a.$attribute.positingColumnName,
        a.$attribute.reliabilityColumnName,
        p.$attribute.valueColumnName,
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName,
        'X' -- existing data
    FROM
        (SELECT DISTINCT $attribute.anchorReferenceName FROM @$attribute.name) i
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    JOIN 
        [$attribute.capsule].[$attribute.annexName] a
    ON 
        a.$attribute.identityColumnName = p.$attribute.identityColumnName;
~*/
            // first remove reassertions
            if(!attribute.isAssertive()) {
                var valueColumn = attribute.hasChecksum() ? attribute.checksumColumnName : attribute.valueColumnName;
                var reliabilityColumn = attribute.reliabilityColumnName;
/*~
    DELETE a
    FROM (
        SELECT 
            $reliabilityColumn AS currentReliability, 
            LAG($reliabilityColumn, 1) OVER (
                PARTITION BY 
                    $attribute.anchorReferenceName, 
                    $(attribute.isHistorized())? $attribute.changingColumnName,
                    $valueColumn
                ORDER BY
                    $attribute.positingColumnName
            ) as previousReliability
        FROM 
            @$attribute.name
    ) a
    WHERE
        a.currentReliability = a.previousReliability;
~*/                
            }
            // then remove restatements 
            if(attribute.isIdempotent()) {
                var valueColumn = attribute.hasChecksum() ? attribute.checksumColumnName : attribute.valueColumnName;
/*~
    DECLARE @deleted TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        $attribute.statementTypeColumnName char(1) not null
    );

    INSERT INTO @deleted
    SELECT 
        x.$attribute.anchorReferenceName,
        $(schema.METADATA)? x.$attribute.metadataColumnName,
        x.$attribute.changingColumnName,
        @now,
        0,
        x.$attribute.valueColumnName,
        $(attribute.hasChecksum())? x.$attribute.checksumColumnName,
        'A' -- quench the existing restatements
    FROM (
        DELETE a
        OUTPUT deleted.*
        FROM 
            @$attribute.name a
        CROSS APPLY (
            SELECT TOP 1
                $valueColumn,
                $attribute.reliabilityColumnName
            FROM
                @$attribute.name h
            WHERE
                h.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
            AND
                h.$attribute.changingColumnName < a.$attribute.changingColumnName
            AND
                h.$attribute.positingColumnName <= a.$attribute.positingColumnName
            ORDER BY 
                h.$attribute.changingColumnName DESC,
                h.$attribute.positingColumnName DESC
        ) pre
        WHERE
            a.$valueColumn = pre.$valueColumn
        AND
            pre.$attribute.reliabilityColumnName = 1
    ) x
    WHERE
        x.$attribute.statementTypeColumnName = 'X';

    INSERT INTO @$attribute.name
    SELECT DISTINCT * FROM @deleted;
~*/
            }
        }
/*~
    INSERT INTO [$attribute.capsule].[$attribute.positName] (
        $attribute.anchorReferenceName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.valueColumnName
    )
    SELECT
        $attribute.anchorReferenceName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.valueColumnName
    FROM
        @$attribute.name
    WHERE
        $attribute.statementTypeColumnName = 'P';

    INSERT INTO [$attribute.capsule].[$attribute.annexName] (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? v.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        v.$attribute.positingColumnName,
        v.$attribute.reliabilityColumnName
    FROM
        @$attribute.name v
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
    $(attribute.isHistorized())? AND
        $(attribute.isHistorized())? p.$attribute.changingColumnName = v.$attribute.changingColumnName
    AND
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName = v.$attribute.checksumColumnName : p.$attribute.valueColumnName = v.$attribute.valueColumnName
    WHERE
        $attribute.statementTypeColumnName in ('P', 'A');
END
GO
~*/
    } // end of loop over attributes
}
}