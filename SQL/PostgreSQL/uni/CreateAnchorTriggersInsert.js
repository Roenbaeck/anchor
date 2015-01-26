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
var anchor, knot, attribute, equivalent;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~
-- BEFORE INSERT trigger --------------------------------------------------------------------------------------------------------
--DROP TRIGGER IF EXISTS tcsl$anchor.name ON l$anchor.name;

CREATE OR REPLACE FUNCTION tcsl$anchor.name() RETURNS trigger AS '
    BEGIN
        CREATE TEMPORARY TABLE IF NOT EXISTS _tmp_$anchor.mnemonic (
            Row bigserial not null primary key,
            $anchor.identityColumnName $anchor.identity not null
        ) ON COMMIT DROP;

        CREATE TEMPORARY TABLE IF NOT EXISTS _tmpi_$anchor.mnemonic (
            $anchor.identityColumnName $anchor.identity not null,
            $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType not null,
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(schema.IMPROVED)? $attribute.anchorReferenceName $anchor.identity null,
            $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType null,
            $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange null,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange null,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
            $attribute.knotValueColumnName $knot.dataRange null,
            $(knot.hasChecksum())? $attribute.knotChecksumColumnName varbinary(16) null,
            $(knot.isEquivalent())? $equivalent $schema.metadata.equivalentRange null,
            $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType null,
            $attribute.valueColumnName $knot.identity null$(anchor.hasMoreAttributes())?,
~*/
            } else {
/*~
            $attribute.valueColumnName $attribute.dataRange null$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
        ) ON COMMIT DROP;
        
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcsl$anchor.name
BEFORE INSERT ON l$anchor.name
FOR EACH STATEMENT
EXECUTE PROCEDURE tcsl$anchor.name();
~*/    	


/*~
-- INSTEAD OF INSERT trigger ----------------------------------------------------------------------------------------------------
--DROP TRIGGER IF EXISTS tcsil$anchor.name ON l$anchor.name;

CREATE OR REPLACE FUNCTION tcsil$anchor.name() RETURNS trigger AS '
    BEGIN
	    INSERT INTO $anchor.name (
	        $(schema.METADATA)? $anchor.metadataColumnName : $anchor.dummyColumnName
	    )
	    OUTPUT
	        NEW.$anchor.identityColumnName
	    INTO
	        _tmp_$anchor.mnemonic
	    SELECT
	        $(schema.METADATA)? NEW.$anchor.metadataColumnName : null
	    FROM
	        inserted
	    WHERE
	        inserted.$anchor.identityColumnName is null;
    
    
	    INSERT INTO _tmpi_$anchor.mnemonic
	    SELECT
	        ISNULL(NEW.$anchor.identityColumnName, a.$anchor.identityColumnName),
	        $(schema.METADATA)? NEW.$anchor.metadataColumnName,
	 ~*/
	        while (attribute = anchor.nextAttribute()) {
	/*~
	        $(schema.IMPROVED)? ISNULL(ISNULL(NEW.$attribute.anchorReferenceName, NEW.$anchor.identityColumnName), a.$anchor.identityColumnName),
	        $(schema.METADATA)? ISNULL(NEW.$attribute.metadataColumnName, NEW.$anchor.metadataColumnName),
	        $(attribute.timeRange)? ISNULL(NEW.$attribute.changingColumnName, @now),
	        $(attribute.isEquivalent())? ISNULL(NEW.$attribute.equivalentColumnName, 0),
	~*/
	            if(attribute.isKnotted()) {
	                knot = attribute.knot;
	                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
	/*~
	        NEW.$attribute.knotValueColumnName,
	        $(knot.hasChecksum())? ISNULL(NEW.$attribute.knotChecksumColumnName, ${schema.metadata.encapsulation}$.MD5(cast(NEW.$attribute.knotValueColumnName as varbinary(max)))),
	        $(knot.isEquivalent())? ISNULL(NEW.$equivalent, 0),
	        $(schema.METADATA)? ISNULL(NEW.$attribute.knotMetadataColumnName, NEW.$anchor.metadataColumnName),
	~*/
	            }
	/*~
	        NEW.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
	~*/
	        }
	/*~
	    FROM (
	        SELECT
	            $anchor.identityColumnName,
	            $(schema.METADATA)? $anchor.metadataColumnName,
	 ~*/
	        while (attribute = anchor.nextAttribute()) {
	/*~
	            $(schema.IMPROVED)? $attribute.anchorReferenceName,
	            $(schema.METADATA)? $attribute.metadataColumnName,
	            $(attribute.timeRange)? $attribute.changingColumnName,
	            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
	~*/
	            if(attribute.isKnotted()) {
	                knot = attribute.knot;
	                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
	/*~
	            $attribute.knotValueColumnName,
	            $(knot.hasChecksum())? $attribute.knotChecksumColumnName,
	            $(knot.isEquivalent())? $equivalent,
	            $(schema.METADATA)? $attribute.knotMetadataColumnName,
	~*/
	            }
	/*~
	            $attribute.valueColumnName,
	~*/
	        }
	/*~
	            ROW_NUMBER() OVER (PARTITION BY $anchor.identityColumnName ORDER BY $anchor.identityColumnName) AS Row
	        FROM
	            inserted
	    ) i
	    LEFT JOIN
	        _tmp_$anchor.mnemonic a
	    ON
	        a.Row = NEW.Row;
    
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcsil$anchor.name
INSTEAD OF INSERT ON l$anchor.name
FOR EACH ROW
EXECUTE PROCEDURE tcsil$anchor.name();
~*/
        
        
        
        
        
        
    	
/*~
BEGIN
    DECLARE @now $schema.metadata.chronon;
    SET @now = $schema.metadata.now;
        
    
~*/
        while (attribute = anchor.nextAttribute()) {
            knot = attribute.knot;
/*~
    INSERT INTO [$attribute.capsule].[$attribute.name] (
        $(schema.METADATA)? $attribute.metadataColumnName,
        $attribute.anchorReferenceName,
        $(attribute.timeRange)? $attribute.changingColumnName,
        $attribute.valueColumnName
    )
    SELECT
        $(schema.METADATA)? i.$attribute.metadataColumnName,
        i.$attribute.anchorReferenceName,
        $(attribute.timeRange)? i.$attribute.changingColumnName,
        $(attribute.isKnotted())? ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) : i.$attribute.valueColumnName
    FROM
        @inserted i
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    LEFT JOIN
        [$knot.capsule].[$knot.name] [k$knot.mnemonic]
    ON
        $(knot.hasChecksum())? [k$knot.mnemonic].$knot.checksumColumnName = i.$attribute.knotChecksumColumnName : [k$knot.mnemonic].$knot.valueColumnName = i.$attribute.knotValueColumnName
~*/
                if(knot.isEquivalent()) {
                    equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
    AND
        [k$knot.mnemonic].$knot.equivalentColumnName = i.$equivalent
~*/
                }
/*~
    WHERE
        ISNULL(i.$attribute.valueColumnName, [k$knot.mnemonic].$knot.identityColumnName) is not null;
~*/
            }
            else {
/*~
    WHERE
        i.$attribute.valueColumnName is not null;
~*/
            }
        }
/*~
END;
~*/
    }
}
