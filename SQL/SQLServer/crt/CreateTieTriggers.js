if(schema.TRIGGERS) {
/*~
-- TIE TRIGGERS -------------------------------------------------------------------------------------------------------
--
-- The following triggers on the assembled and latest views make them behave like tables.
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
var tie, role, knot, anchor;
while (tie = schema.nextTie()) {
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it$tie.name instead of INSERT trigger on $tie.name
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$tie.capsule$.it_$tie.name', 'TR') IS NOT NULL
DROP TRIGGER [$tie.capsule].[it_$tie.name];
GO
CREATE TRIGGER [$tie.capsule].[it_$tie.name] ON [$tie.capsule].[$tie.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    DECLARE @maxVersion int;
    DECLARE @currentVersion int;
    DECLARE @inserted TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
        $tie.versionColumnName bigint not null,
        $tie.statementTypeColumnName char(1) not null,
        $tie.positorColumnName $schema.metadata.positorRange not null,
        $tie.positingColumnName $schema.metadata.positingRange not null,
        $tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
        $tie.assertionColumnName char(1) not null,
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
        $(schema.METADATA)? ISNULL(i.$tie.metadataColumnName, 0),
        $(tie.isHistorized())? ISNULL(i.$tie.changingColumnName, @now),
        DENSE_RANK() OVER (
            PARTITION BY
                i.$tie.positorColumnName,
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                i.$role.columnName$(tie.hasMoreIdentifiers())?,
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
                i.$role.columnName$(tie.hasMoreValues())?,
~*/
                }
            }
/*~
            ORDER BY
                $(tie.isHistorized())? ISNULL(i.$tie.changingColumnName, @now),
                i.$tie.positingColumnName ASC,
                i.$tie.reliabilityColumnName ASC
        ),
        'X',
        ISNULL(i.$tie.positorColumnName, 0),
        ISNULL(i.$tie.positingColumnName, @now),
        ISNULL(i.$tie.reliabilityColumnName, $schema.metadata.defaultReliability),
        CAST(
            case
                when i.$tie.reliabilityColumnName > $schema.metadata.deleteReliability then '+'
                when i.$tie.reliabilityColumnName = $schema.metadata.deleteReliability then '?'
                when i.$tie.reliabilityColumnName < $schema.metadata.deleteReliability then '-'
                else '+' -- assume that unspecified reliability (NULL) means default
            end
        as char(1)),
~*/
        while (role = tie.nextRole()) {
/*~
        i.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
    FROM
        inserted i
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
        var changingParameter = tie.isHistorized() ? 'v.' + tie.changingColumnName : 'DEFAULT';
        var positStatementTypes = "'N'", annexStatementTypes = "'N'";
        if(tie.isAssertive()) {
            annexStatementTypes += ",'D'";
        }
        if(tie.isHistorized() && !tie.isIdempotent()) {
            positStatementTypes += ",'R'";
            annexStatementTypes += ",'R'";
        }
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
                    WHEN EXISTS (
                        SELECT TOP 1
                            t.$tie.identityColumnName
                        FROM
                            [$tie.capsule].[t$tie.name](v.$tie.positorColumnName, $changingParameter, v.$tie.positingColumnName, v.$tie.assertionColumnName) t
                        WHERE
                            t.$tie.reliabilityColumnName = v.$tie.reliabilityColumnName
                        $(tie.isHistorized())? AND
                            $(tie.isHistorized())? t.$tie.changingColumnName = v.$tie.changingColumnName
~*/
        while(role = tie.nextRole()) {
/*~
                        AND
                            t.$role.columnName = v.$role.columnName
~*/
        }
/*~
                    )
                    THEN 'D' -- duplicate assertion
                    WHEN p.$tie.identityColumnName is not null
                    THEN 'S' -- duplicate statement
~*/
        if(tie.isHistorized() && tie.hasMoreValues()) {
/*~
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
                            [$tie.capsule].[r$tie.name] (
                                v.$tie.positorColumnName,
                                v.$tie.changingColumnName,
                                v.$tie.positingColumnName
                            ) pre
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
                            $(tie.hasMoreValues())? AND
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
                            pre.$tie.assertionColumnName = v.$tie.assertionColumnName
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
                            [$tie.capsule].[f$tie.name] (
                                v.$tie.positorColumnName,
                                v.$tie.changingColumnName,
                                v.$tie.positingColumnName
                            ) fol
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
                            $(tie.hasMoreValues())? AND
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
                            fol.$tie.assertionColumnName = v.$tie.assertionColumnName
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
~*/
        }
/*~
                    ELSE 'N' -- new statement
                END
        FROM
            @inserted v
        LEFT JOIN
            [$tie.capsule].[$tie.positName] p
        ON
~*/
            while(role = tie.nextRole()) {
/*~
            p.$role.columnName = v.$role.columnName
        $(tie.hasMoreRoles())? AND
~*/
            }
/*~
        $(tie.isHistorized())? AND
            $(tie.isHistorized())? p.$tie.changingColumnName = v.$tie.changingColumnName
        WHERE
            v.$tie.versionColumnName = @currentVersion;

        INSERT INTO [$tie.capsule].[$tie.positName] (
            $(tie.isHistorized())? $tie.changingColumnName,
~*/
            while(role = tie.nextRole()) {
/*~
            $role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
        )
        SELECT
            $(tie.isHistorized())? $tie.changingColumnName,
~*/
            while(role = tie.nextRole()) {
/*~
            $role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
        FROM
            @inserted
        WHERE
            $tie.versionColumnName = @currentVersion
        AND
            $tie.statementTypeColumnName in ($positStatementTypes);

        INSERT INTO [$tie.capsule].[$tie.annexName] (
            $(schema.METADATA)? $tie.metadataColumnName,
            $tie.identityColumnName,
            $tie.positorColumnName,
            $tie.positingColumnName,
            $tie.reliabilityColumnName
        )
        SELECT
            $(schema.METADATA)? v.$tie.metadataColumnName,
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
        while(role = tie.nextRole()) {
/*~
            p.$role.columnName = v.$role.columnName
        $(tie.hasMoreRoles())? AND
~*/
        }
/*~
        $(tie.isHistorized())? AND
            $(tie.isHistorized())? p.$tie.changingColumnName = v.$tie.changingColumnName
        WHERE
            v.$tie.versionColumnName = @currentVersion
        AND
            v.$tie.statementTypeColumnName in ('S',$annexStatementTypes);
    END
END
GO
~*/
// Here comes the trigger on the latest view, using the trigger above
/*~
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it_l$tie.name instead of INSERT trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$tie.capsule].[it_l$tie.name] ON [$tie.capsule].[l$tie.name]
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    INSERT INTO [$tie.capsule].[$tie.name] (
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
        }
/*~
        $tie.positorColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? i.$tie.metadataColumnName,
        $(tie.isHistorized())? i.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        $(role.knot)? ISNULL(i.$role.columnName, [$role.name].$role.knot.identityColumnName), : i.$role.columnName,
~*/
        }
/*~
        i.$tie.positorColumnName,
        i.$tie.positingColumnName,
        i.$tie.reliabilityColumnName
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
/*~;
END
GO
~*/
    if(tie.hasMoreValues()) {
/*~
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut_l$tie.name instead of UPDATE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$tie.capsule].[ut_l$tie.name] ON [$tie.capsule].[l$tie.name]
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    IF(UPDATE($tie.assertionColumnName))
        RAISERROR('The computed assertion column $tie.assertionColumnName is not updatable.', 16, 1);
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
    INSERT INTO [$tie.capsule].[$tie.name] (
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
        }
/*~
        $tie.positorColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? i.$tie.metadataColumnName,
        $(tie.isHistorized())? cast(CASE WHEN UPDATE($tie.changingColumnName) THEN i.$tie.changingColumnName ELSE @now END as $tie.timeRange),
~*/
        while (role = tie.nextRole()) {
/*~
        $(role.knot)? CASE WHEN UPDATE($role.knotValueColumnName) THEN [$role.name].$role.knot.identityColumnName ELSE i.$role.columnName END, : i.$role.columnName,
~*/
        }
/*~
        CASE WHEN UPDATE($tie.positorColumnName) THEN i.$tie.positorColumnName ELSE 0 END,
        cast(CASE WHEN UPDATE($tie.positingColumnName) THEN i.$tie.positingColumnName ELSE @now END as $schema.metadata.positingRange),
        CASE
            WHEN
~*/
        while(role = tie.nextValue()) {
/*~
                i.$role.columnName is null
            $(tie.hasMoreValues())? OR
~*/
        }
/*~
            THEN $schema.metadata.deleteReliability
            WHEN UPDATE($tie.reliabilityColumnName) THEN i.$tie.reliabilityColumnName
            ELSE $schema.metadata.defaultReliability
        END
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
/*~;
END
GO
~*/
    }
/*~
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt_l$tie.name instead of DELETE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER [$tie.capsule].[dt_l$tie.name] ON [$tie.capsule].[l$tie.name]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
    INSERT INTO [$tie.capsule].[$tie.annexName] (
        $(schema.METADATA)? $tie.metadataColumnName,
        $tie.identityColumnName,
        $tie.positorColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? d.$tie.metadataColumnName,
        d.$tie.identityColumnName,
        d.$tie.positorColumnName,
        @now,
        $schema.metadata.deleteReliability
    FROM
        deleted d;
END
GO
~*/
}
}