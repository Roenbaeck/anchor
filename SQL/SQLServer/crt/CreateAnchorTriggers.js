/*~
-- ANCHOR TRIGGERS ---------------------------------------------------------------------------------------------------
--
-- The following triggers on the latest view make it behave like a table.
-- There are three different 'instead of' triggers: insert, update, and delete.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it$anchor.name instead of INSERT trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[it$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    DECLARE @maxVersion int;
    DECLARE @currentVersion int;
    DECLARE @$anchor.mnemonic TABLE (
        Row bigint IDENTITY(1,1) not null primary key,
        $anchor.identityColumnName $anchor.identity not null
    );
    INSERT INTO [$anchor.capsule].[$anchor.name] (
        $(schema.METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName
    )
    OUTPUT
        inserted.$anchor.identityColumnName
    INTO
        @$anchor.mnemonic
    SELECT
        $(schema.METADATA)? $anchor.metadataColumnName : null
    FROM
        inserted
    WHERE
        inserted.$anchor.identityColumnName is null;
    DECLARE @inserted TABLE (
        $anchor.identityColumnName $anchor.identity not null,
        $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
        $(schema.IMPROVED)? $attribute.anchorReferenceName $anchor.identity null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange null,
        $attribute.positorColumnName $schema.metadata.positorRange null,
        $attribute.positingColumnName $schema.metadata.positingRange null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        $attribute.knotValueColumnName $knot.dataRange null,
        $(knot.hasChecksum())? $attribute.knotChecksumColumnName varbinary(16) null,
        $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType null,
        $attribute.valueColumnName $knot.identity null$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
        $(attribute.hasChecksum())? $attribute.checksumColumnName varbinary(16) null,
        $attribute.valueColumnName $attribute.dataRange null$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
    );
    INSERT INTO @inserted
    SELECT
        ISNULL(i.$anchor.identityColumnName, a.$anchor.identityColumnName),
        $(schema.METADATA)? i.$anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
        $(schema.IMPROVED)? ISNULL(ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName), a.$anchor.identityColumnName),
        $(schema.METADATA)? ISNULL(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
        $(attribute.isHistorized())? ISNULL(i.$attribute.changingColumnName, @now),
        ISNULL(ISNULL(i.$attribute.positorColumnName, i.$schema.metadata.positorSuffix), 0),
        ISNULL(i.$attribute.positingColumnName, @now),
        ISNULL(i.$attribute.reliabilityColumnName, 
        CASE
            WHEN i.$schema.metadata.reliableSuffix = 0 THEN $schema.metadata.deleteReliability
            WHEN i.$attribute.reliableColumnName = 0 THEN $schema.metadata.deleteReliability
            ELSE $schema.metadata.reliableCutoff
        END),
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        i.$attribute.knotValueColumnName,
        $(knot.hasChecksum())? ISNULL(i.$attribute.knotChecksumColumnName, HashBytes('MD5', cast(i.$attribute.knotValueColumnName as varbinary(max)))),
        $(schema.METADATA)? ISNULL(i.$attribute.knotMetadataColumnName, i.$anchor.metadataColumnName),
~*/
            }
/*~
        $(attribute.hasChecksum())? ISNULL(i.$attribute.checksumColumnName, HashBytes('MD5', cast(i.$attribute.valueColumnName as varbinary(max)))),
        i.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
    FROM (
        SELECT
            $schema.metadata.positorSuffix,
            $schema.metadata.reliableSuffix,
            $anchor.identityColumnName,
            $(schema.METADATA)? $anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(schema.IMPROVED)? $attribute.anchorReferenceName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.positorColumnName,
            $attribute.positingColumnName,
            $attribute.reliabilityColumnName,
            $attribute.reliableColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            $attribute.knotValueColumnName,
            $(knot.hasChecksum())? $attribute.knotChecksumColumnName,
            $(schema.METADATA)? $attribute.knotMetadataColumnName,
~*/
            }
/*~
            $(attribute.hasChecksum())? $attribute.checksumColumnName,
            $attribute.valueColumnName,
~*/
        }
/*~
            ROW_NUMBER() OVER (PARTITION BY $anchor.identityColumnName ORDER BY $anchor.identityColumnName) AS Row
        FROM
            inserted
    ) i
    LEFT JOIN
        @$anchor.mnemonic a
    ON
        a.Row = i.Row;
~*/
        while (attribute = anchor.nextAttribute()) {
            knot = attribute.knot;
            var statementTypes = "'N'";
            if(attribute.isAssertive())
                statementTypes += ",'D'";
            if(attribute.isHistorized() && !attribute.isIdempotent())
                statementTypes += ",'R'";
/*~
    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positorColumnName $schema.metadata.positorRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $attribute.reliableColumnName tinyint not null,
        $(attribute.knotRange)? $attribute.valueColumnName $knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
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
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName), : i.$attribute.valueColumnName,
        $(attribute.hasChecksum())? i.$attribute.checksumColumnName,
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
        @inserted i
~*/
            if(attribute.isKnotted()) {
               knot = attribute.knot;
/*~
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = i.$attribute.knotChecksumColumnName : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
    WHERE
        ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) is not null;
~*/
            }
            else {
/*~
    WHERE
        i.$attribute.valueColumnName is not null;
~*/
            }
            var changingParameter = attribute.isHistorized() ? 'v.' + attribute.changingColumnName : 'DEFAULT';
/*~
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
                            $(attribute.hasChecksum())? v.$attribute.checksumColumnName = ( : v.$attribute.valueColumnName = (
                                SELECT TOP 1
                                    $(attribute.hasChecksum())? pre.$attribute.checksumColumnName : pre.$attribute.valueColumnName
                                FROM
                                    [$attribute.capsule].[r$attribute.name](
                                        v.$attribute.positorColumnName,
                                        v.$attribute.changingColumnName,
                                        v.$attribute.positingColumnName
                                    ) pre
                                WHERE
                                    pre.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                                AND
                                    pre.$attribute.changingColumnName < v.$attribute.changingColumnName
                                AND
                                    pre.$attribute.reliableColumnName = 1
                                ORDER BY
                                    pre.$attribute.changingColumnName DESC,
                                    pre.$attribute.positingColumnName DESC
                        )
                    ) OR EXISTS (
                        SELECT
                            $(attribute.hasChecksum())? v.$attribute.checksumColumnName : v.$attribute.valueColumnName
                        WHERE
                            $(attribute.hasChecksum())? v.$attribute.checksumColumnName = ( : v.$attribute.valueColumnName = (
                                SELECT TOP 1
                                    $(attribute.hasChecksum())? fol.$attribute.checksumColumnName : fol.$attribute.valueColumnName
                                FROM
                                    [$attribute.capsule].[f$attribute.name](
                                        v.$attribute.positorColumnName,
                                        v.$attribute.changingColumnName,
                                        v.$attribute.positingColumnName
                                    ) fol
                                WHERE
                                    fol.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                                AND
                                    fol.$attribute.changingColumnName > v.$attribute.changingColumnName
                                AND
                                    fol.$attribute.reliableColumnName = 1
                                ORDER BY
                                    fol.$attribute.changingColumnName ASC,
                                    fol.$attribute.positingColumnName DESC                            
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
~*/
        } // end of loop over attributes
/*~
END
GO
~*/
	}
	if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut$anchor.name instead of UPDATE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[ut$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    IF(UPDATE($anchor.identityColumnName))
        RAISERROR('The identity column $anchor.identityColumnName is not updatable.', 16, 1);
~*/
		while (attribute = anchor.nextHistorizedAttribute()) {
			if(attribute.isKnotted()) {
				knot = attribute.knot;
/*~
    IF(UPDATE($attribute.identityColumnName))
        RAISERROR('The identity column $attribute.identityColumnName is not updatable.', 16, 1);
    IF(UPDATE($attribute.anchorReferenceName))
        RAISERROR('The foreign key column $attribute.anchorReferenceName is not updatable.', 16, 1);
        
    IF(UPDATE($attribute.valueColumnName) OR UPDATE($attribute.knotValueColumnName))
    BEGIN
    INSERT INTO [$attribute.capsule].[$attribute.positName] (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName,
        $attribute.valueColumnName
    )
    SELECT
        u.$attribute.anchorReferenceName,
        u.$attribute.changingColumnName,
        u.$attribute.valueColumnName
    FROM
        inserted i
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = HashBytes('MD5', cast(i.$attribute.knotValueColumnName as varbinary(max))) : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
    CROSS APPLY (
        SELECT
            ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
            cast(CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END as $attribute.timeRange),
            CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END,
            CASE WHEN UPDATE($schema.metadata.positorSuffix) THEN i.$schema.metadata.positorSuffix ELSE ISNULL(i.$attribute.positorColumnName, 0) END,
            cast(CASE WHEN UPDATE($attribute.positingColumnName) THEN i.$attribute.positingColumnName ELSE @now END as $schema.metadata.positingRange)
    ) u (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName,
        $attribute.valueColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName
    )
    LEFT JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = u.$attribute.anchorReferenceName
    AND
        p.$attribute.valueColumnName = u.$attribute.valueColumnName
    AND
        p.$attribute.changingColumnName = u.$attribute.changingColumnName
    WHERE
        u.$attribute.valueColumnName is not null
    AND
        u.$attribute.anchorReferenceName is not null
    AND
        p.$attribute.anchorReferenceName is null~*/
                if(attribute.isIdempotent()) {
/*~                    
    AND NOT EXISTS (
        SELECT
            u.$attribute.valueColumnName
        WHERE
            u.$attribute.valueColumnName = (
                SELECT TOP 1
                    pre.$attribute.valueColumnName
                FROM
                    [$attribute.capsule].[r$attribute.name](
                        u.$attribute.positorColumnName,
                        u.$attribute.changingColumnName,
                        u.$attribute.positingColumnName
                    ) pre
                WHERE
                    pre.$attribute.anchorReferenceName = u.$attribute.anchorReferenceName
                AND
                    pre.$attribute.changingColumnName < u.$attribute.changingColumnName
                AND
                    pre.$attribute.reliableColumnName = 1
                ORDER BY
                    pre.$attribute.changingColumnName DESC,
                    pre.$attribute.positingColumnName DESC
            )
    )
    AND NOT EXISTS (
        SELECT
            u.$attribute.valueColumnName
        WHERE
            u.$attribute.valueColumnName = (
                SELECT TOP 1
                    fol.$attribute.valueColumnName
                FROM
                    [$attribute.capsule].[f$attribute.name](
                        u.$attribute.positorColumnName,
                        u.$attribute.changingColumnName,
                        u.$attribute.positingColumnName
                    ) fol
                WHERE
                    fol.$attribute.anchorReferenceName = u.$attribute.anchorReferenceName
                AND
                    fol.$attribute.changingColumnName > u.$attribute.changingColumnName
                AND
                    fol.$attribute.reliableColumnName = 1
                ORDER BY
                    fol.$attribute.changingColumnName ASC,
                    fol.$attribute.positingColumnName DESC                            
            )
    )~*/
				}
/*~;
    INSERT INTO [$attribute.capsule].[$attribute.annexName] (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        u.$attribute.positorColumnName,
        u.$attribute.positingColumnName,
        u.$attribute.reliabilityColumnName
    FROM 
        inserted i
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = HashBytes('MD5', cast(i.$attribute.knotValueColumnName as varbinary(max))) : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
    CROSS APPLY (
        SELECT
            ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
            CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END,
            cast(
            CASE 
                WHEN i.$attribute.valueColumnName is null AND [k$knot.mnemonic].$knot.identityColumnName is null THEN i.$attribute.changingColumnName
                WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName 
                ELSE @now 
            END as $attribute.timeRange),
            CASE WHEN UPDATE($schema.metadata.positorSuffix) THEN i.$schema.metadata.positorSuffix ELSE ISNULL(i.$attribute.positorColumnName, 0) END,
            cast(CASE WHEN UPDATE($attribute.positingColumnName) THEN i.$attribute.positingColumnName ELSE @now END as $schema.metadata.positingRange),
            CASE 
                WHEN i.$attribute.valueColumnName is null AND [k$knot.mnemonic].$knot.identityColumnName is null THEN $schema.metadata.deleteReliability
                WHEN UPDATE($schema.metadata.reliableSuffix) THEN 
                    CASE i.$schema.metadata.reliableSuffix
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END
                WHEN UPDATE($attribute.reliableColumnName) THEN 
                    CASE i.$attribute.reliableColumnName
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END                
                ELSE ISNULL(i.$attribute.reliabilityColumnName, $schema.metadata.reliableCutoff)
            END            
    ) u (
        $attribute.anchorReferenceName,
        $attribute.valueColumnName,
        $attribute.changingColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON (
            p.$attribute.anchorReferenceName = u.$attribute.anchorReferenceName
        AND
            p.$attribute.changingColumnName = u.$attribute.changingColumnName
        AND
            p.$attribute.valueColumnName = u.$attribute.valueColumnName
    )
    OR (
            p.$attribute.identityColumnName = i.$attribute.identityColumnName
        AND
            u.$attribute.valueColumnName is null
    )~*/
            if(!attribute.isAssertive()) {
/*~
    WHERE NOT EXISTS (
        SELECT
            u.$attribute.reliabilityColumnName
        WHERE
            u.$attribute.reliabilityColumnName = (
                SELECT TOP 1
                    a.$attribute.reliabilityColumnName
                FROM
                    [$attribute.capsule].[$attribute.annexName] a
                WHERE
                    a.$attribute.identityColumnName = p.$attribute.identityColumnName
                AND
                    a.$attribute.positorColumnName = u.$attribute.positorColumnName
                ORDER BY
                    a.$attribute.positingColumnName desc
            )
    )~*/
            }
/*~;
    END
~*/
            }
			else { // not knotted
/*~
    IF(UPDATE($attribute.valueColumnName))
    BEGIN
    INSERT INTO [$attribute.capsule].[$attribute.positName] (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName,
        $attribute.valueColumnName
    )
    SELECT
        u.$attribute.anchorReferenceName,
        u.$attribute.changingColumnName,
        i.$attribute.valueColumnName
    FROM
        inserted i
    CROSS APPLY (
        SELECT
            ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
            cast(CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END as $attribute.timeRange),
            CASE WHEN UPDATE($schema.metadata.positorSuffix) THEN i.$schema.metadata.positorSuffix ELSE ISNULL(i.$attribute.positorColumnName, 0) END,
            cast(CASE WHEN UPDATE($attribute.positingColumnName) THEN i.$attribute.positingColumnName ELSE @now END as $schema.metadata.positingRange)
    ) u (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName, 
        $attribute.positorColumnName,
        $attribute.positingColumnName
    )
    LEFT JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = u.$attribute.anchorReferenceName
    AND
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName = HashBytes('MD5', cast(i.$attribute.valueColumnName as varbinary(max))) : p.$attribute.valueColumnName = i.$attribute.valueColumnName
    AND
        p.$attribute.changingColumnName = u.$attribute.changingColumnName
    WHERE
        i.$attribute.valueColumnName is not null
    AND
        u.$attribute.anchorReferenceName is not null
    AND
        p.$attribute.anchorReferenceName is null~*/
                if(attribute.isIdempotent()) {
/*~                    
    AND NOT EXISTS (
        SELECT
            'P'
        WHERE
            $(attribute.hasChecksum())? HashBytes('MD5', cast(i.$attribute.valueColumnName as varbinary(max))) = ( : i.$attribute.valueColumnName = (
                SELECT TOP 1
                    $(attribute.hasChecksum())? pre.$attribute.checksumColumnName : pre.$attribute.valueColumnName
                FROM
                    [$attribute.capsule].[r$attribute.name](
                        u.$attribute.positorColumnName,
                        u.$attribute.changingColumnName,
                        u.$attribute.positingColumnName
                    ) pre
                WHERE
                    pre.$attribute.anchorReferenceName = u.$attribute.anchorReferenceName
                AND
                    pre.$attribute.changingColumnName < u.$attribute.changingColumnName
                AND
                    pre.$attribute.reliableColumnName = 1
                ORDER BY
                    pre.$attribute.changingColumnName DESC,
                    pre.$attribute.positingColumnName DESC
            )
    )
    AND NOT EXISTS (
        SELECT
            'F'
        WHERE
            $(attribute.hasChecksum())? HashBytes('MD5', cast(i.$attribute.valueColumnName as varbinary(max))) = ( : i.$attribute.valueColumnName = (
                SELECT TOP 1
                    $(attribute.hasChecksum())? fol.$attribute.checksumColumnName : fol.$attribute.valueColumnName
                FROM
                    [$attribute.capsule].[f$attribute.name](
                        u.$attribute.positorColumnName,
                        u.$attribute.changingColumnName,
                        u.$attribute.positingColumnName
                    ) fol
                WHERE
                    fol.$attribute.anchorReferenceName = u.$attribute.anchorReferenceName
                AND
                    fol.$attribute.changingColumnName > u.$attribute.changingColumnName
                AND
                    fol.$attribute.reliableColumnName = 1
                ORDER BY
                    fol.$attribute.changingColumnName ASC,
                    fol.$attribute.positingColumnName DESC                            
            )
    )~*/
				}
/*~;
    INSERT INTO [$attribute.capsule].[$attribute.annexName] (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        u.$attribute.positorColumnName,
        u.$attribute.positingColumnName,
        u.$attribute.reliabilityColumnName
    FROM 
        inserted i
    CROSS APPLY (
        SELECT
            ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
            cast(
            CASE 
                WHEN i.$attribute.valueColumnName is null THEN i.$attribute.changingColumnName
                WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName 
                ELSE @now 
            END as $attribute.timeRange),
            CASE WHEN UPDATE($schema.metadata.positorSuffix) THEN i.$schema.metadata.positorSuffix ELSE ISNULL(i.$attribute.positorColumnName, 0) END,
            cast(CASE WHEN UPDATE($attribute.positingColumnName) THEN i.$attribute.positingColumnName ELSE @now END as $schema.metadata.positingRange),
            CASE 
                WHEN i.$attribute.valueColumnName is null THEN $schema.metadata.deleteReliability
                WHEN UPDATE($schema.metadata.reliableSuffix) THEN 
                    CASE i.$schema.metadata.reliableSuffix
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END
                WHEN UPDATE($attribute.reliableColumnName) THEN 
                    CASE i.$attribute.reliableColumnName
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END                
                ELSE ISNULL(i.$attribute.reliabilityColumnName, $schema.metadata.reliableCutoff)
            END            
    ) u (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON (
            p.$attribute.anchorReferenceName = u.$attribute.anchorReferenceName
        AND
            p.$attribute.changingColumnName = u.$attribute.changingColumnName
        AND
            $(attribute.hasChecksum())? p.$attribute.checksumColumnName = HashBytes('MD5', cast(i.$attribute.valueColumnName as varbinary(max))) : p.$attribute.valueColumnName = i.$attribute.valueColumnName
    )
    OR (
            p.$attribute.identityColumnName = i.$attribute.identityColumnName
        AND
            i.$attribute.valueColumnName is null
    )~*/
            if(!attribute.isAssertive()) {
/*~
    WHERE NOT EXISTS (
        SELECT
            u.$attribute.reliabilityColumnName
        WHERE
            u.$attribute.reliabilityColumnName = (
                SELECT TOP 1
                    a.$attribute.reliabilityColumnName
                FROM
                    [$attribute.capsule].[$attribute.annexName] a
                WHERE
                    a.$attribute.identityColumnName = p.$attribute.identityColumnName
                AND
                    a.$attribute.positorColumnName = u.$attribute.positorColumnName
                ORDER BY
                    a.$attribute.positingColumnName desc
            )
    )~*/
            }
/*~;
    END
~*/
			} // end of not knotted
        } // end of while loop over attributes
/*~
END
GO
~*/
	} // end of if historized attributes exist
	if(anchor.hasMoreAttributes()) {
/*~
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt$anchor.name instead of DELETE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[dt$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    INSERT INTO [$attribute.capsule].[$attribute.annexName] (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.identityColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? p.$attribute.metadataColumnName,
        p.$attribute.identityColumnName,
        p.$attribute.positorColumnName,
        @now,
        $schema.metadata.deleteReliability
    FROM
        deleted d
    JOIN
        [$attribute.capsule].[$attribute.annexName] p
    ON
        p.$attribute.identityColumnName = d.$attribute.identityColumnName;
~*/
        }
/*~
END
GO
~*/
	}
}
