/*~
-- ANCHOR VIEW PERSPECTIVES -------------------------------------------------------------------------------------------
--
-- There are two types of view perspectives: latest and now.
-- They also denormalize the anchor, its attributes,
-- and referenced knots from sixth to third normal form.
--
-- The latest perspective shows the latest available information for each anchor.
-- The now perspective shows the information as it is right now.
--
-- Under equivalence all these views default to equivalent = 0.
--
~*/
var anchor, createOrReplace = 'CREATE OR REPLACE';
// set options per dialect
switch (schema.metadata.databaseTarget) {
    case 'Teradata': 
        createOrReplace = 'REPLACE';
    break;
}
while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
/*~
-- Latest perspective -------------------------------------------------------------------------------------------------
-- l$anchor.name viewed by the latest available information (may include future versions)
-----------------------------------------------------------------------------------------------------------------------
$createOrReplace VIEW $anchor.capsule\.l$anchor.name AS
SELECT $anchor.mnemonic\.$anchor.identityColumnName
     , $anchor.mnemonic\.$(schema.METADATA)? $anchor.metadataColumnName : $anchor.recordingColumnName 
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
     $(schema.IMPROVED)? , $attribute.mnemonic\.$attribute.anchorReferenceName
     , $attribute.mnemonic\.$attribute.valueColumnName
     , $attribute.mnemonic\.$(schema.METADATA)? $attribute.metadataColumnName : $attribute.recordingColumnName
     $(attribute.timeRange)? , $attribute.mnemonic\.$attribute.changingColumnName
     $(attribute.hasChecksum())? , $attribute.mnemonic\.$attribute.checksumColumnName
     $(attribute.isEquivalent())? , $attribute.mnemonic\.$attribute.equivalentColumnName
     $(attribute.isDeletable())? , cast(null as boolean) as $attribute.deletableColumnName     


~*/      
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
     , k$attribute.mnemonic\.$knot.valueColumnName AS $attribute.knotValueColumnName
     , k$attribute.mnemonic\.$(schema.METADATA)? $knot.metadataColumnName AS $attribute.knotMetadataColumnName : $attribute.recordingColumnName AS $attribute.knotMetadataColumnName
     $(knot.hasChecksum())? , k$attribute.mnemonic\.$knot.checksumColumnName AS $attribute.knotChecksumColumnName
     $(knot.isEquivalent())? , k$attribute.mnemonic\.$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName
~*/
            }          
        }
/*~
  FROM $anchor.capsule\.$anchor.name $anchor.mnemonic
~*/ 
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isEquivalent()) {
/*~
  LEFT 
  JOIN $attribute.capsule\.e$attribute.name $attribute.mnemonic
~*/
            }
            else {
                if(attribute.isHistorized()) {
/*~
  LEFT 
  JOIN $attribute.capsule\.l$attribute.name $attribute.mnemonic
~*/                    
                }
                else {
/*~
  LEFT 
  JOIN $attribute.capsule\.$attribute.name $attribute.mnemonic
~*/
                }
            }
/*~
    ON $attribute.mnemonic\.$attribute.anchorReferenceName = $anchor.mnemonic\.$anchor.identityColumnName~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
  LEFT 
  JOIN $knot.capsule\.e$knot.name k$attribute.mnemonic
~*/
                }
                else {
/*~
  LEFT 
  JOIN $knot.capsule\.$knot.name k$attribute.mnemonic
~*/
                }
/*~
    ON k$attribute.mnemonic\.$knot.identityColumnName = $attribute.mnemonic\.$attribute.knotReferenceName~*/
            }
        }
/*~
;
-- Now perspective ----------------------------------------------------------------------------------------------------
-- n$anchor.name viewed as it currently is (cannot include future versions)
-----------------------------------------------------------------------------------------------------------------------
$createOrReplace VIEW $anchor.capsule\.n$anchor.name AS
SELECT $anchor.mnemonic\.$anchor.identityColumnName
     , $anchor.mnemonic\.$(schema.METADATA)? $anchor.metadataColumnName : $anchor.recordingColumnName 
~*/
        var knot, attribute;
        while (attribute = anchor.nextAttribute()) {
/*~
     $(schema.IMPROVED)? , $attribute.mnemonic\.$attribute.anchorReferenceName
     , $attribute.mnemonic\.$attribute.valueColumnName
     , $attribute.mnemonic\.$(schema.METADATA)? $attribute.metadataColumnName : $attribute.recordingColumnName
     $(attribute.timeRange)? , $attribute.mnemonic\.$attribute.changingColumnName
     $(attribute.hasChecksum())? , $attribute.mnemonic\.$attribute.checksumColumnName
     $(attribute.isEquivalent())? , $attribute.mnemonic\.$attribute.equivalentColumnName
     $(attribute.isDeletable())? , cast(null as boolean) as $attribute.deletableColumnName     


~*/      
            if(attribute.isKnotted()) {
                knot = attribute.knot;
/*~
     , k$attribute.mnemonic\.$knot.valueColumnName AS $attribute.knotValueColumnName
     , k$attribute.mnemonic\.$(schema.METADATA)? $knot.metadataColumnName AS $attribute.knotMetadataColumnName : $attribute.recordingColumnName AS $attribute.knotMetadataColumnName
     $(knot.hasChecksum())? , k$attribute.mnemonic\.$knot.checksumColumnName AS $attribute.knotChecksumColumnName
     $(knot.isEquivalent())? , k$attribute.mnemonic\.$knot.equivalentColumnName AS $attribute.knotEquivalentColumnName
~*/
            }          
        }
/*~
  FROM $anchor.capsule\.$anchor.name $anchor.mnemonic
~*/ 
        while (attribute = anchor.nextAttribute()) {
            if(attribute.isEquivalent()) {
/*~
  LEFT 
  JOIN $attribute.capsule\.e$attribute.name $attribute.mnemonic
~*/
            }
            else {
                if(attribute.isHistorized()) {
/*~
  LEFT 
  JOIN $attribute.capsule\.n$attribute.name $attribute.mnemonic
~*/                    
                }
                else {
/*~
  LEFT 
  JOIN $attribute.capsule\.$attribute.name $attribute.mnemonic
~*/
                }
            }
/*~
    ON $attribute.mnemonic\.$attribute.anchorReferenceName = $anchor.mnemonic\.$anchor.identityColumnName~*/
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                if(knot.isEquivalent()) {
/*~
  LEFT 
  JOIN $knot.capsule\.e$knot.name k$attribute.mnemonic
~*/
                }
                else {
/*~
  LEFT 
  JOIN $knot.capsule\.$knot.name k$attribute.mnemonic
~*/
                }
/*~
    ON k$attribute.mnemonic\.$knot.identityColumnName = $attribute.mnemonic\.$attribute.knotReferenceName~*/
            }
        }
/*~
;
~*/
    } // end of if anchor has any attributes
}