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

    DECLARE @inserted TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
        $tie.statementTypeColumnName char(1) not null,
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
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
~*/
    if(tie.hasMoreIdentifiers()) {
        while(role = tie.nextIdentifier()) {
/*~
            $role.columnName asc,
~*/
        }
    }
    else {
        while(role = tie.nextValue()) {
/*~
            $role.columnName asc,
~*/
        }
    }
/*~
            $(tie.isHistorized())? $tie.changingColumnName desc,
            $tie.positingColumnName desc
        )
    );
    INSERT INTO @inserted
    SELECT
        $(schema.METADATA)? ISNULL(i.$tie.metadataColumnName, 0),
        CASE   
            WHEN p.$tie.identityColumnName is null 
            THEN 'P' -- new posit
            WHEN a.$tie.identityColumnName is null
            THEN 'A' -- new assertion
        END,
        $(tie.isHistorized())? ISNULL(i.$tie.changingColumnName, @now),
        ISNULL(i.$tie.positingColumnName, @now),
        ISNULL(i.$tie.reliabilityColumnName, 1),
~*/
    while (role = tie.nextRole()) {
/*~
        i.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    FROM
        inserted i
    LEFT JOIN
        [$tie.capsule].[$tie.positName] p
    ON
~*/
    while(role = tie.nextRole()) {
/*~
        p.$role.columnName = i.$role.columnName
    $(tie.hasMoreRoles())? AND
~*/
    }
/*~
    $(tie.isHistorized())? AND
        $(tie.isHistorized())? p.$tie.changingColumnName = i.$tie.changingColumnName
    LEFT JOIN 
        [$tie.capsule].[$tie.annexName] a
    ON  
        a.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        a.$tie.positingColumnName = i.$tie.positingColumnName
    WHERE -- either the posit or the assertion must be different (exclude the identical)
        (p.$tie.identityColumnName is null OR a.$tie.identityColumnName is null)
    AND
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
/*~
    INSERT INTO @inserted
    SELECT
        $(schema.METADATA)? a.$tie.metadataColumnName,
        'X', -- existing data
        $(tie.isHistorized())? p.$tie.changingColumnName,
        a.$tie.positingColumnName,
        a.$tie.reliabilityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        p.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
    FROM (
        SELECT DISTINCT
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
        FROM 
            @inserted 
    ) i
    JOIN
        [$tie.capsule].[$tie.positName] p
    ON
~*/
        if(tie.hasMoreIdentifiers()) {
            while(role = tie.nextIdentifier()) {
/*~
        p.$role.columnName = i.$role.columnName
    $(tie.hasMoreIdentifiers())? AND
~*/
            }
        }
        else {
            while(role = tie.nextValue()) {
/*~
        p.$role.columnName = i.$role.columnName
    $(tie.hasMoreValues())? AND
~*/
            }
        }
/*~
    JOIN 
        [$tie.capsule].[$tie.annexName] a
    ON  
        a.$tie.identityColumnName = p.$tie.identityColumnName;

    DECLARE @retracted TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
        $tie.statementTypeColumnName char(1) not null,
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
        $tie.positingColumnName $schema.metadata.positingRange not null,
        $tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
        $role.columnName $knot.identity not null$(tie.hasMoreRoles())?,
~*/
        }
        else {
            anchor = role.anchor;
/*~
        $role.columnName $anchor.identity not null$(tie.hasMoreRoles())?,
~*/
        }
    }
/*~
    );

    INSERT INTO @retracted (
        $(schema.METADATA)? $tie.metadataColumnName,
        $tie.statementTypeColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    )
    SELECT
        $(schema.METADATA)? $tie.metadataColumnName,
        $tie.statementTypeColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    FROM (
        DELETE a
        OUTPUT 
            deleted.*,
            pre.$tie.reliabilityColumnName as previous_$tie.reliabilityColumnName, 
            fol.$tie.reliabilityColumnName as following_$tie.reliabilityColumnName
        FROM
            @inserted a
        OUTER APPLY (
            SELECT TOP 1
                p.$tie.reliabilityColumnName
            FROM
                @inserted p
            WHERE
~*/
        if(tie.hasMoreIdentifiers()) {
            while(role = tie.nextIdentifier()) {
/*~
                p.$role.columnName = a.$role.columnName
            $(tie.hasMoreIdentifiers())? AND
~*/
            }
        }
        else {
            while(role = tie.nextValue()) {
/*~
                p.$role.columnName = a.$role.columnName
            $(tie.hasMoreValues())? AND
~*/
            }
        }
/*~
            $(tie.isHistorized())? AND
                $(tie.isHistorized())? p.$tie.changingColumnName = a.$tie.changingColumnName
            AND
                p.$tie.positingColumnName < a.$tie.positingColumnName
            ORDER BY 
                p.$tie.positingColumnName DESC
        ) pre
        OUTER APPLY (
            SELECT TOP 1
                p.$tie.reliabilityColumnName
            FROM
                @inserted p
            WHERE
~*/
        if(tie.hasMoreIdentifiers()) {
            while(role = tie.nextIdentifier()) {
/*~
                p.$role.columnName = a.$role.columnName
            $(tie.hasMoreIdentifiers())? AND
~*/
            }
        }
        else {
            while(role = tie.nextValue()) {
/*~
                p.$role.columnName = a.$role.columnName
            $(tie.hasMoreValues())? AND
~*/
            }
        }
/*~
            $(tie.isHistorized())? AND
                $(tie.isHistorized())? p.$tie.changingColumnName = a.$tie.changingColumnName
            AND
                p.$tie.positingColumnName > a.$tie.positingColumnName
            ORDER BY 
                p.$tie.positingColumnName ASC
        ) fol
        WHERE
            (a.$tie.reliabilityColumnName = 0 AND isnull(pre.$tie.reliabilityColumnName, 1) = 1) -- ta bort isnull för assertive
        OR
            (a.$tie.reliabilityColumnName = 1 AND fol.$tie.reliabilityColumnName = 0)
    ) i
    WHERE
        i.$tie.statementTypeColumnName <> 'X'
    AND (
            (i.$tie.reliabilityColumnName = 0 AND i.previous_$tie.reliabilityColumnName = 1)
        OR
            (i.$tie.reliabilityColumnName = 1 AND i.following_$tie.reliabilityColumnName = 0)
        );
~*/
    if(!tie.isAssertive() || (tie.isHistorized() && tie.isIdempotent())) {
        // first remove reassertions
        if(!tie.isAssertive()) {
            var reliabilityColumn = tie.reliabilityColumnName;
/*~
    -- remove remaining (dangling) retractions
	DELETE @inserted 
	WHERE 
        $tie.reliabilityColumnName = 0;

    IF EXISTS (
        SELECT TOP 1 
            $tie.statementTypeColumnName 
        FROM 
            @inserted 
        WHERE 
            $tie.statementTypeColumnName IN ('P', 'A')
    )
    BEGIN --- (only run if necessary) ---
    DECLARE @updated TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
        $tie.positingColumnName $schema.metadata.positingRange not null,
        previous_$tie.positingColumnName $schema.metadata.positingRange not null,
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
~*/
    if(tie.hasMoreIdentifiers()) {
        while(role = tie.nextIdentifier()) {
/*~
            $role.columnName asc,
~*/
        }
    }
    else {
        while(role = tie.nextValue()) {
/*~
            $role.columnName asc,
~*/
        }
    }
/*~
            $(tie.isHistorized())? $tie.changingColumnName desc,
            $tie.positingColumnName desc
        )
    );

    INSERT INTO @updated (
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
        $tie.positingColumnName,
        previous_$tie.positingColumnName,
        $tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    )
    SELECT
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
        $tie.positingColumnName,
        previous_$tie.positingColumnName,
        $tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    FROM (
        DELETE a
        OUTPUT 
            deleted.*,
            pre.$tie.positingColumnName AS previous_$tie.positingColumnName,
            pre.$tie.statementTypeColumnName AS previous_$tie.statementTypeColumnName
        FROM 
            @inserted a
        CROSS APPLY (
            SELECT TOP 1
                * 
            FROM 
                @inserted s
            WHERE
~*/
            while(role = tie.nextRole()) {
/*~
                s.$role.columnName = a.$role.columnName
            AND
~*/
            }
/*~
                $(tie.isHistorized())? s.$tie.changingColumnName = a.$tie.changingColumnName
            $(tie.isHistorized())? AND 
                s.$tie.positingColumnName < a.$tie.positingColumnName
            ORDER BY 
                s.$tie.positingColumnName DESC
        ) pre
        WHERE
            a.$tie.reliabilityColumnName = pre.$tie.reliabilityColumnName
    ) u
    WHERE
        u.previous_$tie.statementTypeColumnName = 'A';

    DELETE a
    FROM 
        @inserted a
    JOIN 
        @updated u
    ON 
~*/
            while(role = tie.nextRole()) {
/*~
        u.$role.columnName = a.$role.columnName
    AND
~*/
            }
/*~
        $(tie.isHistorized())? U.$tie.changingColumnName = a.$tie.changingColumnName
    $(tie.isHistorized())? AND 
        u.previous_$tie.positingColumnName = a.$tie.positingColumnName;
    END --- (only run if necessary) ---        
~*/                
        } // end of tie is not assertive

        // then remove restatements 
        if(tie.isHistorized() && tie.isIdempotent()) {
/*~
    IF EXISTS (
        SELECT TOP 1 
            $tie.statementTypeColumnName 
        FROM 
            @inserted 
        WHERE 
            $tie.statementTypeColumnName IN ('P', 'A')
    )
    BEGIN --- (only run if necessary) ---
    DECLARE @restated TABLE (
        $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType not null,
        $tie.statementTypeColumnName char(1) not null,
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
        $tie.positingColumnName $schema.metadata.positingRange not null,
        $tie.reliabilityColumnName $schema.metadata.reliabilityRange not null,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
        $role.columnName $knot.identity not null$(tie.hasMoreRoles())?,
~*/
        }
        else {
            anchor = role.anchor;
/*~
        $role.columnName $anchor.identity not null$(tie.hasMoreRoles())?,
~*/
        }
    }
/*~
    );
    INSERT INTO @restated (
        $(schema.METADATA)? $tie.metadataColumnName,
        $tie.statementTypeColumnName,
        $tie.changingColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName,
~*/
    while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    )
    SELECT 
        $(schema.METADATA)? x.$tie.metadataColumnName,
        CASE 
            WHEN x.previous_$tie.positingColumnName < x.$tie.positingColumnName THEN 'D' -- physical delete 
            ELSE 'A' -- logical delete 
        END,
        x.$tie.changingColumnName,
        CASE 
            WHEN x.previous_$tie.positingColumnName < x.$tie.positingColumnName THEN x.$tie.positingColumnName 
            ELSE x.previous_$tie.positingColumnName 
        END,
        0, -- quench the existing restatements
~*/
        while (role = tie.nextRole()) {
/*~
        x.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
    FROM (
        DELETE a
        OUTPUT 
            deleted.*,
            pre.$tie.positingColumnName as previous_$tie.positingColumnName
        FROM 
            @inserted a
        OUTER APPLY (
            SELECT TOP 1
                h.*
            FROM 
                @inserted h
            WHERE
~*/
    if(tie.hasMoreIdentifiers()) {
        while(role = tie.nextIdentifier()) {
/*~
                h.$role.columnName = a.$role.columnName
            AND
~*/
        }
    }
    else {
        while(role = tie.nextValue()) {
/*~
                h.$role.columnName = a.$role.columnName
            AND
~*/
        }
    }
/*~
                h.$tie.changingColumnName < a.$tie.changingColumnName
            ORDER BY 
                h.$tie.changingColumnName DESC,
                h.$tie.positingColumnName DESC
        ) pre
        WHERE 
~*/
            while(role = tie.nextRole()) {
/*~
            a.$role.columnName = pre.$role.columnName
        $(tie.hasMoreRoles())? AND
~*/
            }
/*~     
    ) x
    WHERE
        x.$tie.statementTypeColumnName = 'X'; -- quench

    -- add the quenches
    INSERT INTO @inserted 
    SELECT 
        * 
    FROM (
        DELETE @restated
        OUTPUT deleted.*
        WHERE $tie.statementTypeColumnName = 'A'
    ) d;

    -- perform any remaining physical deletes 
    DELETE a
    FROM 
        @restated i
    JOIN
        [$tie.capsule].[$tie.positName] p
    ON
~*/
    while(role = tie.nextRole()) {
/*~
        p.$role.columnName = i.$role.columnName
    $(tie.hasMoreRoles())? AND
~*/
    }
/*~
    $(tie.isHistorized())? AND
        $(tie.isHistorized())? p.$tie.changingColumnName = i.$tie.changingColumnName
    JOIN 
        [$tie.capsule].[$tie.annexName] a
    ON  
        a.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        a.$tie.positingColumnName = i.$tie.positingColumnName;

    END --- (only run if necessary) ---
~*/
        }
    }
/*~
    -- add the retractions
    INSERT INTO @inserted SELECT * FROM @retracted;

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
        $tie.statementTypeColumnName = 'P';
~*/
            if(!tie.isAssertive()) {
/*~
    UPDATE a
    SET 
        a.$tie.positingColumnName = u.previous_$tie.positingColumnName
    FROM 
        @updated u
    JOIN
        [$tie.capsule].[$tie.positName] p
    ON
~*/
                while(role = tie.nextRole()) {
/*~
        p.$role.columnName = u.$role.columnName
    $(tie.hasMoreRoles())? AND
~*/
                }
/*~     
    $(tie.isHistorized())? AND
        $(tie.isHistorized())? p.$tie.changingColumnName = u.$tie.changingColumnName
    JOIN
        [$tie.capsule].[$tie.annexName] a
    ON 
        a.$tie.identityColumnName = p.$tie.identityColumnName
    AND
        a.$tie.positingColumnName = u.$tie.positingColumnName;        
~*/
            }
/*~
    INSERT INTO [$tie.capsule].[$tie.annexName] (
        $(schema.METADATA)? $tie.metadataColumnName,
        $tie.identityColumnName,
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? v.$tie.metadataColumnName,
        p.$tie.identityColumnName,
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
        v.$tie.statementTypeColumnName in ('P', 'A');
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
            THEN 0
            WHEN UPDATE($tie.reliabilityColumnName) THEN i.$tie.reliabilityColumnName
            ELSE 1
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
        $tie.positingColumnName,
        $tie.reliabilityColumnName
    )
    SELECT
        $(schema.METADATA)? d.$tie.metadataColumnName,
        d.$tie.identityColumnName,
        @now,
        0
    FROM
        deleted d;
END
GO
~*/
}
}