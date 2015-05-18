var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
        if(anchor.hasMoreHistorizedAttributes()) {	
        	
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION $anchor.capsule\.d$anchor.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection text = null
) RETURNS TABLE (
    inspectedTimepoint $schema.metadata.chronon,
    mnemonic text,
    $anchor.identityColumnName $anchor.identity,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType,~*/
        	
    	while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.anchorReferenceName $anchor.identity,
    $(schema.METADATA)? $attribute.metadataColumnName $schema.metadata.metadataType,
    $(attribute.timeRange)? $attribute.changingColumnName $attribute.timeRange,
    $(attribute.isEquivalent())? $attribute.equivalentColumnName $schema.metadata.equivalentRange,
~*/
    		if(attribute.isKnotted()) {
    			knot = attribute.knot;
/*~
    $(knot.hasChecksum())? $attribute.knotChecksumColumnName bytea,
    $(knot.isEquivalent())? $attribute.knotEquivalentColumnName $schema.metadata.equivalentRange,
    $attribute.knotValueColumnName $knot.dataRange,
    $(schema.METADATA)? $attribute.knotMetadataColumnName $schema.metadata.metadataType, 
~*/
    		}
/*~
    $(attribute.hasChecksum())? $attribute.checksumColumnName bytea,
    $attribute.valueColumnName $(attribute.isKnotted())? $knot.identity: $attribute.dataRange~*/  
/*~$(anchor.hasMoreAttributes())?,
~*/    	
    	}
/*~
) AS '
SELECT
    timepoints.inspectedTimepoint,
    timepoints.mnemonic,
    p$anchor.mnemonic\.*
FROM (
~*/
            while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        CAST($attribute.changingColumnName AS $schema.metadata.chronon) AS inspectedTimepoint,
        ''$attribute.mnemonic'' AS mnemonic
    FROM
        $(attribute.isEquivalent())? $attribute.capsule\.e$attribute.name(0) : $attribute.capsule\.$attribute.name
    WHERE
        (selection is null OR selection like ''%$attribute.mnemonic%'')
    AND
        $attribute.changingColumnName BETWEEN intervalStart AND intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
            }
/*~
) timepoints
CROSS JOIN LATERAL
    $anchor.capsule\.p$anchor.name(timepoints.inspectedTimepoint) p$anchor.mnemonic
WHERE
    p$anchor.mnemonic\.$anchor.identityColumnName = timepoints.$anchor.identityColumnName;
' LANGUAGE SQL;
~*/
        }
    } // end of if anchor has any attributes
}