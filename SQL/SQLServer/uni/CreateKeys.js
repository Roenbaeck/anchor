// create keys
var anchor, route, key, stop, component, attribute, tie, numberOfStops, numberOfHistorizedAttributes;
while (anchor = schema.nextAnchor()) {
	if(anchor.keys) {
		for(route in anchor.keys) {
            numberOfStops = 0;
            numberOfHistorizedAttributes = 0;
			key = anchor.keys[route];
/*~
-- Key view -----------------------------------------------------------------------------------------------------------
-- $route key view for lookups of identities in $anchor.name
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$anchor.capsule$.$key.name', 'V') IS NOT NULL
DROP VIEW [$anchor.capsule].[$key.name];
GO

CREATE VIEW [$anchor.capsule].[$key.name] WITH SCHEMABINDING AS
SELECT
~*/
			for(stop in key.stops) {
                numberOfStops++;
				component = key.stops[stop];
				if(attribute = component.attribute) {
                    if(attribute.timeRange) numberOfHistorizedAttributes++;
/*~
    twine.$component.routedValueColumnName,
~*/					
				}
			}
/*~
    $(numberOfHistorizedAttributes > 0 && numberOfStops > 1)? twine.[$schema.metadata.changingSuffix],
    $(numberOfHistorizedAttributes > 0 && numberOfStops === 1)? twine.$attribute.changingColumnName AS [$schema.metadata.changingSuffix],
    [$anchor.mnemonic].$anchor.identityColumnName
FROM
    [$anchor.capsule].[$anchor.name] [$anchor.mnemonic]
~*/
            if(numberOfStops === 1) {
/*~
LEFT JOIN 
    [$attribute.capsule].[$attribute.name] twine
ON
    twine.$attribute.anchorReferenceName = [$anchor.mnemonic].$anchor.identityColumnName;
~*/
            }
            else {
/*~
LEFT JOIN (
    SELECT TOP 1 WITH TIES
~*/
            for(stop in key.stops) {
                component = key.stops[stop];
                if(attribute = component.attribute) {
/*~
        CAST(
            MAX(CASE
                WHEN [QualifiedType] = '$component.routedValueColumnName'
                THEN [Value] END
            ) OVER (
                PARTITION BY 
                    $anchor.identityColumnName, 
                    $component.routedChangingColumnName
            ) AS $attribute.dataRange
        ) AS $component.routedValueColumnName,
~*/                 
                }
            }
/*~
        $anchor.identityColumnName,
        [$schema.metadata.changingSuffix]
    FROM (
        SELECT
~*/
            for(stop in key.stops) {
                component = key.stops[stop];
                if(attribute = component.attribute) {
/*~
            MAX(CASE
                WHEN [QualifiedType] = '$component.routedValueColumnName'  
                 AND [Value] is not null
                THEN [$schema.metadata.changingSuffix] END
            ) OVER (
                PARTITION BY $anchor.identityColumnName 
                ORDER BY [$schema.metadata.changingSuffix]
            ) AS $component.routedChangingColumnName,
~*/                 
                }
            }
/*~
            $anchor.identityColumnName,
            [Value],
            [QualifiedType],
            [$schema.metadata.changingSuffix]
        FROM (
~*/
            var traversal = [];
            var currentStop = 0;
            var lastAnchor = anchor;
            for(stop in key.stops) {
                currentStop++;
                component = key.stops[stop];
                if(tie = component.tie) {
                    traversal.push(tie);
                }
                else if(attribute = component.attribute) {
                    lastAnchor = attribute.anchor;
                    if(traversal.length == 0) {
/*~
            SELECT
                [$attribute.mnemonic].$attribute.anchorReferenceName AS $anchor.identityColumnName, 
                CAST([$attribute.mnemonic].$attribute.valueColumnName AS VARBINARY(max)) AS [Value],
                '$component.routedValueColumnName' AS [QualifiedType],
                $(attribute.timeRange)? [$attribute.mnemonic].$attribute.changingColumnName AS [$schema.metadata.changingSuffix]
                $(!attribute.timeRange)? NULL AS [$schema.metadata.changingSuffix]
            FROM
                [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]
            $(currentStop < numberOfStops)? UNION ALL
~*/
                    }
                    else {

                    }
                }
            }
/*~
        ) unified_timelines
    ) resolved_changes
) twine
ON
    twine.$anchor.identityColumnName = [$anchor.mnemonic].$anchor.identityColumnName;
~*/
            }
		}
	}
}
