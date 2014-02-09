// the following builds the naming convention of Anchor Modeling, change if you want something else

// delimiter that is used in the naming convention
var D = '_';
var SID = 'SID';
var businessName;

// set some hard coded defaults if they are missing
schema.defaultCapsule = schema.defaultCapsule || 'dbo';
schema.chronon = schema.chronon || 'datetime';

var knot;
while (knot = schema.nextKnot()) {
    knot.name = knot.mnemonic + D + knot.descriptor;
    knot.businessName = knot.descriptor;
    knot.valueColumnName = knot.name;
    knot.identityColumnName = knot.mnemonic + D + schema.identitySuffix;
    knot.checksumColumnName = knot.mnemonic + D + schema.checksumSuffix;
    knot.capsule = knot.metadata.capsule || schema.defaultCapsule;
    knot.metadataColumnName = schema.metadataPrefix + D + knot.mnemonic;
    knot.toString = function() { return this.mnemonic; };
}

// warn about naming clashes for business names
if(BUSINESS_VIEWS) {
    var knots = {};
    while (knot = schema.nextKnot()) {
        if(!knots[knot.businessName])
            knots[knot.businessName] = [knot];
        else
            knots[knot.businessName].push(knot);
    }
    for(businessName in knots) {
        if(knots[businessName].length > 1)
            alert(
                "WARNING: The knots " + knots[businessName].join(' and ') +
                " all have the same business name: " + businessName + "."
            );
    }
}

var anchor;
while (anchor = schema.nextAnchor()) {
    anchor.name = anchor.mnemonic + D + anchor.descriptor;
    anchor.businessName = anchor.descriptor;
    anchor.identityColumnName = anchor.mnemonic + D + schema.identitySuffix;
    anchor.capsule = anchor.metadata.capsule || schema.defaultCapsule;
    anchor.metadataColumnName = schema.metadataPrefix + D + anchor.mnemonic;
    anchor.dummyColumnName = anchor.mnemonic + D + schema.dummySuffix;
    anchor.businessIdentityColumnName = anchor.descriptor + D + SID;
    anchor.toString = function() { return this.mnemonic; };
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        attribute.uniqueMnemonic = anchor.mnemonic + D + attribute.mnemonic;
        attribute.name = attribute.uniqueMnemonic + D + anchor.descriptor + D + attribute.descriptor;
        attribute.businessName = attribute.descriptor;
        attribute.positName = attribute.name + D + schema.positSuffix;
        attribute.annexName = attribute.name + D + schema.annexSuffix;
        attribute.checksumColumnName = attribute.uniqueMnemonic + D + schema.checksumSuffix;
        attribute.identityColumnName = attribute.uniqueMnemonic + D + schema.identitySuffix;
        attribute.metadataColumnName = schema.metadataPrefix + D + attribute.uniqueMnemonic;
        attribute.versionColumnName = attribute.uniqueMnemonic + D + schema.versionSuffix;
        attribute.positingColumnName = attribute.uniqueMnemonic + D + schema.positingSuffix;
        attribute.positorColumnName = attribute.uniqueMnemonic + D + schema.positorSuffix;
        attribute.reliabilityColumnName = attribute.uniqueMnemonic + D + schema.reliabilitySuffix;
        attribute.reliableColumnName = attribute.uniqueMnemonic + D + schema.reliableSuffix;
        attribute.statementTypeColumnName = attribute.uniqueMnemonic + D + schema.statementTypeSuffix;
        if(IMPROVED) {
            attribute.anchorReferenceName = attribute.uniqueMnemonic + D + anchor.mnemonic + D + schema.identitySuffix;
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                attribute.knotReferenceName = attribute.uniqueMnemonic + D + attribute.knotRange + D + schema.identitySuffix;
                attribute.knotValueColumnName = attribute.uniqueMnemonic + D + knot.name;
                attribute.knotMetadataColumnName = attribute.uniqueMnemonic + D + knot.metadataColumnName;
            }
        }
        else {
            attribute.anchorReferenceName = anchor.identityColumnName;
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                attribute.knotReferenceName = attribute.knotRange + D + schema.identitySuffix;
                attribute.knotValueColumnName = knot.name;
                attribute.knotMetadataColumnName = knot.metadataColumnName;
            }
        }
        attribute.valueColumnName = attribute.knotReferenceName || attribute.name;
        // historized
        if(attribute.isHistorized()) {
            attribute.changingColumnName = attribute.uniqueMnemonic + D + schema.changingSuffix;
        }
        attribute.capsule = attribute.metadata.capsule || schema.defaultCapsule;
        attribute.toString = function() { return this.mnemonic; };
    }
}

// warn about naming clashes for business names
if(BUSINESS_VIEWS) {
    var anchors = {};
    while (anchor = schema.nextAnchor()) {
        if(!anchors[anchor.businessName])
            anchors[anchor.businessName] = [anchor];
        else
            anchors[anchor.businessName].push(anchor);
        var attributes = {};
        while (attribute = anchor.nextAttribute()) {
            if(!attributes[attribute.businessName])
                attributes[attribute.businessName] = [attribute];
            else
                attributes[attribute.businessName].push(attribute);
        }
        for(businessName in attributes) {
            if(attributes[businessName].length > 1)
                alert(
                    "WARNING: The attributes " + attributes[businessName].join(' and ') +
                    " on the anchor " + anchor.name +
                    " all have the same business name: " + businessName + "."
                );
        }
    }
    for(businessName in anchors) {
        if(anchors[businessName].length > 1)
            alert(
                "WARNING: The anchors " + anchors[businessName].join(' and ') +
                " all have the same business name: " + businessName + "."
            );
    }
}

var tie;
while (tie = schema.nextTie()) {
    var name = '';
    var role;
    while (role = tie.nextRole()) {
        role.name = role.type + D + role.role;
        if(role.knot)
            role.businessName = role.knot.descriptor + D + role.role;
        else
            role.businessName = role.anchor.descriptor + D + role.role;
        role.businessColumnName = role.businessName + D + SID;
        role.columnName = role.type + D + schema.identitySuffix + D + role.role;
        if(role.knot) {
            knot = role.knot;
            if(IMPROVED) {
                role.knotValueColumnName = role.role + D + knot.valueColumnName;
                role.knotMetadataColumnName = role.role + D + knot.metadataColumnName;
            }
            else {
                role.knotValueColumnName = knot.valueColumnName;
                role.knotMetadataColumnName = knot.metadataColumnName;
            }
        }
        name += role.name;
        businessName += role.businessName;
        if(tie.hasMoreRoles()) {
            name += D;
            businessName += D;
        }
    }
    tie.name = name;
    tie.businessName = businessName;
    tie.positName = tie.name + D + schema.positSuffix;
    tie.annexName = tie.name + D + schema.annexSuffix;
    tie.identityColumnName = tie.name + D + schema.identitySuffix;
    tie.positingColumnName = tie.name + D + schema.positingSuffix;
    tie.positorColumnName = tie.name + D + schema.positorSuffix;
    tie.reliabilityColumnName = tie.name + D + schema.reliabilitySuffix;
    tie.reliableColumnName = tie.name + D + schema.reliableSuffix;
    tie.capsule = tie.metadata.capsule || schema.defaultCapsule;
    tie.metadataColumnName = schema.metadataPrefix + D + tie.name;
    tie.versionColumnName = tie.name + D + schema.versionSuffix;
    tie.statementTypeColumnName = tie.name + D + schema.statementTypeSuffix;
    if(tie.timeRange) {
        tie.changingColumnName = tie.name + D + schema.changingSuffix;
    }
    tie.toString = function() { return tie.name; };
}

// warn about naming clashes for business names
if(BUSINESS_VIEWS) {
    var ties = {};
    while (tie = schema.nextTie()) {
        if(!ties[tie.businessName])
            ties[tie.businessName] = [tie];
        else
            ties[knot.businessName].push(tie);
    }
    for(businessName in ties) {
        if(ties[businessName].length > 1)
            alert(
                "WARNING: The ties " + ties[businessName].join(' and ') +
                " all have the same business name: " + businessName + "."
            );
    }
}
