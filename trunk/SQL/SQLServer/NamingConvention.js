// the following builds the naming convention of Anchor Modeling, change if you want something else

// delimiter that is used in the naming convention
var D = '_';
var defaultCapsule = schema.defaultCapsule || 'dbo';

var knot;
while (knot = schema.nextKnot()) {
    knot.name = knot.mnemonic + D + knot.descriptor;
    knot.valueColumnName = knot.name;
    knot.identityColumnName = knot.mnemonic + D + schema.identitySuffix;
    knot.capsule = knot.metadata.capsule || defaultCapsule;
    knot.metadataColumnName = schema.metadataPrefix + D + knot.mnemonic;
}

var anchor;
while (anchor = schema.nextAnchor()) {
    anchor.name = anchor.mnemonic + D + anchor.descriptor;
    anchor.identityColumnName = anchor.mnemonic + D + schema.identitySuffix;
    anchor.capsule = anchor.metadata.capsule || defaultCapsule;
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
        attribute.statementTypeColumnName = attribute.uniqueMnemonic + D + schema.statementTypeSuffix;
        if(schema.naming == 'improved') {
            attribute.anchorReferenceName = attribute.uniqueMnemonic + D + anchor.mnemonic + D + schema.identitySuffix;
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
                attribute.knotReferenceName = attribute.uniqueMnemonic + D + attribute.knotRange + D + schema.identitySuffix;
                attribute.knotValueColumnName = attribute.uniqueMnemonic + D + knot.name;
                attribute.knotMetadataColumnName = attribute.uniqueMnemonic + D + knot.metadataColumnName;
            }
        }
        else {
            attribute.anchorReferenceName = anchor.identityColumnName;
            if(attribute.knotRange) {
                knot = schema.knot[attribute.knotRange];
                attribute.knotReferenceName = attribute.knotRange + D + schema.identitySuffix;
                attribute.knotValueColumnName = knot.name;
                attribute.knotMetadataColumnName = knot.metadataColumnName;
            }
        }
        attribute.valueColumnName = attribute.knotReferenceName || attribute.name;
        // historized
        if(attribute.timeRange) {
            attribute.changingColumnName = attribute.uniqueMnemonic + D + schema.changingSuffix;
        }
        attribute.capsule = attribute.metadata.capsule || defaultCapsule;
    }
}

var tie;
while (tie = schema.nextTie()) {
    var name = '';
    var role;
    while (role = tie.nextRole()) {
        role.name = role.type + D + role.role;
        role.columnName = role.type + D + schema.identitySuffix + D + role.role;
        name += role.name;
        if(tie.hasMoreRoles()) name += D;
    }
    tie.name = name;
    tie.positName = tie.name + D + schema.positSuffix;
    tie.annexName = tie.name + D + schema.annexSuffix;
    tie.identityColumnName = tie.name + D + schema.identitySuffix;
    tie.capsule = tie.metadata.capsule || defaultCapsule;
    tie.metadataColumnName = schema.metadataPrefix + D + tie.name;
    if(tie.timeRange) {
        tie.changingColumnName = tie.name + D + schema.changingSuffix;
    }
}
