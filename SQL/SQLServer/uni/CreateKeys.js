// create keys
var anchor, route, key, stop, component, attribute, tie, numberOfStops;
while (anchor = schema.nextAnchor()) {
	if(anchor.keys) {
		for(route in anchor.keys) {
            numberOfStops = 0;
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
                var historized = false;
				if(attribute = component.attribute) {
                    if(attribute.timeRange) historized = true;
/*~
    twine.$component.routedValueColumnName
~*/					
				}

			}
/*~
    $(historized && numberOfStops > 1)? twine.$schema.metadata.changingSuffix,
    $(historized && numberOfStops === 1)? twine.$attribute.changingColumnName AS $schema.metadata.changingSuffix,
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
~*/
			// build the twine here
/*~
) twine
ON
    twine.$anchor.identityColumnName = [$anchor.mnemonic].$anchor.identityColumnName;
~*/
            }
		}
	}
}
