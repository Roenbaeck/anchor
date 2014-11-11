var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
    	var knot, attribute;

/*~
-- Point-in-time perspective ------------------------------------------------------------------------------------------
-- p$anchor.name viewed as it was on the given timepoint
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION \"p$anchor.name\" (
    changingTimepoint $schema.metadata.chronon
)
RETURNS TABLE (
    \"$anchor.identityColumnName\" $anchor.identity,
    $(schema.METADATA)? \"$anchor.metadataColumnName\" $schema.metadata.metadataType,~*/
    	while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? \"$attribute.anchorReferenceName\" $anchor.identity,
    $(schema.METADATA)? \"$attribute.metadataColumnName\" $schema.metadata.metadataType,
    $(attribute.timeRange)? \"$attribute.changingColumnName\" $attribute.timeRange,
    $(attribute.isEquivalent())? \"$attribute.equivalentColumnName\" $schema.metadata.equivalentRange,
~*/
    		if(attribute.isKnotted()) {
    			knot = attribute.knot;
/*~
    $(knot.hasChecksum())? \"$attribute.knotChecksumColumnName\" bytea,
    $(knot.isEquivalent())? \"$attribute.knotEquivalentColumnName\" $schema.metadata.equivalentRange,
    \"$attribute.knotValueColumnName\" $knot.dataRange,
    $(schema.METADATA)? \"$attribute.knotMetadataColumnName\" $schema.metadata.metadataType, 
~*/
    		}
/*~
    $(attribute.hasChecksum())? \"$attribute.checksumColumnName\" bytea,
    \"$attribute.valueColumnName\" $(attribute.isKnotted())? $knot.identity: $attribute.dataRange~*/  
/*~$(anchor.hasMoreAttributes())?,
~*/    		
    	}
    	
/*~    	
) AS '
SELECT
    \"$anchor.mnemonic\"\.\"$anchor.identityColumnName\",
    $(schema.METADATA)? \"$anchor.mnemonic\"\.\"$anchor.metadataColumnName\",
~*/
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? \"$attribute.mnemonic\"\.\"$attribute.anchorReferenceName\",
    $(schema.METADATA)? \"$attribute.mnemonic\"\.\"$attribute.metadataColumnName\",
    $(attribute.timeRange)? \"$attribute.mnemonic\"\.\"$attribute.changingColumnName\",
    $(attribute.isEquivalent())? \"$attribute.mnemonic\"\.\"$attribute.equivalentColumnName\",
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? \"k$attribute.mnemonic\"\.\"$knot.checksumColumnName\" AS \"$attribute.knotChecksumColumnName\",
    $(knot.isEquivalent())? \"k$attribute.mnemonic\"\.\"$knot.equivalentColumnName\" AS \"$attribute.knotEquivalentColumnName\",
    \"k$attribute.mnemonic\"\.\"$knot.valueColumnName\" AS \"$attribute.knotValueColumnName\",
    $(schema.METADATA)? \"k$attribute.mnemonic\"\.\"$knot.metadataColumnName\" AS \"$attribute.knotMetadataColumnName\",
~*/
            }
/*~
    $(attribute.hasChecksum())? \"$attribute.mnemonic\"\.\"$attribute.checksumColumnName\",
    \"$attribute.mnemonic\"\.\"$attribute.valueColumnName\"$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    \"$anchor.name\" \"$anchor.mnemonic\"
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isHistorized()) {
                if(attribute.isEquivalent()) {
/*~
LEFT JOIN
    \"r$attribute.name\"(0, CAST(changingTimepoint AS $attribute.timeRange)) \"$attribute.mnemonic\"
~*/
                }
                else {
/*~
LEFT JOIN
    \"r$attribute.name\"(CAST(changingTimepoint AS $attribute.timeRange)) \"$attribute.mnemonic\"
~*/
                }
/*~
ON
    \"$attribute.mnemonic\"\.\"$attribute.anchorReferenceName\" = \"$anchor.mnemonic\"\.\"$anchor.identityColumnName\"
AND
    \"$attribute.mnemonic\"\.\"$attribute.changingColumnName\" = (
        SELECT
            max(sub.\"$attribute.changingColumnName\")
        FROM
            $(attribute.isEquivalent())? \"r$attribute.name\"(0, CAST(changingTimepoint AS $attribute.timeRange)) sub : \"r$attribute.name\"(CAST(changingTimepoint AS $attribute.timeRange)) sub
        WHERE
            sub.\"$attribute.anchorReferenceName\" = \"$anchor.mnemonic\"\.\"$anchor.identityColumnName\"
   )~*/
            }
            else {
                if(attribute.isEquivalent()) {
/*~
LEFT JOIN
    \"e$attribute.name\"(0) \"$attribute.mnemonic\"
~*/
                }
                else {
/*~
LEFT JOIN
    \"$attribute.name\" \"$attribute.mnemonic\"
~*/
                }
/*~
ON
    \"$attribute.mnemonic\"\.\"$attribute.anchorReferenceName\" = \"$anchor.mnemonic\"\.\"$anchor.identityColumnName\"~*/
            }
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    \"e$knot.name\"(0) \"k$attribute.mnemonic\"
~*/
                }
                else {
/*~
LEFT JOIN
    \"$knot.name\" \"k$attribute.mnemonic\"
~*/
                }
/*~
ON
    \"k$attribute.mnemonic\"\.\"$knot.identityColumnName\" = \"$attribute.mnemonic\"\.\"$attribute.knotReferenceName\"~*/
            }
            if(!anchor.hasMoreAttributes()) {
                /*~;~*/
            }
        }
/*~
' LANGUAGE SQL;~*/
    }
}