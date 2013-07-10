// set up some iterators for the different components
schema._iterator = {};
schema._iterator.knot = 0;
schema._iterator.anchor = 0;
schema._iterator.attribute = 0;
schema._iterator.historizedAttribute = 0;
schema._iterator.tie = 0;
schema._iterator.historizedTie = 0;
schema._iterator.role = 0;
schema._iterator.identifier = 0;

// set up helpers for knots
schema.nextKnot = function() {
    if(schema._iterator.knot == schema.knots.length) {
        schema._iterator.knot = 0;
        return null;
    }
    return schema.knot[schema.knots[schema._iterator.knot++]];
};
schema.hasMoreKnots = function() {
    return schema._iterator.knot < schema.knots.length;
};

// set up helpers for anchors
schema.nextAnchor = function() {
    if(schema._iterator.anchor == schema.anchors.length) {
        schema._iterator.anchor = 0;
        return null;
    }
    return schema.anchor[schema.anchors[schema._iterator.anchor++]];
};
schema.hasMoreAnchors = function() {
    return schema._iterator.anchor < schema.anchors.length;
};

var anchor;
while(anchor = schema.nextAnchor()) {
    anchor.historizedAttributes = [];
}

// set up helpers for attributes
while (anchor = schema.nextAnchor()) {
    anchor.nextAttribute = function() {
        if(schema._iterator.attribute == this.attributes.length) {
            schema._iterator.attribute = 0;
            return null;
        }
        return this.attribute[this.attributes[schema._iterator.attribute++]];
    };
    anchor.hasMoreAttributes = function() {
        return schema._iterator.attribute < this.attributes.length;
    };
}

var attribute;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        if(attribute.timeRange)
            anchor.historizedAttributes.push(attribute.mnemonic);
    }
}

while (anchor = schema.nextAnchor()) {
    anchor.nextHistorizedAttribute = function() {
        if(schema._iterator.historizedAttribute == this.historizedAttributes.length) {
            schema._iterator.historizedAttribute = 0;
            return null;
        }
        return this.attribute[this.historizedAttributes[schema._iterator.historizedAttribute++]];
    };
    anchor.hasMoreHistorizedAttributes = function() {
        return schema._iterator.historizedAttribute < this.historizedAttributes.length;
    };
}

// set up helpers for ties
schema.nextTie = function() {
    if(schema._iterator.tie == schema.ties.length) {
        schema._iterator.tie = 0;
        return null;
    }
    return schema.tie[schema.ties[schema._iterator.tie++]];
};
schema.hasMoreTies = function() {
    return schema._iterator.tie < schema.ties.length;
};

schema.historizedTies = [];
var tie;
for(var t = 0; tie = schema.tie[schema.ties[t]]; t++) {
    tie.identifiers = [];
    if(tie.timeRange)
        schema.historizedTies.push(schema.ties[t]);
}

schema.nextHistorizedTie = function() {
    if(schema._iterator.historizedTie == schema.historizedTies.length) {
        schema._iterator.historizedTie = 0;
        return null;
    }
    return schema.tie[schema.historizedTies[schema._iterator.historizedTie++]];
};
schema.hasMoreHistorizedTies = function() {
    return schema._iterator.historizedTie < schema.historizedTies.length;
};

// set up helpers for roles
while(tie = schema.nextTie()) {
    tie.nextRole = function() {
        if(schema._iterator.role == this.roles.length) {
            schema._iterator.role = 0;
            return null;
        }
        var anchorRole, knotRole;
        if(this.anchorRole)
            anchorRole = this.anchorRole[this.roles[schema._iterator.role]];
        if(this.knotRole)
            knotRole = this.knotRole[this.roles[schema._iterator.role]];
        schema._iterator.role++;
        return anchorRole || knotRole;
    };
    tie.hasMoreRoles = function() {
        return schema._iterator.role < this.roles.length;
    };
}

var role;
while (tie = schema.nextTie()) {
    while(role = tie.nextRole()) {
        if(role.type.length == 3)
            role.knot = role.type;
        if(role.type.length == 2)
            role.anchor = role.type;
        if(role.identifier == 'true')
            tie.identifiers.push(role.type + '_' + role.role);
    }
}

while (tie = schema.nextTie()) {
    tie.nextIdentifier = function() {
        if(schema._iterator.identifier == this.identifiers.length) {
            schema._iterator.identifier = 0;
            return null;
        }
        var anchorRole, knotRole;
        if(this.anchorRole)
            anchorRole = this.anchorRole[this.identifiers[schema._iterator.identifier]];
        if(this.knotRole)
            knotRole = this.knotRole[this.identifiers[schema._iterator.identifier]];
        schema._iterator.identifier++;
        return anchorRole || knotRole;
    };
    tie.hasMoreIdentifiers = function() {
        return schema._iterator.identifier < this.identifiers.length;
    }
}

// global variables
window.METADATA = schema.metadataUsage == 'true';
window.IMPROVED = schema.naming == 'improved';


