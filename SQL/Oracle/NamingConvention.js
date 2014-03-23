// the following builds the naming convention of Anchor Modeling, change if you want something else

// delimiter that is used in the naming convention
var D = '_';

// set some hard coded defaults if they are missing
schema.metadata.defaultCapsule = schema.metadata.defaultCapsule || 'dbo';
schema.metadata.chronon = schema.metadata.chronon || 'datetime';

var knot;
while (knot = schema.nextKnot()) {
    knot.name = knot.mnemonic + D + knot.descriptor;
    knot.valueColumnName = knot.name;
    knot.identityColumnName = knot.mnemonic + D + schema.metadata.identitySuffix;
    knot.capsule = knot.metadata.capsule || schema.metadata.defaultCapsule;
    knot.metadataColumnName = schema.metadata.metadataPrefix + D + knot.mnemonic;
}

var anchor;
while (anchor = schema.nextAnchor()) {
    anchor.name = anchor.mnemonic + D + anchor.descriptor;
    anchor.identityColumnName = anchor.mnemonic + D + schema.metadata.identitySuffix;
    anchor.capsule = anchor.metadata.capsule || schema.metadata.defaultCapsule;
    anchor.metadataColumnName = schema.metadata.metadataPrefix + D + anchor.mnemonic;
    anchor.dummyColumnName = anchor.mnemonic + D + schema.metadata.dummySuffix;
    var attribute;
    while (attribute = anchor.nextAttribute()) {
        attribute.uniqueMnemonic = attribute.mnemonic;
//        attribute.uniqueMnemonic = anchor.mnemonic + D + attribute.mnemonic;
        attribute.tablename = anchor.name + D + "Attr";
        anchor.attributeTableName = attribute.tablename;
        attribute.name = attribute.uniqueMnemonic + D + attribute.descriptor;
//        attribute.name = attribute.uniqueMnemonic + D + anchor.descriptor + D + attribute.descriptor;
        attribute.positName = attribute.name + D + schema.metadata.positSuffix;
        attribute.annexName = attribute.name + D + schema.metadata.annexSuffix;
        attribute.identityColumnName = attribute.uniqueMnemonic + D + schema.metadata.identitySuffix;
        attribute.metadataColumnName = schema.metadata.metadataPrefix + D + attribute.uniqueMnemonic;
        attribute.versionColumnName = attribute.uniqueMnemonic + D + schema.metadata.versionSuffix;
        attribute.positingColumnName = attribute.uniqueMnemonic + D + schema.metadata.positingSuffix;
        attribute.positorColumnName = attribute.uniqueMnemonic + D + schema.metadata.positorSuffix;
        attribute.reliabilityColumnName = attribute.uniqueMnemonic + D + schema.metadata.reliabilitySuffix;
        attribute.reliableColumnName = attribute.uniqueMnemonic + D + schema.metadata.reliableSuffix;
        attribute.statementTypeColumnName = attribute.uniqueMnemonic + D + schema.metadata.statementTypeSuffix;
        if(schema.IMPROVED) {
            attribute.anchorReferenceName = anchor.identityColumnName;
//            attribute.anchorReferenceName = attribute.uniqueMnemonic + D + anchor.mnemonic + D + schema.metadata.identitySuffix;
            if(attribute.isKnotted()) {
                knot = attribute.knot;
                attribute.knotReferenceName = attribute.uniqueMnemonic + D + attribute.knotRange + D + schema.metadata.identitySuffix;
                attribute.knotValueColumnName = attribute.uniqueMnemonic + D + knot.name;
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
    }
}

var tie;
while (tie = schema.nextTie()) {
    var name = '';
    var role;
    while (role = tie.nextRole()) {
        role.name = role.type + D + role.role;
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
        if(tie.hasMoreRoles()) name += D;
    }
    tie.name = name;
    tie.positName = tie.name + D + schema.metadata.positSuffix;
    tie.annexName = tie.name + D + schema.metadata.annexSuffix;
    tie.identityColumnName = tie.name + D + schema.metadata.identitySuffix;
    tie.identity = 'bigint'; // TODO: remove hard coded value
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
}

// This code dispatches relations and knots from ties to a an anchors instead of an actuall TIE
// Loop throug all anchors and look in the xml tie if its dependent on some other objets described as ROLEs or TIEs
while (anchor = schema.nextAnchor()) {
    var tie;
    while (tie = schema.nextTie()) {
        var role;
        var currentAnchorTable = anchor.name, exportAttr, exportAttrFromTable, exportAttrToTable, anchorRoleFather, anchorRoleFatherId, knotRoleFather, childTable, knotRoleFatherType, i = 0;
        while (role = tie.nextRole()) {
            // anchorRole always comes before knorRole. Last achorRole will be set as father for all comming anchorKnots
            if (!role.knot){ // anchorRole
                i++;
                if (1 == i){ // first anchorRole will be set as father to the rest of the anchorRoles
                    anchorRoleFather = role.anchor.name;
                    anchorRoleFatherId = role.anchor.identityColumnName;
                } else if (anchor.mnemonic == role.type){ // does this anchor belong to someone
                    childTable = role.anchor.name;
                    if (anchorRoleFather == childTable){ // Exception for "Self join/join by prior"
                        role.exportAttr = (anchorRoleFatherId + "_parent").substr(0,30);
                    } else { // Ordinary forein key constraint 
                        role.exportAttr = anchorRoleFatherId;
                    }
                    role.exportAttrFromTable = anchorRoleFather;
                    role.exportAttrToTable = childTable;
                    role.exportRelation = "FOREIN KEY";
                }
                knotRoleFather = role.anchor.name;
                knotRoleFatherType = role.type; // matches anchor.mnemonic
            } else { // knotRole
                // If there is knotRole check if previus anchorRole matches current currentAnchorTable
                //if (knotRoleFather == currentAnchorTable){
                if (anchor.mnemonic == knotRoleFatherType){
                    role.exportAttr = role.type + D + schema.metadata.identitySuffix;
                    role.exportAttrFromTable = tie.name;
                    role.exportAttrToTable = currentAnchorTable;
                    role.exportRelation = "KNOT";
                }
            }
        }
    }
}

