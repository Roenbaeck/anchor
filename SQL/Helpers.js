 // set up some iterators for the different components
schema._iterator = {};
schema._iterator.knot = 0;
schema._iterator.anchor = 0;
schema._iterator.nexus = 0;
schema._iterator.attribute = 0;
schema._iterator.historizedAttribute = 0;
schema._iterator.tie = 0;
schema._iterator.historizedTie = 0;
// iterators specific to tie roles
schema._iterator.tie_role = 0;
schema._iterator.tie_knotRole= 0;
schema._iterator.tie_anchorRole = 0;
schema._iterator.tie_nexusRole = 0; // new iterator for nexus roles
schema._iterator.tie_entityRole = 0; // new iterator for entity (anchor+nexus) roles
// iterators specific to nexus roles
schema._iterator.nexus_role = 0;
schema._iterator.nexus_knotRole = 0;
schema._iterator.nexus_anchorRole = 0;
schema._iterator.nexus_nexusRole = 0; // new iterator for nexus roles
schema._iterator.nexus_entityRole = 0;
// other iterators
schema._iterator.identifier = 0;
schema._iterator.value = 0;

// unified attribute collection (anchor + nexus) for later global iteration/refactor
schema.allAttributes = [];

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

// set up helpers for nexuses
schema.nextNexus = function() {
    var list = schema.nexuses;
    if(!list) return null;
    if(schema._iterator.nexus == list.length) {
        schema._iterator.nexus = 0;
        return null;
    }
    return schema.nexus[list[schema._iterator.nexus++]];
};
schema.hasMoreNexuses = function() {
    var list = schema.nexuses;
    if(!list) return false;
    return schema._iterator.nexus < list.length;
};
schema.isFirstNexus = function() {
    return schema._iterator.nexus == 1;
};

var nexus;
while(nexus = schema.nextNexus()) {
    nexus.historizedAttributes = [];
    nexus.isGenerator = function() {
        return this.metadata.generator == 'true';
    };
    nexus.identifiers = [];
    nexus.values = [];
    nexus.knotRoles = [];
    nexus.anchorRoles = [];
    // new role groupings
    nexus.nexusRoles = [];
    nexus.entityRoles = [];
}

// set up helpers for nexus attributes
while (nexus = schema.nextNexus()) {
    nexus.nextAttribute = function() {
        if(!this.attributes) return null;
        if(schema._iterator.attribute == this.attributes.length) {
            schema._iterator.attribute = 0;
            return null;
        }
        return this.attribute[this.attributes[schema._iterator.attribute++]];
    };
    nexus.hasMoreAttributes = function() {
        if(!this.attributes) return false;
        return schema._iterator.attribute < this.attributes.length;
    };
    nexus.isFirstAttribute = function() {
        return schema._iterator.attribute == 1;
    };
    // generic role iterator for nexus
    nexus.nextRole = function() {
        if(!this.roles) return null;
        if(schema._iterator.nexus_role == this.roles.length) {
            schema._iterator.nexus_role = 0;
            return null;
        }
        return this.role[this.roles[schema._iterator.nexus_role++]];
    };
    nexus.hasMoreRoles = function() {
        if(!this.roles) return false;
        return schema._iterator.nexus_role < this.roles.length;
    };
    nexus.isFirstRole = function() {
        return schema._iterator.nexus_role == 1;
    };
    nexus.nextEntityRole = function() {
        if(!this.entityRoles) return null;
        if(schema._iterator.nexus_entityRole == this.entityRoles.length) {
            schema._iterator.nexus_entityRole = 0;
            return null;
        }
        return this.role[this.entityRoles[schema._iterator.nexus_entityRole++]];
    };
    nexus.hasMoreEntityRoles = function() {
        if(!this.entityRoles) return false;
        return schema._iterator.nexus_entityRole < this.entityRoles.length;
    };
    nexus.nextKnotRole = function() {
        if(!this.knotRoles) return null;
        if(schema._iterator.nexus_knotRole == this.knotRoles.length) {
            schema._iterator.nexus_knotRole = 0;
            return null;
        }
        return this.role[this.knotRoles[schema._iterator.nexus_knotRole++]];
    };
    nexus.hasMoreKnotRoles = function() {
        if(!this.knotRoles) return false;
        return schema._iterator.nexus_knotRole < this.knotRoles.length;
    };
}

var nxAttribute;
while (nexus = schema.nextNexus()) {
    while(nxAttribute = nexus.nextAttribute()) {
        nxAttribute.isGenerator = function() {
            return this.metadata.generator == 'true';
        };
        nxAttribute.isKnotted = function() {
            return !!this['knotRange'];
        };
        nxAttribute.isIdempotent = function() {
            return this.metadata.idempotent == 'true';
        };
        nxAttribute.isAssertive = function() {
            return this.metadata.assertive == 'true';
        };
        nxAttribute.isEquivalent = function() {
            // the modeler's rule: a knotted attribute is never equivalent (its knot may be), whatever a file says
            return this.metadata.equivalent == 'true' && !this.isKnotted();
        };
        nxAttribute.isDeletable = function() {
            return this.metadata.deletable == 'true';
        };
        nxAttribute.isRestatable = function() {
            return this.metadata.restatable == 'true';
        };
        nxAttribute.hasChecksum = function() {
            return this.metadata.checksum == 'true';
        };
        nxAttribute.isHistorized = function() {
            return !!this['timeRange'];
        };
        nxAttribute.getEncryptionGroup = function() {
            // the modeler's rule: a knotted attribute is never encrypted (it holds a reference to its knot), whatever a file says
            if(this.isKnotted() || !this.metadata.encryptionGroup || this.metadata.encryptionGroup.trim().length === 0)
                return;
            return this.metadata.encryptionGroup;
        };
        if(nxAttribute.isHistorized())
            nexus.historizedAttributes.push(nxAttribute.mnemonic);
        if(nxAttribute.isKnotted())
            nxAttribute.knot = schema.knot[nxAttribute.knotRange];
        if(nxAttribute.getEncryptionGroup()) {
            nxAttribute.originalDataRange = nxAttribute.dataRange;
            nxAttribute.dataRange = 'varbinary(max)';
        }
        // parent enrichment (nexus)
        nxAttribute.parentType = 'nexus';
        nxAttribute.parentIdentityRange = nexus.identity;
        nxAttribute.parentIdentityColumnName = nexus.identityColumnName;
        nxAttribute.parent = nexus;
        // add to global collection
        schema.allAttributes.push(nxAttribute);
    }
    // Chronicle support: collect static (non-historized) attributes with a positive chronicle number
    nexus._chronicleSorted = null; // lazy cache
    nexus._chronicleIndex = 0;
    nexus._buildChronicleList = function() {
        var list = [];
        if(this.attributes) {
            for(var i=0;i<this.attributes.length;i++) {
                var aid = this.attributes[i];
                var attr = this.attribute[aid];
                if(!attr) continue;
                var chron = attr.chronicle ? Number(attr.chronicle) : 0;
                // Exclude historized (should not exist for nexus now) and zero/NaN
                if(chron > 0 && !attr.timeRange) {
                    list.push(attr);
                }
            }
        }
        list.sort(function(a,b){ return Number(a.chronicle)-Number(b.chronicle); });
        this._chronicleSorted = list;
        this._chronicleIndex = 0;
    };
    nexus.nextChronicle = function() {
        if(!this._chronicleSorted) this._buildChronicleList();
        if(this._chronicleIndex >= this._chronicleSorted.length) {
            this._chronicleIndex = 0;
            return null;
        }
        return this._chronicleSorted[this._chronicleIndex++];
    };
    nexus.hasMoreChronicles = function() {
        if(!this._chronicleSorted) this._buildChronicleList();
        return this._chronicleIndex < this._chronicleSorted.length;
    };
    nexus.isFirstChronicle = function() {
        return this._chronicleIndex == 1; // first returned increments index to 1
    };
}

// classify nexus roles and populate role grouping vectors (identifiers, values, knot/anchor/nexus/entity)
while (nexus = schema.nextNexus()) {
    if(!nexus.roles || nexus._classifiedRoles) continue;
    for(var i = 0; i < nexus.roles.length; i++) {
        var rid = nexus.roles[i];
        var role = nexus.role && nexus.role[rid];
        if(!role) continue;
        // predicate helpers (mirroring tie roles)
        role.isIdentifier = function() { return this.identifier == 'true'; };
        role.isKnotRole = function() { return schema.knot[this.type] != null; };
        role.isAnchorRole = function() { return schema.anchor[this.type] != null; };
        role.isNexusRole = function() { return schema.nexus && schema.nexus[this.type] != null; };
        role.isEntityRole = function() { return this.isAnchorRole() || this.isNexusRole(); };
        if(role.isKnotRole()) {
            role.knot = schema.knot[role.type];
            if(!nexus.knotRole) nexus.knotRole = {};
            nexus.knotRole[role.id] = role;
            nexus.knotRoles.push(role.id);
        }
        else if(role.isAnchorRole()) {
            role.anchor = schema.anchor[role.type];
            role.entity = role.anchor;
            if(!nexus.anchorRole) nexus.anchorRole = {};
            nexus.anchorRole[role.id] = role;
            nexus.anchorRoles.push(role.id);
            nexus.entityRoles.push(role.id);
        }
        else if(role.isNexusRole()) {
            role.nexus = schema.nexus[role.type];
            role.entity = role.nexus;
            if(!nexus.nexusRole) nexus.nexusRole = {};
            nexus.nexusRole[role.id] = role;
            nexus.nexusRoles.push(role.id);
            nexus.entityRoles.push(role.id);
        }
        // identifier vs value grouping (if applicable for nexus semantics)
        if(role.isIdentifier())
            nexus.identifiers.push(role.id);
        else
            nexus.values.push(role.id);
    }
    nexus._classifiedRoles = true;
}

while (nexus = schema.nextNexus()) {
    nexus.nextHistorizedAttribute = function() {
        if(schema._iterator.historizedAttribute == this.historizedAttributes.length) {
            schema._iterator.historizedAttribute = 0;
            return null;
        }
        return this.attribute[this.historizedAttributes[schema._iterator.historizedAttribute++]];
    };
    nexus.hasMoreHistorizedAttributes = function() {
        return schema._iterator.historizedAttribute < this.historizedAttributes.length;
    };
    nexus.isFirstHistorizedAttribute = function() {
        return schema._iterator.historizedAttribute == 1;
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
            // the modeler's rule: a knotted attribute is never equivalent (its knot may be), whatever a file says
            return this.metadata.equivalent == 'true' && !this.isKnotted();
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
            // the modeler's rule: a knotted attribute is never encrypted (it holds a reference to its knot), whatever a file says
            if(this.isKnotted() || !this.metadata.encryptionGroup || this.metadata.encryptionGroup.trim().length === 0)
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
        // parent enrichment (anchor)
        attribute.parentType = 'anchor';
        attribute.parentIdentityRange = anchor.identity;
        attribute.parentIdentityColumnName = anchor.identityColumnName;
        attribute.parent = anchor;
        // add to global collection
        schema.allAttributes.push(attribute);
    }
}

// Global attribute iterator helpers (schema-level, independent of per-parent attribute iterators)
schema._iterator.globalAttribute = 0;
schema.nextAttribute = function() {
    if(!schema.allAttributes) return null;
    if(schema._iterator.globalAttribute >= schema.allAttributes.length) {
        schema._iterator.globalAttribute = 0;
        return null;
    }
    return schema.allAttributes[schema._iterator.globalAttribute++];
};
schema.hasMoreAttributes = function() {
    if(!schema.allAttributes) return false;
    return schema._iterator.globalAttribute < schema.allAttributes.length;
};
schema.isFirstAttribute = function() {
    return schema._iterator.globalAttribute == 1;
};

// Convenience enumerator
schema.forEachAttribute = function(callback) {
    if(!schema.allAttributes) return;
    for(var i=0;i<schema.allAttributes.length;i++) callback(schema.allAttributes[i], i);
};

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
    // role grouping vectors
    tie.nexusRoles = [];
    tie.entityRoles = [];
    // role maps (populate during classification)
    tie.knotRole = {};
    tie.anchorRole = {};
    tie.nexusRole = {};
    tie.isGenerator = function() {
        return this.metadata.generator == 'true';
    };
    tie.isKnotted = function() {
        // knotRole is made empty for every tie, so it is the list of knot roles that tells
        return this.knotRoles.length > 0;
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
        if(schema._iterator.tie_role == this.roles.length) {
            schema._iterator.tie_role = 0;
            return null;
        }
        var rid = this.roles[schema._iterator.tie_role++];
        return this.knotRole[rid] || this.anchorRole[rid] || this.nexusRole[rid] || null;
    };
    tie.hasMoreRoles = function() {
        if(!this.roles) return false;
        return schema._iterator.tie_role < this.roles.length;
    };
    tie.isFirstRole = function() {
        return schema._iterator.tie_role == 1;
    };
}

var role;
// classify tie roles and populate grouping vectors + maps
while (tie = schema.nextTie()) {
    if(!tie.roles || tie._classifiedRoles) continue;
    for(var i = 0; i < tie.roles.length; i++) {
        var rid = tie.roles[i];
        var role = tie.role && tie.role[rid];
        if(!role) continue;
        role.isIdentifier = function() {
            return this.identifier == 'true';
        };
        role.isKnotRole = function() {
            return schema.knot[this.type] != null;
        };
        role.isAnchorRole = function() { return schema.anchor[this.type] != null; };
        role.isNexusRole = function() { return schema.nexus && schema.nexus[this.type] != null; };
        role.isEntityRole = function() { return this.isAnchorRole() || this.isNexusRole(); };
        if(role.isKnotRole()) {
            role.knot = schema.knot[role.type];
            tie.knotRole[role.id] = role;
            tie.knotRoles.push(role.id);
        }
        else if(role.isAnchorRole()) {
            role.anchor = schema.anchor[role.type];
            role.entity = role.anchor;
            tie.anchorRole[role.id] = role;
            tie.anchorRoles.push(role.id);
            tie.entityRoles.push(role.id);
        }
        else if(role.isNexusRole()) {
            role.nexus = schema.nexus[role.type];
            role.entity = role.nexus;
            tie.nexusRole[role.id] = role;
            tie.nexusRoles.push(role.id);
            tie.entityRoles.push(role.id);
        }
        if(role.isIdentifier()) tie.identifiers.push(role.id); else tie.values.push(role.id);
    }
    tie._classifiedRoles = true;
}

while (tie = schema.nextTie()) {
    tie.nextIdentifier = function() {
        if(schema._iterator.identifier == this.identifiers.length) {
            schema._iterator.identifier = 0;
            return null;
        }
        var anchorRole, knotRole, nexusRole, genericRole;
        var currentId = this.identifiers[schema._iterator.identifier];
        if(this.anchorRole)
            anchorRole = this.anchorRole[currentId];
        if(this.knotRole)
            knotRole = this.knotRole[currentId];
        if(this.nexusRole)
            nexusRole = this.nexusRole[currentId];
        if(!anchorRole && !knotRole && !nexusRole && this.role)
            genericRole = this.role[currentId];
        schema._iterator.identifier++;
        return anchorRole || knotRole || nexusRole || genericRole || null;
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
        var anchorRole, knotRole, nexusRole, genericRole;
        var currentVal = this.values[schema._iterator.value];
        if(this.anchorRole)
            anchorRole = this.anchorRole[currentVal];
        if(this.knotRole)
            knotRole = this.knotRole[currentVal];
        if(this.nexusRole)
            nexusRole = this.nexusRole[currentVal];
        if(!anchorRole && !knotRole && !nexusRole && this.role)
            genericRole = this.role[currentVal];
        schema._iterator.value++;
        return anchorRole || knotRole || nexusRole || genericRole || null;
    };
    tie.hasMoreValues = function() {
        return schema._iterator.value < this.values.length;
    };
    tie.isFirstValue = function() {
        return schema._iterator.value == 1;
    };
    tie.nextKnotRole = function() {
        if(schema._iterator.tie_knotRole == this.knotRoles.length) {
            schema._iterator.tie_knotRole = 0;
            return null;
        }
        return this.knotRole[this.knotRoles[schema._iterator.tie_knotRole++]];
    };
    tie.hasMoreKnotRoles = function() {
        return schema._iterator.tie_knotRole< this.knotRoles.length;
    };
    tie.isFirstKnotRole = function() {
        return schema._iterator.tie_knotRole== 1;
    };
    tie.nextAnchorRole = function() {
        if(schema._iterator.tie_anchorRole == this.anchorRoles.length) {
            schema._iterator.tie_anchorRole = 0;
            return null;
        }
        return this.anchorRole[this.anchorRoles[schema._iterator.tie_anchorRole++]];
    };
    tie.hasMoreAnchorRoles = function() {
        return schema._iterator.tie_anchorRole < this.anchorRoles.length;
    };
    tie.isFirstAnchorRole = function() {
        return schema._iterator.tie_anchorRole == 1;
    };
    // iterators for nexus roles
    tie.nextNexusRole = function() {
        if(!this.nexusRoles) return null;
        if(schema._iterator.tie_nexusRole == this.nexusRoles.length) {
            schema._iterator.tie_nexusRole = 0;
            return null;
        }
        return this.nexusRole[this.nexusRoles[schema._iterator.tie_nexusRole++]];
    };
    tie.hasMoreNexusRoles = function() {
        if(!this.nexusRoles) return false;
        if(!schema._iterator.nexusRole) schema._iterator.tie_nexusRole = 0;
        return schema._iterator.tie_nexusRole < this.nexusRoles.length;
    };
    tie.isFirstNexusRole = function() {
        return schema._iterator.tie_nexusRole == 1;
    };
    // iterators for entity roles (anchor + nexus)
    tie.nextEntityRole = function() {
        if(!this.entityRoles) return null;
        if(schema._iterator.tie_entityRole == this.entityRoles.length) {
            schema._iterator.tie_entityRole = 0;
            return null;
        }
        var id = this.entityRoles[schema._iterator.tie_entityRole++];
        return this.anchorRole[id] || this.nexusRole[id] || null;
    };
    tie.hasMoreEntityRoles = function() {
        if(!this.entityRoles) return false;
        return schema._iterator.tie_entityRole < this.entityRoles.length;
    };
    tie.isFirstEntityRole = function() {
        return schema._iterator.tie_entityRole == 1;
    };
}

if(DEBUG) console.log(schema);

// Natural keys as routes ----------------------------------------------------------------------------------------------
// A natural key of an anchor or a nexus is a route: the <key> elements that share an `of` and a `route`, placed on the
// attributes and roles the route passes. Each branch of the route is a path that starts at the anchor or nexus and ends
// in a value, and `stop` orders the elements, along each path and the values of the key among themselves. Along a path
//   - an attribute of what the path has reached is a value and ends the path; a knotted attribute gives its knot's value;
//   - a role of the nexus the path has reached leads to what the role refers to; a role that refers to what the path
//     has reached leads into its nexus instead, which is not functional, since one anchor can be in many of them;
//   - a tie takes two stops in a row: the role the path enters it by, played by what the path has reached, and the role
//     it leaves it by. It is functional when no role other than the one it is entered by is an identifier;
//   - a knot role, of a nexus or of a tie, gives the value of its knot and ends the path.
// A route that does not follow these rules is not usable, and says why. A route that passes something historized
// changes over time, and one that passes something that is not functional can give an identity more than one key.
//
// naturalKeys() reads every key element, on the attributes of anchors and nexuses and on the roles of nexuses and ties,
// and orders the stops by number (not in the order for..in gives, which is not the same in every JavaScript engine). It
// reads names, so it is called after the naming conventions, from a derive.js. It does not use the iterators,
// so it can be called from inside a loop over them. It returns plain data, one item for each route, by anchor and then
// nexus in the order of the model, and by route name (1st before 2nd before 10th):
//   of, route, entityName, capsule, identityColumnName, identity   the anchor or nexus
//   perspective   whether it has perspectives (an anchor or nexus has them when it has attributes); if not, its table
//                 is read instead
//   name, pointInTimeName, checkName   key_<name>_<route>, pkey_<name>_<route> and ic_key_<name>_<route>
//   tableName, refreshName             <name>_<route> and refresh_<name>_<route>, a table that holds the key of every
//                                      identity and the procedure that fills it, where a database has them
//   historized    whether an attribute or a tie on the route is historized
//   usable        whether the route follows the rules; if not, problem says why, and the lists below are empty
//   notes         a {text} for each step of the route that is not functional
//   joins         what to join after the anchor or nexus, which is aliased by its mnemonic, in order:
//                 {capsule, name, perspective, alias, column, fromAlias, fromColumn}, where alias.column equals
//                 fromAlias.fromColumn, and perspective says whether name has perspectives or is read as a table. An
//                 anchor or nexus on the way is joined only when a column of its own is read
//   columns       the values of the key, each followed by its checksum if it has one: {name, alias, source, type,
//                 isChecksum}, where source is the column in what alias is; name is source prefixed by the roles the
//                 path left through, so two values cannot get the same name; the type of a checksum is left to the
//                 database
//   matches       the column each value is compared on, its checksum if it has one: {name, type, isChecksum}
function naturalKeys() {
    var routes = {}, list = [], result = [];
    function each(ids, map, f) {
        if(!ids || !map) return;
        for(var n = 0; n < ids.length; n++) if(map[ids[n]]) f(map[ids[n]]);
    }
    function entityOf(mnemonic) {
        return (schema.anchor && schema.anchor[mnemonic]) || (schema.nexus && schema.nexus[mnemonic]) || null;
    }
    function knotOf(mnemonic) {
        return (schema.knot && schema.knot[mnemonic]) || null;
    }
    function hasAttributes(entity) {
        return !!(entity.attributes && entity.attributes.length);
    }
    function collect(element, kind, owner) {
        if(!element || !element.key) return;
        for(var keyId in element.key) {
            var mark = element.key[keyId];
            if(!mark || !mark.of || !mark.route) continue;
            var hash = mark.of + '|' + mark.route;
            if(!routes[hash]) {
                routes[hash] = { of: mark.of, route: mark.route, marks: [] };
                list.push(routes[hash]);
            }
            routes[hash].marks.push({ stop: String(mark.stop), branch: String(mark.branch || '1'), kind: kind, element: element, owner: owner });
        }
    }
    each(schema.anchors, schema.anchor, function(anchor) {
        each(anchor.attributes, anchor.attribute, function(attribute) { collect(attribute, 'attribute', anchor); });
    });
    each(schema.nexuses, schema.nexus, function(nexus) {
        each(nexus.attributes, nexus.attribute, function(attribute) { collect(attribute, 'attribute', nexus); });
        each(nexus.roles, nexus.role, function(role) { collect(role, 'nexusRole', nexus); });
    });
    each(schema.ties, schema.tie, function(tie) {
        each(tie.roles, tie.role, function(role) { collect(role, 'tieRole', tie); });
    });
    // the modeler can put a key on a knot, which the XML schema does not allow; it is reported, not followed
    each(schema.knots, schema.knot, function(knot) { collect(knot, 'knot', knot); });

    function analyze(entity, route) {
        var key = {
            of: entity.mnemonic,
            route: route.route,
            entityName: entity.name,
            capsule: entity.capsule,
            identityColumnName: entity.identityColumnName,
            identity: entity.identity,
            perspective: hasAttributes(entity),
            name: 'key' + D + entity.name + D + route.route,
            pointInTimeName: 'pkey' + D + entity.name + D + route.route,
            checkName: 'ic' + D + 'key' + D + entity.name + D + route.route,
            tableName: entity.name + D + route.route,
            refreshName: 'refresh' + D + entity.name + D + route.route,
            historized: false,
            usable: true,
            problem: null,
            notes: [],
            joins: [],
            columns: [],
            matches: []
        };
        function fail(text) {
            if(key.usable) {
                key.usable = false;
                key.problem = text;
            }
        }
        var marks = route.marks.slice(0), taken = {}, n, m;
        for(n = 0; n < marks.length; n++) {
            m = marks[n];
            if(!/^[0-9]+$/.test(m.stop)) fail('stop "' + m.stop + '" is not a number');
            else if(taken[parseInt(m.stop, 10)]) fail('more than one element is stop ' + m.stop);
            else taken[parseInt(m.stop, 10)] = true;
        }
        marks.sort(function(a, b) { return parseInt(a.stop, 10) - parseInt(b.stop, 10); });
        // the branches, in the order of their first stops
        var branches = [], branchOf = {};
        for(n = 0; n < marks.length; n++) {
            m = marks[n];
            if(!branchOf[m.branch]) {
                branchOf[m.branch] = [];
                branches.push(branchOf[m.branch]);
            }
            branchOf[m.branch].push(m);
        }
        // Where a path is: the anchor or nexus it has reached, and the alias and column that hold its identity. Only an
        // anchor or nexus whose columns are read is joined, so an identity can pass straight from one tie to the next.
        // What is joined is the perspective of an anchor or nexus that has attributes, and otherwise its table, since
        // only those with attributes have perspectives; a tie always has them.
        var names = {}, at;
        function reach(target, alias, column, stop) {
            at = { entity: target, alias: alias, column: column, joined: false, stop: stop };
        }
        function join() {
            if(at.joined) return;
            key.joins.push({ capsule: at.entity.capsule, name: at.entity.name, perspective: hasAttributes(at.entity), alias: 's' + at.stop, column: at.entity.identityColumnName, fromAlias: at.alias, fromColumn: at.column });
            at = { entity: at.entity, alias: 's' + at.stop, column: at.entity.identityColumnName, joined: true, stop: at.stop };
        }
        for(var b = 0; b < branches.length && key.usable; b++) {
            var path = branches[b], prefix = '', value = null;
            at = { entity: entity, alias: entity.mnemonic, column: entity.identityColumnName, joined: true, stop: null };
            for(var s = 0; s < path.length && key.usable; s++) {
                m = path[s];
                var where = 'stop ' + m.stop;
                if(value) {
                    fail(where + ' comes after the value that ends branch ' + m.branch);
                }
                else if(m.kind == 'attribute') {
                    if(m.owner.mnemonic != at.entity.mnemonic) {
                        fail(where + ': ' + m.element.name + ' is not an attribute of ' + at.entity.name);
                    }
                    else {
                        join();
                        value = { attribute: m.element, alias: at.alias };
                    }
                }
                else if(m.kind == 'nexusRole') {
                    var role = m.element, nexus = m.owner;
                    if(nexus.mnemonic == at.entity.mnemonic) {
                        // leaving the nexus by one of its roles, which has one value, so functional
                        join();
                        if(knotOf(role.type)) {
                            if(!hasAttributes(nexus))
                                fail(where + ': the value of the knot of ' + role.role + ' is in the perspectives of ' + nexus.name + ', which has none without attributes');
                            else
                                value = { knot: knotOf(role.type), role: role, alias: at.alias };
                        }
                        else if(!entityOf(role.type)) {
                            fail(where + ': the role ' + role.role + ' of ' + nexus.name + ' refers to nothing in the model');
                        }
                        else {
                            reach(entityOf(role.type), at.alias, role.columnName, m.stop);
                            prefix += role.role + D;
                        }
                    }
                    else if(role.type == at.entity.mnemonic) {
                        // entering the nexus by the role that refers to what the path has reached
                        key.joins.push({ capsule: nexus.capsule, name: nexus.name, perspective: hasAttributes(nexus), alias: 's' + m.stop, column: role.columnName, fromAlias: at.alias, fromColumn: at.column });
                        key.notes.push({ text: at.entity.name + ' can be ' + role.role + ' in more than one ' + nexus.name + ', so an identity can have more than one key' });
                        at = { entity: nexus, alias: 's' + m.stop, column: nexus.identityColumnName, joined: true, stop: m.stop };
                        prefix += role.role + D;
                    }
                    else {
                        fail(where + ': the role ' + role.role + ' of ' + nexus.name + ' does not connect to ' + at.entity.name);
                    }
                }
                else if(m.kind == 'tieRole') {
                    var tie = m.owner, enter = m.element, next = path[s + 1];
                    if(!next || next.kind != 'tieRole' || next.owner !== tie || next.element === enter) {
                        fail(where + ': a tie takes two stops in a row in one branch, the role it is entered by and the role it is left by');
                    }
                    else if(enter.type != at.entity.mnemonic) {
                        fail(where + ': ' + at.entity.name + ' does not play the role ' + enter.role + ' in ' + tie.name);
                    }
                    else {
                        var leave = next.element, functional = true;
                        s++;
                        each(tie.roles, tie.role, function(other) {
                            if(other !== enter && other.isIdentifier && other.isIdentifier()) functional = false;
                        });
                        if(tie.isHistorized && tie.isHistorized()) key.historized = true;
                        key.joins.push({ capsule: tie.capsule, name: tie.name, perspective: true, alias: 's' + m.stop, column: enter.columnName, fromAlias: at.alias, fromColumn: at.column });
                        if(!functional)
                            key.notes.push({ text: tie.name + ' has identifiers other than ' + enter.role + ', so it can lead to more than one ' + leave.role + ' and an identity to more than one key' });
                        if(knotOf(leave.type)) {
                            value = { knot: knotOf(leave.type), role: leave, alias: 's' + m.stop };
                        }
                        else if(!entityOf(leave.type)) {
                            fail('stop ' + next.stop + ': the role ' + leave.role + ' of ' + tie.name + ' refers to nothing in the model');
                        }
                        else {
                            reach(entityOf(leave.type), 's' + m.stop, leave.columnName, next.stop);
                            prefix += leave.role + D;
                        }
                    }
                }
                else {
                    fail(where + ' is on the knot ' + m.element.name + ', which a route reaches through a knotted attribute or a knot role instead');
                }
            }
            if(!key.usable) break;
            if(!value) {
                fail('branch ' + path[0].branch + ' does not end in a value, an attribute or a knot');
                break;
            }
            var source, type, checksum = null, knot;
            if(value.attribute) {
                var attribute = value.attribute;
                if(attribute.isHistorized && attribute.isHistorized()) key.historized = true;
                if(attribute.isKnotted && attribute.isKnotted()) {
                    knot = attribute.knot;
                    source = attribute.knotValueColumnName;
                    type = knot.dataRange;
                    if(knot.hasChecksum()) checksum = attribute.knotChecksumColumnName;
                }
                else {
                    source = attribute.valueColumnName;
                    type = attribute.dataRange;
                    if(attribute.hasChecksum()) checksum = attribute.checksumColumnName;
                }
            }
            else {
                knot = value.knot;
                source = value.role.knotValueColumnName;
                type = knot.dataRange;
                if(knot.hasChecksum()) checksum = value.role.knotChecksumColumnName;
            }
            if(names[prefix + source]) {
                fail('two branches give the column ' + prefix + source);
                break;
            }
            names[prefix + source] = true;
            key.columns.push({ name: prefix + source, alias: value.alias, source: source, type: type, isChecksum: false });
            if(checksum) {
                key.columns.push({ name: prefix + checksum, alias: value.alias, source: checksum, type: null, isChecksum: true });
                key.matches.push({ name: prefix + checksum, type: null, isChecksum: true });
            }
            else {
                key.matches.push({ name: prefix + source, type: type, isChecksum: false });
            }
        }
        if(!key.usable) {
            key.notes = [];
            key.joins = [];
            key.columns = [];
            key.matches = [];
        }
        return key;
    }
    function byRouteName(a, b) {
        var x = parseInt(a.route, 10), y = parseInt(b.route, 10);
        if(!isNaN(x) && !isNaN(y) && x != y) return x - y;
        return a.route < b.route ? -1 : a.route > b.route ? 1 : 0;
    }
    function routesOf(entity) {
        var own = [], r;
        for(r = 0; r < list.length; r++) if(list[r].of == entity.mnemonic) own.push(list[r]);
        own.sort(byRouteName);
        for(r = 0; r < own.length; r++) result.push(analyze(entity, own[r]));
    }
    each(schema.anchors, schema.anchor, routesOf);
    each(schema.nexuses, schema.nexus, routesOf);
    return result;
}

// "global" variables
schema.METADATA = schema.metadata.metadataUsage === 'true';
schema.IMPROVED = schema.metadata.naming === 'improved';
schema.PARTITIONING = schema.metadata.partitioning === 'true';
schema.INTEGRITY = schema.metadata.entityIntegrity === 'true';
schema.BUSINESS_VIEWS = schema.metadata.businessViews === 'true';
schema.KNOT_ALIASES = schema.metadata.knotAliases === 'true';
schema.TRIGGERS = schema.metadata.triggers === 'true';
schema.NATURAL_KEY_ATTRIBUTES = schema.metadata.naturalKeyAttributes === 'true';
schema.EQUIVALENCE = schema.metadata.equivalence === 'true';
schema.DECISIVENESS = schema.metadata.decisiveness === 'true';
schema.UNI = schema.metadata.temporalization === 'uni';
schema.CRT = schema.metadata.temporalization === 'crt';
schema.EOT = '\'9999-12-31\''; // End Of Time
