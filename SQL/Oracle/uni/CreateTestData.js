/*~
-- KNOT KNOT KNOT KNOT
-- KNOT KNOT KNOT KNOT
-- KNOT KNOT KNOT KNOT
-- KNOT KNOT KNOT KNOT
~*/
var knot, l_type;
while (knot = schema.nextKnot()) {
/*~
prompt Populate KNOT l$knot.name;
~*/
    if(schema.METADATA)
       knot.metadataDefinition = knot.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null';
       if (knot.dataRange.substr(0,1) == 'V'){l_type = knot.name}else{l_type = '0'}
/*~
INSERT INTO $knot.name (
    $knot.identityColumnName,
    $knot.valueColumnName,
    $knot.metadataColumnName
) VALUES (
    100, -- $knot.identityColumnName, -- $knot.identity not null
    '$l_type', -- $knot.valueColumnName, -- $knot.dataRange not null 
    0 -- $knot.metadataColumnName
);
~*/
}


/*~
-- ANCHOR ANCHOR ANCHOR ANCHOR
-- ANCHOR ANCHOR ANCHOR ANCHOR
-- ANCHOR ANCHOR ANCHOR ANCHOR
-- ANCHOR ANCHOR ANCHOR ANCHOR
~*/
var anchor, knot, attribute, iPrefix, i, endPoint
// Antal
i = 100
iPrefix = 0
while (anchor = schema.nextAnchor()) {
/*~
prompt Populate ANCHOR l$anchor.name;
~*/
//    if(anchor.hasMoreAttributes()) {
        iPrefix = iPrefix + 10000000
        endPoint = iPrefix + i
/*~
declare
    l_now   date := sysdate;
    l_count integer := 0;
begin
    for i in $iPrefix .. $endPoint loop 
        INSERT INTO l$anchor.name ( -- $iPrefix
            $anchor.identityColumnName,
            $(schema.METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName~*//*~ $(anchor.hasMoreAttributes())?,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(schema.IMPROVED)? $attribute.anchorReferenceName,     -- ATTRIBUTE
            $(schema.METADATA)? $attribute.metadataColumnName,     -- ATTRIBUTE
            $(attribute.timeRange)? $attribute.changingColumnName,     -- ATTRIBUTE
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            $attribute.knotValueColumnName,    -- KNOT
            $(schema.METADATA)? $attribute.knotMetadataColumnName,    -- KNOT
~*/
            }
/*~
            $attribute.valueColumnName$(anchor.hasMoreAttributes())?,~*/ /*~     -- ATTRIBUTE
~*/
        }
/*~
        ) VALUES ( -- $iPrefix
            i, -- $anchor.identityColumnName
            $(schema.METADATA)? 0~*//*~$(anchor.hasMoreAttributes())?,~*//*~ -- $anchor.metadataColumnName, : $anchor.dummyColumnName,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(schema.IMPROVED)? NULL, -- $attribute.anchorReferenceName,     -- ATTRIBUTE
            $(schema.METADATA)? NULL, -- $attribute.metadataColumnName,     -- ATTRIBUTE
            $(attribute.timeRange)? l_now, -- $attribute.changingColumnName,     -- ATTRIBUTE
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                var l_type
                if (knot.dataRange.substr(0,1) == 'V'){l_type = knot.name}else{l_type = '0'}
/*~
            '$l_type', -- $attribute.knotValueColumnName    -- KNOT
            $(schema.METADATA)? NULL, -- $attribute.knotMetadataColumnName    -- KNOT
~*/
            }
            var l_atype, l_precision
            if(attribute.dataRange){ 
                l_precision = attribute.dataRange.substr(attribute.dataRange.indexOf('(')+1)

                if (attribute.dataRange.substr(0,1) == 'V'){l_atype =  'substr(l_count || \'_' + attribute.valueColumnName + '\',1,' + l_precision}
                else if (attribute.dataRange.substr(0,1) == 'd'){l_atype = 'sysdate'}
                else if (attribute.dataRange.substr(0,1) == 'i'){l_atype = 'l_count'}
                else{l_atype = 'substr(l_count,1,' + l_precision}
            } else{
                l_atype = 'l_count'
            }
/*~
            $l_atype$(anchor.hasMoreAttributes())?, ~*/ /*~ -- $attribute.valueColumnName $attribute.dataRange l_precision = $l_precision
~*/
        }
/*~
        );
        l_count := l_count + 1;
    end loop;
end;
/
~*/
//    }
}

/*~
-- TIE TIE TIE TIE
-- TIE TIE TIE TIE
-- TIE TIE TIE TIE
-- TIE TIE TIE TIE
~*/
var tie, knot;
while (tie = schema.nextTie()) {
    if(schema.METADATA)
        tie.metadataDefinition = tie.metadataColumnName + ' ' + schema.metadata.metadataType + ' not null,';
/*~
prompt Populate TIE l$tie.name;
~*/
    if(tie.isHistorized() && tie.isKnotted()) {
/*~
-- Knotted historized tie table ---------------------------------------------------------------------------------------
~*/
    }
    else if(tie.isHistorized()) {
/*~
-- Historized tie table -----------------------------------------------------------------------------------------------
~*/
    }
    else if(tie.isKnotted()) {
/*~
-- Knotted static tie table -------------------------------------------------------------------------------------------
~*/
    }
    else {
/*~
-- Static tie table ---------------------------------------------------------------------------------------------------
~*/
    }
/*~
    insert into l$tie.name (
        $(schema.METADATA)? ${tie.metadataColumnName.substr(0,30)}$,
        $(tie.timeRange)? ${tie.changingColumnName.substr(0,30)}$,
~*/
    var role, knot;
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
        $role.knotValueColumnName,  -- KNOT
        $(schema.METADATA)? $role.knotMetadataColumnName,  -- KNOT
~*/
        }
/*~
        $role.columnName$(tie.hasMoreRoles())?,
~*/
    }
/*~
    ) SELECT 
        $(schema.METADATA)? '0' AS ${tie.metadataColumnName.substr(0,30)}$~*//*~$(tie.hasMoreRoles())?,
        $(tie.timeRange)? NULL AS ${tie.changingColumnName.substr(0,30)}$,
~*/
    var role, knot;
    while (role = tie.nextRole()) {
        if(role.knot) {
            knot = role.knot;
/*~
        $role.columnName\.$role.knot.name AS $role.knotValueColumnName,  -- KNOT
        $(schema.METADATA)? '0' AS $role.knotMetadataColumnName,  -- KNOT
~*/
        }
/*~
    $(role.entity)? $role.columnName\.$role.entity.identityColumnName: $role.columnName\.$role.knot.identityColumnName AS $role.columnName~*//*~$(tie.hasMoreRoles())?,
~*/
    }
    
/*~
    FROM    
~*/
    while (role = tie.nextRole()) {
/*~
    $(role.entity)? $role.entity.name $role.columnName: $role.knot.name $role.columnName~*//*~$(tie.hasMoreRoles())?,
~*/
    }
    var i = 0, l_currentIdentityColumn = '', l_previousIdentityColumn = ''
    while (role = tie.nextRole()) {
        l_currentIdentityColumn = (role.anchor)? role.columnName + '.' + role.anchor.identityColumnName : role.columnName + '.' + role.knot.identityColumnName
        if (i == 0){
/*~ 
    WHERE 1=1
~*/
        } else {
            if (!role.knot) {
/*~ 
    AND substr($l_previousIdentityColumn,4) = substr($l_currentIdentityColumn,4)
~*/
            }
        }
        l_previousIdentityColumn = (role.anchor)? role.columnName + '.' + role.anchor.identityColumnName : role.columnName + '.' + role.knot.identityColumnName
        i++
    }
/*~
    ;
~*/
}
/*~
COMMIT;
~*/
