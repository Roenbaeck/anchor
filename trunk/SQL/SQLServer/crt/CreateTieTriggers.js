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
var tie, role, knot, anchor;
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
    DECLARE @now $schema.metadata.chronon = $schema.metadata.now;
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
        ISNULL(i.$tie.reliabilityColumnName, $schema.metadata.reliableCutoff),
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
        var changingParameter = tie.isHistorized() ? 'v.' + tie.changingColumnName : 'DEFAULT';
        var statementTypes = "'N'";
        if(tie.isAssertive())
            statementTypes += ",'D'";
        if(tie.isHistorized() && !tie.isIdempotent())
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
                    WHEN EXISTS (
                        SELECT TOP 1
                            t.$tie.identityColumnName
                        FROM
                            [$tie.capsule].[t$tie.name](v.$tie.positorColumnName, $changingParameter, v.$tie.positingColumnName, 1) t
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
                            pre.$tie.reliabilityColumnName >= $schema.metadata.reliableCutoff
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
                            fol.$tie.reliabilityColumnName >= $schema.metadata.reliableCutoff
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
            $tie.statementTypeColumnName in ($statementTypes);

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
            v.$tie.statementTypeColumnName in ('S',$statementTypes);
    END
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
    DECLARE @now $schema.metadata.chronon = $schema.metadata.now;
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
        u.$tie.changingColumnName
    FROM
        inserted i
    CROSS APPLY (
        SELECT
            cast(CASE WHEN UPDATE($tie.changingColumnName) THEN i.$tie.changingColumnName ELSE @now END as $tie.timeRange),
            cast(CASE WHEN UPDATE($tie.positingColumnName) THEN i.$tie.positingColumnName ELSE @now END as $schema.metadata.positingRange)
    ) u (
        $tie.changingColumnName,
        $tie.positingColumnName
    )~*/
        if(tie.isIdempotent()) {
/*~
    LEFT JOIN
        [$tie.capsule].[$tie.positName] p
    ON
        p.$tie.changingColumnName = u.$tie.changingColumnName
~*/
        while(role = tie.nextRole()) {
/*~
    AND
        p.$role.columnName = i.$role.columnName
~*/
        }
/*~
    WHERE
        p.$tie.identityColumnName is null
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
                pre.$tie.changingColumnName < u.$tie.changingColumnName
            AND
                pre.$tie.positingColumnName <= u.$tie.positingColumnName
            AND
                pre.$tie.positorColumnName = i.$tie.positorColumnName
            AND
                pre.$tie.reliabilityColumnName >= $schema.metadata.reliableCutoff
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
                fol.$tie.changingColumnName > u.$tie.changingColumnName
            AND
                fol.$tie.positingColumnName <= u.$tie.positingColumnName
            AND
                fol.$tie.positorColumnName = i.$tie.positorColumnName
            AND
                fol.$tie.reliabilityColumnName >= $schema.metadata.reliableCutoff
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
        ) = 0~*/
        }
/*~;
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
        u.$tie.positingColumnName,
        v.$tie.reliabilityColumnName
    FROM
        inserted v
    CROSS APPLY (
        SELECT
            cast(CASE WHEN UPDATE($tie.changingColumnName) THEN v.$tie.changingColumnName ELSE @now END as $tie.timeRange),
            cast(CASE WHEN UPDATE($tie.positingColumnName) THEN v.$tie.positingColumnName ELSE @now END as $schema.metadata.positingRange),
            CASE 
                WHEN UPDATE($tie.reliabilityColumnName) THEN v.$tie.reliabilityColumnName 
                WHEN UPDATE($tie.reliableColumnName) THEN 
                    CASE v.$tie.reliableColumnName
                        WHEN 0 THEN $schema.metadata.deleteReliability
                        ELSE $schema.metadata.reliableCutoff
                    END                
                ELSE v.$tie.reliabilityColumnName 
            END  
    ) u (
        $tie.changingColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    JOIN
        [$tie.capsule].[$tie.positName] p
    ON
        p.$tie.changingColumnName = u.$tie.changingColumnName
~*/
            while(role = tie.nextRole()) {
/*~
    AND
        p.$role.columnName = v.$role.columnName~*/
            }
            if(!tie.isAssertive()) {
/*~
    WHERE NOT EXISTS (
        SELECT 
            u.$tie.reliabilityColumnName
        WHERE
            u.$tie.reliabilityColumnName = (
                SELECT TOP 1
                    a.$tie.reliabilityColumnName
                FROM
                    [$tie.capsule].[$tie.annexName] a
                WHERE
                    a.$tie.identityColumnName = p.$tie.identityColumnName
                AND
                    a.$tie.positorColumnName = v.$tie.positorColumnName
                ORDER BY
                    a.$tie.positingColumnName desc
            )
    )~*/
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
    DECLARE @now $schema.metadata.chronon = $schema.metadata.now;
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