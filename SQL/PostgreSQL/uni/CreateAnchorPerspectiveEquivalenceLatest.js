var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
        if(schema.EQUIVALENCE) {
/*~
-- Latest equivalence perspective -------------------------------------------------------------------------------------
-- el$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[el$anchor.name] (
    @equivalent $schema.metadata.equivalentRange
)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
SELECT
    [$anchor.mnemonic].$anchor.identityColumnName,
    $(schema.METADATA)? [$anchor.mnemonic].$anchor.metadataColumnName,
~*/
            var knot, attribute;
            while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? [$attribute.mnemonic].$attribute.anchorReferenceName,
    $(schema.METADATA)? [$attribute.mnemonic].$attribute.metadataColumnName,
    $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName,
    $(attribute.isEquivalent())? [$attribute.mnemonic].$attribute.equivalentColumnName,
~*/
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
/*~
    $(knot.hasChecksum())? [k$attribute.mnemonic].$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? [k$attribute.mnemonic].$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    [k$attribute.mnemonic].$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? [k$attribute.mnemonic].$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
                }
/*~
    $(attribute.hasChecksum())? [$attribute.mnemonic].$attribute.checksumColumnName,
    [$attribute.mnemonic].$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
            }
/*~
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
            while (attribute = anchor.nextAttribute()) {
                if(attribute.isEquivalent()) {
/*~
LEFT JOIN
    [$attribute.capsule].[e$attribute.name](@equivalent) [$attribute.mnemonic]
~*/
                }
                else {
/*~
LEFT JOIN
    [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
~*/
                }
/*~
ON
    [$attribute.mnemonic].$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName~*/
                if(attribute.isHistorized()) {
/*~
AND
    [$attribute.mnemonic].$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) sub : [$attribute.capsule].[$attribute.name] sub
        WHERE
            sub.$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName
   )~*/
                }
                if(attribute.isKnotted()) {
                    knot = attribute.knot;
                    if(knot.isEquivalent()) {
/*~
LEFT JOIN
    [$knot.capsule].[e$knot.name](@equivalent) [k$attribute.mnemonic]
~*/
                    }
                    else {
/*~
LEFT JOIN
    [$knot.capsule].[$knot.name] [k$attribute.mnemonic]
~*/
                    }
/*~
ON
    [k$attribute.mnemonic].$knot.identityColumnName = [$attribute.mnemonic].$attribute.knotReferenceName~*/
                }
                if(!anchor.hasMoreAttributes()) {
                /*~;~*/
                }
            }
/*~
GO
~*/
        } // end of if equivalence
    } // end of if anchor has any attributes
}