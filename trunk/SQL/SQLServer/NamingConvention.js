// the following builds the naming convention of Anchor Modeling, change if you want something else

// delimiter that is used in the naming convention
var D = '_';

// used in business naming
var businessIdentity = 'Id';
var businessName;

// set some hard coded defaults if they are missing
schema.metadata.defaultCapsule = schema.metadata.defaultCapsule || 'dbo';
schema.metadata.chronon = schema.metadata.chronon || 'datetime';

var knot;
while (knot = schema.nextKnot()) {
    knot.name = knot.mnemonic + D + knot.descriptor;
    knot.businessName = knot.descriptor;
    knot.valueColumnName = knot.name;
    knot.identityColumnName = knot.mnemonic + D + schema.metadata.identitySuffix;
    knot.checksumColumnName = knot.mnemonic + D + schema.metadata.checksumSuffix;
    knot.capsule = knot.metadata.capsule || schema.metadata.defaultCapsule;
    knot.metadataColumnName = schema.metadata.metadataPrefix + D + knot.mnemonic;
    knot.toString = function() { return this.mnemonic; };
}

// warn about naming clashes for business names
if(schema.BUSINESS_VIEWS) {
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
    anchor.identityColumnName = anchor.mnemonic + D + schema.metadata.identitySuffix;
    anchor.capsule = anchor.metadata.capsule || schema.metadata.defaultCapsule;
    anchor.metadataColumnName = schema.metadata.metadataPrefix + D + anchor.mnemonic;
    anchor.dummyColumnName = anchor.mnemonic + D + schema.metadata.dummySuffix;
    anchor.businessIdentityColumnName = anchor.descriptor + D + businessIdentity;
    anchor.toString = function() { return this.mnemonic; };
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        attribute.uniqueMnemonic = anchor.mnemonic + D + attribute.mnemonic;
        attribute.name = attribute.uniqueMnemonic + D + anchor.descriptor + D + attribute.descriptor;
        attribute.businessName = attribute.descriptor;
        attribute.positName = attribute.name + D + schema.metadata.positSuffix;
        attribute.annexName = attribute.name + D + schema.metadata.annexSuffix;
        attribute.checksumColumnName = attribute.uniqueMnemonic + D + schema.metadata.checksumSuffix;
        attribute.identityColumnName = attribute.uniqueMnemonic + D + schema.metadata.identitySuffix;
        attribute.metadataColumnName = schema.metadata.metadataPrefix + D + attribute.uniqueMnemonic;
        attribute.versionColumnName = attribute.uniqueMnemonic + D + schema.metadata.versionSuffix;
        attribute.positingColumnName = attribute.uniqueMnemonic + D + schema.metadata.positingSuffix;
        attribute.positorColumnName = attribute.uniqueMnemonic + D + schema.metadata.positorSuffix;
        attribute.reliabilityColumnName = attribute.uniqueMnemonic + D + schema.metadata.reliabilitySuffix;
        attribute.reliableColumnName = attribute.uniqueMnemonic + D + schema.metadata.reliableSuffix;
        attribute.statementTypeColumnName = attribute.uniqueMnemonic + D + schema.metadata.statementTypeSuffix;
        if(schema.IMPROVED) {
            attribute.anchorReferenceName = attribute.uniqueMnemonic + D + anchor.mnemonic + D + schema.metadata.identitySuffix;
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                attribute.knotReferenceName = attribute.uniqueMnemonic + D + attribute.knotRange + D + schema.metadata.identitySuffix;
                attribute.knotValueColumnName = attribute.uniqueMnemonic + D + knot.name;
                attribute.knotChecksumColumnName = attribute.uniqueMnemonic + D + knot.checksumColumnName;
                attribute.knotMetadataColumnName = attribute.uniqueMnemonic + D + knot.metadataColumnName;
            }
        }
        else {
            attribute.anchorReferenceName = anchor.identityColumnName;
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                attribute.knotReferenceName = attribute.knotRange + D + schema.metadata.identitySuffix;
                attribute.knotValueColumnName = knot.name;
                attribute.knotMetadataColumnName = knot.metadataColumnName;
            }
        }
        attribute.valueColumnName = attribute.knotReferenceName || attribute.name;
        // historized
        if(attribute.isHistorized()) {
            attribute.changingColumnName = attribute.uniqueMnemonic + D + schema.metadata.changingSuffix;
        }
        attribute.capsule = attribute.metadata.capsule || schema.metadata.defaultCapsule;
        attribute.toString = function() { return this.mnemonic; };
    }
}

// warn about naming clashes for business names
if(schema.BUSINESS_VIEWS) {
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
    var name = '', bName = '';
    var role;
    while (role = tie.nextRole()) {
        role.name = role.type + D + role.role;
        if(role.knot)
            role.businessName = role.knot.descriptor + D + role.role;
        else
            role.businessName = role.anchor.descriptor + D + role.role;
        role.businessColumnName = role.businessName + D + businessIdentity;
        role.columnName = role.type + D + schema.metadata.identitySuffix + D + role.role;
        if(role.knot) {
            knot = role.knot;
            if(schema.IMPROVED) {
                role.knotValueColumnName = role.role + D + knot.valueColumnName;
                role.knotMetadataColumnName = role.role + D + knot.metadataColumnName;
            }
            else {
                role.knotValueColumnName = knot.valueColumnName;
                role.knotMetadataColumnName = knot.metadataColumnName;
            }
        }
        name += role.name;
        bName += role.businessName;
        if(tie.hasMoreRoles()) {
            name += D;
            bName += D;
        }
    }
    tie.name = name;
    tie.businessName = bName;
    tie.positName = tie.name + D + schema.metadata.positSuffix;
    tie.annexName = tie.name + D + schema.metadata.annexSuffix;
    tie.identityColumnName = tie.name + D + schema.metadata.identitySuffix;
    tie.positingColumnName = tie.name + D + schema.metadata.positingSuffix;
    tie.positorColumnName = tie.name + D + schema.metadata.positorSuffix;
    tie.reliabilityColumnName = tie.name + D + schema.metadata.reliabilitySuffix;
    tie.reliableColumnName = tie.name + D + schema.metadata.reliableSuffix;
    tie.capsule = tie.metadata.capsule || schema.metadata.defaultCapsule;
    tie.metadataColumnName = schema.metadata.metadataPrefix + D + tie.name;
    tie.versionColumnName = tie.name + D + schema.metadata.versionSuffix;
    tie.statementTypeColumnName = tie.name + D + schema.metadata.statementTypeSuffix;
    if(tie.timeRange) {
        tie.changingColumnName = tie.name + D + schema.metadata.changingSuffix;
    }
    tie.toString = function() { return tie.name; };
}

// warn about naming clashes for business names
if(schema.BUSINESS_VIEWS) {
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
