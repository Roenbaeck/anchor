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
        var statementTypes = "'N'";
        if(attribute.isAssertive())
            statementTypes += ",'D'";
        if(attribute.isHistorized() && !attribute.isIdempotent())
            statementTypes += ",'R'";
        var changingParameter = attribute.isHistorized() ? 'v.' + attribute.changingColumnName : 'DEFAULT';
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
    DECLARE @maxVersion int;
    DECLARE @currentVersion int;

    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positorColumnName $schema.metadata.positorRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $attribute.reliableColumnName tinyint not null,
        $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) not null,
        $attribute.versionColumnName bigint not null,
        $attribute.statementTypeColumnName char(1) not null,
        primary key(
            $attribute.versionColumnName,
            $attribute.positorColumnName,
            $attribute.anchorReferenceName
        )
    );
    INSERT INTO @$attribute.name
    SELECT
        i.$attribute.anchorReferenceName,
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        $(attribute.isHistorized())? i.$attribute.changingColumnName,
        i.$attribute.positorColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.reliabilityColumnName,
        case
            when i.$attribute.reliabilityColumnName < $schema.metadata.reliableCutoff then 0
            else 1
        end,
        i.$attribute.valueColumnName,
        $(attribute.hasChecksum())? ${schema.metadata.encapsulation}$.MD5(cast(i.$attribute.valueColumnName as varbinary(max))),
        DENSE_RANK() OVER (
            PARTITION BY
                i.$attribute.positorColumnName,
                i.$attribute.anchorReferenceName
            ORDER BY
                $(attribute.isHistorized())? i.$attribute.changingColumnName ASC,
                i.$attribute.positingColumnName ASC,
                i.$attribute.reliabilityColumnName ASC
        ),
        'X'
    FROM
        inserted i;

    SELECT
        @maxVersion = max($attribute.versionColumnName),
        @currentVersion = 0
    FROM
        @$attribute.name;
    WHILE (@currentVersion < @maxVersion)
    BEGIN
        SET @currentVersion = @currentVersion + 1;
        UPDATE v
        SET
            v.$attribute.statementTypeColumnName =
                CASE
                    WHEN EXISTS (
                        SELECT TOP 1
                            t.$attribute.identityColumnName
                        FROM
                            [$anchor.capsule].[t$anchor.name](v.$attribute.positorColumnName, $changingParameter, v.$attribute.positingColumnName, v.$attribute.reliableColumnName) t
                        WHERE
                            t.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                        $(attribute.isHistorized())? AND
                            $(attribute.isHistorized())? t.$attribute.changingColumnName = v.$attribute.changingColumnName
                        AND
                            t.$attribute.reliabilityColumnName = v.$attribute.reliabilityColumnName
                        AND
                            $(attribute.hasChecksum())? t.$attribute.checksumColumnName = v.$attribute.checksumColumnName : t.$attribute.valueColumnName = v.$attribute.valueColumnName
                    )
                    THEN 'D' -- duplicate assertion
                    WHEN p.$attribute.anchorReferenceName is not null
                    THEN 'S' -- duplicate statement
~*/
            if(attribute.isHistorized()) {
/*~
                    WHEN EXISTS (
                        SELECT
                            $(attribute.hasChecksum())? v.$attribute.checksumColumnName : v.$attribute.valueColumnName
                        WHERE
                            $(attribute.hasChecksum())? v.$attribute.checksumColumnName =  : v.$attribute.valueColumnName =
                                $attribute.capsule$.pre$attribute.name (
                                    v.$attribute.anchorReferenceName,
                                    v.$attribute.positorColumnName,
                                    v.$attribute.changingColumnName,
                                    v.$attribute.positingColumnName
                                )
                    ) OR EXISTS (
                        SELECT
                            $(attribute.hasChecksum())? v.$attribute.checksumColumnName : v.$attribute.valueColumnName
                        WHERE
                            $(attribute.hasChecksum())? v.$attribute.checksumColumnName = : v.$attribute.valueColumnName =
                                $attribute.capsule$.fol$attribute.name (
                                    v.$attribute.anchorReferenceName,
                                    v.$attribute.positorColumnName,
                                    v.$attribute.changingColumnName,
                                    v.$attribute.positingColumnName
                                )
                    )
                    THEN 'R' -- restatement
~*/
            }
/*~
                    ELSE 'N' -- new statement
                END
        FROM
            @$attribute.name v
        LEFT JOIN
            [$attribute.capsule].[$attribute.positName] p
        ON
            p.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
        $(attribute.isHistorized())? AND
            $(attribute.isHistorized())? p.$attribute.changingColumnName = v.$attribute.changingColumnName
        AND
            $(attribute.hasChecksum())? p.$attribute.checksumColumnName = v.$attribute.checksumColumnName : p.$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = @currentVersion;

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
            $attribute.versionColumnName = @currentVersion
        AND
            $attribute.statementTypeColumnName in ($statementTypes);

        INSERT INTO [$attribute.capsule].[$attribute.annexName] (
            $(schema.METADATA)? $attribute.metadataColumnName,
            $attribute.identityColumnName,
            $attribute.positorColumnName,
            $attribute.positingColumnName,
            $attribute.reliabilityColumnName
        )
        SELECT
            $(schema.METADATA)? v.$attribute.metadataColumnName,
            p.$attribute.identityColumnName,
            v.$attribute.positorColumnName,
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
            v.$attribute.versionColumnName = @currentVersion
        AND
            $attribute.statementTypeColumnName in ('S',$statementTypes);
    END
END
GO
~*/
    } // end of loop over attributes
}