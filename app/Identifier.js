// Identifier: the identifier of an anchor or a nexus (a key route).
import { Model } from './Model.js';
import { UniqueIdentity } from './UniqueIdentity.js';
import { Editables, createOption } from './Editables.js';
import { Component } from './Component.js';
import { Role } from './Role.js';
import { Settings } from './Settings.js';
export function Identifier(x, y, entity, route) { // entity may be Anchor or Nexus
    if(!entity) {
        console.warn('[Identifier] Aborting creation: no entity supplied for route "' + route + '"');
        return; // abort
    }
    this.entity = entity; // unified property replaces anchor
    var qualified = entity.mnemonic + '|' + route;
    this.route = Model.routes[qualified];
    if (!this.route) {
        console.warn('[Identifier] Missing route "' + route + '" for entity ' + entity.mnemonic + '. Qualified key: ' + qualified + '. Available routes:', Object.keys(Model.routes));
        return; // abort so caller can skip safely
    }
    this.id = UniqueIdentity.nextId();
    // call the parent constructor
    Component.call(this, new Node(this.id, x, y, NodeType.IDENTIFIER));
    // set members
    // Removed keySelectEdit: identifiers are bound to their defining key route; editing route is not allowed.
    this.editables.push(Editables.encapsulationEdit);
    this.editables.push(Editables.positIdentityEdit);
    this.editables.push(Editables.positGeneratorEdit);
    this.editables.push(Editables.assertivenessEdit);
    this.editables.push(Editables.checksumEdit);
    this.editables.push(Editables.privacyEdit);
    this.historized = false;
    for(var stop in this.route.stops) {
        var component = this.route.stops[stop].component;
        if (component.node.type == NodeType.ATTRIBUTE && component.historized == true) {
            this.historized = true;
            this.changingRange = component.changingRange;
            break;
        }
        // do we want to historized if is passes through a historized tie?
        /*
        if (component.node.type == NodeType.EDGE && component.component.historized == true) {
            this.historized = true;
            this.changingRange = component.component.changingRange;
            break;
        }
        */
    }
    this.assertive = Defaults.assertiveness === 'true';
    this.checksum = Defaults.checksum === 'true';
    this.encapsulation = Defaults.encapsulation;
    this.privacy = Defaults.privacy;
    this.positIdentity = Defaults.positIdentity;
    this.positGenerator = Defaults.positGenerator === 'true';
    var ref = this.historized ? '#identifier_historized' : '#identifier';
    // how it looks, for its view
    this.look = { ref: ref, xOffset: 5, yOffset: 2, navComponent: false };
    this.attachView();
    this.setHistorized(this.historized);
    this.setNameable(true);
    this.postCreationInitialization();
}
Identifier.prototype = {
    changingRange: '',
    positIdentity: '',
    positGenerator: true,
    historized: false,
    assertive: true,
    checksum: false,
    encapsulation: Defaults.encapsulation,
    privacy: Defaults.privacy,
    route: null,
    entity: null,
    isInteractive: function() {
        return true;
    },
    isDraggable: function() {
        return true;
    },
    isConforming: function() {
        var i, edge, anchor, otherNode, otherComponent;
        // first find the anchor
        for(i = 0; edge = this.node.edges[i]; i++) {
            otherNode = (edge.node === this.node ? edge.otherNode : edge.node);
            if(otherNode.type === NodeType.ANCHOR) {
                anchor = Model.nodeToComponent(otherNode);
                break;
            }
        }
        // probably check that key exists
        return true;
    },
    prepareEditing: function(editable) {
        editable.elements.length = 0;
        if(!this.entity) return;
        var prefix = this.entity.mnemonic + '|';
        for (var r in Model.routes) {
            if (r.indexOf(prefix) === 0) {
                editable.elements.push(createOption(r, Model.routes[r].name));
            }
        }
    },
    setRoute: function(qualifiedRoute) {
        this.route = Model.routes[qualifiedRoute];
    },
    getRoute: function() {
        return (this.entity ? this.entity.mnemonic : '??') + '|' + (this.route ? this.route.name : '?');
    },
    setHistorized: function(historized) {
        // Identifiers may be historized implicitly if any stop attribute is historized, but
        // their time range and restatable properties are not user-editable (always schema metadata chronon).
        // Ensure legacy editables are removed if present.
        var idx = this.editables.indexOf(Editables.changingRangeEdit);
        if(idx >= 0) this.editables.splice(idx,1);
        idx = this.editables.indexOf(Editables.restatabilityEdit);
        if(idx >= 0) this.editables.splice(idx,1);
        if(this.changingRange === '' && historized) this.changingRange = Defaults.changingRange; // internal use only
        var ref = historized ? '#identifier_historized' : '#identifier';
        this.setShape(ref);
        this.historized = historized;
    },
    getHistorized: function() {
        return this.historized;
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
        var privacy = Defaults.privacy;
        var capsule = Defaults.encapsulation;
        var encryptionGroup = Defaults.encryptionGroup;
        var assertive = Defaults.assertiveness === 'true';
        var checksum = Defaults.checksum === 'true';
        var generator = Defaults.positGenerator === 'true';
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'metadata')
                metadata = element.childNodes.item(i);
        if(metadata) {
            privacy = metadata.getAttribute("privacy") || privacy;
            capsule = metadata.getAttribute("capsule") || capsule;
            encryptionGroup = metadata.getAttribute("encryptionGroup") || encryptionGroup;
            var _checksum = metadata.getAttribute("checksum");
            checksum = _checksum ? _checksum === 'true' : checksum;
            var _generator = metadata.getAttribute("generator");
            generator = _generator ? _generator === 'true' : generator;
            var _assertive = metadata.getAttribute("assertive");
            assertive = _assertive ? _assertive === 'true' : assertive;
        }
        var description;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'description')
                description = element.childNodes.item(i);
        var route = element.getAttribute("route");
        var changingRange = element.getAttribute("timeRange");
        var parent = element.parentNode;
        var entityLookup = Model.getLookup('entity');
        var entity = entityLookup[parent.getAttribute("mnemonic")];
        var identity = element.getAttribute("identity") || Defaults.positIdentity;
        var identifier = new Identifier(x, y, entity, route);
        if(!identifier) {
            console.warn('[Identifier.fromXML] Skipped identifier for entity', entity && entity.mnemonic, 'route="' + route + '" (route missing).');
            return null;
        } else {
            identifier.setFixed(fixed);
        }
        identifier.description = (description && description.firstChild) ? description.firstChild.nodeValue : '';
        identifier.privacy = privacy;
        identifier.encapsulation = capsule;
        identifier.assertive = assertive;
        identifier.checksum = checksum;
        identifier.encryptionGroup = encryptionGroup;
        identifier.positIdentity = identity;
        identifier.positGenerator = generator;
        if(changingRange) identifier.changingRange = changingRange;
        Model.addComponent(new Role(identifier, entity, true));
        identifier.updateName();
        return identifier;
    },
    addXML: function(element, schema) {
        // create an identifier element (correct spelling)
        var identifierEl = schema.createElement("identifier");
        identifierEl.setAttribute("route", this.route.name);
        // NOTE: timeRange attribute for identifiers has been deprecated.
        // Historizaton of an identifier is derived from its key route (presence of historized stops)
        // and no longer serialized explicitly. We keep reading legacy timeRange on load for backward compatibility
        // but we do not emit it anymore.
        if(Defaults.temporalization === 'crt' || Defaults.temporalization === 'bi')
            identifierEl.setAttribute("identity", this.isEmpty(this.positIdentity) ? '' : this.positIdentity);
        var metadata = schema.createElement("metadata");
        metadata.setAttribute("privacy", this.isEmpty(this.privacy) ?
                Defaults.privacy : this.privacy);
        if(!this.isEmpty(this.encryptionGroup)) {
            metadata.setAttribute("encryptionGroup", this.encryptionGroup);
        }
        metadata.setAttribute("capsule", this.isEmpty(this.encapsulation) ?
                Defaults.encapsulation : this.encapsulation);
        if(Defaults.temporalization === 'crt' || Defaults.temporalization === 'bi') {
            metadata.setAttribute("generator", this.isEmpty(this.positGenerator) ? '' : this.positGenerator);
            metadata.setAttribute("assertive", this.isEmpty(this.assertive) ? '' : this.assertive);
        }
        if(this.checksum) {
            metadata.setAttribute("checksum", this.isEmpty(this.checksum) ?
                    false : this.checksum);
        }
        // Removed restatable for identifiers: historization is derived and identifier restatability is not user-controlled.
        identifierEl.appendChild(metadata);
        this.addLayoutXML(identifierEl, schema);
        this.addDescriptionXML(identifierEl, schema, this.description);
        element.appendChild(identifierEl);
    },
    contextualName: function() {
        var name = '';
        if(Settings.showMnemonics)
            name += this.toString();
        else
            name += this.route.name;
        if(this.postfixes.length > 0) 
            name += ' [' + this.postfixes.join(', ') + ']'; 
        return name;
    },
    toString: function() {
        // Prefer the explicitly stored entity reference set in the constructor
        var anchor = this.entity;
        // Fallback: derive from current edges (legacy behavior)
        if(!anchor) {
            var edge;
            for(var i = 0; edge = this.node.edges[i]; i++) {
                if(edge.otherNode.type === NodeType.ANCHOR) {
                    anchor = Model.nodeToComponent(edge.otherNode);
                    break;
                }
            }
        }
        if(!anchor) {
            // Orphaned identifier (edge construction order or data issue); return safe placeholder
            return '!OrphanIdentifier!' + (this.route && this.route.name ? '_' + this.route.name : '');
        }
        var routeName = (this.route && this.route.name) ? this.route.name : '?';
        return anchor.mnemonic + '_' + anchor.descriptor + '_' + routeName;
    },
};

// inheritance
Object.setPrototypeOf(Identifier.prototype, Component.prototype);
