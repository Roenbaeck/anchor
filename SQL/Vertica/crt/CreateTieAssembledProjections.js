/*~
-- TIE ASSEMBLED PROJECTIONS ------------------------------------------------------------------------------------------
--
-- The assembled projecton of a tie combines the posit and annex table of the tie.
-- It can be used to maintain entity integrity through a primary key, which cannot be
-- defined elsewhere.
--
~*/
var tie;
while (tie = schema.nextTie()) {
    if(schema.METADATA)
        tie.metadataDefinition = tie.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null,';
/*~
-- Tie assembled projection -------------------------------------------------------------------------------------------
-- $tie.name assembled projection of the posit and annex tables,
-- pk$tie.name optional temporal consistency constraint
-----------------------------------------------------------------------------------------------------------------------
CREATE PROJECTION IF NOT EXISTS ${tie.capsule}$.$tie.name
AS
SELECT
    $(schema.METADATA)? a.$tie.metadataColumnName,
    p.$tie.identityColumnName,
~*/
    var role;
    while (role = tie.nextRole()) {
/*~
    p.$role.columnName,
~*/
    }
/*~
    $(tie.timeRange)? p.$tie.changingColumnName,
    a.$tie.positingColumnName,
    a.$tie.positorColumnName,
    a.$tie.reliabilityColumnName,
    a.$tie.reliableColumnName
FROM
    [$tie.capsule].[$tie.positName] p
JOIN
    [$tie.capsule].[$tie.annexName] a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
ORDER BY
~*/
    var r;
    for(r = 0; role = anchorRoles[r]; r++) {
/*~
    $role.columnName$(r != anchorRoles.length - 1)?,
~*/
    }
/*~    
SEGMENTED BY MODULARHASH(${anchorRoles[0].columnName}$) ALL NODES
PARTITION BY(a.$tie.positorColumnName);    
~*/
    var segmentationRole, otherRoles;
    for(var i = 1; segmentationRole = anchorRoles[i]; i++) {
        otherRoles = [];
        for(r = 0; role = anchorRoles[r]; r++) {
            if(role != segmentationRole) otherRoles.push(role);
        }
/*~
CREATE PROJECTION IF NOT EXISTS ${tie.capsule}$.$tie.name
AS
SELECT
    $(schema.METADATA)? a.$tie.metadataColumnName,
    p.$tie.identityColumnName,
~*/
    var role;
    while (role = tie.nextRole()) {
/*~
    p.$role.columnName,
~*/
    }
/*~
    $(tie.timeRange)? p.$tie.changingColumnName,
    a.$tie.positingColumnName,
    a.$tie.positorColumnName,
    a.$tie.reliabilityColumnName,
    a.$tie.reliableColumnName
FROM
    [$tie.capsule].[$tie.positName] p
JOIN
    [$tie.capsule].[$tie.annexName] a
ON
    a.$tie.identityColumnName = p.$tie.identityColumnName
ORDER BY
~*/
    var r;
    for(r = 0; role = anchorRoles[r]; r++) {
/*~
    $role.columnName$(r != anchorRoles.length - 1)?,
~*/
    }
/*~    
SEGMENTED BY MODULARHASH(${segmentationRole.columnName}$) ALL NODES
PARTITION BY(a.$tie.positorColumnName);    
~*/
    }
}