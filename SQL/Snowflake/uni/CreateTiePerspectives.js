/*~
-- TIE TEMPORAL PERSPECTIVES ------------------------------------------------------------------------------------------
--
-- Snowflake-native tie perspectives: latest (l), point-in-time (p), now (n), difference (d),
-- and equivalence variants (el, ep, en, ed).
--
~*/
var tie, role, knot;
while (tie = schema.nextTie()) {
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${tie.capsule}$.l$tie.name AS
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
        }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
FROM
    ${tie.capsule}$.$tie.name tie
~*/
    while (role = tie.nextKnotRole()) {
        knot = role.knot;
        if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(0)) $role.name
~*/
        }
        else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
        }
/*~
ON
    ${role.name}$.$knot.identityColumnName = tie.$role.columnName
~*/
    }
    if(tie.isHistorized()) {
/*~
WHERE
    tie.$tie.changingColumnName = (
        SELECT
            max(sub.$tie.changingColumnName)
        FROM
            ${tie.capsule}$.$tie.name sub
        WHERE
~*/
        if(tie.hasMoreIdentifiers()) {
            while (role = tie.nextIdentifier()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreIdentifiers())? AND
~*/
            }
        }
        else {
            while (role = tie.nextAnchorRole()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreAnchorRoles())? OR
~*/
            }
        }
/*~
   )
~*/
    }
/*~
;

-- Point-in-time perspective ------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.p$tie.name (
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
~*/
    while (role = tie.nextRole()) {
        var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
        if(role.knot) {
            knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
        }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
    }
/*~
)
AS
$$$$
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
        }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
FROM
    ${tie.capsule}$.$tie.name tie
~*/
    while (role = tie.nextKnotRole()) {
        knot = role.knot;
        if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(0)) $role.name
~*/
        }
        else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
        }
/*~
ON
    ${role.name}$.$knot.identityColumnName = tie.$role.columnName
~*/
    }
    if(tie.isHistorized()) {
/*~
WHERE
    tie.$tie.changingColumnName = (
        SELECT
            max(sub.$tie.changingColumnName)
        FROM
            ${tie.capsule}$.$tie.name sub
        WHERE
~*/
        if(tie.hasMoreIdentifiers()) {
            while (role = tie.nextIdentifier()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        AND
~*/
            }
        }
        else {
/*~
        (
~*/
            while (role = tie.nextAnchorRole()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreAnchorRoles())? OR
~*/
            }
/*~
        )
        AND
~*/
        }
/*~
            sub.$tie.changingColumnName <= changingTimepoint
   )
~*/
    }
/*~
$$$$
;

-- Now perspective ----------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW ${tie.capsule}$.n$tie.name AS
SELECT
    *
FROM
    TABLE(${tie.capsule}$.p$tie.name($schema.metadata.now::$schema.metadata.chronon))
;
~*/
    if(tie.isHistorized()) {
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.d$tie.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
~*/
        while (role = tie.nextRole()) {
            var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
        }
/*~
)
AS
$$$$
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    ${tie.capsule}$.$tie.name tie
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
            if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(0)) $role.name
~*/
            }
            else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
            }
/*~
ON
    ${role.name}$.$knot.identityColumnName = tie.$role.columnName
~*/
        }
/*~
WHERE
    tie.$tie.changingColumnName BETWEEN intervalStart AND intervalEnd
$$$$
;
~*/
    }

    if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.el$tie.name (
    equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
~*/
        while (role = tie.nextRole()) {
            var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
        }
/*~
)
AS
$$$$
SELECT
    *
FROM
    TABLE(${tie.capsule}$.ep$tie.name(equivalent, $schema.metadata.now::$schema.metadata.chronon))
$$$$
;

-- Point-in-time equivalence perspective ------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.ep$tie.name (
    equivalent $schema.metadata.equivalentRange,
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
~*/
        while (role = tie.nextRole()) {
            var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
        }
/*~
)
AS
$$$$
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
        while (role = tie.nextRole()) {
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
            }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
        }
/*~
FROM
    ${tie.capsule}$.$tie.name tie
~*/
        while (role = tie.nextKnotRole()) {
            knot = role.knot;
            if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(equivalent)) $role.name
~*/
            }
            else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
            }
/*~
ON
    ${role.name}$.$knot.identityColumnName = tie.$role.columnName
~*/
        }
        if(tie.isHistorized()) {
/*~
WHERE
    tie.$tie.changingColumnName = (
        SELECT
            max(sub.$tie.changingColumnName)
        FROM
            ${tie.capsule}$.$tie.name sub
        WHERE
~*/
            if(tie.hasMoreIdentifiers()) {
                while (role = tie.nextIdentifier()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        AND
~*/
                }
            }
            else {
/*~
        (
~*/
                while (role = tie.nextAnchorRole()) {
/*~
            sub.$role.columnName = tie.$role.columnName
        $(tie.hasMoreAnchorRoles())? OR
~*/
                }
/*~
        )
        AND
~*/
            }
/*~
            sub.$tie.changingColumnName <= changingTimepoint
   )
~*/
        }
/*~
$$$$
;

-- Now equivalence perspective ----------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.en$tie.name (
    equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
~*/
        while (role = tie.nextRole()) {
            var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
            if(role.knot) {
                knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
            }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
        }
/*~
)
AS
$$$$
SELECT
    *
FROM
    TABLE(${tie.capsule}$.ep$tie.name(equivalent, $schema.metadata.now::$schema.metadata.chronon))
$$$$
;
~*/
        if(tie.isHistorized()) {
/*~

-- Difference equivalence perspective ---------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ${tie.capsule}$.ed$tie.name (
    equivalent $schema.metadata.equivalentRange,
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon
)
RETURNS TABLE (
    $(schema.METADATA)? $tie.metadataColumnName $schema.metadata.metadataType,
    $(tie.isHistorized())? $tie.changingColumnName $tie.timeRange,
~*/
            while (role = tie.nextRole()) {
                var roleIdentity = role.entity ? role.entity.identity : role.knot.identity;
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? $role.knotChecksumColumnName numeric(19,0),
    $role.knotValueColumnName $knot.dataRange,
    $(knot.isEquivalent())? $role.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $(schema.METADATA)? $role.knotMetadataColumnName $schema.metadata.metadataType,
~*/
                }
/*~
    $role.columnName $roleIdentity$(tie.hasMoreRoles())?,
~*/
            }
/*~
)
AS
$$$$
SELECT
    $(schema.METADATA)? tie.$tie.metadataColumnName,
    $(tie.isHistorized())? tie.$tie.changingColumnName,
~*/
            while (role = tie.nextRole()) {
                if(role.knot) {
                    knot = role.knot;
/*~
    $(knot.hasChecksum())? ${role.name}$.$knot.checksumColumnName AS $role.knotChecksumColumnName,
    ${role.name}$.$knot.valueColumnName AS $role.knotValueColumnName,
    $(knot.isEquivalent())? ${role.name}$.$knot.equivalentColumnName AS $role.knotEquivalentColumnName,
    $(schema.METADATA)? ${role.name}$.$knot.metadataColumnName AS $role.knotMetadataColumnName,
~*/
                }
/*~
    tie.$role.columnName$(tie.hasMoreRoles())?,
~*/
            }
/*~
FROM
    ${tie.capsule}$.$tie.name tie
~*/
            while (role = tie.nextKnotRole()) {
                knot = role.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    TABLE(${knot.capsule}$.e$knot.name(equivalent)) $role.name
~*/
                }
                else {
/*~
LEFT JOIN
    ${knot.capsule}$.$knot.name $role.name
~*/
                }
/*~
ON
    ${role.name}$.$knot.identityColumnName = tie.$role.columnName
~*/
            }
/*~
WHERE
    tie.$tie.changingColumnName BETWEEN intervalStart AND intervalEnd
$$$$
;
~*/
        }
    }
}
