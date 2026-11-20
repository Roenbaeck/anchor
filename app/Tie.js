// Tie: a tie.
import { NAVLayer, SVGLayer, SVGNS, XLINKNS } from './config.js';
import { Model } from './Model.js';
import { DrawingEngine } from './DrawingEngine.js';
import { UniqueIdentity } from './UniqueIdentity.js';
import { Editables } from './Editables.js';
import { EventHandler } from './EventHandler.js';
import { Component } from './Component.js';
import { Role } from './Role.js';
import { Settings } from './Settings.js';
export function Tie(x, y, historized) {
    this.id = UniqueIdentity.nextId();
    // call the parent constructor
    Component.call(this, new Node(this.id, x, y, NodeType.TIE));
    this.historized = historized;
    this.deletable = Defaults.deletability === 'true';
    this.restatable = Defaults.restatability === 'true';
    this.idempotent = Defaults.idempotency === 'true';
    this.assertive = Defaults.assertiveness === 'true';
    this.editables.push(Editables.encapsulationEdit);
    this.editables.push(Editables.positIdentityEdit);
    this.editables.push(Editables.positGeneratorEdit);
    this.editables.push(Editables.assertivenessEdit);
    this.editables.push(Editables.deletabilityEdit);
    this.editables.push(Editables.idempotencyEdit);
    this.positIdentity = Defaults.positIdentity;
    this.positGenerator = Defaults.positGenerator === 'true';
    this.operations.push('toggleHistorized','addKnot','addAnchor');
    this.encapsulation = Defaults.encapsulation;
    // SVG
    this.svg.graphicsElement = document.createElementNS(SVGNS, 'g');
    this.svg.graphicsElement.component = this;
    this.svg.useElement = document.createElementNS(SVGNS, 'use');
    var ref = historized ? '#tie_historized' : '#tie';
    this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', ref);
    this.svg.graphicsElement.appendChild(this.svg.useElement);
    this.svg.graphicsElement.addEventListener('mouseover', EventHandler.beginInteraction, false);
    SVGLayer.nodes.appendChild(this.svg.graphicsElement);
    this.svg.control = this.svg.graphicsElement.transform.baseVal.appendItem(
        this.svg.graphicsElement.ownerSVGElement.createSVGTransform()
    );
    this.svg.control.setTranslate(x, y);
    this.svg.boundingBox = this.svg.graphicsElement.getBBox();
    this.svg.xOffset = 2;
    this.svg.yOffset = 2;
    // NAV
    this.nav.graphicsElement = document.createElementNS(SVGNS, 'g');
    this.nav.graphicsElement.component = this;
    this.nav.useElement = document.createElementNS(SVGNS, 'use');
    this.nav.useElement.setAttributeNS(XLINKNS, 'xlink:href', ref.replace(/#/,'#nav_'));
    this.nav.graphicsElement.appendChild(this.nav.useElement);
    NAVLayer.nodes.appendChild(this.nav.graphicsElement);
    this.nav.control = this.nav.graphicsElement.transform.baseVal.appendItem(
        this.nav.graphicsElement.ownerSVGElement.createSVGTransform()
    );
    this.nav.control.setTranslate(x, y);
    this.setNameable(true);
    this.postCreationInitialization();
}
Tie.prototype = {
    changingRange: Defaults.changingRange,
    historized: false,
    deletable: false,
    restatable: true,
    idempotent: false,
    assertive: true,
    positIdentity: '',
    positGenerator: true,
    encapsulation: Defaults.encapsulation,
    isInteractive: function() {
        return true;
    },
    isDraggable: function() {
        return true;
    },
    setFirstRole: function(role) {
        this.node.edges.splice(this.node.edges.indexOf(role.node), 1);
        this.node.edges.splice(0, 0, role.node);
    },
    checkIdentifiers: function() {
        if(this.historized) {
            var outside = 0, inside = 0;
            for(var i = 0; i < this.node.edges.length; i++) {
                outside += Model.nodeToComponent(this.node.edges[i]).identifier ? 0 : 1;
                inside += Model.nodeToComponent(this.node.edges[i]).identifier ? 1 : 0;
            }
            if(outside > 1)
                alert("The tie " + this + " has " + outside +
                        " roles outside the identifier, which is not recommended for a historized tie. " +
                        "In order to determine what changes over time leaving exactly one role outside the " +
                        "identifier is recommended.");
            else if (outside === 0 && inside > 0)
                alert("The tie " + this +
                        " has no role outside the identifier, which is not recommended for a historized tie. " +
                        "If you want a many-to-many relationship then gaps in the timeline needs to be " +
                        "modeled explicitly using a knotted tie.");
        }
    },
    isConforming: function() {
        var edge, otherEdge, role, otherRole, component, otherComponent;
        var i, j, identical, relation, related;
        var relations = Object.create(null);
        // check that no roles are identical in the tie
        for(i = 0; edge = this.node.edges[i]; i++) {
            for(j = 0; otherEdge = this.node.edges[j]; j++) {
                role = Model.nodeToComponent(edge);
                otherRole = Model.nodeToComponent(otherEdge);
                if(i !== j && role.role === otherRole.role) {
                    component = Model.nodeToComponent(
                                    edge.node === this.node ? edge.otherNode : edge.node
                    );
                    otherComponent = Model.nodeToComponent(
                                    otherEdge.node === this.node ? otherEdge.otherNode : otherEdge.node)
                    ;
                    if(component.mnemonic === otherComponent.mnemonic)
                        return !confirm("The roles named '" + role.role + "' for '" +
                                component + "' cannot be identical in this tie. " +
                                "Please give the roles different and distinguishing names.");
                }
            }
        }
        // build the relations lookup
        for(i = 0; edge = this.node.edges[i]; i++) {
            related = Model.nodeToComponent(edge.node === this.node ? edge.otherNode : edge.node);
            role = Model.nodeToComponent(edge);
            relation = role.role + "_" + related.mnemonic;
            relations[relation] = true;
        }
        // then find all other ties of the same cardinality
        for(i = 0; component = Model.components[i]; i++) {
            if(component.node.type === NodeType.TIE && component !== this &&
                    component.node.edges.length === this.node.edges.length) {
                identical = true;
                for(j = 0; edge = component.node.edges[j]; j++) {
                    related = Model.nodeToComponent(edge.node === component.node ? edge.otherNode : edge.node);
                    role = Model.nodeToComponent(edge);
                    relation = role.role + "_" + related.mnemonic;
                    identical &= relations[relation];
                    if(relations[relation]) delete relations[relation]; // so that it cannot be matched twice
                }
                if(identical) {
                    return !confirm("This tie will become identical to the already existing tie named " +
                            component + ". Please rename the role.");
                }
            }
        }
        return true;
    },
    setHistorized: function(historized) {
        var index = this.editables.indexOf(Editables.changingRangeEdit);
        if(historized && index < 0)
            this.editables.push(Editables.changingRangeEdit);
        else if (!historized && index >= 0)
            this.editables.splice(index, 1);
        index = this.editables.indexOf(Editables.restatabilityEdit);
        if(historized && index < 0) 
            this.editables.push(Editables.restatabilityEdit);
        else if (!historized && index >= 0)
            this.editables.splice(index, 1);
        if(this.changingRange === '')
            this.changingRange = Defaults.changingRange;
        var ref = historized ? '#tie_historized' : '#tie';
        this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', ref);
        this.nav.useElement.setAttributeNS(XLINKNS, 'xlink:href', ref.replace(/#/,'#nav_'));
        DrawingEngine.invalidateMiniature();
        this.historized = historized;
    },
    getHistorized: function() {
        return this.historized;
    },
    setKnotted: function(knotted) {
        this.knotted = knotted;
    },
    getKnotted: function() {
        return this.knotted;
    },
    fromXML: function(element) {
        var x, y, fixed, i, layout;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'layout')
                layout = element.childNodes.item(i);
        if(layout) {
            x = layout.getAttribute("x");
            y = layout.getAttribute("y");
            fixed = layout.getAttribute("fixed");
        }
        x = x ? Number(x) : Math.random() * window.innerWidth;
        y = y ? Number(y) : Math.random() * window.innerHeight;
        fixed = fixed ? fixed === 'true' : false;
        var metadata;
        var capsule = Defaults.encapsulation;
        var deletable = Defaults.deletability === 'true';
        var restatable = Defaults.restatability === 'true';
        var idempotent = Defaults.idempotency === 'true';
        var assertive = Defaults.assertiveness === 'true';
        var generator = Defaults.positGenerator === 'true';
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'metadata')
                metadata = element.childNodes.item(i);
        if(metadata) {
            capsule = metadata.getAttribute("capsule") || capsule;
            var _deletable = metadata.getAttribute("deletable");
            deletable = _deletable ? _deletable === 'true' : deletable;
            var _restatable = metadata.getAttribute("restatable") || metadata.getAttribute("restatements");
            restatable = _restatable ? _restatable === 'true' : restatable;
            var _idempotent = metadata.getAttribute("idempotent");
            idempotent = _idempotent ? _idempotent === 'true' : idempotent;
            var _generator = metadata.getAttribute("generator");
            generator = _generator ? _generator === 'true' : generator;
            var _assertive = metadata.getAttribute("assertive");
            assertive = _assertive ? _assertive === 'true' : assertive;
        }
        var description;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'description')
                description = element.childNodes.item(i);
        var changingRange = element.getAttribute("timeRange") || '';
        var historized = changingRange ? true : false;
        var identity = element.getAttribute("identity") || Defaults.positIdentity;
        var tie = new Tie(x, y, historized);
        tie.setFixed(fixed);
        tie.setHistorized(historized);
        tie.changingRange = changingRange;
        tie.encapsulation = capsule;
        tie.deletable = deletable;
        tie.restatable = restatable;
        tie.idempotent = idempotent;
        tie.assertive = assertive;
        tie.positIdentity = identity;
        tie.positGenerator = generator;
        tie.description = (description && description.firstChild) ? description.firstChild.nodeValue : '';
        var grandparent = element.parentNode.parentNode;
        // unified role elements
        var unifiedRoles = element.getElementsByTagName('role');
        if(unifiedRoles && unifiedRoles.length > 0) {
            // Infer classification: if mnemonic in knot lookup -> knot; else if in anchor or nexus lookup -> entity
            var anchorLookup2 = Model.getLookup('entity'); // extended to include nexus mnemonics earlier
            var knotLookup2 = Model.getLookup('knot');
            // Build refs arrays for parseRoles calls
            var anchorRefList2 = grandparent.getElementsByTagName('anchor');
            var nexusRefList2 = grandparent.getElementsByTagName('nexus');
            var knotRefList2 = grandparent.getElementsByTagName('knot');
            var combined2 = [];
            for(var c2 = 0; c2 < anchorRefList2.length; c2++) combined2.push(anchorRefList2[c2]);
            for(var n2 = 0; n2 < nexusRefList2.length; n2++) combined2.push(nexusRefList2[n2]);
            var entityRoles = [];
            var knotRolesNew = [];
            for(var ur = 0; ur < unifiedRoles.length; ur++) {
                var tMnemonic = unifiedRoles[ur].getAttribute('type');
                if(knotLookup2 && knotLookup2[tMnemonic]) knotRolesNew.push(unifiedRoles[ur]);
                else entityRoles.push(unifiedRoles[ur]);
            }
            if(entityRoles.length > 0) this.parseRoles(tie, entityRoles, anchorLookup2, combined2);
            if(knotRolesNew.length > 0) this.parseRoles(tie, knotRolesNew, knotLookup2, knotRefList2);
        }
        else { // legacy anchorRole/knotRole
            var anchorRoles = element.getElementsByTagName("anchorRole");
            if(anchorRoles && anchorRoles.length > 0) {
                // Combine anchors and nexuses for lookup resolution
                var anchorRefList = grandparent.getElementsByTagName("anchor");
                var nexusRefList = grandparent.getElementsByTagName("nexus");
                // Build a temporary NodeList-like array merging both
                var combined = [];
                for(var c = 0; c < anchorRefList.length; c++) combined.push(anchorRefList[c]);
                for(var n = 0; n < nexusRefList.length; n++) combined.push(nexusRefList[n]);
                // Reuse the entity lookup (anchors + nexuses)
                this.parseRoles(
                    tie,
                    anchorRoles,
                    Model.getLookup('entity'),
                    combined
                );
            }
            var knotRoles = element.getElementsByTagName("knotRole");
            if(knotRoles && knotRoles.length > 0)
                this.parseRoles(
                        tie,
                        knotRoles, 
                        Model.getLookup('knot'), 
                        grandparent.getElementsByTagName("knot")
                );
        }
        tie.updateName();
        return tie;
    },
    parseRoles: function(tie, roles, lookup, refs) {
        var i, j, d, type, role, roleName, identifier, description, coloring, referred, key;
        for(i = 0; i < roles.length; i++) {
            type = roles[i].getAttribute("type") || "??";
            roleName = roles[i].getAttribute("role");
            if(!roleName || roleName.match(/![^role].*!/)) roleName = "!role" + UniqueIdentity.nextId() + "!";
            identifier = roles[i].getAttribute("identifier") || false;
            coloring = roles[i].getAttribute("coloring") || "#000000";
            for(j = 0; j < refs.length; j++) {
                if(refs[j].getAttribute("mnemonic") === type) {
                    referred = lookup[refs[j].getAttribute("mnemonic")];
                    if(!referred) {
                        // Potentially stale lookup (component added earlier in XML). Rebuild once.
                        Model.markLookupsDirty();
                        var refreshed = (lookup === Model.getLookup('knot')) ? Model.getLookup('knot') : Model.getLookup('entity');
                        referred = refreshed[type];
                    }
                    if(!referred) {
                        // Cannot resolve target component; skip this role gracefully.
                        break;
                    }
                    role = new Role(tie, referred, (identifier === "true"));
                    role.role = roleName;
                    role.setColoring(coloring);
                    Model.addComponent(role);
                    role.updateName();
                    break; // only one should match
                }
            }
            if(role) {
                for(d = 0; d < roles[i].childNodes.length; d++) {
                    if(roles[i].childNodes.item(d).nodeName === 'description')
                        description = roles[i].childNodes.item(d);
                    // WIP: keys
                    if(roles[i].childNodes.item(d).nodeName === 'key') {
                        key = roles[i].childNodes.item(d);
                        role.keys.push({
                            stop: key.getAttribute("stop") || '1',
                            route: key.getAttribute("route"),
                            of: key.getAttribute("of"), 
                            branch: key.getAttribute("branch") || '1'
                        });
                    }
                }
                role.description = (description && description.firstChild) ? description.firstChild.nodeValue : '';
                // Enforce identifier=false for direct nexus links (NEXUS-ANCHOR/KNOT)
                var rn = role.node.node, ro = role.node.otherNode;
                if((rn.type === NodeType.NEXUS && (ro.type === NodeType.ANCHOR || ro.type === NodeType.KNOT)) ||
                   (ro.type === NodeType.NEXUS && (rn.type === NodeType.ANCHOR || rn.type === NodeType.KNOT))) {
                    role.setIdentifier(false);
                    var idx2 = role.operations.indexOf('toggleIdentifier');
                    if(idx2 >= 0) role.operations.splice(idx2, 1);
                }
            }
        }
    },
    toXML: function(schema) {
        var tie = schema.createElement("tie");
        if(Defaults.temporalization === 'crt' || Defaults.temporalization === 'bi')
            tie.setAttribute("identity", this.isEmpty(this.positIdentity) ? '' : this.positIdentity);
        if(this.historized)
            tie.setAttribute("timeRange", this.isEmpty(this.changingRange) ? '' : this.changingRange);
        var edges = this.node.edges;
        for(var i = 0; i < edges.length; i++) {
            var node = edges[i].otherNode;
            var role = Model.nodeToComponent(edges[i]);
            var component = Model.nodeToComponent(node);
            // unified role element (no explicit kind attribute; infer by mnemonic on load)
            var roleElement = schema.createElement("role");
            roleElement.setAttribute("role", this.isEmpty(role.role) ? "!role" + UniqueIdentity.nextId() + "!" : role.role);
            roleElement.setAttribute("type", this.isEmpty(component.mnemonic) ? "???" : component.mnemonic);
            if(role.coloring !== '#000000')
                roleElement.setAttribute("coloring", role.coloring);
            roleElement.setAttribute("identifier",
                    this.isEmpty(role.identifier) ? false : role.identifier);
            this.addDescriptionXML(roleElement, schema, role.description || component.description);
            // WIP: keys
            if(role.keys && role.keys.length > 0) {
                for(var k = 0; k < role.keys.length; k++) {
                    var key = schema.createElement("key");
                    key.setAttribute("stop", role.keys[k].stop);
                    key.setAttribute("route", role.keys[k].route);
                    key.setAttribute("of", role.keys[k].of);
                    key.setAttribute("branch", role.keys[k].branch);
                    roleElement.appendChild(key);
                }
            }
            tie.appendChild(roleElement);
        }

        var metadata = schema.createElement("metadata");
        metadata.setAttribute("capsule", this.encapsulation);
        if(Defaults.temporalization === 'crt' || Defaults.temporalization === 'bi') {
            metadata.setAttribute("generator", this.isEmpty(this.positGenerator) ? '' : this.positGenerator);
            metadata.setAttribute("assertive", this.isEmpty(this.assertive) ? '' : this.assertive);
        }
        if(this.historized) {
            metadata.setAttribute("restatable", this.isEmpty(this.restatable) ?
                    Defaults.restatability === 'true' : this.restatable);
        }
        metadata.setAttribute("deletable", this.isEmpty(this.deletable) ?
                Defaults.deletability === 'true' : this.deletable);
        metadata.setAttribute("idempotent", this.isEmpty(this.idempotent) ?
                Defaults.idempotency === 'true' : this.idempotent);
        tie.appendChild(metadata);
        this.addLayoutXML(tie, schema);
        this.addDescriptionXML(tie, schema, this.description);
        return tie;
    },
    contextualName: function() {
        var name;
        if(Settings.showMnemonics) {
            name = this.toString();
            if(this.historized && (this.restatable || this.idempotent)) {
                name += ' (';
                if(this.restatable)
                    name += 'r';
                if(this.idempotent)
                    name += 'i';
                if(this.deletable)
                    name += 'd';
                if((Defaults.temporalization === 'crt' || Defaults.temporalization === 'bi') && this.assertive)
                    name += 'a';
                name += ')';
            }
            if(this.postfixes.length > 0) 
                name += ' [' + this.postfixes.join(', ') + ']'; 
        }
        else
            name = '';
        return name;
    },
    toString: function() {
        var i, edge, component, role, name="";
        for(i = 0; edge = this.node.edges[i]; i++) {
            if(i > 0)
                name += "_";
            component = Model.nodeToComponent(edge.otherNode);
            role = Model.nodeToComponent(edge);
            name += component.mnemonic + "_" + role.role;
        }
        return name;
    },
    draw: function(image) {
        image.control.setTranslate(this.node.xPosition, this.node.yPosition);
    }
};

// inheritance
Object.setPrototypeOf(Tie.prototype, Component.prototype);
