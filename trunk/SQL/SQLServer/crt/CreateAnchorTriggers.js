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
    DECLARE @now $schema.chronon = $schema.now;
    DECLARE @maxVersion int;
    DECLARE @currentVersion int;
    DECLARE @$anchor.mnemonic TABLE (
        Row bigint IDENTITY(1,1) not null primary key,
        $anchor.identityColumnName $anchor.identity not null
    );
    INSERT INTO [$anchor.capsule].[$anchor.name] (
        $(METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName
    )
    OUTPUT
        inserted.$anchor.identityColumnName
    INTO
        @$anchor.mnemonic
    SELECT
        $(METADATA)? $anchor.metadataColumnName : null
    FROM
        inserted
    WHERE
        inserted.$anchor.identityColumnName is null;
    DECLARE @inserted TABLE (
        $anchor.identityColumnName $anchor.identity not null,
        $(METADATA)? $anchor.metadataColumnName $schema.metadataType not null,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
        $(IMPROVED)? $attribute.anchorReferenceName $anchor.identity null,
        $(METADATA)? $attribute.metadataColumnName $schema.metadataType null,
        $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange null,
        $attribute.positorColumnName $schema.positorRange null,
        $attribute.positingColumnName $schema.positingRange null,
        $attribute.reliabilityColumnName $schema.reliabilityRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
        $attribute.knotValueColumnName $knot.dataRange null,
        $(METADATA)? $attribute.knotMetadataColumnName $schema.metadataType null,
        $attribute.valueColumnName $knot.identity null$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
        $attribute.valueColumnName $attribute.dataRange null$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
    );
    INSERT INTO @inserted
    SELECT
        ISNULL(i.$anchor.identityColumnName, a.$anchor.identityColumnName),
        $(METADATA)? i.$anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
        $(IMPROVED)? ISNULL(ISNULL(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName), a.$anchor.identityColumnName),
        $(METADATA)? ISNULL(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
        $(attribute.timeRange)? ISNULL(i.$attribute.changingColumnName, @now),
        ISNULL(i.$attribute.positorColumnName, 0),
        ISNULL(i.$attribute.positingColumnName, @now),
        ISNULL(i.$attribute.reliabilityColumnName, $schema.reliableCutoff),
~*/
            if(attribute.isKnotted()) {
/*~
        i.$attribute.knotValueColumnName,
        $(METADATA)? ISNULL(i.$attribute.knotMetadataColumnName, i.$anchor.metadataColumnName),
~*/
            }
/*~
        i.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
    FROM (
        SELECT
            $anchor.identityColumnName,
            $(METADATA)? $anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(IMPROVED)? $attribute.anchorReferenceName,
            $(METADATA)? $attribute.metadataColumnName,
            $(attribute.timeRange)? $attribute.changingColumnName,
            $attribute.positorColumnName,
            $attribute.positingColumnName,
            $attribute.reliabilityColumnName,
~*/
            if(attribute.isKnotted()) {
/*~
            $attribute.knotValueColumnName,
            $(METADATA)? $attribute.knotMetadataColumnName,
~*/
            }
/*~
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
            if(attribute.isHistorized()) {
                var statementTypes = "'N'";
                if(!attribute.isIdempotent())
                    statementTypes += ",'R'";
/*~
    DECLARE @$attribute.name TABLE (
        $attribute.anchorReferenceName $anchor.identity not null,
        $(METADATA)? $attribute.metadataColumnName $schema.metadataType not null,
        $attribute.changingColumnName $attribute.timeRange not null,
        $attribute.positorColumnName $schema.positorRange not null,
        $attribute.positingColumnName $schema.positingRange not null,
        $attribute.reliabilityColumnName $schema.reliabilityRange not null,
        $(attribute.knotRange)? $attribute.valueColumnName $knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
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
        $(METADATA)? i.$attribute.metadataColumnName,
        i.$attribute.changingColumnName,
        i.$attribute.positorColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.reliabilityColumnName,
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName), : i.$attribute.valueColumnName,
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
/*~
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
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
                    WHEN a.$attribute.identityColumnName is not null
                    THEN 'D' -- identical duplicate
                    WHEN v.$attribute.valueColumnName in ((
                        SELECT TOP 1
                            pre.$attribute.valueColumnName
                        FROM
                            [$attribute.capsule].[$attribute.positName] pre
                        WHERE
                            pre.$attribute.changingColumnName < v.$attribute.changingColumnName
                        AND
                            pre.$attribute.positingColumnName <= v.positingColumnName
                        AND
                            pre.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                        AND
                            pre.$attribute.positorColumnName = v.$attribute.positorColumnName
                        AND
                            pre.$attribute.reliabilityColumnName >= $schema.reliableCutoff
                        ORDER BY
                            pre.$attribute.changingColumnName desc,
                            pre.$attribute.positingColumnName desc
                    ), (
                        SELECT TOP 1
                            fol.$attribute.valueColumnName
                        FROM
                            [$attribute.capsule].[$attribute.positName] fol
                        WHERE
                            fol.$attribute.changingColumnName > v.$attribute.changingColumnName
                        AND
                            fol.$attribute.positingColumnName <= v.positingColumnName
                        AND
                            fol.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
                        AND
                            fol.$attribute.positorColumnName = v.$attribute.positorColumnName
                        AND
                            fol.$attribute.reliabilityColumnName = $schema.reliableCutoff
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
            p.$attribute.valueColumnName = v.$attribute.valueColumnName
        LEFT JOIN
            [$attribute.capsule].[$attribute.annexName] a
        ON
            a.$attribute.identityColumnName = p.$attribute.identityColumnName
        AND
            a.$attribute.positorColumnName = v.$attribute.positorColumnName
        AND
            a.$attribute.positingColumnName = v.$attribute.positingColumnName
        AND
            a.$attribute.reliabilityColumnName = v.$attribute.reliabilityColumnName
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
            $attribute.identityColumnName,
            $attribute.positorColumnName,
            $attribute.positingColumnName,
            $attribute.reliabilityColumnName
        )
        SELECT
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
            p.$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = @currentVersion
        AND
            $attribute.statementTypeColumnName in ('S',$statementTypes);
    END
~*/
            }
            else {
/*~
    INSERT INTO [$attribute.capsule].[$attribute.positName] (
        $attribute.anchorReferenceName,
        $attribute.valueColumnName
    )
    SELECT
        i.$attribute.anchorReferenceName,
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) : i.$attribute.valueColumnName
    FROM
        @inserted i
    LEFT JOIN
        [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
    ON
        [$attribute.mnemonic].$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
~*/
                if(attribute.isKnotted()) {
/*~
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
    WHERE
        ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) is not null
 ~*/
                }
/*~
    $(attribute.knotRange)? AND : WHERE
        [$attribute.mnemonic].$attribute.anchorReferenceName is null
    AND
        $(attribute.knotRange)? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) is not null; : i.$attribute.valueColumnName is not null;

    INSERT INTO [$attribute.capsule].[$attribute.annexName] (
        $attribute.identityColumnName,
        $attribute.positorColumnName,
        $attribute.positingColumnName,
        $attribute.reliabilityColumnName
    )
    SELECT
        p.$attribute.identityColumnName,
        i.$attribute.positorColumnName,
        i.$attribute.positingColumnName,
        i.$attribute.reliabilityColumnName
    FROM
        @inserted i
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    $(attribute.isHistorized())? AND
        $(attribute.isHistorized())? p.$attribute.changingColumnName = i.$attribute.changingColumnName
    AND
        p.$attribute.valueColumnName = i.$attribute.valueColumnName;
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
    DECLARE @now $schema.chronon = $schema.now;
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
        CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END,
        CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END
    FROM
        inserted i
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName~*/
                if(attribute.isIdempotent()) {
/*~
    LEFT JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    AND
        p.$attribute.valueColumnName = CASE WHEN UPDATE($attribute.valueColumnName) THEN i.$attribute.valueColumnName ELSE [k$knot.mnemonic].$knot.identityColumnName END
    AND
        p.$attribute.changingColumnName = i.$attribute.changingColumnName
    WHERE
        p.$attribute.anchorReferenceName is null
    AND
        i.$attribute.valueColumnName not in ((
            SELECT TOP 1
                pre.$attribute.valueColumnName
            FROM
                [$attribute.capsule].[$attribute.positName] pre
            WHERE
                pre.$attribute.changingColumnName < i.$attribute.changingColumnName
            AND
                pre.$attribute.positingColumnName <= i.positingColumnName
            AND
                pre.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                pre.$attribute.positorColumnName = i.$attribute.positorColumnName
            AND
                pre.$attribute.reliabilityColumnName = $schema.reliableCutoff
            ORDER BY
                pre.$attribute.changingColumnName desc,
                pre.$attribute.positingColumnName desc
        ), (
            SELECT TOP 1
                fol.$attribute.valueColumnName
            FROM
                [$attribute.capsule].[$attribute.positName] fol
            WHERE
                fol.$attribute.changingColumnName > i.$attribute.changingColumnName
            AND
                fol.$attribute.positingColumnName <= i.positingColumnName
            AND
                fol.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                fol.$attribute.positorColumnName = i.$attribute.positorColumnName
            AND
                fol.$attribute.reliabilityColumnName = $schema.reliableCutoff
            ORDER BY
                fol.$attribute.changingColumnName asc,
                fol.$attribute.positingColumnName desc
        ))~*/
                }
            }
            else {
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
        CASE WHEN UPDATE($attribute.changingColumnName) THEN i.$attribute.changingColumnName ELSE @now END,
        i.$attribute.valueColumnName
    FROM
        inserted i~*/
                if(attribute.isIdempotent()) {
/*~
    LEFT JOIN
        [$attribute.capsule].[$attribute.name] b
    ON
        b.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    AND
        b.$attribute.valueColumnName = i.$attribute.valueColumnName
    AND
        b.$attribute.changingColumnName = i.$attribute.changingColumnName
    WHERE
        b.$attribute.anchorReferenceName is null
    AND
        i.$attribute.valueColumnName not in ((
            SELECT TOP 1
                pre.$attribute.valueColumnName
            FROM
                [$attribute.capsule].[$attribute.positName] pre
            WHERE
                pre.$attribute.changingColumnName < i.$attribute.changingColumnName
            AND
                pre.$attribute.positingColumnName <= i.positingColumnName
            AND
                pre.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                pre.$attribute.positorColumnName = i.$attribute.positorColumnName
            AND
                pre.$attribute.reliabilityColumnName = $schema.reliableCutoff
            ORDER BY
                pre.$attribute.changingColumnName desc,
                pre.$attribute.positingColumnName desc
        ), (
            SELECT TOP 1
                fol.$attribute.valueColumnName
            FROM
                [$attribute.capsule].[$attribute.positName] fol
            WHERE
                fol.$attribute.changingColumnName > i.$attribute.changingColumnName
            AND
                fol.$attribute.positingColumnName <= i.positingColumnName
            AND
                fol.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
            AND
                fol.$attribute.positorColumnName = i.$attribute.positorColumnName
            AND
                fol.$attribute.reliabilityColumnName = $schema.reliableCutoff
            ORDER BY
                fol.$attribute.changingColumnName asc,
                fol.$attribute.positingColumnName desc
        ))~*/
                }
            }
            /*~;
    INSERT INTO [$attribute.capsule].[$attribute.annexName] (
        $attribute.identityColumnName,
        $attribute.positorName,
        $attribute.positingName,
        $attribute.reliabilityColumnName
    )
    SELECT
        p.$attribute.identityColumnName,
        i.$attribute.positorName,
        i.$attribute.positingName,
        i.$attribute.reliabilityColumnName
    FROM
        inserted i
    JOIN
        [$attribute.capsule].[$attribute.positName] p
    ON
        p.$attribute.anchorReferenceName = i.$attribute.anchorReferenceName
    AND
        p.$attribute.changingColumnName = i.$attribute.changingColumnName
    AND
        p.$attribute.valueColumnName = i.$attribute.valueColumnName;
    END
~*/
        }
/*~
END
GO
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt$anchor.name instead of DELETE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$anchor.capsule].[dt$anchor.name] ON [$anchor.capsule].[l$anchor.name]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    INSERT INTO [$attribute.capsule].[$attribute.annexName] (
        $attribute.identityColumnName,
        $attribute.positorName,
        $attribute.positingName,
        $attribute.reliabilityColumnName
    )
    SELECT
        p.$attribute.identityColumnName,
        p.$attribute.positorName,
        p.$attribute.positingName,
        $schema.deleteReliability
    FROM
        deleted d
    JOIN
        [$attribute.capsule].[$attribute.annexName] p
    ON
        p.$attribute.identityColumnName = d.$attribute.identityColumnName;
~*/
        }
/*~;
END
GO
~*/
    }
}
