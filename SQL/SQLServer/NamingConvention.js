// the following builds the naming convention of Anchor Modeling, change if you want something else

// delimiter that is used in the naming convention
var D = '_';
var defaultCapsule = schema.defaultCapsule || 'dbo';

var knot;
for(var k = 0; knot = schema.knot[schema.knots[k]]; k++) {
    knot.name = knot.mnemonic + D + knot.descriptor;
    knot.valueColumnName = knot.name;
    knot.identityColumnName = knot.mnemonic + D + schema.identitySuffix;
    knot.capsule = knot.metadata.capsule || defaultCapsule;
    knot.metadataColumnName = schema.metadataPrefix + D + knot.mnemonic;
}

var anchor;
for(var a = 0; anchor = schema.anchor[schema.anchors[a]]; a++) {
    anchor.name = anchor.mnemonic + D + anchor.descriptor;
    anchor.identityColumnName = anchor.mnemonic + D + schema.identitySuffix;
    anchor.capsule = anchor.metadata.capsule || defaultCapsule;
    anchor.metadataColumnName = schema.metadataPrefix + D + anchor.mnemonic;
    anchor.dummyColumnName = anchor.mnemonic + D + schema.dummySuffix;
    var attribute;
    for(var b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
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
for(var t = 0; tie = schema.tie[schema.ties[t]]; t++) {
    var name = '';
    var key, anchorRole, knotRole;
    for(var r = 0; r < tie.roles.length; r++) {
        key = tie.roles[r];
        anchorRole = tie.anchorRole ? tie.anchorRole[key] : null;
        knotRole = tie.knotRole ? tie.knotRole[key] : null;
        var role = anchorRole ? anchorRole : knotRole;
        role.name = role.type + D + role.role;
        role.columnName = role.type + D + schema.identitySuffix + D + role.role;
        name += role.name;
        if(!role.last) name += D;
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
