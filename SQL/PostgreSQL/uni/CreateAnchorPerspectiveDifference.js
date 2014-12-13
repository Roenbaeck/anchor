var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
        if(anchor.hasMoreHistorizedAttributes()) {	
        	
/*~
-- Difference perspective ---------------------------------------------------------------------------------------------
-- d$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION d$anchor.name (
    intervalStart $schema.metadata.chronon,
    intervalEnd $schema.metadata.chronon,
    selection text = null
) RETURNS SETOF record AS '
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
        $attribute.changingColumnName AS inspectedTimepoint,
        ''$attribute.mnemonic'' AS mnemonic
    FROM
        $(attribute.isEquivalent())? e$attribute.name(0) : $attribute.name
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
    p$anchor.name(timepoints.inspectedTimepoint) p$anchor.mnemonic
WHERE
    p$anchor.mnemonic\.$anchor.identityColumnName = timepoints.$anchor.identityColumnName;
' LANGUAGE SQL;
~*/
        }
    } // end of if anchor has any attributes
}