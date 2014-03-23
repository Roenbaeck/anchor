/*~
-- ANCHOR TRIGGERS ---------------------------------------------------------------------------------------------------
--
-- The following triggers on the latest view make it behave like a table.
-- There are three different 'instead of' triggers: insert, update, and delete.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor;
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
CREATE OR REPLACE TRIGGER it$anchor.name 
-- Insert trigger -----------------------------------------------------------------------------------------------------
-- it$anchor.name instead of INSERT trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
INSTEAD OF INSERT
ON l$anchor.name
FOR EACH ROW
DECLARE
    x INTEGER;
    l_now   date := sysdate;
BEGIN
    
    INSERT INTO $anchor.name (
        $anchor.identityColumnName,
        $(schema.METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName
    ) VALUES (
        :NEW.$anchor.identityColumnName,
        :NEW.$(schema.METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName
    );

~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isKnotted()) {
/*~
    if (:NEW.$attribute.knotValueColumnName is not null) then -- insert
~*/
            } else {
/*~
    if (:NEW.$attribute.valueColumnName is not null) then -- insert
~*/
            }
/*~
        INSERT INTO $attribute.name (
            $(schema.IMPROVED)? $attribute.anchorReferenceName, -- $anchor.identity null,
            $(attribute.timeRange)? $attribute.changingColumnName, -- $attribute.timeRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            -- $attribute.knotValueColumnName, -- $knot.dataRange null,   KNOT
            -- $(schema.METADATA)? $attribute.knotMetadataColumnName, -- $schema.metadata.metadataType null,   KNOT
            $attribute.valueColumnName, --  $knot.identity null$(anchor.hasMoreAttributes())?,   KNOT
~*/
            }
            else {
/*~
            $attribute.valueColumnName, --  $attribute.dataRange null$(anchor.hasMoreAttributes())?,   ELSE
~*/
            }
/*~
            $(schema.METADATA)? $attribute.metadataColumnName -- $schema.metadata.metadataType null,
        ) VALUES (
            $(schema.IMPROVED)? ${String.fromCharCode(58) + 'NEW.' + anchor.identityColumnName}$, -- $anchor.identity null,
            $(attribute.timeRange)? ${'nvl(' + String.fromCharCode(58) + 'NEW.' + attribute.changingColumnName + ', l_now)'}$, -- $attribute.timeRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            -- ${String.fromCharCode(58) + 'NEW.' + attribute.knotValueColumnName}$, -- $knot.dataRange null,   KNOT
            -- $(schema.METADATA)? ${'nvl(' + String.fromCharCode(58) + 'NEW.' + attribute.knotMetadataColumnName + ', ' + String.fromCharCode(58) + 'NEW.' + anchor.metadataColumnName + '),'}$ -- $schema.metadataType null,   KNOT
            ${'(select knot.' + knot.identityColumnName + ' from ' + knot.name + ' knot where knot.' + knot.valueColumnName + ' = :NEW.' + attribute.knotValueColumnName + ')'}$, -- $knot.identity null$(anchor.hasMoreAttributes())?,    -- KNOT insert om $attribute.knotValueColumnName på väg in i vyn finns i $knot.name
~*/
            }
            else {
/*~
            ${String.fromCharCode(58) + 'NEW.' + attribute.valueColumnName}$, --  $attribute.dataRange null$(anchor.hasMoreAttributes())?,   ELSE
~*/
            }
/*~
            $(schema.METADATA)? ${'nvl(' + String.fromCharCode(58) + 'NEW.' + attribute.metadataColumnName + ', ' + String.fromCharCode(58) + 'NEW.' + anchor.metadataColumnName + ')'}$ -- $schema.metadataType null,
        );
    end if;
~*/
        }
/*~
END it$anchor.name;
/            
~*/
    }
    if(anchor.hasMoreHistorizedAttributes()) {
/*~
CREATE OR REPLACE TRIGGER ut$anchor.name 
-- UPDATE trigger -----------------------------------------------------------------------------------------------------
-- ut$anchor.name instead of UPDATE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
INSTEAD OF UPDATE
ON l$anchor.name
FOR EACH ROW
DECLARE
    x INTEGER;
    l_now date := sysdate;
    l_changedate date := sysdate;
    l_metadata  integer;
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
    -- ger changedate, OBS tar hänsyn till NULL
    function get_changedate ( in_new date, in_old date) return date is
    begin
        -- Denna if är något bakvänt skriven för att ta hand om fallen där NEW eller OLD är NULL. 
        -- Svaret på detta är varken true eller false vilket gör att även dessa hamnar i else
        if (in_old = in_new) OR (in_old is null and in_new is null) OR (in_new is null) then 
            -- FALSE
            return l_now;
        else
            -- TRUE
            return in_new;
        end if;
    end get_changedate;
    -- ger metadata, OBS tar hänsyn till NULL
    function get_metadata ( in_new integer, in_old integer) return integer is
    begin
        -- Denna if är något bakvänt skriven för att ta hand om fallen där NEW eller OLD är NULL. 
        -- Svaret på detta är varken true eller false vilket gör att även dessa hamnar i else
        if (in_old = in_new) OR (in_old is null and in_new is null) then 
            -- FALSE
            return 0;
        else
            -- TRUE
            return in_new;
        end if;
    end get_metadata;
BEGIN
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isKnotted()) {
/*~
    if is_changed(:NEW.$attribute.knotValueColumnName, :OLD.$attribute.knotValueColumnName) then -- insert
~*/
            } else {
/*~
    if is_changed(:NEW.$attribute.valueColumnName, :OLD.$attribute.valueColumnName) then -- insert
~*/
            }
/*~
        $(attribute.timeRange)? ${'l_changedate ' + String.fromCharCode(58) + '= get_changedate(' + String.fromCharCode(58) + 'NEW.' + attribute.changingColumnName + ', ' + String.fromCharCode(58) + 'OLD.' + attribute.changingColumnName + ');'}$
        $(schema.METADATA)? ${'l_metadata ' + String.fromCharCode(58) + '= get_metadata(' + String.fromCharCode(58) + 'NEW.' + attribute.metadataColumnName + ', ' + String.fromCharCode(58) + 'OLD.' + attribute.metadataColumnName + ');'}$
        INSERT INTO $attribute.name (
            $(schema.IMPROVED)? $attribute.anchorReferenceName, -- $anchor.identity null,
            $(attribute.timeRange)? $attribute.changingColumnName, -- $attribute.timeRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            -- $attribute.knotValueColumnName, -- $knot.dataRange null,   KNOT
            -- $(schema.METADATA)? $attribute.knotMetadataColumnName, -- $schema.metadata.metadataType null,   KNOT
            $attribute.valueColumnName, --  $knot.identity null$(anchor.hasMoreAttributes())?,   KNOT
~*/
            }
            else {
/*~
            $attribute.valueColumnName, --  $attribute.dataRange null$(anchor.hasMoreAttributes())?,   ELSE
~*/
            }
/*~
            $(schema.METADATA)? $attribute.metadataColumnName -- $schema.metadata.metadataType null,
        ) VALUES (
            $(schema.IMPROVED)? ${String.fromCharCode(58) + 'NEW.' + anchor.identityColumnName}$, -- $anchor.identity null,
            $(attribute.timeRange)? l_changedate,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
            -- ${String.fromCharCode(58) + 'NEW.' + attribute.knotValueColumnName}$, -- $knot.dataRange null,   KNOT
            -- $(schema.METADATA)? ${'nvl(' + String.fromCharCode(58) + 'NEW.' + attribute.knotMetadataColumnName + ', ' + String.fromCharCode(58) + 'NEW.' + anchor.metadataColumnName + '),'}$ -- $schema.metadataType null,   KNOT
            ${'(select knot.' + knot.identityColumnName + ' from ' + knot.name + ' knot where knot.' + knot.valueColumnName + ' = :NEW.' + attribute.knotValueColumnName + ')'}$, -- $knot.identity null$(anchor.hasMoreAttributes())?,    -- KNOT insert om $attribute.knotValueColumnName på väg in i vyn finns i $knot.name
~*/
            }
            else {
/*~
            ${String.fromCharCode(58) + 'NEW.' + attribute.valueColumnName}$, --  $attribute.dataRange null$(anchor.hasMoreAttributes())?,   ELSE
~*/
            }
/*~
            $(schema.METADATA)? l_metadata -- $schema.metadata.metadataType null,
        );
    end if;
~*/
        }
/*~
END ut$anchor.name;
/
CREATE OR REPLACE TRIGGER dt$anchor.name
-- DELETE trigger -----------------------------------------------------------------------------------------------------
-- dt$anchor.name instead of DELETE trigger on l$anchor.name
-----------------------------------------------------------------------------------------------------------------------
INSTEAD OF DELETE
ON l$anchor.name
FOR EACH ROW
DECLARE    l_now date := sysdate;
BEGIN
~*/
        var attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    -- ta bort attribut för givet ankare $(attribute.timeRange)? och tid
    delete $attribute.name where 1=1 
    $(schema.IMPROVED)? ${'and ' + attribute.anchorReferenceName + ' = ' + String.fromCharCode(58) + 'OLD.' + anchor.identityColumnName}$
    $(attribute.timeRange)? ${'and ' + attribute.changingColumnName + ' = ' + String.fromCharCode(58) + 'OLD.' + attribute.changingColumnName}$
    ;
~*/
        }
/*~
    -- ta bort ankare om det inte längre har några attribut
    delete $anchor.name where $anchor.identityColumnName = $(schema.IMPROVED)? ${String.fromCharCode(58) + 'OLD.' + anchor.identityColumnName}$
~*/
        var attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
   
    and 0 = (select count(*) from $attribute.name where $(schema.IMPROVED)? ${attribute.anchorReferenceName + ' = ' + String.fromCharCode(58) + 'OLD.' + anchor.identityColumnName + ')'}$
~*/
        }
/*~
    ;
END dt$anchor.name;
/            
~*/
    }
}
