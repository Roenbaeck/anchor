// set up some iterators for the different components
schema._iterator = {};
schema._iterator.knot = 0;
schema._iterator.anchor = 0;
schema._iterator.attribute = 0;
schema._iterator.historizedAttribute = 0;
schema._iterator.tie = 0;
schema._iterator.historizedTie = 0;
schema._iterator.role = 0;
schema._iterator.knotRole = 0;
schema._iterator.anchorRole = 0;
schema._iterator.identifier = 0;
schema._iterator.value = 0;

// set up helpers for knots
schema.nextKnot = function() {
    if(!schema.knots) return null;
    if(schema._iterator.knot == schema.knots.length) {
        schema._iterator.knot = 0;
        return null;
    }
    return schema.knot[schema.knots[schema._iterator.knot++]];
};
schema.hasMoreKnots = function() {
    if(!schema.knots) return false;
    return schema._iterator.knot < schema.knots.length;
};
schema.isFirstKnot = function() {
    return schema._iterator.knot == 1;
};

var knot;
while(knot = schema.nextKnot()) {
    knot.isGenerator = function() {
        return this.metadata.generator == 'true';
    };
    knot.isEquivalent = function() {
        return this.metadata.equivalent == 'true';
    };
    knot.hasChecksum = function() {
        return this.metadata.checksum == 'true';
    };
}

// set up helpers for anchors
schema.nextAnchor = function() {
    if(!schema.anchors) return null;
    if(schema._iterator.anchor == schema.anchors.length) {
        schema._iterator.anchor = 0;
        return null;
    }
    return schema.anchor[schema.anchors[schema._iterator.anchor++]];
};
schema.hasMoreAnchors = function() {
    if(!schema.anchors) return false;
    return schema._iterator.anchor < schema.anchors.length;
};
schema.isFirstAnchor = function() {
    return schema._iterator.anchor == 1;
};

var anchor;
while(anchor = schema.nextAnchor()) {
    anchor.historizedAttributes = [];
    anchor.isGenerator = function() {
        return this.metadata.generator == 'true';
    };
}

// set up helpers for attributes
while (anchor = schema.nextAnchor()) {
    anchor.nextAttribute = function() {
        if(!this.attributes) return null;
        if(schema._iterator.attribute == this.attributes.length) {
            schema._iterator.attribute = 0;
            return null;
        }
        return this.attribute[this.attributes[schema._iterator.attribute++]];
    };
    anchor.hasMoreAttributes = function() {
        if(!this.attributes) return false;
        return schema._iterator.attribute < this.attributes.length;
    };
    anchor.isFirstAttribute = function() {
        return schema._iterator.attribute == 1;
    };
}

var attribute;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        attribute.isGenerator = function() {
            return this.metadata.generator == 'true';
        };
        attribute.isKnotted = function() {
            return !!this['knotRange'];
        };
        attribute.isIdempotent = function() {
            return this.metadata.idempotent == 'true';
        };
        attribute.isAssertive = function() {
            return this.metadata.assertive == 'true';
        };
        attribute.isEquivalent = function() {
            return this.metadata.equivalent == 'true';
        };
        attribute.isDeletable = function() {
            return this.metadata.deletable == 'true';
        };
        attribute.isRestatable = function() {
            return this.metadata.restatable == 'true';
        };
        attribute.hasChecksum = function() {
            return this.metadata.checksum == 'true';
        };
        attribute.isHistorized = function() {
            return !!this['timeRange'];
        };
        attribute.getEncryptionGroup = function() {
            if(!this.metadata.encryptionGroup || this.metadata.encryptionGroup.trim().length === 0) 
                return;
            return this.metadata.encryptionGroup;
        };
        if(attribute.isHistorized())
            anchor.historizedAttributes.push(attribute.mnemonic);
        if(attribute.isKnotted())
            attribute.knot = schema.knot[attribute.knotRange];
        if(attribute.getEncryptionGroup()) {
            attribute.originalDataRange = attribute.dataRange;
            attribute.dataRange = 'varbinary(max)';
        }
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
    anchor.isFirstHistorizedAttribute = function() {
        return schema._iterator.historizedAttribute == 1;
    };
}

// set up helpers for ties
schema.nextTie = function() {
    if(!schema.ties) return null;
    if(schema._iterator.tie == schema.ties.length) {
        schema._iterator.tie = 0;
        return null;
    }
    return schema.tie[schema.ties[schema._iterator.tie++]];
};
schema.hasMoreTies = function() {
    if(!schema.ties) return false;
    return schema._iterator.tie < schema.ties.length;
};
schema.isFirstTie = function() {
    return schema._iterator.tie == 1;
};


schema.historizedTies = [];
var tie;
while(tie = schema.nextTie()) {
    tie.identifiers = [];
    tie.values = [];
    tie.knotRoles = [];
    tie.anchorRoles = [];
    tie.isGenerator = function() {
        return this.metadata.generator == 'true';
    };
    tie.isKnotted = function() {
        return !!this['knotRole'];
    };
    tie.isHistorized = function() {
        return !!this['timeRange'];
    };
    tie.isDeletable = function() {
        return this.metadata.deletable == 'true';
    };
    tie.isRestatable = function() {
        return this.metadata.restatable == 'true';
    };
    tie.isIdempotent = function() {
        return this.metadata.idempotent == 'true';
    };
    tie.isAssertive = function() {
        return this.metadata.assertive == 'true';
    };
    if(tie.isHistorized())
        schema.historizedTies.push(tie.id);
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
schema.isFirstHistorizedTie = function() {
    return schema._iterator.historizedTie == 1;
};


// set up helpers for roles
while(tie = schema.nextTie()) {
    tie.nextRole = function() {
        if(!this.roles) return null;
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
        if(!this.roles) return false;
        return schema._iterator.role < this.roles.length;
    };
    tie.isFirstRole = function() {
        return schema._iterator.role == 1;
    };
}

var role;
while (tie = schema.nextTie()) {
    while(role = tie.nextRole()) {
        role.isIdentifier = function() {
            return this.identifier == 'true';
        };
        role.isKnotRole = function() {
            return schema.knot[this.type] != null;
        };
        role.isAnchorRole = function() {
            return schema.anchor[this.type] != null;
        };
        if(schema.hasMoreKnots() && schema.knot[role.type]) {
            role.knot = schema.knot[role.type];
            tie.knotRoles.push(role.id);
        }
        else if(schema.hasMoreAnchors() && schema.anchor[role.type]) {
            role.anchor = schema.anchor[role.type];
            tie.anchorRoles.push(role.id);
        }
        if(role.isIdentifier())
            tie.identifiers.push(role.id);
        else
            tie.values.push(role.id);
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
    };
    tie.isFirstIdentifier = function() {
        return schema._iterator.identifier == 1;
    };
    tie.nextValue = function() {
        if(schema._iterator.value == this.values.length) {
            schema._iterator.value = 0;
            return null;
        }
        var anchorRole, knotRole;
        if(this.anchorRole)
            anchorRole = this.anchorRole[this.values[schema._iterator.value]];
        if(this.knotRole)
            knotRole = this.knotRole[this.values[schema._iterator.value]];
        schema._iterator.value++;
        return anchorRole || knotRole;
    };
    tie.hasMoreValues = function() {
        return schema._iterator.value < this.values.length;
    };
    tie.isFirstValue = function() {
        return schema._iterator.value == 1;
    };
    tie.nextKnotRole = function() {
        if(schema._iterator.knotRole == this.knotRoles.length) {
            schema._iterator.knotRole = 0;
            return null;
        }
        return this.knotRole[this.knotRoles[schema._iterator.knotRole++]];
    };
    tie.hasMoreKnotRoles = function() {
        return schema._iterator.knotRole < this.knotRoles.length;
    };
    tie.isFirstKnotRole = function() {
        return schema._iterator.knotRole == 1;
    };
    tie.nextAnchorRole = function() {
        if(schema._iterator.anchorRole == this.anchorRoles.length) {
            schema._iterator.anchorRole = 0;
            return null;
        }
        return this.anchorRole[this.anchorRoles[schema._iterator.anchorRole++]];
    };
    tie.hasMoreAnchorRoles = function() {
        return schema._iterator.anchorRole < this.anchorRoles.length;
    };
    tie.isFirstAnchorRole = function() {
        return schema._iterator.anchorRole == 1;
    };
}

// create a key lookup
var keyIdentifier, key;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        if(attribute.key) {
            for(keyIdentifier in attribute.key) {
                key = attribute.key[keyIdentifier];
                if(!schema.anchor[key.of].keys) 
                    schema.anchor[key.of].keys = {};
                if(!schema.anchor[key.of].keys[key.route])
                    schema.anchor[key.of].keys[key.route] = {};
                if(!schema.anchor[key.of].keys[key.route].stops)
                    schema.anchor[key.of].keys[key.route].stops = {};
                schema.anchor[key.of].keys[key.route].stops[key.stop] = {
                    branch: key.branch,
                    stop: key.stop,
                    attribute: attribute,
                    anchor: anchor
                };
            }
        }
    }
}
while (tie = schema.nextTie()) {
    while(role = tie.nextRole()) {
        if(role.key) {
            for(keyIdentifier in role.key) {
                key = role.key[keyIdentifier];
                if(!schema.anchor[key.of].keys) 
                    schema.anchor[key.of].keys = {};
                if(!schema.anchor[key.of].keys[key.route])
                    schema.anchor[key.of].keys[key.route] = {};
                if(!schema.anchor[key.of].keys[key.route].stops)
                    schema.anchor[key.of].keys[key.route].stops = {};
                schema.anchor[key.of].keys[key.route].stops[key.stop] = {
                    branch: key.branch,
                    stop: key.stop,
                    role: role,
                    tie: tie
                }
            }
        }
    }
}

if(DEBUG) console.log(schema);

// "global" variables
schema.METADATA = schema.metadata.metadataUsage === 'true';
schema.IMPROVED = schema.metadata.naming === 'improved';
schema.PARTITIONING = schema.metadata.partitioning === 'true';
schema.INTEGRITY = schema.metadata.entityIntegrity === 'true';
schema.BUSINESS_VIEWS = schema.metadata.businessViews === 'true';
schema.KNOT_ALIASES = schema.metadata.knotAliases === 'true';
schema.TRIGGERS = schema.metadata.triggers === 'true';
schema.EQUIVALENCE = schema.metadata.equivalence === 'true';
schema.DECISIVENESS = schema.metadata.decisiveness === 'true';
schema.UNI = schema.metadata.temporalization === 'uni';
schema.CRT = schema.metadata.temporalization === 'crt';
schema.EOT = '\'9999-12-31\''; // End Of Time
