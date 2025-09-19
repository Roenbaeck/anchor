// create keys
var anchor, route, key, stop, component, attribute, tie, numberOfStops, numberOfBranches, numberOfHistorizedAttributes;
while (anchor = schema.nextAnchor()) {
	if(anchor.keys) {
		for(route in anchor.keys) {
            numberOfStops = 0;
            numberOfBranches = 0;
            numberOfHistorizedAttributes = 0;
			key = anchor.keys[route];
            if(schema.NATURAL_KEY_ATTRIBUTES) {
                /*~
-- Materialized Natural Key Table -------------------------------------------------
-- $route key table for lookups of identities in $anchor.name
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$anchor.capsule$.$key.tableName', 'U') IS NOT NULL
DROP TABLE [$anchor.capsule].[$key.tableName];
GO

CREATE TABLE [$anchor.capsule].[$key.tableName](
    $anchor.identityColumnName $anchor.identity NOT NULL,
                ~*/
                for(stop in key.stops) {
                    component = key.stops[stop];
                    if(attribute = component.attribute) {
                        /*~
    $component.routedValueColumnName $attribute.dataRange NOT NULL,
                        ~*/
                    }
                }
                /*~
    $(key.historized)? $key.changingColumnName $schema.metadata.chronon NOT NULL,
    $(schema.EQUIVALENCE)? $anchor.mnemonic$schema.metadata.equivalentSuffix $schema.metadata.equivalentRange NOT NULL,
    $(schema.METADATA)? $anchor.metadataColumnName $schema.metadata.metadataType NOT NULL,
    CONSTRAINT pk$key.tableName PRIMARY KEY CLUSTERED (
    ~*/
                if(key.historized) {
    /*~
        $(schema.EQUIVALENCE)? $anchor.mnemonic$schema.metadata.equivalentSuffix,
        $anchor.identityColumnName,
        $key.changingColumnName
    ~*/
                }
                else {
    /*~
        $(schema.EQUIVALENCE)? $anchor.mnemonic$schema.metadata.equivalentSuffix,
        $anchor.identityColumnName
    ~*/
                }
    /*~
    ),
    CONSTRAINT uq$key.tableName UNIQUE (
        $(schema.EQUIVALENCE)? $anchor.mnemonic$schema.metadata.equivalentSuffix,
    ~*/
                var numberOfStops = Object.keys(key.stops).length;
                var currentStopNumber = 0;
                for(stop in key.stops) {
                    currentStopNumber++;
                    var name = component.routedValueColumnName +',';
                    if(!key.historized && currentStopNumber === numberOfStops) {
                        name = component.routedValueColumnName;
                    }
                    component = key.stops[stop];
                    if(attribute = component.attribute) {
                        /*~
        $name
                        ~*/
                    }
                }
    /*~
        $(key.historized)? $key.changingColumnName
    )
);
GO
                ~*/
            }
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
            var branches = {}; // rearrange the route into its branches
			for(stop in key.stops) {
                numberOfStops++;
				component = key.stops[stop];
                if(component.branch) {
                    if(!branches[component.branch]) {
                        numberOfBranches++;
                        branches[component.branch] = [];
                    }
                    branches[component.branch].push(component);
                }
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
GO
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
            var currentBranch = 0;
            for(var branch in branches) {
                currentBranch++;
                var branchLength = branches[branch].length;
                var endpoint = branches[branch][branchLength - 1];
                var startpoint = branches[branch][0];
                var attribute = endpoint.attribute; // branch must end in attribute
                var idColumn = startpoint.tie ? startpoint.role.columnName : attribute.anchorReferenceName;
/*~
            SELECT
                $idColumn AS $anchor.identityColumnName, 
                CAST($attribute.valueColumnName AS VARBINARY(max)) AS [Value],
                '$endpoint.routedValueColumnName' AS [QualifiedType],
                $(attribute.timeRange)? CAST($attribute.changingColumnName AS $schema.metadata.chronon) AS [$schema.metadata.changingSuffix]
                $(!attribute.timeRange)? CAST(NULL AS $schema.metadata.chronon) AS [$schema.metadata.changingSuffix]
            FROM
~*/
                if(branchLength == 1) {
                    component = branches[branch][0];
                    attribute = component.attribute;
/*~
                [$attribute.capsule].[$attribute.name] 
~*/
                }
                else {
                    var firstRole, firstStop, secondRole, secondStop, mnemonic, referencedAnchor;
                    for(var i = 0; component = branches[branch][i]; i++) {
                        if (tie = component.tie) {
                            firstRole = component.role;
                            firstStop = component.stop;
                            component = branches[branch][++i];
                            secondRole = component.role;
                            secondStop = component.stop;
                            mnemonic = 'S' + firstStop + 'S' + secondStop;
/*~
                [$tie.capsule].[$tie.name] [$mnemonic] 
            JOIN            
~*/                     
                            if(secondRole.isAnchorRole()) {
                                referencedAnchor = secondRole.anchor;
/*~
                [$referencedAnchor.capsule].[$referencedAnchor.name] [$referencedAnchor.mnemonic] 
            ON
                [$referencedAnchor.mnemonic].$referencedAnchor.identityColumnName = [$mnemonic].$secondRole.columnName
            JOIN
~*/
                            }
                        }           
                        else if(attribute = component.attribute) {
/*~
                [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]      
            ON
                [$attribute.mnemonic].$attribute.anchorReferenceName = [$referencedAnchor.mnemonic].$referencedAnchor.identityColumnName
~*/                     
                        }
                    }
                }
/*~
            $(currentBranch < numberOfBranches)? UNION ALL
~*/
            }
/*~
        ) unified_timelines
    ) resolved_changes
    ORDER BY 
        ROW_NUMBER() OVER (
            PARTITION BY 
                $anchor.identityColumnName, 
                [$schema.metadata.changingSuffix] 
            ORDER BY
                (select 1)
        )
) twine
ON
    twine.$anchor.identityColumnName = [$anchor.mnemonic].$anchor.identityColumnName;
GO
~*/
            }
		}
	}
}

// Nexus key views (mirrors anchor key logic)
var nexus;
while (schema.nextNexus && (nexus = schema.nextNexus())) {
	if(nexus.keys) {
		for(route in nexus.keys) {
            numberOfStops = 0;
            numberOfBranches = 0;
            numberOfHistorizedAttributes = 0;
			key = nexus.keys[route];
            if(schema.NATURAL_KEY_ATTRIBUTES) {
                /*~
-- Materialized Natural Key Table -------------------------------------------------
-- $route key table for lookups of identities in $nexus.name
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$nexus.capsule$.$key.tableName', 'U') IS NOT NULL
DROP TABLE [$nexus.capsule].[$key.tableName];
GO

CREATE TABLE [$nexus.capsule].[$key.tableName](
    $nexus.identityColumnName $nexus.identityRange NOT NULL,
                ~*/
                for(stop in key.stops) {
                    component = key.stops[stop];
                    if(attribute = component.attribute) {
                        /*~
    $component.routedValueColumnName $attribute.dataRange NULL,
                        ~*/
                    }
                }
                /*~
    $(key.historized)? $key.changingColumnName $schema.metadata.chronon NOT NULL,
    $(schema.EQUIVALENCE)? $nexus.mnemonic$schema.metadata.equivalentSuffix $schema.metadata.equivalentRange NOT NULL,
    $(schema.METADATA)? $nexus.metadataColumnName $schema.metadata.metadataType NOT NULL,
    CONSTRAINT pk$key.tableName PRIMARY KEY CLUSTERED (
    ~*/
                if(key.historized) {
    /*~
        $nexus.identityColumnName,
        $key.changingColumnName
    ~*/
                }
                else {
    /*~
        $nexus.identityColumnName
    ~*/
                }
    /*~
    ),
    CONSTRAINT uq$key.tableName UNIQUE (
        $(schema.EQUIVALENCE)? $anchor.mnemonic$schema.metadata.equivalentSuffix,
    ~*/
                var numberOfStops = Object.keys(key.stops).length;
                var currentStopNumber = 0;
                for(stop in key.stops) {
                    currentStopNumber++;
                    var name = component.routedValueColumnName +',';
                    if(!key.historized && currentStopNumber === numberOfStops) {
                        name = component.routedValueColumnName;
                    }
                    component = key.stops[stop];
                    if(attribute = component.attribute) {
                        /*~
        $name
                        ~*/
                    }
                }
    /*~
        $(key.historized)? $key.changingColumnName
    )
);
GO
                ~*/
            }
/*~
-- Key view -----------------------------------------------------------------------------------------------------------
-- $route key view for lookups of identities in $nexus.name
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$nexus.capsule$.$key.name', 'V') IS NOT NULL
DROP VIEW [$nexus.capsule].[$key.name];
GO

CREATE VIEW [$nexus.capsule].[$key.name] WITH SCHEMABINDING AS
SELECT
~*/
            var branches = {}; // rearrange the route into its branches
			for(stop in key.stops) {
                numberOfStops++;
				component = key.stops[stop];
                if(component.branch) {
                    if(!branches[component.branch]) {
                        numberOfBranches++;
                        branches[component.branch] = [];
                    }
                    branches[component.branch].push(component);
                }
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
    [$nexus.mnemonic].$nexus.identityColumnName
FROM
    [$nexus.capsule].[$nexus.name] [$nexus.mnemonic]
~*/
            if(numberOfStops === 1) {
/*~
LEFT JOIN 
    [$attribute.capsule].[$attribute.name] twine
ON
    twine.$attribute.anchorReferenceName = [$nexus.mnemonic].$nexus.identityColumnName;
GO
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
                    $nexus.identityColumnName, 
                    $component.routedChangingColumnName
            ) AS $attribute.dataRange
        ) AS $component.routedValueColumnName,
~*/                 
                }
            }
/*~
        $nexus.identityColumnName,
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
                PARTITION BY $nexus.identityColumnName 
                ORDER BY [$schema.metadata.changingSuffix]
            ) AS $component.routedChangingColumnName,
~*/                 
                }
            }
/*~
            $nexus.identityColumnName,
            [Value],
            [QualifiedType],
            [$schema.metadata.changingSuffix]
        FROM (
~*/
            var currentBranch = 0;
            for(var branch in branches) {
                currentBranch++;
                var branchLength = branches[branch].length;
                var endpoint = branches[branch][branchLength - 1];
                var startpoint = branches[branch][0];
                var attribute = endpoint.attribute; // branch must end in attribute
                var idColumn = startpoint.tie ? startpoint.role.columnName : attribute.anchorReferenceName;
/*~
            SELECT
                $idColumn AS $nexus.identityColumnName, 
                CAST($attribute.valueColumnName AS VARBINARY(max)) AS [Value],
                '$endpoint.routedValueColumnName' AS [QualifiedType],
                $(attribute.timeRange)? CAST($attribute.changingColumnName AS $schema.metadata.chronon) AS [$schema.metadata.changingSuffix]
                $(!attribute.timeRange)? CAST(NULL AS $schema.metadata.chronon) AS [$schema.metadata.changingSuffix]
            FROM
~*/
                if(branchLength == 1) {
                    component = branches[branch][0];
                    attribute = component.attribute;
/*~
                [$attribute.capsule].[$attribute.name] 
~*/
                }
                else {
                    var firstRole, firstStop, secondRole, secondStop, mnemonic, referencedAnchor;
                    for(var i = 0; component = branches[branch][i]; i++) {
                        if (tie = component.tie) {
                            firstRole = component.role;
                            firstStop = component.stop;
                            component = branches[branch][++i];
                            secondRole = component.role;
                            secondStop = component.stop;
                            mnemonic = 'S' + firstStop + 'S' + secondStop;
/*~
                [$tie.capsule].[$tie.name] [$mnemonic] 
            JOIN            
~*/                     
                            if(secondRole.isAnchorRole()) {
                                referencedAnchor = secondRole.anchor;
/*~
                [$referencedAnchor.capsule].[$referencedAnchor.name] [$referencedAnchor.mnemonic] 
            ON
                [$referencedAnchor.mnemonic].$referencedAnchor.identityColumnName = [$mnemonic].$secondRole.columnName
            JOIN
~*/
                            }
                        }           
                        else if(attribute = component.attribute) {
/*~
                [$attribute.capsule].[$attribute.name] [$attribute.mnemonic]      
            ON
                [$attribute.mnemonic].$attribute.anchorReferenceName = [$referencedAnchor.mnemonic].$referencedAnchor.identityColumnName
~*/                     
                        }
                    }
                }
/*~
            $(currentBranch < numberOfBranches)? UNION ALL
~*/
            }
/*~
        ) unified_timelines
    ) resolved_changes
    ORDER BY 
        ROW_NUMBER() OVER (
            PARTITION BY 
                $nexus.identityColumnName, 
                [$schema.metadata.changingSuffix] 
            ORDER BY
                (select 1)
        )
) twine
ON
    twine.$nexus.identityColumnName = [$nexus.mnemonic].$nexus.identityColumnName;
GO
~*/
            }
		}
	}
}
