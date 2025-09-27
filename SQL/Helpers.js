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
            return this.metadata.equivalent == 'true';
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
            if(!this.metadata.encryptionGroup || this.metadata.encryptionGroup.trim().length === 0) 
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

// create a key lookup
var keyIdentifier, key;
while (anchor = schema.nextAnchor()) {
    while(attribute = anchor.nextAttribute()) {
        if(attribute.key) {
            for(keyIdentifier in attribute.key) {
                key = attribute.key[keyIdentifier];
                // Determine key target (anchor or nexus)
                var keyTarget = (schema.anchor && schema.anchor[key.of]) ? schema.anchor[key.of] : (schema.nexus && schema.nexus[key.of] ? schema.nexus[key.of] : null);
                if(!keyTarget) continue; // unknown target
                if(!keyTarget.keys)
                    keyTarget.keys = {};
                if(!keyTarget.keys[key.route])
                    keyTarget.keys[key.route] = {};
                if(!keyTarget.keys[key.route].stops)
                    keyTarget.keys[key.route].stops = {};
                keyTarget.keys[key.route].stops[key.stop] = {
                    branch: key.branch,
                    stop: key.stop,
                    attribute: attribute,
                    anchor: anchor // original anchor context (even if target is nexus)
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
                var keyTarget = (schema.anchor && schema.anchor[key.of]) ? schema.anchor[key.of] : (schema.nexus && schema.nexus[key.of] ? schema.nexus[key.of] : null);
                if(!keyTarget) continue;
                if(!keyTarget.keys)
                    keyTarget.keys = {};
                if(!keyTarget.keys[key.route])
                    keyTarget.keys[key.route] = {};
                if(!keyTarget.keys[key.route].stops)
                    keyTarget.keys[key.route].stops = {};
                keyTarget.keys[key.route].stops[key.stop] = {
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

    // Derive key level properties (historization) for anchors and nexuses
    var _entityWithKeys, _routeId, _component;
    function _decorateKeys(entity) {
        if(!entity || !entity.keys) return;
        for(_routeId in entity.keys) {
            var _key = entity.keys[_routeId];
            var historized = false;
            if(_key.stops) {
                for(var _stopId in _key.stops) {
                    _component = _key.stops[_stopId];
                    if(_component.attribute && _component.attribute.timeRange) {
                        historized = true; break;
                    }
                }
            }
            _key.historized = historized;
        }
    }
    if(schema.anchor) {
        for(var _anchorName in schema.anchor) _decorateKeys(schema.anchor[_anchorName]);
    }
    if(schema.nexus) {
        for(var _nexusName in schema.nexus) _decorateKeys(schema.nexus[_nexusName]);
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
