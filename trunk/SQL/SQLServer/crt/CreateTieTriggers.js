/*~
-- TIE TRIGGERS -------------------------------------------------------------------------------------------------------
--
-- The following triggers on the latest view make it behave like a table.
-- There are three different 'instead of' triggers: insert, update, and delete.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent ties, only changes that represent values different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var tie, role, knot, anchor, anyRole;
while (tie = schema.nextTie()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it$tie.name instead of INSERT trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$tie.capsule].[it$tie.name] ON [$tie.capsule].[l$tie.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.chronon = $schema.now;
    DECLARE @maxVersion int;
    DECLARE @currentVersion int;
    DECLARE @inserted TABLE (
        $(METADATA)? $tie.metadataColumnName $schema.metadataType not null,
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
        $(tie.isHistorized())? $tie.versionColumnName bigint not null,
        $(tie.isHistorized())? $tie.statementTypeColumnName char(1) not null,
        $tie.positorColumnName $schema.positorRange not null,
        $tie.positingColumnName $schema.positingRange not null,
        $tie.reliabilityColumnName $schema.reliabilityRange not null,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
        $role.columnName $knot.identity not null,
~*/
            }
            else {
                anchor = role.anchor;
/*~
        $role.columnName $anchor.identity not null,
~*/
            }
        }
/*~
        primary key (
            $(tie.isHistorized())? $tie.versionColumnName,
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
            $role.columnName$(tie.hasMoreIdentifiers())?,
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
            $role.columnName$(tie.hasMoreValues())?,
~*/
                }
            }
/*~
        )
    );
    INSERT INTO @inserted
    SELECT
        $(METADATA)? ISNULL(i.$tie.metadataColumnName, 0),
~*/
        if(tie.isHistorized()) {
/*~
        ISNULL(i.$tie.changingColumnName, @now),
        DENSE_RANK() OVER (
            PARTITION BY
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                $role.columnName$(tie.hasMoreIdentifiers())?,
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
                $role.columnName$(tie.hasMoreValues())?,
~*/
                }
            }
/*~
            ORDER BY
                ISNULL(i.$tie.changingColumnName, @now)
        ),
        'X',
~*/
        }
/*~
        ISNULL(i.$tie.positorColumnName, 0),
        ISNULL(i.$tie.positingColumnName, @now),
        ISNULL(i.$tie.reliabilityColumnName, $schema.reliableCutoff),
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
        ISNULL(i.$role.columnName, [$role.name].$knot.identityColumnName)~*/
            }
            else {
                anchor = role.anchor;
/*~
        i.$role.columnName~*/
            }
            /*~$(tie.hasMoreRoles())?,~*/
        }
/*~
    FROM
        inserted i~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
/*~
    LEFT JOIN
        [$knot.capsule].[$knot.name] [$role.name]
    ON
        [$role.name].$knot.valueColumnName = i.$role.knotValueColumnName~*/
        }
/*~
    WHERE
~*/
        if(tie.hasMoreIdentifiers()) {
            while(role = tie.nextIdentifier()) {
/*~
    $(!tie.isFirstIdentifier())? AND
        i.$role.columnName is not null~*/
            }
        }
        else {
            while(role = tie.nextValue()) {
/*~
    $(!tie.isFirstValue())? AND
        i.$role.columnName is not null~*/
            }
        }
/*~;~*/
        if(tie.isHistorized() && tie.hasMoreValues()) {
            var statementTypes = "'N'";
            if(!tie.isIdempotent())
                statementTypes += ",'R'";
/*~
    SELECT
        @maxVersion = max($tie.versionColumnName),
        @currentVersion = 0
    FROM
        @inserted;
    WHILE (@currentVersion < @maxVersion)
    BEGIN
        SET @currentVersion = @currentVersion + 1;
        UPDATE v
        SET
            v.$tie.statementTypeColumnName =
                CASE
                    WHEN tie.$tie.changingColumnName is not null
                    THEN 'D' -- duplicate
                    WHEN (
                        SELECT
                            COUNT(*)
                        FROM (
                            SELECT TOP 1
~*/
            while(role = tie.nextValue()) {
/*~
                                pre.$role.columnName$(tie.hasMoreValues())?,
~*/
            }
/*~
                        FROM
                            [$tie.capsule].[$tie.name] pre
                        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                            pre.$role.columnName = v.$role.columnName
                        AND
~*/
                }
            }
            else {
/*~
                        (
~*/
                while(role = tie.nextValue()) {
/*~
                                pre.$role.columnName = v.$role.columnName
                            $(tie.hasMoreValues())? OR
~*/
                }
/*~
                        )
                        AND
~*/
            }
/*~
                            pre.$tie.changingColumnName < v.$tie.changingColumnName
                        AND
                            pre.$tie.positingColumnName <= v.$tie.positingColumnName
                        AND
                            pre.$tie.positorColumnName = v.$tie.positorColumnName
                        AND
                            pre.$tie.reliabilityColumnName >= $schema.reliableCutoff
                        ORDER BY
                            pre.$tie.changingColumnName DESC,
                            pre.$tie.positingColumnName DESC
                        UNION
                        SELECT TOP 1
~*/
            while(role = tie.nextValue()) {
/*~
                            fol.$role.columnName$(tie.hasMoreValues())?,
~*/
            }
/*~
                        FROM
                            [$tie.capsule].[$tie.name] fol
                        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                            fol.$role.columnName = v.$role.columnName
                        AND
~*/
                }
            }
            else {
/*~
                        (
~*/
                while(role = tie.nextValue()) {
/*~
                                fol.$role.columnName = v.$role.columnName
                            $(tie.hasMoreValues())? OR
~*/
                }
/*~
                        )
                        AND
~*/
            }
/*~
                            fol.$tie.changingColumnName > v.$tie.changingColumnName
                        AND
                            fol.$tie.positingColumnName <= v.$tie.positingColumnName
                        AND
                            fol.$tie.positorColumnName = v.$tie.positorColumnName
                        AND
                            fol.$tie.reliabilityColumnName >= $schema.reliableCutoff
                        ORDER BY
                            fol.$tie.changingColumnName ASC,
                            fol.$tie.positingColumnName DESC
                    ) s
                    WHERE
~*/
            while(role = tie.nextValue()) {
/*~
                        s.$role.columnName = v.$role.columnName
                    $(tie.hasMoreValues())? AND
~*/
            }
/*~
                    ) > 0
                    THEN 'R' -- restatement
                    ELSE 'N' -- new statement
                END
        FROM
            @inserted v
        LEFT JOIN
            [$tie.capsule].[$tie.name] tie
        ON
            tie.$tie.changingColumnName = v.$tie.changingColumnName
~*/
            while(role = tie.nextIdentifier()) {
/*~
        AND
            tie.$role.columnName = v.$role.columnName
~*/
            }
            while(role = tie.nextValue()) {
/*~
        AND
            tie.$role.columnName = v.$role.columnName
~*/
            }
/*~
        WHERE
            v.$tie.versionColumnName = @currentVersion;

        INSERT INTO [$tie.capsule].[$tie.positName] (
~*/
            while(role = tie.nextRole()) {
/*~
            $role.columnName,
~*/
            }
/*~
            $tie.changingColumnName
        )
        SELECT
~*/
            while(role = tie.nextRole()) {
/*~
            $role.columnName,
~*/
            }
/*~
            $tie.changingColumnName
        FROM
            @inserted
        WHERE
            $tie.versionColumnName = @currentVersion
        AND
            $tie.statementTypeColumnName in ($statementTypes);

        INSERT INTO [$tie.capsule].[$tie.annexName] (
            $(METADATA)? $tie.metadataColumnName,
            $tie.identityColumnName,
            $tie.positorColumnName,
            $tie.positingColumnName,
            $tie.reliabilityColumnName
        )
        SELECT
            $(METADATA)? v.$tie.metadataColumnName,
            p.$tie.identityColumnName,
            v.$tie.positorColumnName,
            v.$tie.positingColumnName,
            v.$tie.reliabilityColumnName
        FROM
            @inserted v
        JOIN
            [$tie.capsule].[$tie.positName] p
        ON
            p.$tie.changingColumnName = v.$tie.changingColumnName
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
        AND
            p.$role.columnName = v.$role.columnName
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
        AND
            p.$role.columnName = v.$role.columnName
~*/
                }
            }
/*~
        WHERE
            v.$tie.versionColumnName = @currentVersion
        AND
            v.$tie.statementTypeColumnName in ($statementTypes);
    END
~*/
        }
        else {
/*~
    INSERT INTO [$tie.capsule].[$tie.positName] (
~*/
            while(role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
    )
    SELECT
~*/
            while(role = tie.nextRole()) {
/*~
        i.$role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
    FROM
        @inserted i
    LEFT JOIN
        [$tie.capsule].[$tie.name] tie
    ON
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
                    anyRole = role;
/*~
        tie.$role.columnName = i.$role.columnName
    $(tie.hasMoreIdentifiers())? AND
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
                    anyRole = role;
/*~
        tie.$role.columnName = i.$role.columnName
    $(tie.hasMoreValues())? OR
~*/
                }
            }
/*~
    WHERE
        tie.$anyRole.columnName is null;
~*/
        }
/*~
    INSERT INTO [$tie.capsule].[$tie.annexName] (
        $(METADATA)? $tie.metadataColumnName,
        $tie.identityColumnName,
        $tie.positorColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    SELECT
        $(METADATA)? v.$tie.metadataColumnName,
        p.$tie.identityColumnName,
        v.$tie.positorColumnName,
        v.$tie.positingColumnName,
        v.$tie.reliabilityColumnName
    FROM
        @inserted v
    JOIN
        [$tie.capsule].[$tie.positName] p
    ON
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
        p.$role.columnName = v.$role.columnName$(!tie.hasMoreIdentifiers())?;
    $(tie.hasMoreIdentifiers())? AND~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
        p.$role.columnName = v.$role.columnName$(!tie.hasMoreValues())?;
    $(tie.hasMoreValues())? AND~*/
                }
            }
/*~
END
GO
~*/
    if(tie.isHistorized() && tie.hasMoreValues()) {
/*~
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut$tie.name instead of UPDATE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$tie.capsule].[ut$tie.name] ON [$tie.capsule].[l$tie.name]
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.chronon = $schema.now;
~*/
        if(tie.hasMoreIdentifiers()) {
            while(role = tie.nextIdentifier()) {
/*~
    IF(UPDATE($role.columnName))
        RAISERROR('The identity column $role.columnName is not updatable.', 16, 1);
~*/
            }
        }
/*~
    INSERT INTO [$tie.capsule].[$tie.positName] (
~*/
            while(role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
            }
/*~
        $tie.changingColumnName
    )
    SELECT
~*/
            while(role = tie.nextRole()) {
/*~
        i.$role.columnName,
~*/
            }
/*~
        CASE WHEN UPDATE($tie.changingColumnName) THEN i.$tie.changingColumnName ELSE @now END
    FROM
        inserted i~*/
        if(tie.isIdempotent()) {
/*~
    LEFT JOIN
        [$tie.capsule].[$tie.name] tie
    ON
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
                    anyRole = role;
/*~
        tie.$role.columnName = i.$role.columnName
    $(tie.hasMoreIdentifiers())? AND
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
                    anyRole = role;
/*~
        tie.$role.columnName = i.$role.columnName
    $(tie.hasMoreValues())? OR
~*/
                }
            }
/*~
    WHERE
        tie.$anyRole.columnName is null
    AND (
                        SELECT
                            COUNT(*)
                        FROM (
                            SELECT TOP 1
~*/
            while(role = tie.nextValue()) {
/*~
                                pre.$role.columnName$(tie.hasMoreValues())?,
~*/
            }
/*~
                        FROM
                            [$tie.capsule].[$tie.name] pre
                        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                            pre.$role.columnName = i.$role.columnName
                        AND
~*/
                }
            }
            else {
/*~
                        (
~*/
                while(role = tie.nextValue()) {
/*~
                                pre.$role.columnName = i.$role.columnName
                            $(tie.hasMoreValues())? OR
~*/
                }
/*~
                        )
                        AND
~*/
            }
/*~
                            pre.$tie.changingColumnName < i.$tie.changingColumnName
                        AND
                            pre.$tie.positingColumnName <= i.$tie.positingColumnName
                        AND
                            pre.$tie.positorColumnName = i.$tie.positorColumnName
                        AND
                            pre.$tie.reliabilityColumnName >= $schema.reliableCutoff
                        ORDER BY
                            pre.$tie.changingColumnName DESC,
                            pre.$tie.positingColumnName DESC
                        UNION
                        SELECT TOP 1
~*/
            while(role = tie.nextValue()) {
/*~
                            fol.$role.columnName$(tie.hasMoreValues())?,
~*/
            }
/*~
                        FROM
                            [$tie.capsule].[$tie.name] fol
                        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                            fol.$role.columnName = i.$role.columnName
                        AND
~*/
                }
            }
            else {
/*~
                        (
~*/
                while(role = tie.nextValue()) {
/*~
                                fol.$role.columnName = i.$role.columnName
                            $(tie.hasMoreValues())? OR
~*/
                }
/*~
                        )
                        AND
~*/
            }
/*~
                            fol.$tie.changingColumnName > i.$tie.changingColumnName
                        AND
                            fol.$tie.positingColumnName <= i.$tie.positingColumnName
                        AND
                            fol.$tie.positorColumnName = i.$tie.positorColumnName
                        AND
                            fol.$tie.reliabilityColumnName >= $schema.reliableCutoff
                        ORDER BY
                            fol.$tie.changingColumnName ASC,
                            fol.$tie.positingColumnName DESC
                    ) s
                    WHERE
~*/
            while(role = tie.nextValue()) {
/*~
                        s.$role.columnName = i.$role.columnName
                    $(tie.hasMoreValues())? AND
~*/
            }
/*~
                    ) > 0~*/
        }
/*~;
    INSERT INTO [$tie.capsule].[$tie.annexName] (
        $(METADATA)? $tie.metadataColumnName,
        $tie.identityColumnName,
        $tie.positorColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    SELECT
        $(METADATA)? v.$tie.metadataColumnName,
        p.$tie.identityColumnName,
        v.$tie.positorColumnName,
        v.$tie.positingColumnName,
        v.$tie.reliabilityColumnName
    FROM
        inserted v
    JOIN
        [$tie.capsule].[$tie.positName] p
    ON
        p.$tie.changingColumnName = v.$tie.changingColumnName
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
    AND
        p.$role.columnName = v.$role.columnName
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
    AND
        p.$role.columnName = v.$role.columnName~*/
                }
            }
/*~;
END
GO
~*/
    }
/*~
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt$tie.name instead of DELETE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$tie.capsule].[dt$tie.name] ON [$tie.capsule].[l$tie.name]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [$tie.capsule].[$tie.annexName] (
        $(METADATA)? $tie.metadataColumnName,
        $tie.identityColumnName,
        $tie.positorColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    SELECT
        $(METADATA)? d.$tie.metadataColumnName,
        d.$tie.identityColumnName,
        d.$tie.positorColumnName,
        d.$tie.positingColumnName,
        $schema.deleteReliability
    FROM
        deleted d;
END
GO
~*/
}