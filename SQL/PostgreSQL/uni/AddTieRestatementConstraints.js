var tie, role, restatements = false;

while (tie = schema.nextHistorizedTie())
    if(tie.hasMoreValues()) {
        restatements = true;
    }

if(restatements) {
/*~
-- TIE RESTATEMENT CONSTRAINTS ----------------------------------------------------------------------------------------
--
-- Ties may be prevented from storing restatements.
-- A restatement is when the same (non-key) values occurs for two adjacent points
-- in changing time.
--
-- returns      1 for one or two equal surrounding values, 0 for different surrounding values
--
~*/
    while (tie = schema.nextHistorizedTie()) {
        // the tie needs to have at least one role outside of the identifier
        if(tie.hasMoreValues()) {
/*~
-- Restatement Finder Function and Constraint -------------------------------------------------------------------------
-- rf$tie.name restatement finder
--
~*/
            while(role = tie.nextRole()) {
/*~
-- $role.columnName $(role.isIdentifier())? primary key component : non-key value
~*/
            }
/*~
-- changed     the point in time from which this value shall represent a change
--
-- rc$tie.name restatement constraint (available only in ties that cannot have restatements)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $tie.capsule\.rf$tie.name (
~*/
            while(role = tie.nextRole()) {
/*~
    _$role.columnName $(role.anchor)? $role.anchor.identity, : $role.knot.identity,
~*/
            }
/*~
    changed $tie.timeRange
) RETURNS smallint AS '
    BEGIN RETURN (
        SELECT
            COUNT(*)
        FROM (
            (SELECT
~*/
            while(role = tie.nextValue()) {
/*~
                pre.$role.columnName$(tie.hasMoreValues())?,
~*/
            }
/*~
            FROM
                $tie.capsule\.$tie.name pre
            WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                pre.$role.columnName = _$role.columnName
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
                    pre.$role.columnName = _$role.columnName
                $(tie.hasMoreValues())? OR
~*/
                }
/*~
            )
            AND
~*/
            }
/*~
                pre.$tie.changingColumnName < changed
            ORDER BY
                pre.$tie.changingColumnName DESC
            LIMIT 1)
            UNION
            (SELECT
~*/
            while(role = tie.nextValue()) {
/*~
                fol.$role.columnName$(tie.hasMoreValues())?,
~*/
            }
/*~
            FROM
                $tie.capsule\.$tie.name fol
            WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while(role = tie.nextIdentifier()) {
/*~
                fol.$role.columnName = _$role.columnName
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
                    fol.$role.columnName = _$role.columnName
                $(tie.hasMoreValues())? OR
~*/
                }
/*~
            )
            AND
~*/
            }
/*~
                fol.$tie.changingColumnName > changed
            ORDER BY
                fol.$tie.changingColumnName ASC
            LIMIT 1)
        ) s
        WHERE
~*/
            while(role = tie.nextValue()) {
/*~
            s.$role.columnName = _$role.columnName
        $(tie.hasMoreValues())? AND
~*/
            }
/*~
    );
~*/
            if(!tie.isRestatable()) {
/*~
        ALTER TABLE $tie.capsule\.$tie.name
        ADD CONSTRAINT rc$tie.name CHECK (
            $tie.capsule\.rf$tie.name (
~*/
            while(role = tie.nextRole()) {
/*~
                _$role.columnName,
~*/
            }
/*~
                $tie.changingColumnName
            ) = 0
        );
~*/
            }
/*~
    END;
' LANGUAGE plpgsql;
~*/
        }
    }
}