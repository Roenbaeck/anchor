var anchor;

while (anchor = schema.nextAnchor()) {
    if(anchor.hasMoreAttributes()) { // only do perspectives if there are attributes
        if(schema.EQUIVALENCE) {
            if(anchor.hasMoreHistorizedAttributes()) {
/*~
-- Difference equivalence perspective ---------------------------------------------------------------------------------
-- ed$anchor.name showing all differences between the given timepoints and optionally for a subset of attributes
-----------------------------------------------------------------------------------------------------------------------
CREATE FUNCTION [$anchor.capsule].[ed$anchor.name] (
    @equivalent $schema.metadata.equivalentRange,
    @intervalStart $schema.metadata.chronon,
    @intervalEnd $schema.metadata.chronon,
    @selection varchar(max) = null
)
RETURNS TABLE AS RETURN
SELECT
    timepoints.inspectedTimepoint,
    timepoints.mnemonic,
    [p$anchor.mnemonic].*
FROM (
~*/
                while (attribute = anchor.nextHistorizedAttribute()) {
/*~
    SELECT DISTINCT
        $attribute.anchorReferenceName AS $anchor.identityColumnName,
        $attribute.changingColumnName AS inspectedTimepoint,
        '$attribute.mnemonic' AS mnemonic
    FROM
        $(attribute.isEquivalent())? [$attribute.capsule].[e$attribute.name](@equivalent) : [$attribute.capsule].[$attribute.name]
    WHERE
        (@selection is null OR @selection like '%$attribute.mnemonic%')
    AND
        $attribute.changingColumnName BETWEEN @intervalStart AND @intervalEnd
    $(anchor.hasMoreHistorizedAttributes())? UNION
~*/
                }
/*~
) timepoints
CROSS APPLY
    [$anchor.capsule].[ep$anchor.name](@equivalent, timepoints.inspectedTimepoint) [p$anchor.mnemonic]
WHERE
    [p$anchor.mnemonic].$anchor.identityColumnName = timepoints.$anchor.identityColumnName;
GO
~*/
            }
        } // end of if equivalence
    } // end of if anchor has any attributes
}