// Nexus: a nexus.
import { Model } from './Model.js';
import { UniqueIdentity } from './UniqueIdentity.js';
import { Editables } from './Editables.js';
import { Component } from './Component.js';
import { Attribute } from './Attribute.js';
import { Role } from './Role.js';
export function Nexus(x, y) {
    this.id = UniqueIdentity.nextId();
    // call the parent constructor
    Component.call(this, new Node(this.id, x, y, NodeType.NEXUS));
    this.mnemonic = '?' + this.getId();
    this.descriptor = '!Unnamed!';
    this.identity = Defaults.identity;
    this.generator = true;
    this.encapsulation = Defaults.encapsulation;
    this.editables.push(Editables.descriptorEdit);
    this.editables.push(Editables.twoMnemonicEdit);
    this.editables.push(Editables.encapsulationEdit);
    this.editables.push(Editables.identityEdit);
    this.editables.push(Editables.generatorEdit);
    this.operations.push('addAttribute','addKnot','addAnchor','explode', 'addToKey', 'createKey');
    // how it looks, for its view (a nexus is given its shape when it is drawn)
    this.look = { ref: '#nexus', implodedRef: '#nexus_imploded', drawsShape: true, xOffset: 6, yOffset: 0, navComponent: true, nameClass: 'nexus' };
    this.attachView();
    this.setNameable(true);
    this.postCreationInitialization();
}
Nexus.prototype = {
    mnemonic: '',
    descriptor: '',
    identity: Defaults.identity,
    generator: true,
    encapsulation: Defaults.encapsulation,
    isInteractive: function() {
        return true;
    },
    isDraggable: function() {
        return true;
    },
    isConforming: function() {
        // A Nexus must have at least one chronicled attribute (attribute.chronicle > 0)
        // Traverse edges and look for any connected Attribute component with chronicle > 0.
        var edges = this.node && this.node.edges ? this.node.edges : [];
        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            // Attributes can appear on either side depending on construction order
            if (edge.node && edge.node.type === NodeType.ATTRIBUTE) {
                var attr = Model.nodeToComponent(edge.node);
                if (attr && typeof attr.chronicle === 'number' && attr.chronicle > 0)
                    return true;
            }
            if (edge.otherNode && edge.otherNode.type === NodeType.ATTRIBUTE) {
                var attr2 = Model.nodeToComponent(edge.otherNode);
                if (attr2 && typeof attr2.chronicle === 'number' && attr2.chronicle > 0)
                    return true;
            }
        }
        // No chronicled attribute found; ask user to confirm continuing, mirroring style in other isConforming methods.
        return !confirm("The nexus " + this + " has no chronicled attribute (chronicle > 0). " +
                "At least one chronicled attribute is necessary to capture temporal progression.");
    },
    setImploded: function(imploded) {
        this.imploded = imploded;
        if(imploded) {
            if(this.operations.indexOf('addAttribute') >= 0)
                this.operations.splice(this.operations.indexOf('addAttribute'), 1);
        }
        else {
            this.operations.push('addAttribute');
        }
    },
    toXML: function(schema) {
        // create a nexus element
        var nexus = schema.createElement("nexus");
        // set attributes on the element
        nexus.setAttribute("mnemonic", this.isEmpty(this.mnemonic) ? "??" : this.mnemonic);
        nexus.setAttribute("descriptor", this.isEmpty(this.descriptor) ? "!Unnamed!" : this.descriptor);
        nexus.setAttribute("identity", this.isEmpty(this.identity) ? "" : this.identity);

        var metadata = schema.createElement("metadata");
        metadata.setAttribute("capsule", this.isEmpty(this.encapsulation) ?
                Defaults.encapsulation : this.encapsulation);
        metadata.setAttribute("generator", this.isEmpty(this.generator) ? false : this.generator);
        nexus.appendChild(metadata);

        var edge;
        for(var i = 0; edge = this.node.edges[i]; i++) {
            // Attributes and Identifiers are always on edge.node side (Role constructed with node=attribute/identifier, otherNode=entity)
            if (edge.node.type === NodeType.ATTRIBUTE || edge.node.type === NodeType.IDENTIFIER) {
                var comp = Model.nodeToComponent(edge.node);
                // Attribute and Identifier components both implement addXML(element,schema)
                // so we can call it generically here.
                if(comp && typeof comp.addXML === 'function') {
                    comp.addXML(nexus, schema);
                }
            }
            else if (edge.otherNode.type === NodeType.ANCHOR || edge.otherNode.type === NodeType.KNOT) {
                var r = Model.nodeToComponent(edge);
                var roleElement = schema.createElement('role');
                roleElement.setAttribute('role', this.isEmpty(r.role) ? '!role' + r.id + '!' : r.role);
                roleElement.setAttribute('type', r.otherComponent.mnemonic);
                roleElement.setAttribute('identifier', r.identifier);
                if(r.coloring !== '#000000') {
                    roleElement.setAttribute('coloring', r.coloring);
                }
                // Serialize any key definitions on nexus roles (parity with Tie.toXML)
                if(r.keys && r.keys.length > 0) {
                    for(var k = 0; k < r.keys.length; k++) {
                        var keyElem = schema.createElement('key');
                        keyElem.setAttribute('stop', r.keys[k].stop);
                        keyElem.setAttribute('route', r.keys[k].route);
                        keyElem.setAttribute('of', r.keys[k].of);
                        keyElem.setAttribute('branch', r.keys[k].branch);
                        roleElement.appendChild(keyElem);
                    }
                }
                this.addDescriptionXML(roleElement, schema, r.description);
                nexus.appendChild(roleElement);
            }
        }
        this.addLayoutXML(nexus, schema);
        this.addDescriptionXML(nexus, schema, this.description);
        return nexus;
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
        var metadata, capsule = Defaults.encapsulation, generator = true;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'metadata')
                metadata = element.childNodes.item(i);
        if(metadata) {
            capsule = metadata.getAttribute("capsule") || capsule;
            generator = metadata.getAttribute("generator") ?
                    metadata.getAttribute("generator") === 'true' : generator;
        }
        var mnemonic = element.getAttribute("mnemonic") || "??";
        var descriptor = element.getAttribute("descriptor") || "!Unnamed!";
        var identity = element.getAttribute("identity") || '';
        var nexus = new Nexus(x, y);
        nexus.setFixed(fixed);
        nexus.mnemonic = mnemonic;
        nexus.descriptor = descriptor;
        nexus.identity = identity;
        nexus.generator = generator;
        nexus.encapsulation = capsule;
        var description;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'description')
                description = element.childNodes.item(i);
        nexus.description = (description && description.firstChild) ? description.firstChild.nodeValue : '';

        // Parse attributes (similar to Anchor)
        var attributes = element.getElementsByTagName("attribute");
        for(i = 0; i < attributes.length; i++) {
            var attribute = Attribute.prototype.fromXML(attributes[i]);
            Model.addComponent(attribute);
            Model.addComponent(new Role(attribute, nexus, true));
        }
        
        // Parse roles (unified or legacy)
        var grandparent = element.parentNode;
        var unifiedRolesNexus = element.getElementsByTagName('role');
        if(unifiedRolesNexus && unifiedRolesNexus.length > 0) {
            var anchorRefsNexus = grandparent.getElementsByTagName('anchor');
            var knotRefsNexus = grandparent.getElementsByTagName('knot');
            var anchorLookupNexus = Model.getLookup('entity');
            var knotLookupNexus = Model.getLookup('knot');
            var entityRolesNexus = [];
            var knotRolesNexus = [];
            for(var urx = 0; urx < unifiedRolesNexus.length; urx++) {
                var tMnemonic2 = unifiedRolesNexus[urx].getAttribute('type');
                if(knotLookupNexus && knotLookupNexus[tMnemonic2]) knotRolesNexus.push(unifiedRolesNexus[urx]);
                else entityRolesNexus.push(unifiedRolesNexus[urx]);
            }
            if(entityRolesNexus.length > 0) this.parseRoles(nexus, entityRolesNexus, anchorLookupNexus, anchorRefsNexus);
            if(knotRolesNexus.length > 0) this.parseRoles(nexus, knotRolesNexus, knotLookupNexus, knotRefsNexus);
        }
        else {
            // legacy parsing
            var anchorRolesLegacy = element.getElementsByTagName("anchorRole");
            if(anchorRolesLegacy && anchorRolesLegacy.length > 0) {
                this.parseRoles(
                    nexus,
                    anchorRolesLegacy, 
                    Model.getLookup('entity'), 
                    grandparent.getElementsByTagName("anchor")
                );
            }
            var knotRolesLegacy = element.getElementsByTagName("knotRole");
            if(knotRolesLegacy && knotRolesLegacy.length > 0) {
                this.parseRoles(
                    nexus,
                    knotRolesLegacy,
                    Model.getLookup('knot'), 
                    grandparent.getElementsByTagName("knot")
                );
            }
        }
        
        nexus.updateName();
        return nexus;
    },
    parseRoles: function(nexus, roles, lookup, refs) {
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
                    if(referred) {
                        role = new Role(nexus, referred, (identifier === "true"));
                        role.role = roleName;
                        role.setColoring(coloring);
                        Model.addComponent(role);
                        role.updateName();
                    }
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
                var tn = role.node.node, to = role.node.otherNode;
                if((tn.type === NodeType.NEXUS && (to.type === NodeType.ANCHOR || to.type === NodeType.KNOT)) ||
                   (to.type === NodeType.NEXUS && (tn.type === NodeType.ANCHOR || tn.type === NodeType.KNOT))) {
                    role.setIdentifier(false);
                    var idx3 = role.operations.indexOf('toggleIdentifier');
                    if(idx3 >= 0) role.operations.splice(idx3, 1);
                }
            }
        }
    },
    toString: function() {
        return this.mnemonic + "_" + this.descriptor;
    },
    contextualName: function() {
        var name;
        if(Component.showMnemonics)
            name = this.toString();
        else
            name = this.descriptor;
        if(this.imploded)
            name = "(" + name + ")";
        if(this.postfixes.length > 0) 
            name += ' [' + this.postfixes.join(', ') + ']'; 
        return name;
    }
};

// inheritance
Object.setPrototypeOf(Nexus.prototype, Component.prototype);
