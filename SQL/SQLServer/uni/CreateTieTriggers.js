if(schema.TRIGGERS) {
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
    if(tie.isHistorized()) {
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
            $(tie.isHistorized())? $tie.changingColumnName desc
        )
    );
    INSERT INTO @inserted
    SELECT
        $(schema.METADATA)? ISNULL(i.$tie.metadataColumnName, 0),
        'P', -- new posit
        $(tie.isHistorized())? ISNULL(i.$tie.changingColumnName, @now),
~*/
    while (role = tie.nextRole()) {
/*~
        i.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    FROM
        inserted i
    WHERE NOT EXISTS (
        SELECT 
            42
        FROM
            [$tie.capsule].[$tie.name] x
        WHERE 
~*/
        while(role = tie.nextRole()) {
/*~
            x.$role.columnName = i.$role.columnName
        $(tie.hasMoreRoles())? AND
~*/
        }
/*~
        $(tie.isHistorized())? AND
            $(tie.isHistorized())? x.$tie.changingColumnName = i.$tie.changingColumnName
    );
~*/
    // fill table with entire history in these cases
    if(tie.isIdempotent()) {
/*~
    INSERT INTO @inserted
    SELECT
        $(schema.METADATA)? p.$tie.metadataColumnName, 
        'X', -- existing data
        $(tie.isHistorized())? p.$tie.changingColumnName, 
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
        [$tie.capsule].[$tie.name] p
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
        // then remove restatements 
/*~
    DECLARE @restated TABLE (
        $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange not null,
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
    INSERT INTO @restated
    SELECT 
        x.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
        x.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
    FROM (
        DELETE t
        OUTPUT 
            deleted.*
        FROM 
            @inserted t
        OUTER APPLY (
            SELECT TOP 1
~*/
            while(role = tie.nextRole()) {
/*~
                $role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
            FROM
                @inserted h
            WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                h.$role.columnName = t.$role.columnName
            AND
~*/
                }
            }
            else {
                while(role = tie.nextValue()) {
/*~
                h.$role.columnName = t.$role.columnName
            AND
~*/
                }
            }
/*~
                h.$tie.changingColumnName < t.$tie.changingColumnName
            ORDER BY 
                h.$tie.changingColumnName DESC
        ) pre
        WHERE 
~*/
            while(role = tie.nextRole()) {
/*~
            t.$role.columnName = pre.$role.columnName
        $(tie.hasMoreRoles())? AND
~*/
            }
/*~     
    ) x
    WHERE
        x.$tie.statementTypeColumnName = 'X';

    -- delete the quenches (should be rare)
    DELETE t
    FROM 
        [$tie.capsule].[$tie.name] t
    JOIN 
        @restated d
    ON 
        d.$tie.changingColumnName = t.$tie.changingColumnName
    AND
~*/  
            while(role = tie.nextRole()) {
    /*~
        d.$role.columnName = t.$role.columnName
    $(tie.hasMoreRoles())? AND
    ~*/
            }
        }
/*~
    INSERT INTO [$tie.capsule].[$tie.name] (
        $(schema.METADATA)? $tie.metadataColumnName,    
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
        $(schema.METADATA)? $tie.metadataColumnName,
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
END
GO
~*/
    } // enf of historized tie
    else if (!tie.isHistorized() && tie.isIdempotent()) {
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

    INSERT INTO [$tie.capsule].[$tie.name] (
        $(schema.METADATA)? $tie.metadataColumnName,    
~*/
        while(role = tie.nextRole()) {
    /*~
        $role.columnName$(tie.hasMoreRoles())?,
    ~*/
        }
    /*~
    )
    SELECT
        $(schema.METADATA)? $tie.metadataColumnName,
    ~*/
        while(role = tie.nextRole()) {
    /*~
        $role.columnName$(tie.hasMoreRoles())?,
    ~*/
        }
    /*~
    FROM
        inserted i
    WHERE NOT EXISTS (
        SELECT 
            42
        FROM
            [$tie.capsule].[$tie.name] x
        WHERE 
~*/
        while(role = tie.nextRole()) {
/*~
            x.$role.columnName = i.$role.columnName
        $(tie.hasMoreRoles())? AND
~*/
        }
/*~
    );
END
GO
~*/       
    }
// Here comes the trigger on the latest view, using the trigger above
    var comma = '';
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
        $role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
    )
    SELECT
        $(schema.METADATA)? i.$tie.metadataColumnName,
        $(tie.isHistorized())? i.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
            comma = tie.hasMoreRoles() ? ',' : '';
/*~
        $(role.knot)? ISNULL(i.$role.columnName, [$role.name].$role.knot.identityColumnName)${comma}$ : i.$role.columnName${comma}$
~*/
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
/*~;
END
GO
~*/
    if(tie.hasMoreValues() || tie.isDeletable()) {
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
        if(tie.hasMoreValues()) {
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
    IF(UPDATE($role.columnName))
        RAISERROR('The identity column $role.columnName is not updatable.', 16, 1);
~*/
                }
            }
            if(tie.isHistorized()) {
/*~
    INSERT INTO [$tie.capsule].[$tie.name] (
        $(schema.METADATA)? $tie.metadataColumnName,
        $(tie.isHistorized())? $tie.changingColumnName,
~*/
                while (role = tie.nextRole()) {
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
                }
/*~
    )
    SELECT
        $(schema.METADATA)? i.$tie.metadataColumnName,
        $(tie.isHistorized())? cast(CASE WHEN UPDATE($tie.changingColumnName) THEN i.$tie.changingColumnName ELSE @now END as $tie.timeRange),
~*/
                while (role = tie.nextRole()) {
                    comma = tie.hasMoreRoles() ? ',' : '';
/*~
        $(role.knot)? CASE WHEN UPDATE($role.knotValueColumnName) THEN [$role.name].$role.knot.identityColumnName ELSE i.$role.columnName END${comma}$ : i.$role.columnName${comma}$
~*/
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
/*~;~*/
            }
        }
        if(tie.isDeletable() && tie.hasMoreIdentifiers() && tie.hasMoreValues()) {
            var timeType = tie.isHistorized() ? tie.timeRange : schema.metadata.chronon;
/*~        
    SELECT
        $(tie.isHistorized())? cast(CASE WHEN UPDATE($tie.changingColumnName) THEN i.$tie.changingColumnName ELSE @now END as $tie.timeRange) as $tie.deletionTimeColumnName,
~*/
            while(role = tie.nextIdentifier()) {
/*~
        i.$role.columnName$(tie.hasMoreIdentifiers())?,
~*/
            }
/*~        
    INTO
        #$tie.name
    FROM
        inserted i 
    WHERE
~*/
            while(role = tie.nextValue()) {
/*~
        i.$role.columnName is null
    AND
~*/
            }
/*~

        i.$tie.deletableColumnName = 1

    IF(@@ROWCOUNT > 0)
    BEGIN
        IF OBJECT_ID('[$tie.capsule].[$tie.deletionName]') is null
        SELECT TOP 0 
            * ,
            CAST(null as $timeType) as $tie.deletionTimeColumnName
        INTO 
            [$tie.capsule].[$tie.deletionName]
        FROM 
            [$tie.capsule].[$tie.name];

        DELETE tie
        OUTPUT 
            deleted.*,
            $(tie.isHistorized())? ISNULL(d.$tie.deletionTimeColumnName, @now) : @now            
        INTO
            [$tie.capsule].[$tie.deletionName]
        FROM
            [$tie.capsule].[$tie.name] tie
        JOIN
            #$tie.name d
        ON
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
            d.$role.columnName = tie.$role.columnName
        $(tie.hasMoreIdentifiers())? AND
~*/
                }
            }
/*~                    
    END
~*/
        } // end of deletable
/*~        
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
    DELETE tie
    FROM
        [$tie.capsule].[$tie.name] tie
    JOIN
        deleted d
    ON
        $(tie.timeRange)? d.$tie.changingColumnName = tie.$tie.changingColumnName
    $(tie.timeRange)? AND
~*/
   if(tie.hasMoreIdentifiers()) {
        while(role = tie.nextIdentifier()) {
/*~
        d.$role.columnName = tie.$role.columnName$(!tie.hasMoreIdentifiers())? ;
    $(tie.hasMoreIdentifiers())? AND
~*/
        }
    }
    else {
/*~
       (
~*/
        while(role = tie.nextValue()) {
/*~
            d.$role.columnName = tie.$role.columnName
        $(tie.hasMoreValues())? AND
~*/
        }
/*~
       );
~*/
    }
/*~
END
GO
~*/
}
}