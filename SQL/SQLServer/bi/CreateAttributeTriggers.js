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

    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        $attribute.statementTypeColumnName char(1) not null,
        primary key (
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

    INSERT INTO @$attribute.name (
        $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName,
        $attribute.valueColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.statementTypeColumnName   
    )
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

    DECLARE @retracted TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        $attribute.statementTypeColumnName char(1) not null
    );

    INSERT INTO @retracted (
        $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName,
        $attribute.valueColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.statementTypeColumnName   
    )
    SELECT
        $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName,
        $attribute.valueColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.statementTypeColumnName   
    FROM (
        DELETE a
        OUTPUT 
            deleted.*,
            pre.$attribute.reliabilityColumnName as previous_$attribute.reliabilityColumnName, 
            fol.$attribute.reliabilityColumnName as following_$attribute.reliabilityColumnName
        FROM
            @$attribute.name a
        OUTER APPLY (
            SELECT TOP 1
                p.$attribute.reliabilityColumnName
            FROM
                @$attribute.name p
            WHERE
                p.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
            $(attribute.isHistorized())? AND
                $(attribute.isHistorized())? p.$attribute.changingColumnName = a.$attribute.changingColumnName
            AND
                p.$attribute.positingColumnName < a.$attribute.positingColumnName
            ORDER BY 
                p.$attribute.positingColumnName DESC
        ) pre
        OUTER APPLY (
            SELECT TOP 1
                p.$attribute.reliabilityColumnName
            FROM
                @$attribute.name p
            WHERE
                p.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
            $(attribute.isHistorized())? AND
                $(attribute.isHistorized())? p.$attribute.changingColumnName = a.$attribute.changingColumnName
            AND
                p.$attribute.positingColumnName > a.$attribute.positingColumnName
            ORDER BY 
                p.$attribute.positingColumnName ASC
        ) fol
        WHERE
            (a.$attribute.reliabilityColumnName = 0 AND isnull(pre.$attribute.reliabilityColumnName, 1) = 1) -- ta bort isnull för assertive
        OR
            (a.$attribute.reliabilityColumnName = 1 AND fol.$attribute.reliabilityColumnName = 0)
    ) i
    WHERE
        i.$attribute.statementTypeColumnName <> 'X'
    AND (
            (i.$attribute.reliabilityColumnName = 0 AND i.previous_$attribute.reliabilityColumnName = 1)
        OR
            (i.$attribute.reliabilityColumnName = 1 AND i.following_$attribute.reliabilityColumnName = 0)
        );
~*/
        if(!attribute.isAssertive() || (attribute.isHistorized() && attribute.isIdempotent())) {
            // first remove reassertions
            if(!attribute.isAssertive()) {
                var valueColumn = attribute.hasChecksum() ? attribute.checksumColumnName : attribute.valueColumnName;
/*~
    -- remove remaining (dangling) retractions
	DELETE @$attribute.name 
	WHERE 
        $attribute.reliabilityColumnName = 0;

    IF EXISTS (
        SELECT TOP 1 
            $attribute.statementTypeColumnName 
        FROM 
            @$attribute.name
        WHERE 
            $attribute.statementTypeColumnName IN ('P', 'A')
    )
    BEGIN --- (only run if necessary) ---

    DECLARE @updated TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        previous_$attribute.positingColumnName $schema.metadata.positingRange not null,
        primary key(
            $attribute.anchorReferenceName asc, 
            $(attribute.timeRange)? $attribute.changingColumnName desc,
            $attribute.positingColumnName desc
        )
    );

    INSERT INTO @updated (
        $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName,
        $attribute.valueColumnName, 
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        previous_$attribute.positingColumnName
    )
    SELECT
        $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName,
        $attribute.valueColumnName, 
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        previous_$attribute.positingColumnName
    FROM (
        DELETE a
        OUTPUT 
            deleted.*,
            pre.$attribute.positingColumnName AS previous_$attribute.positingColumnName,
            pre.$attribute.statementTypeColumnName AS previous_$attribute.statementTypeColumnName
        FROM 
            @$attribute.name a
        CROSS APPLY (
            SELECT TOP 1
                * 
            FROM 
                @$attribute.name s
            WHERE
                s.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
            $(attribute.isHistorized())? AND
                $(attribute.isHistorized())? s.$attribute.changingColumnName = a.$attribute.changingColumnName
            AND
                $(attribute.hasChecksum())? s.$attribute.checksumColumnName = a.$attribute.checksumColumnName : s.$attribute.valueColumnName = a.$attribute.valueColumnName
            AND 
                s.$attribute.positingColumnName < a.$attribute.positingColumnName
            ORDER BY 
                s.$attribute.positingColumnName DESC
        ) pre
        WHERE
            a.$attribute.reliabilityColumnName = pre.$attribute.reliabilityColumnName
    ) u
    WHERE
        u.previous_$attribute.statementTypeColumnName = 'A';

    DELETE a
    FROM 
        @$attribute.name a
    JOIN 
        @updated u
    ON 
        u.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
    $(attribute.isHistorized())? AND
        $(attribute.isHistorized())? u.$attribute.changingColumnName = a.$attribute.changingColumnName
    AND
        $(attribute.hasChecksum())? u.$attribute.checksumColumnName = a.$attribute.checksumColumnName : u.$attribute.valueColumnName = a.$attribute.valueColumnName
    AND 
        u.previous_$attribute.positingColumnName = a.$attribute.positingColumnName;
    END --- (only run if necessary) ---
~*/                
            }
            // then remove restatements 
            if(attribute.isHistorized() && attribute.isIdempotent()) {
                var valueColumn = attribute.hasChecksum() ? attribute.checksumColumnName : attribute.valueColumnName;
/*~
    IF EXISTS (
        SELECT TOP 1 
            $attribute.statementTypeColumnName 
        FROM 
            @$attribute.name
        WHERE 
            $attribute.statementTypeColumnName IN ('P', 'A')
    )
    BEGIN --- (only run if necessary) ---

    DECLARE @restated TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        $attribute.statementTypeColumnName char(1) not null
    );

    INSERT INTO @restated (
        $attribute.anchorReferenceName,
        $(schema.METADATA)? $attribute.metadataColumnName,
        $(attribute.isHistorized())? $attribute.changingColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName,
        $attribute.valueColumnName,
        $(attribute.hasChecksum())? $attribute.checksumColumnName,
        $attribute.statementTypeColumnName   
    )
    SELECT 
        x.$attribute.anchorReferenceName,
        $(schema.METADATA)? x.$attribute.metadataColumnName,
        $(attribute.isHistorized())? x.$attribute.changingColumnName,
        CASE 
            WHEN x.previous_$attribute.positingColumnName < x.$attribute.positingColumnName THEN x.$attribute.positingColumnName 
            ELSE x.previous_$attribute.positingColumnName 
        END,
        0, -- quench the existing restatements
        x.$attribute.valueColumnName,
        $(attribute.hasChecksum())? x.$attribute.checksumColumnName,
        CASE 
            WHEN x.previous_$attribute.positingColumnName < x.$attribute.positingColumnName THEN 'D' -- physical delete 
            ELSE 'A' -- logical delete 
        END
    FROM (
        DELETE a
        OUTPUT 
            deleted.*,
            pre.$attribute.positingColumnName as previous_$attribute.positingColumnName
        FROM 
            @$attribute.name a
        OUTER APPLY (
            SELECT TOP 1
                *
            FROM 
                @$attribute.name h
            WHERE
                h.$attribute.anchorReferenceName = a.$attribute.anchorReferenceName
            $(attribute.isHistorized())? AND
                $(attribute.isHistorized())? h.$attribute.changingColumnName < a.$attribute.changingColumnName
            ORDER BY 
                $(attribute.isHistorized())? h.$attribute.changingColumnName DESC,
                h.$attribute.positingColumnName DESC
        ) pre
        WHERE
            $(attribute.hasChecksum())? a.$attribute.checksumColumnName = pre.$attribute.checksumColumnName : a.$attribute.valueColumnName = pre.$attribute.valueColumnName
    ) x
    WHERE
        x.$attribute.statementTypeColumnName = 'X';  -- quench

    -- add the quenches
    INSERT INTO @$attribute.name 
    SELECT 
        * 
    FROM (
        DELETE @restated
        OUTPUT deleted.*
        WHERE $attribute.statementTypeColumnName = 'A'
    ) d;

    -- perform any remaining physical deletes 
    DELETE a
    FROM 
        @restated i
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    $(attribute.isHistorized())? AND
        $(attribute.isHistorized())? p.$attribute.changingColumnName = i.$attribute.changingColumnName
    AND
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName = ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.valueColumnName as varbinary(max))) : p.$attribute.valueColumnName = i.$attribute.valueColumnName
    JOIN 
        [$attribute.capsule].[$attribute.annexName] a
    ON 
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.positingColumnName = i.$attribute.positingColumnName;

    END --- (only run if necessary) ---
~*/
            }
        }
/*~
    -- add the retractions
    INSERT INTO @$attribute.name SELECT * FROM @retracted;

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
~*/
        if(!attribute.isAssertive()) {
/*~
    UPDATE a
    SET 
        a.$attribute.positingColumnName = u.previous_$attribute.positingColumnName
    FROM 
        @updated u
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        u.$attribute.anchorReferenceName = p.$attribute.anchorReferenceName
    $(attribute.isHistorized())? AND
        $(attribute.isHistorized())? u.$attribute.changingColumnName = p.$attribute.changingColumnName
    AND
        $(attribute.hasChecksum())? u.$attribute.checksumColumnName = p.$attribute.checksumColumnName : u.$attribute.valueColumnName = p.$attribute.valueColumnName
    JOIN
        [$attribute.capsule].[$attribute.annexName] a
    ON 
        a.$attribute.identityColumnName = p.$attribute.identityColumnName
    AND
        a.$attribute.positingColumnName = u.$attribute.positingColumnName;
~*/
        }
/*~
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