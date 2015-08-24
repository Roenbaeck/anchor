var anchor, knot, attribute, equivalent;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) {
/*~


-- BEFORE UPDATE trigger --------------------------------------------------------------------------------------------------------
--DROP TRIGGER IF EXISTS utb_l$anchor.name ON $anchor.capsule\.l$anchor.name;
--DROP FUNCTION IF EXISTS $anchor.capsule\.utb_l$anchor.name();

CREATE OR REPLACE FUNCTION $anchor.capsule\.utb_l$anchor.name() RETURNS trigger AS '
    BEGIN
        -- create temporary table to keep inserted rows in
        CREATE TEMPORARY TABLE IF NOT EXISTS _tmp_ut_$anchor.name (
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
            $(knot.hasChecksum())? $attribute.knotChecksumColumnName $schema.metadata.checksumType null,
            $(knot.isEquivalent())? $equivalent $schema.metadata.equivalentRange null,
            $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType null,
            $attribute.valueColumnName $knot.identity null$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
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

CREATE TRIGGER utb_l$anchor.name
BEFORE UPDATE ON $anchor.capsule\.l$anchor.name
FOR EACH STATEMENT
EXECUTE PROCEDURE $anchor.capsule\.utb_l$anchor.name();


-- INSTEAD OF UPDATE trigger ----------------------------------------------------------------------------------------------------
--DROP TRIGGER IF EXISTS uti_l$anchor.name ON $anchor.capsule\.l$anchor.name;
--DROP FUNCTION IF EXISTS $anchor.capsule\.uti_l$anchor.name();

CREATE OR REPLACE FUNCTION $anchor.capsule\.uti_l$anchor.name() RETURNS trigger AS '
    BEGIN
        -- insert row into temporary table
    	INSERT INTO _tmp_ut_$anchor.name (
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
            $attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
            }
            else {
/*~
            $attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
            }
        }
/*~
    	) VALUES (
    	    NEW.$anchor.identityColumnName,
            $(schema.METADATA)? NEW.$anchor.metadataColumnName,
 ~*/
        while (attribute = anchor.nextAttribute()) {
/*~
            $(schema.IMPROVED)? COALESCE(NEW.$attribute.anchorReferenceName, NEW.$anchor.identityColumnName),
            $(schema.METADATA)? COALESCE(NEW.$attribute.metadataColumnName, NEW.$anchor.metadataColumnName),
            $(attribute.timeRange)? COALESCE(NEW.$attribute.changingColumnName, CAST($schema.metadata.now AS $attribute.timeRange)),
            $(attribute.isEquivalent())? COALESCE(NEW.$attribute.equivalentColumnName, 0),
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~
            NEW.$attribute.knotValueColumnName,
            $(knot.hasChecksum())? COALESCE(NEW.$attribute.knotChecksumColumnName, $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(CAST(NEW.$attribute.knotValueColumnName AS text))),
            $(knot.isEquivalent())? COALESCE(NEW.$equivalent, 0),
            $(schema.METADATA)? COALESCE(NEW.$attribute.knotMetadataColumnName, NEW.$anchor.metadataColumnName),
~*/
            }
/*~
            NEW.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
    	);
    	
    	RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER uti_l$anchor.name
INSTEAD OF UPDATE ON $anchor.capsule\.l$anchor.name
FOR EACH ROW
EXECUTE PROCEDURE $anchor.capsule\.uti_l$anchor.name();


-- AFTER UPDATE trigger ---------------------------------------------------------------------------------------------------------
--DROP TRIGGER IF EXISTS uta_l$anchor.name ON $anchor.capsule\.l$anchor.name;
--DROP FUNCTION IF EXISTS $anchor.capsule\.uta_l$anchor.name();

CREATE OR REPLACE FUNCTION $anchor.capsule\.uta_l$anchor.name() RETURNS trigger AS '
    BEGIN
        IF NEW.$anchor.identityColumnName != OLD.$anchor.identityColumnName THEN
            RAISE EXCEPTION ''The identity column $anchor.identityColumnName is not updatable.'';
        END IF;
~*/
		while (attribute = anchor.nextAttribute()) {
/*~
        IF NEW.$attribute.anchorReferenceName != OLD.$attribute.anchorReferenceName THEN
            RAISE EXCEPTION ''The foreign key column $attribute.anchorReferenceName is not updatable.'';
        END IF;
~*/
			if(attribute.isKnotted()) {
				knot = attribute.knot;
                equivalent = schema.IMPROVED ? attribute.knotEquivalentColumnName : knot.equivalentColumnName;
/*~ 
    IF NEW.$attribute.valueColumnName != OLD.$attribute.valueColumnName OR NEW.$attribute.knotValueColumnName != OLD.$attribute.knotValueColumnName THEN
        INSERT INTO $attribute.capsule\.$attribute.name (
            $(schema.METADATA)? $attribute.metadataColumnName,
            $attribute.anchorReferenceName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.valueColumnName
        )
        SELECT
            $(schema.METADATA)? COALESCE(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
            COALESCE(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
~*/
                if(attribute.isHistorized()) {
/*~
            cast(CASE
                WHEN i.$attribute.valueColumnName is null AND k$knot.mnemonic\.$knot.identityColumnName is null THEN i.$attribute.changingColumnName
                WHEN NEW.$attribute.changingColumnName != OLD.$attribute.changingColumnName THEN i.$attribute.changingColumnName
                ELSE $schema.metadata.now
            END as $attribute.timeRange),
~*/
                }
/*~
            CASE 
                WHEN NEW.$attribute.valueColumnName != OLD.$attribute.valueColumnName THEN i.$attribute.valueColumnName 
                ELSE k$knot.mnemonic\.$knot.identityColumnName 
            END
        FROM
            _tmp_ut_$anchor.name i
        LEFT JOIN
            $knot.capsule\.$knot.name k$knot.mnemonic
        ON
            $(knot.hasChecksum())? k$knot.mnemonic\.$knot.checksumColumnName = $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(CAST(i.$attribute.knotValueColumnName AS text)) : k$knot.mnemonic\.$knot.valueColumnName = i.$attribute.knotValueColumnName
        $(knot.isEquivalent())? AND
            $(knot.isEquivalent())? k$knot.mnemonic\.$knot.equivalentColumnName = i.$equivalent
        WHERE
            COALESCE(i.$attribute.valueColumnName, k$knot.mnemonic\.$knot.identityColumnName) is not null;
    END IF;
~*/
            }
			else { // not knotted
/*~
    IF NEW.$attribute.valueColumnName != OLD.$attribute.valueColumnName THEN
        INSERT INTO $attribute.capsule\.$attribute.name (
            $(schema.METADATA)? $attribute.metadataColumnName,
            $attribute.anchorReferenceName,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.valueColumnName
        )
        SELECT
            $(schema.METADATA)? COALESCE(i.$attribute.metadataColumnName, i.$anchor.metadataColumnName),
            COALESCE(i.$attribute.anchorReferenceName, i.$anchor.identityColumnName),
            $(attribute.isEquivalent())? i.$attribute.equivalentColumnName,
~*/
                if(attribute.isHistorized()) {
/*~
            cast(CASE
                WHEN i.$attribute.valueColumnName is null THEN i.$attribute.changingColumnName
                WHEN NEW.$attribute.changingColumnName != OLD.$attribute.changingColumnName
                THEN i.$attribute.changingColumnName
                ELSE $schema.metadata.now
            END as $attribute.timeRange),
~*/
                }
/*~
            i.$attribute.valueColumnName
        FROM
            _tmp_ut_$anchor.name i
        WHERE
            i.$attribute.valueColumnName is not null;
    END IF;
~*/
			} // end of not knotted
        } // end of while loop over attributes
/*~

        DROP TABLE IF EXISTS _tmp_ut_$anchor.name;
    
        RETURN NULL;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER uta_l$anchor.name
AFTER UPDATE ON $anchor.capsule\.l$anchor.name
FOR EACH STATEMENT
EXECUTE PROCEDURE $anchor.capsule\.uta_l$anchor.name();
~*/
    }
}