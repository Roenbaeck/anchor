// the following builds the naming convention of Anchor Modeling, change if you want something else

// delimiter that is used in the naming convention
var D = '_';

// set some hard coded defaults if they are missing
schema.defaultCapsule = schema.defaultCapsule || 'dbo';
schema.chronon = schema.chronon || 'datetime';

var knot;
while (knot = schema.nextKnot()) {
    knot.name = knot.mnemonic + D + knot.descriptor;
    knot.valueColumnName = knot.name;
    knot.identityColumnName = knot.mnemonic + D + schema.identitySuffix;
    knot.capsule = knot.metadata.capsule || schema.defaultCapsule;
    knot.metadataColumnName = schema.metadataPrefix + D + knot.mnemonic;
}

var anchor;
while (anchor = schema.nextAnchor()) {
    anchor.name = anchor.mnemonic + D + anchor.descriptor;
    anchor.identityColumnName = anchor.mnemonic + D + schema.identitySuffix;
    anchor.capsule = anchor.metadata.capsule || schema.defaultCapsule;
    anchor.metadataColumnName = schema.metadataPrefix + D + anchor.mnemonic;
    anchor.dummyColumnName = anchor.mnemonic + D + schema.dummySuffix;
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        attribute.uniqueMnemonic = anchor.mnemonic + D + attribute.mnemonic;
        attribute.name = attribute.uniqueMnemonic + D + anchor.descriptor + D + attribute.descriptor;
        attribute.positName = attribute.name + D + schema.positSuffix;
        attribute.annexName = attribute.name + D + schema.annexSuffix;
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
    }
}

var tie;
while (tie = schema.nextTie()) {
    var name = '';
    var role;
    while (role = tie.nextRole()) {
        role.name = role.type + D + role.role;
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
        if(tie.hasMoreRoles()) name += D;
    }
    tie.name = name;
    tie.positName = tie.name + D + schema.positSuffix;
    tie.annexName = tie.name + D + schema.annexSuffix;
    tie.identityColumnName = tie.name + D + schema.identitySuffix;
    tie.identity = 'bigint'; // TODO: remove hard coded value
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
}
