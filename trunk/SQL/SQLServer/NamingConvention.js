// the following builds the naming convention of Anchor Modeling, change if you want something else

// delimiter that is used in the naming convention
var D = '_';
var defaultCapsule = 'dbo';

var knot;
for(var k = 0; knot = schema.knot[schema.knots[k]]; k++) {
    knot.name = knot.mnemonic + D + knot.descriptor;
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
    var attribute;
    for(var b = 0; attribute = anchor.attribute[anchor.attributes[b]]; b++) {
        attribute.name = anchor.mnemonic + D + attribute.mnemonic + D + anchor.descriptor + D + attribute.descriptor;
        attribute.positName = attribute.name + D + schema.positSuffix;
        attribute.annexName = attribute.name + D + schema.annexSuffix;
        attribute.identityColumnName = anchor.mnemonic + D + attribute.mnemonic + D + schema.identitySuffix;
        attribute.metadataColumnName = schema.metadataPrefix + D + anchor.mnemonic + D + attribute.mnemonic;
        if(schema.naming = 'improved') {
            attribute.anchorReferenceName = anchor.mnemonic + D + attribute.mnemonic + D + anchor.mnemonic + D + schema.identitySuffix;
            if(attribute.knotRange)
                attribute.knotReferenceName = anchor.mnemonic + D + attribute.mnemonic + D + attribute.knotRange + D + schema.identitySuffix;
        }
        else {
            attribute.anchorReferenceName = anchor.identityColumnName;
            if(attribute.knotRange)
                attribute.knotReferenceName = attribute.knotRange + D + schema.identitySuffix;
        }
        // historized
        if(attribute.timeRange) {
            attribute.changingColumnName = anchor.mnemonic + D + attribute.mnemonic + D + schema.changingSuffix;
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
