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
    DECLARE @now $schema.metadata.chronon = $schema.metadata.now;
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
        $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange null,
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
        $(attribute.timeRange)? ISNULL(i.$attribute.changingColumnName, @now),
        ISNULL(ISNULL(i.$attribute.positorColumnName, i.$schema.metadata.positorSuffix), 0),
        ISNULL(i.$attribute.positingColumnName, @now),
        ISNULL(i.$attribute.reliabilityColumnName, 
        CASE i.$schema.metadata.reliableSuffix
            WHEN 0 THEN $schema.metadata.deleteReliability
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
            $(attribute.timeRange)? $attribute.changingColumnName,
            $attribute.positorColumnName,
            $attribute.positingColumnName,
            $attribute.reliabilityColumnName,
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
            if(attribute.isHistorized()) {
                if(!attribute.isIdempotent())
                    statementTypes += ",'R'";
/*~
    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positorColumnName $schema.metadata.positorRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
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
        i.$attribute.changingColumnName,
        i.$attribute.positorColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.reliabilityColumnName,
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName), : i.$attribute.valueColumnName,
        $(attribute.hasChecksum())? i.$attribute.checksumColumnName,
        DENSE_RANK() OVER (
            PARTITION BY
                i.$attribute.positorColumnName,
                i.$attribute.anchorReferenceName
            ORDER BY
                i.$attribute.changingColumnName ASC,
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
                    WHEN v.$attribute.reliabilityColumnName = (
                        SELECT TOP 1
                            a.$attribute.reliabilityColumnName
                        FROM
                            [$attribute.capsule].[$attribute.annexName] a
                        WHERE
                            a.$attribute.identityColumnName = p.$attribute.identityColumnName
                        AND
                            a.$attribute.positorColumnName = v.$attribute.positorColumnName
                        ORDER BY
                            a.$attribute.positingColumnName desc
                    ) 
                    THEN 'D' -- duplicate assertion
                    WHEN $(attribute.hasChecksum())? v.$attribute.checksumColumnName in (( : v.$attribute.valueColumnName in ((
                        SELECT TOP 1
                            $(attribute.hasChecksum())? pre.$attribute.checksumColumnName : pre.$attribute.valueColumnName
                        FROM
                            [$attribute.capsule].[$attribute.name] pre
                        WHERE
                            pre.$attribute.changingColumnName < v.$attribute.changingColumnName
                        AND
                            pre.$attribute.positingColumnName <= v.$attribute.positingColumnName
                        AND
                            pre.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                        AND
                            pre.$attribute.positorColumnName = v.$attribute.positorColumnName
                        AND
                            pre.$attribute.reliabilityColumnName >= $schema.metadata.reliableCutoff
                        ORDER BY
                            pre.$attribute.changingColumnName desc,
                            pre.$attribute.positingColumnName desc
                    ), (
                        SELECT TOP 1
                            $(attribute.hasChecksum())? fol.$attribute.checksumColumnName : fol.$attribute.valueColumnName
                        FROM
                            [$attribute.capsule].[$attribute.name] fol
                        WHERE
                            fol.$attribute.changingColumnName > v.$attribute.changingColumnName
                        AND
                            fol.$attribute.positingColumnName <= v.$attribute.positingColumnName
                        AND
                            fol.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                        AND
                            fol.$attribute.positorColumnName = v.$attribute.positorColumnName
                        AND
                            fol.$attribute.reliabilityColumnName >= $schema.metadata.reliableCutoff
                        ORDER BY
                            fol.$attribute.changingColumnName asc,
                            fol.$attribute.positingColumnName desc
                    ))
                    THEN 'R' -- restatement
                    WHEN p.$attribute.anchorReferenceName is not null
                    THEN 'S' -- duplicate statement
                    ELSE 'N' -- new statement
                END
        FROM
            @$attribute.name v
        LEFT JOIN
            [$attribute.capsule].[$attribute.positName] p
        ON
            p.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
        AND
            p.$attribute.changingColumnName = v.$attribute.changingColumnName
        AND
            $(attribute.hasChecksum())? p.$attribute.checksumColumnName = v.$attribute.checksumColumnName : p.$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = @currentVersion;

        INSERT INTO [$attribute.capsule].[$attribute.positName] (
            $attribute.anchorReferenceName,
            $attribute.changingColumnName,
            $attribute.valueColumnName
        )
        SELECT
            $attribute.anchorReferenceName,
            $attribute.changingColumnName,
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
        AND
            p.$attribute.changingColumnName = v.$attribute.changingColumnName
        AND
            $(attribute.hasChecksum())? p.$attribute.checksumColumnName = v.$attribute.checksumColumnName : p.$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = @currentVersion
        AND
            $attribute.statementTypeColumnName in ('S',$statementTypes);
    END
~*/
            }
            else { // not historized
/*~
    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
        $attribute.positorColumnName $schema.metadata.positorRange not null,
        $attribute.positingColumnName $schema.metadata.positingRange not null,
        $attribute.reliabilityColumnName $schema.metadata.reliabilityRange not null,
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
        i.$attribute.positorColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.reliabilityColumnName,
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName), : i.$attribute.valueColumnName,
        $(attribute.hasChecksum())? i.$attribute.checksumColumnName,
        DENSE_RANK() OVER (
            PARTITION BY
                i.$attribute.positorColumnName,
                i.$attribute.anchorReferenceName
            ORDER BY
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
                    WHEN v.$attribute.reliabilityColumnName = (
                        SELECT TOP 1
                            a.$attribute.reliabilityColumnName
                        FROM
                            [$attribute.capsule].[$attribute.annexName] a
                        WHERE
                            a.$attribute.identityColumnName = p.$attribute.identityColumnName
                        AND
                            a.$attribute.positorColumnName = v.$attribute.positorColumnName
                        ORDER BY
                            a.$attribute.positingColumnName desc
                    ) 
                    THEN 'D' -- duplicate assertion
                    WHEN p.$attribute.anchorReferenceName is not null
                    THEN 'S' -- duplicate statement
                    ELSE 'N' -- new statement
                END
        FROM
            @$attribute.name v
        LEFT JOIN
            [$attribute.capsule].[$attribute.positName] p
        ON
            p.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
        AND
            $(attribute.hasChecksum())? p.$attribute.checksumColumnName = v.$attribute.checksumColumnName : p.$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = @currentVersion;

        INSERT INTO [$attribute.capsule].[$attribute.positName] (
            $attribute.anchorReferenceName,
            $attribute.valueColumnName
        )
        SELECT
            $attribute.anchorReferenceName,
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
        AND
            $(attribute.hasChecksum())? p.$attribute.checksumColumnName = v.$attribute.checksumColumnName : p.$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = @currentVersion
        AND
            $attribute.statementTypeColumnName in ('S',$statementTypes);
    END
    ~*/
			}
		}
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
    DECLARE @now $schema.metadata.chronon = $schema.metadata.now;
    IF(UPDATE($anchor.identityColumnName))
        RAISERROR('The identity column $anchor.identityColumnName is not updatable.', 16, 1);
~*/
		while (attribute = anchor.nextHistorizedAttribute()) {
			if(attribute.isKnotted()) {
				knot = attribute.knot;
/*~
    IF(UPDATE($attribute.identityColumnName))
        RAISERROR('The identity column $attribute.identityColumnName is not updatable.', 16, 1);

    IF(UPDATE($attribute.valueColumnName) OR UPDATE($attribute.knotValueColumnName))
    BEGIN
    INSERT INTO [$attribute.capsule].[$attribute.positName] (
        $attribute.anchorReferenceName,
        $attribute.changingColumnName,
        $attribute.valueColumnName
    )
    SELECT
        i.$attribute.anchorReferenceName,
        u.$attribute.changingColumnName,
        u.$attribute.valueColumnName
    FROM
        inserted i
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = i.$attribute.knotChecksumColumnName : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
    CROSS APPLY (
        SELECT
            cast(CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END as $attribute.timeRange),
            CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END,
            CASE WHEN UPDATE($schema.metadata.positorSuffix) THEN i.$schema.metadata.positorSuffix ELSE i.$attribute.positorColumnName END,
            cast(CASE WHEN UPDATE($attribute.positingColumnName) THEN $attribute.positingColumnName ELSE @now END as $schema.metadata.positingRange)
    ) u (
        $attribute.changingColumnName,
        $attribute.valueColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName
    )~*/
				if(attribute.isIdempotent()) {
/*~
    LEFT JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    AND
        p.$attribute.valueColumnName = u.$attribute.valueColumnName
    AND
        p.$attribute.changingColumnName = u.$attribute.changingColumnName
    WHERE
        p.$attribute.anchorReferenceName is null
    AND
        i.$attribute.valueColumnName not in ((
            SELECT TOP 1
                pre.$attribute.valueColumnName
            FROM
                [$attribute.capsule].[$attribute.name] pre
            WHERE
                pre.$attribute.changingColumnName < u.$attribute.changingColumnName
            AND
                pre.$attribute.positingColumnName <= u.$attribute.positingColumnName
            AND
                pre.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                pre.$attribute.positorColumnName = u.$attribute.positorColumnName
            AND
                pre.$attribute.reliabilityColumnName >= $schema.metadata.reliableCutoff
            ORDER BY
                pre.$attribute.changingColumnName desc,
                pre.$attribute.positingColumnName desc
        ), (
            SELECT TOP 1
                fol.$attribute.valueColumnName
            FROM
                [$attribute.capsule].[$attribute.name] fol
            WHERE
                fol.$attribute.changingColumnName > u.$attribute.changingColumnName
            AND
                fol.$attribute.positingColumnName <= u.$attribute.positingColumnName
            AND
                fol.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                fol.$attribute.positorColumnName = u.$attribute.positorColumnName
            AND
                fol.$attribute.reliabilityColumnName >= $schema.metadata.reliableCutoff
            ORDER BY
                fol.$attribute.changingColumnName asc,
                fol.$attribute.positingColumnName desc
        ))~*/
				}
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
        i.$attribute.anchorReferenceName,
        u.$attribute.changingColumnName,
        i.$attribute.valueColumnName
    FROM
        inserted i
    CROSS APPLY (
        SELECT
            cast(CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END as $attribute.timeRange),
            CASE WHEN UPDATE($schema.metadata.positorSuffix) THEN i.$schema.metadata.positorSuffix ELSE i.$attribute.positorColumnName END,
            cast(CASE WHEN UPDATE($attribute.positingColumnName) THEN $attribute.positingColumnName ELSE @now END as $schema.metadata.positingRange)
    ) u (
        $attribute.changingColumnName, 
        $attribute.positorColumnName,
        $attribute.positingColumnName
    )~*/
				if(attribute.isIdempotent()) {
/*~
    LEFT JOIN
        [$attribute.capsule].[$attribute.name] b
    ON
        b.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    AND
        $(attribute.hasChecksum())? b.$attribute.checksumColumnName = i.$attribute.checksumColumnName : b.$attribute.valueColumnName = i.$attribute.valueColumnName
    AND
        b.$attribute.changingColumnName = i.$attribute.changingColumnName
    WHERE
        b.$attribute.anchorReferenceName is null
    AND
        $(attribute.hasChecksum())? i.$attribute.checksumColumnName not in (( : i.$attribute.valueColumnName not in ((
            SELECT TOP 1
                $(attribute.hasChecksum())? pre.$attribute.checksumColumnName : pre.$attribute.valueColumnName
            FROM
                [$attribute.capsule].[$attribute.name] pre
            WHERE
                pre.$attribute.changingColumnName < u.$attribute.changingColumnName
            AND
                pre.$attribute.positingColumnName <= u.$attribute.positingColumnName
            AND
                pre.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                pre.$attribute.positorColumnName = u.$attribute.positorColumnName
            AND
                pre.$attribute.reliabilityColumnName >= $schema.metadata.reliableCutoff
            ORDER BY
                pre.$attribute.changingColumnName desc,
                pre.$attribute.positingColumnName desc
        ), (
            SELECT TOP 1
                $(attribute.hasChecksum())? fol.$attribute.checksumColumnName : fol.$attribute.valueColumnName
            FROM
                [$attribute.capsule].[$attribute.name] fol
            WHERE
                fol.$attribute.changingColumnName > u.$attribute.changingColumnName
            AND
                fol.$attribute.positingColumnName <= u.$attribute.positingColumnName
            AND
                fol.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                fol.$attribute.positorColumnName = u.$attribute.positorColumnName
            AND
                fol.$attribute.reliabilityColumnName >= $schema.metadata.reliableCutoff
            ORDER BY
                fol.$attribute.changingColumnName asc,
                fol.$attribute.positingColumnName desc
        ))~*/
				}
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
            cast(CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END as $attribute.timeRange),
            CASE WHEN UPDATE($schema.metadata.positorSuffix) THEN $schema.metadata.positorSuffix ELSE $attribute.positorColumnName END,
            cast(CASE WHEN UPDATE($attribute.positingColumnName) THEN $attribute.positingColumnName ELSE @now END as $schema.metadata.positingRange),
            CASE 
                WHEN UPDATE($attribute.reliabilityColumnName) THEN $attribute.reliabilityColumnName 
                WHEN UPDATE($schema.metadata.reliableSuffix) THEN 
                    CASE $schema.metadata.reliableSuffix
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END
                ELSE $attribute.reliabilityColumnName 
            END            
    ) u (
        $attribute.changingColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    AND
        p.$attribute.changingColumnName = u.$attribute.changingColumnName
    AND
        $(attribute.hasChecksum())? p.$attribute.checksumColumnName = i.$attribute.checksumColumnName : p.$attribute.valueColumnName = i.$attribute.valueColumnName~*/
            if(!attribute.isAssertive()) {
/*~
    AND u.$attribute.reliabilityColumnName <> (
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
    )~*/
            }
/*~;
    END
~*/
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
    DECLARE @now $schema.metadata.chronon = $schema.metadata.now;
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
