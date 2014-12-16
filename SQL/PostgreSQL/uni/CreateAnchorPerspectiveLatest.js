var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE VIEW l$anchor.name AS
SELECT
    $anchor.mnemonic\.$anchor.identityColumnName,
    $(schema.METADATA)? $anchor.mnemonic\.$anchor.metadataColumnName,
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
    $(schema.IMPROVED)? $attribute.mnemonic\.$attribute.anchorReferenceName,
    $(schema.METADATA)? $attribute.mnemonic\.$attribute.metadataColumnName,
    $(attribute.timeRange)? $attribute.mnemonic\.$attribute.changingColumnName,
    $(attribute.isEquivalent())? $attribute.mnemonic\.$attribute.equivalentColumnName,
~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
    $(knot.hasChecksum())? k$attribute.mnemonic\.$knot.checksumColumnName AS $attribute.knotChecksumColumnName,
    $(knot.isEquivalent())? k$attribute.mnemonic\.$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName,
    k$attribute.mnemonic\.$knot.valueColumnName AS $attribute.knotValueColumnName,
    $(schema.METADATA)? k$attribute.mnemonic\.$knot.metadataColumnName AS $attribute.knotMetadataColumnName,
~*/
            }
/*~
    $(attribute.hasChecksum())? $attribute.mnemonic\.$attribute.checksumColumnName,
    $attribute.mnemonic\.$attribute.valueColumnName$(anchor.hasMoreAttributes())?,
~*/
        }
/*~
FROM
    $anchor.name $anchor.mnemonic
~*/
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isEquivalent()) {
/*~
LEFT JOIN
    e$attribute.name(0) $attribute.mnemonic
~*/
            }
            else {
/*~
LEFT JOIN
    $attribute.name $attribute.mnemonic
~*/
            }
/*~
ON
    $attribute.mnemonic\.$attribute.anchorReferenceName = $anchor.mnemonic\.$anchor.identityColumnName~*/
            if(attribute.isHistorized()) {
/*~
AND
    $attribute.mnemonic\.$attribute.changingColumnName = (
        SELECT
            max(sub.$attribute.changingColumnName)
        FROM
            $(attribute.isEquivalent())? e$attribute.name(0) sub : $attribute.name sub
        WHERE
            sub.$attribute.anchorReferenceName = $anchor.mnemonic\.$anchor.identityColumnName
   )~*/
            }
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
LEFT JOIN
    e$knot.name(0) k$attribute.mnemonic
~*/
                }
                else {
/*~
LEFT JOIN
    $knot.name k$attribute.mnemonic
~*/
                }
/*~
ON
    k$attribute.mnemonic\.$knot.identityColumnName = $attribute.mnemonic\.$attribute.knotReferenceName~*/
            }
        }
/*~;~*/
    } // end of if anchor has any attributes
}