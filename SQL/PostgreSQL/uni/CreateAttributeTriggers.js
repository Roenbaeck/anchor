/*~
-- ATTRIBUTE TRIGGERS -------------------------------------------------------------------------------------------------
--
-- The following triggers on the attributes make them behave like tables.
-- They will ensure that such operations are propagated to the underlying tables
-- in a consistent way. Default values are used for some columns if not provided
-- by the corresponding SQL statements.
--
-- For idempotent attributes, only changes that represent a value different from
-- the previous or following value are stored. Others are silently ignored in
-- order to avoid unnecessary temporal duplicates.
--
~*/
var anchor, attribute;

while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
    	var statementTypes = "''N''";
    	
        if(attribute.isHistorized() && !attribute.isIdempotent()) {
            statementTypes += ",''R''";
        }

/*~
-- BEFORE INSERT trigger ----------------------------------------------------------------------------------------------
-- DROP TRIGGER IF EXISTS tcb$attribute.name ON $attribute.capsule\.$attribute.name;
-- DROP FUNCTION IF EXISTS $attribute.capsule\.tcb$attribute.name();

CREATE OR REPLACE FUNCTION $attribute.capsule\.tcb$attribute.name() RETURNS trigger AS '
    BEGIN
        -- temporary table is used to create an insert order 
        -- (so that rows are inserted in order with respect to temporality)
        CREATE TEMPORARY TABLE IF NOT EXISTS _tmp_$attribute.name (
            $attribute.anchorReferenceName $anchor.identity not null,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange not null,
            $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType not null,
            $(attribute.isHistorized())? $attribute.changingColumnName $attribute.timeRange not null,
            $(attribute.knotRange)? $attribute.valueColumnName $attribute.knot.identity not null, : $attribute.valueColumnName $attribute.dataRange not null,
            $(attribute.hasChecksum())? $attribute.checksumColumnName $schema.metadata.checksumType not null,
            $attribute.versionColumnName bigint not null,
            $attribute.statementTypeColumnName char(1) not null,
            primary key(
                $attribute.versionColumnName,
                $attribute.anchorReferenceName
            )
        ) ON COMMIT DROP;
        
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tcb$attribute.name
BEFORE INSERT ON $attribute.capsule\.$attribute.name
FOR EACH STATEMENT
EXECUTE PROCEDURE $attribute.capsule\.tcb$attribute.name();
~*/

    	
/*~
-- INSTEAD OF INSERT trigger ------------------------------------------------------------------------------------------
-- DROP TRIGGER IF EXISTS tci$attribute.name ON $attribute.capsule\.$attribute.name;
-- DROP FUNCTION IF EXISTS $attribute.capsule\.tci$attribute.name();

CREATE OR REPLACE FUNCTION $attribute.capsule\.tci$attribute.name() RETURNS trigger AS '
    BEGIN
        -- insert rows into the temporary table
        INSERT INTO _tmp_$attribute.name
        SELECT
            NEW.$attribute.anchorReferenceName,
            $(attribute.isEquivalent())? NEW.$attribute.equivalentColumnName,
            $(schema.METADATA)? NEW.$attribute.metadataColumnName,
            $(attribute.isHistorized())? NEW.$attribute.changingColumnName,
            NEW.$attribute.valueColumnName,
            $(attribute.hasChecksum())? $schema.metadata.encapsulation\.$schema.metadata.checksumFunction(CAST(NEW.$attribute.valueColumnName AS text)),
~*/
        if(attribute.isHistorized()) {
/*~
            0,
~*/
        }
        else {
/*~
            1,
~*/
        }
/*~
            ''X'';
        
        RETURN NEW;
    END;
' LANGUAGE plpgsql;

CREATE TRIGGER tci$attribute.name
INSTEAD OF INSERT ON $attribute.capsule\.$attribute.name
FOR EACH ROW
EXECUTE PROCEDURE $attribute.capsule\.tci$attribute.name();
~*/


/*~
-- AFTER INSERT trigger -----------------------------------------------------------------------------------------------
-- DROP TRIGGER IF EXISTS tca$attribute.name ON $attribute.capsule\.$attribute.name;
-- DROP FUNCTION IF EXISTS $attribute.capsule\.tca$attribute.name();

CREATE OR REPLACE FUNCTION $attribute.capsule\.tca$attribute.name() RETURNS trigger AS '
    DECLARE maxVersion int;
    DECLARE currentVersion int = 0;
BEGIN
~*/
        if(attribute.isHistorized()) {
/*~
    -- find ranks for inserted data (using self join)
    UPDATE _tmp_$attribute.name
    SET $attribute.versionColumnName = v.rank
    FROM (
        SELECT
            DENSE_RANK() OVER (
                PARTITION BY
                    $(attribute.isEquivalent())? $attribute.equivalentColumnName,
                    $attribute.anchorReferenceName
                ORDER BY
                    $attribute.changingColumnName ASC
            ) AS rank,
            $attribute.anchorReferenceName AS pk
        FROM _tmp_$attribute.name
    ) AS v
    WHERE $attribute.anchorReferenceName = v.pk
    AND $attribute.versionColumnName = 0;
~*/
        }
/*~
    -- find max version
    SELECT
        MAX($attribute.versionColumnName) INTO maxVersion
    FROM
        _tmp_$attribute.name;
    
    -- is max version NULL?
    IF (maxVersion is null) THEN
        RETURN NULL;
    END IF;
    
    -- loop over versions
    LOOP
        currentVersion := currentVersion + 1;
        
        -- set statement types
        UPDATE _tmp_$attribute.name
        SET
            $attribute.statementTypeColumnName =
                CASE
                    WHEN $attribute.mnemonic\.$attribute.anchorReferenceName is not null
                    THEN ''D'' -- duplicate
~*/
        if(attribute.isHistorized()) {
/*~
                    WHEN $attribute.capsule\.rf$attribute.name(
                        v.$attribute.anchorReferenceName,
                        $(attribute.isEquivalent())? v.$attribute.equivalentColumnName,
                        $(attribute.hasChecksum())? v.$attribute.checksumColumnName, : v.$attribute.valueColumnName,
                        v.$attribute.changingColumnName
                    ) = 1
                    THEN ''R'' -- restatement
~*/
        }
/*~
                    ELSE ''N'' -- new statement
                END
        FROM
            _tmp_$attribute.name v
        LEFT JOIN
            $attribute.capsule\._$attribute.name $attribute.mnemonic
        ON
            $attribute.mnemonic\.$attribute.anchorReferenceName = v.$attribute.anchorReferenceName
        $(attribute.isHistorized())? AND
            $(attribute.isHistorized())? $attribute.mnemonic\.$attribute.changingColumnName = v.$attribute.changingColumnName
        $(attribute.isEquivalent())? AND
            $(attribute.isEquivalent())? $attribute.mnemonic\.$attribute.equivalentColumnName = v.$attribute.equivalentColumnName
        AND
            $(attribute.hasChecksum())? $attribute.mnemonic\.$attribute.checksumColumnName = v.$attribute.checksumColumnName : $attribute.mnemonic\.$attribute.valueColumnName = v.$attribute.valueColumnName
        WHERE
            v.$attribute.versionColumnName = currentVersion;

        -- insert data into attribute table
        INSERT INTO $attribute.capsule\._$attribute.name (
            $attribute.anchorReferenceName,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.valueColumnName$(attribute.hasChecksum())?,
            $(attribute.hasChecksum())? $attribute.checksumColumnName
        )
        SELECT
            $attribute.anchorReferenceName,
            $(attribute.isEquivalent())? $attribute.equivalentColumnName,
            $(schema.METADATA)? $attribute.metadataColumnName,
            $(attribute.isHistorized())? $attribute.changingColumnName,
            $attribute.valueColumnName$(attribute.hasChecksum())?,
            $(attribute.hasChecksum())? $attribute.checksumColumnName
        FROM
            _tmp_$attribute.name
        WHERE
            $attribute.versionColumnName = currentVersion
        AND
            $attribute.statementTypeColumnName in ($statementTypes);

        EXIT WHEN currentVersion >= maxVersion;
    END LOOP;
    
    DROP TABLE IF EXISTS _tmp_$attribute.name;
    
    RETURN NULL;
END;
' LANGUAGE plpgsql;

CREATE TRIGGER tca$attribute.name
AFTER INSERT ON $attribute.capsule\.$attribute.name
FOR EACH STATEMENT
EXECUTE PROCEDURE $attribute.capsule\.tca$attribute.name();
~*/

    } // end of loop over attributes
}