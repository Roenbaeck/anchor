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
CREATE OR REPLACE TRIGGER it$tie.name 
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it$tie.name instead of INSERT trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
INSTEAD OF INSERT
ON l$tie.name
FOR EACH ROW
DECLARE
    x INTEGER;
    l_now   date := sysdate;
BEGIN

~*/
    if(tie.isHistorized()){/*~ -- HISTORIZED ~*/} else{/*~ -- NOT HISTORIZED ~*/}
    if(tie.isKnotted()){/*~ KNOTTED ~*/} else{/*~ NOT KNOTTED ~*/}
/*~
       $tie.valueColumnName  $tie.knotValueColumnName
 
    INSERT INTO $tie.name (
~*/
        while(role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
        }
/*~
        $(tie.isHistorized())? ${tie.changingColumnName.substr(0,30)}$,
        $(schema.METADATA)? ${tie.metadataColumnName.substr(0,30)}$
    ) VALUES (
~*/
        while(role = tie.nextRole()) { //loopa TIEs kolumner
            if(role.knot) { // Om kolumn är KNOT
                knot = role.knot;
/*~
        (select a.$knot.identityColumnName from $knot.name a where a.$knot.valueColumnName = :NEW.$role.knotValueColumnName), -- Denna kolumn har också ett konstraint till en KNOT och måste därför särbehandlas
~*/
            } else {
/*~
        ${String.fromCharCode(58) + 'NEW.' + role.columnName}$,
~*/
            }        
        }
/*~
        $(tie.isHistorized())? ${'NVL(' + String.fromCharCode(58) + 'NEW.' + tie.changingColumnName.substr(0,30) + ',l_now)'}$,
        $(schema.METADATA)? ${String.fromCharCode(58) + 'NEW.' + tie.metadataColumnName.substr(0,30)}$
    );
END it$tie.name;
/            

~*/
    if(tie.isHistorized() && tie.hasMoreValues()) { 
/*~
CREATE OR REPLACE TRIGGER ut$tie.name 
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut$tie.name instead of UPDATE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
INSTEAD OF UPDATE
ON l$tie.name
FOR EACH ROW
DECLARE
    x INTEGER;
    l_now   date := sysdate;
    -- är kolumnen förändrad, OBS tar hänsyn till NULL
    function is_changed ( in_new varchar2, in_old varchar2) return boolean is
    begin
        -- Denna if är något bakvänt skriven för att ta hand om fallen där NEW eller OLD är NULL. 
        -- Svaret på detta är varken true eller false vilket gör att även dessa hamnar i else
        if (in_old = in_new) OR (in_old is null and in_new is null) then 
            -- FALSE
            return false;
        else
            -- TRUE
            return true;
        end if;
    end is_changed;
BEGIN

~*/
    if(tie.isHistorized()){/*~ -- HISTORIZED ~*/} else{/*~ -- NOT HISTORIZED ~*/}
    if(tie.isKnotted()){/*~ KNOTTED ~*/} else{/*~ NOT KNOTTED ~*/}
        while(role = tie.nextRole()) {
            if(!role.knot) { // Om kolumn INTE är KNOT
/*~
    -- Relationskolumner får ej uppdateras
    if is_changed(:NEW.$role.columnName, :OLD.$role.columnName) then 
        raise_application_error(-20001, 'Relationskolumnen $tie.name\.$role.columnName får ej uppdateras'); 
    end if;
~*/
            }
        }
/*~
    INSERT INTO $tie.name (
~*/
        while(role = tie.nextRole()) {
/*~
        $role.columnName,
~*/
        }
/*~
        $(tie.isHistorized())? ${tie.changingColumnName.substr(0,30)}$,
        $(schema.METADATA)? ${tie.metadataColumnName.substr(0,30)}$
    ) VALUES (
~*/
        while(role = tie.nextRole()) { //loopa TIEs kolumner
            if(role.knot) { // Om kolumn är KNOT
                knot = role.knot;
/*~
        (select a.$knot.identityColumnName from $knot.name a where a.$knot.valueColumnName = :NEW.$role.knotValueColumnName), -- Denna kolumn har också ett konstraint till en KNOT och måste därför särbehandlas
~*/
            } else {
/*~
        ${String.fromCharCode(58) + 'NEW.' + role.columnName}$,
~*/
            }        
        }
/*~
        $(tie.isHistorized())? ${'NVL(' + String.fromCharCode(58) + 'NEW.' + tie.changingColumnName.substr(0,30) + ',l_now)'}$,
        $(schema.METADATA)? ${String.fromCharCode(58) + 'NEW.' + tie.metadataColumnName.substr(0,30)}$
    );
END ut$tie.name;
/            

~*/
    }
/*~
CREATE OR REPLACE TRIGGER dt$tie.name 
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt$tie.name instead of DELETE trigger on l$tie.name
-----------------------------------------------------------------------------------------------------------------------
INSTEAD OF DELETE
ON l$tie.name
FOR EACH ROW
DECLARE
    x INTEGER;
    l_now   date := sysdate;
BEGIN
    DELETE $tie.name WHERE 1=1 
    $(tie.timeRange)? ${'AND ' + tie.changingColumnName.substr(0,30) + ' = ' + String.fromCharCode(58) + 'NEW.' + tie.changingColumnName.substr(0,30)}$
~*/
   if(tie.hasMoreIdentifiers()) {
        while(role = tie.nextIdentifier()) {
/*~
    AND ${role.columnName.substr(0,30)}$ = :NEW.${role.columnName.substr(0,30)}$
    $(!tie.hasMoreIdentifiers())? ;
~*/
        }
    }
    else {
/*~
    AND (
~*/
        while(role = tie.nextValue()) {
/*~
            $role.columnName = :NEW.$role.columnName
        $(tie.hasMoreValues())? OR
~*/
        }
/*~
    );
~*/
    }
/*~
END dt$tie.name;
/
~*/
}
