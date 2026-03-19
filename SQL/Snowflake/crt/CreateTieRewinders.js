/*~
-- TIE REWINDERS AND FORWARDERS ---------------------------------------------------------------------------------------
--
-- These table valued functions rewind a tie posit table to the given
-- point in changing time, or a tie annex table to the given point
-- in positing time. It does not pick a temporal perspective and
-- instead shows all rows that have been in effect before that point
-- in time. The forwarder is the opposite of the rewinder, such that 
-- their union corresponds to all rows in the posit table.
--
-- @positor             the view of which positor to adopt (defaults to 0)
-- @changingTimepoint   the point in changing time to rewind to (defaults to End of Time, no rewind)
-- @positingTimepoint   the point in positing time to rewind to (defaults to End of Time, no rewind)
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
    if(tie.isHistorized()) {
/*~
-- Tie posit rewinder -------------------------------------------------------------------------------------------------
-- r$tie.positName rewinding over changing time function
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.r$tie.positName (
    changingTimepoint $tie.timeRange
)
RETURNS TABLE (
    $tie.identityColumnName $tie.identity,
    SELECT
        $tie.identityColumnName,
~*/
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity,
/*~
        $role.columnName,
~*/
    $tie.changingColumnName $tie.timeRange
)
AS
$$
SELECT
    $tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
    $role.columnName,
~*/
        }
/*~
    $tie.changingColumnName
FROM
    ${tie.capsule}$.$tie.positName
WHERE
    $tie.changingColumnName <= changingTimepoint
$$
;

END
GO
-- Tie posit forwarder ------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.f$tie.positName (
    changingTimepoint $tie.timeRange
)
RETURNS TABLE (
    $tie.identityColumnName $tie.identity,
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity,
~*/
        while (role = tie.nextRole()) {
/*~
    $tie.changingColumnName $tie.timeRange
)
AS
$$
SELECT
    $tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
    $role.columnName,
~*/
        }
/*~
    $tie.changingColumnName
FROM
    ${tie.capsule}$.$tie.positName
WHERE
    $tie.changingColumnName > changingTimepoint
$$
;
        $tie.changingColumnName > @changingTimepoint;
    ');
END
GO
~*/
    }
CREATE OR REPLACE FUNCTION ${tie.capsule}$.r$tie.annexName (
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.identityColumnName $tie.identity,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
)
AS
$$
    CREATE FUNCTION [$tie.capsule].[r$tie.annexName] (
        @positingTimepoint $schema.metadata.positingRange = '$schema.EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT
        $(schema.METADATA)? $tie.metadataColumnName,
        $tie.assertionColumnName,
        $tie.reliableColumnName
        $tie.positingColumnName,
        ${tie.capsule}$.$tie.annexName
        $tie.reliabilityColumnName,
        $tie.positingColumnName <= positingTimepoint
$$
;

        $tie.positingColumnName <= @positingTimepoint;
    ');
END
CREATE OR REPLACE FUNCTION ${tie.capsule}$.r$tie.name (
    positor $schema.metadata.positorRange,
    $(tie.isHistorized())? changingTimepoint $tie.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.identityColumnName $tie.identity,
        $(tie.isHistorized())? @changingTimepoint $tie.timeRange = '$schema.EOT',
        @positingTimepoint $schema.metadata.positingRange = '$schema.EOT'
    )
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity,
    SELECT
        $(schema.METADATA)? a.$tie.metadataColumnName,
        p.$tie.identityColumnName,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
)
AS
$$
SELECT
    $(schema.METADATA)? a.$tie.metadataColumnName,
    p.$tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
    p.$role.columnName,
~*/
        }
/*~
    $(tie.isHistorized())? p.$tie.changingColumnName,
    a.$tie.positingColumnName,
    a.$tie.positorColumnName,
    a.$tie.reliabilityColumnName,
    a.$tie.assertionColumnName,
    a.$tie.reliableColumnName
FROM
    $(tie.isHistorized())? TABLE(${tie.capsule}$.r$tie.positName(changingTimepoint)) p : ${tie.capsule}$.$tie.positName p
JOIN
    TABLE(${tie.capsule}$.r$tie.annexName(positingTimepoint)) a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
AND
    a.$tie.positorColumnName = positor
QUALIFY
    row_number() OVER (
        PARTITION BY p.$tie.identityColumnName
        ORDER BY a.$tie.positingColumnName DESC
    ) = 1
$$
;

                sub.$tie.positorColumnName = @positor
            ORDER BY
                sub.$tie.positingColumnName DESC
CREATE OR REPLACE FUNCTION ${tie.capsule}$.f$tie.name (
    positor $schema.metadata.positorRange,
    $(tie.isHistorized())? changingTimepoint $tie.timeRange,
    positingTimepoint $schema.metadata.positingRange
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $tie.identityColumnName $tie.identity,
    EXEC('
    CREATE FUNCTION [$tie.capsule].[f$tie.name] (
        @positor $schema.metadata.positorRange = 0,
    $role.columnName $(role.entity)? $role.entity.identity : $role.knot.identity,
        @positingTimepoint $schema.metadata.positingRange = '$schema.EOT'
    )
    RETURNS TABLE WITH SCHEMABINDING AS RETURN
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
    $tie.positingColumnName $schema.metadata.positingRange,
    $tie.positorColumnName $schema.metadata.positorRange,
    $tie.reliabilityColumnName $schema.metadata.reliabilityRange,
    $tie.assertionColumnName string,
    $tie.reliableColumnName int
)
AS
$$
SELECT
    $(schema.METADATA)? a.$tie.metadataColumnName,
    p.$tie.identityColumnName,
~*/
        while (role = tie.nextRole()) {
/*~
    p.$role.columnName,
~*/
        }
/*~
    $(tie.isHistorized())? p.$tie.changingColumnName,
    a.$tie.positingColumnName,
    a.$tie.positorColumnName,
    a.$tie.reliabilityColumnName,
    a.$tie.assertionColumnName,
    a.$tie.reliableColumnName
FROM
    $(tie.isHistorized())? TABLE(${tie.capsule}$.f$tie.positName(changingTimepoint)) p : ${tie.capsule}$.$tie.positName p
JOIN
    TABLE(${tie.capsule}$.r$tie.annexName(positingTimepoint)) a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
AND
    a.$tie.positorColumnName = positor
QUALIFY
    row_number() OVER (
        PARTITION BY p.$tie.identityColumnName
        ORDER BY a.$tie.positingColumnName DESC
    ) = 1
$$
;
            WHERE
                sub.$tie.identityColumnName = p.$tie.identityColumnName
            AND
                sub.$tie.positorColumnName = @positor
            ORDER BY
                sub.$tie.positingColumnName DESC
        )
    ');
END
GO
~*/
}