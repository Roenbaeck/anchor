// Attribute: an attribute (static, historized, knotted).
import { Model } from './Model.js';
import { UniqueIdentity } from './UniqueIdentity.js';
import { Editables } from './Editables.js';
import { Component } from './Component.js';
import { Role } from './Role.js';
import { Settings } from './Settings.js';
export function Attribute(x, y, historized) {
    this.id = UniqueIdentity.nextId();
    // call the parent constructor
    Component.call(this, new Node(this.id, x, y, NodeType.ATTRIBUTE));
    // set members
    this.mnemonic = '?' + this.getId();
    this.descriptor = '!Unnamed!';
    this.keys = [];
    this.editables.push(Editables.descriptorEdit);
    this.editables.push(Editables.threeMnemonicEdit);
    this.editables.push(Editables.encapsulationEdit);
    this.editables.push(Editables.dataRangeEdit);
    this.editables.push(Editables.positIdentityEdit);
    this.editables.push(Editables.positGeneratorEdit);
    this.editables.push(Editables.assertivenessEdit);
    this.editables.push(Editables.checksumEdit);
    this.editables.push(Editables.deletabilityEdit);
    this.editables.push(Editables.idempotencyEdit);
    this.editables.push(Editables.encryptionGroupEdit);
    this.editables.push(Editables.equivalenceEdit);
    this.editables.push(Editables.privacyEdit);
    this.knotted = false;
    this.historized = historized;
    this.deletable = Defaults.deletability === 'true';
    this.restatable = Defaults.restatability === 'true';
    this.idempotent = Defaults.idempotency === 'true';
    this.assertive = Defaults.assertiveness === 'true';
    this.equivalent = Defaults.equivalence === 'true';
    this.checksum = Defaults.checksum === 'true';
    this.encryptionGroup = Defaults.encryptionGroup;
    this.encapsulation = Defaults.encapsulation;
    this.privacy = Defaults.privacy;
    this.positIdentity = Defaults.positIdentity;
    this.positGenerator = Defaults.positGenerator === 'true';
    this.chronicle = 0;
    this.operations.push('toggleKnotted','toggleHistorized', 'addToKey', 'removeFromKey', 'createKey');
    // Note: 'toggleHistorized' will be removed automatically if the attribute connects to a Nexus (see Role construction adjustments if added)
    var ref = historized ? '#attribute_historized' : '#attribute';
    // how it looks, for its view
    this.look = { ref: ref, xOffset: 5, yOffset: 2, navComponent: false };
    this.attachView();
    this.setNameable(true);
    this.postCreationInitialization();
}
Attribute.prototype = {
    mnemonic: '',
    descriptor: '',
    dataRange: '',
    changingRange: '',
    positIdentity: '',
    positGenerator: true,
    historized: false,
    deletable: false,
    restatable: true,
    idempotent: false,
    assertive: true,
    equivalent: false,
    checksum: false,
    encryptionGroup: Defaults.encryptionGroup,
    knotted: false,
    encapsulation: Defaults.encapsulation,
    privacy: Defaults.privacy,
    keys: null,
    isInteractive: function() {
        return true;
    },
    isDraggable: function() {
        return true;
    },
    isConforming: function() {
        var i, edge, anchor, otherNode, otherComponent;
        // first find the anchor or nexus parent
        for(i = 0; edge = this.node.edges[i]; i++) {
            otherNode = (edge.node === this.node ? edge.otherNode : edge.node);
            if(otherNode.type === NodeType.ANCHOR || otherNode.type === NodeType.NEXUS) {
                anchor = Model.nodeToComponent(otherNode);
                break;
            }
        }
        // If no parent anchor/nexus, skip uniqueness check (attribute not yet fully connected)
        if(!anchor || !anchor.node) return true;
        // then check mnemonic uniqueness
        for(i = 0; edge = anchor.node.edges[i]; i++) {
            otherNode = (edge.node === anchor.node ? edge.otherNode : edge.node);
            otherComponent = Model.nodeToComponent(otherNode);
            if(otherNode.type === NodeType.ATTRIBUTE && otherNode !== this.node && otherComponent.mnemonic === this.mnemonic) {
                return !confirm("The mnemonic '" + this.mnemonic +
                        "' is not unique among other attributes on the '" + anchor +
                        "' anchor. Please change to a different mnemonic in order to continue.");
            }
        }
        return true;
    },
    setHistorized: function(historized) {
        // Prevent historization for attributes that belong to a Nexus (event attributes are immutable)
        if(historized) {
            for(var i = 0; i < this.node.edges.length; i++) {
                var e = this.node.edges[i];
                var otherNode = (e.node === this.node ? e.otherNode : e.node);
                if(otherNode.type === NodeType.NEXUS) {
                    // Silently ignore request (could alternatively warn)
                    historized = false;
                    break;
                }
            }
        }
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
        var ref = historized ? '#attribute_historized' : '#attribute';
        this.setShape(ref);
        this.historized = historized;
    },
    getHistorized: function() {
        return this.historized;
    },
    setKnotted: function(knotted) {
        var index = this.editables.indexOf(Editables.dataRangeEdit);
        if(!knotted && index < 0)
            this.editables.push(Editables.dataRangeEdit);
        else if (knotted && index >= 0)
            this.editables.splice(index, 1);
        index = this.editables.indexOf(Editables.checksumEdit);
        if(!knotted && index < 0)
            this.editables.push(Editables.checksumEdit);
        else if (knotted && index >= 0)
            this.editables.splice(index, 1);
        index = this.editables.indexOf(Editables.encryptionGroupEdit);
        if(!knotted && index < 0)
            this.editables.push(Editables.encryptionGroupEdit);
        else if (knotted && index >= 0)
            this.editables.splice(index, 1);                
        index = this.editables.indexOf(Editables.equivalenceEdit);
        if(!knotted && index < 0)
            this.editables.push(Editables.equivalenceEdit);
        else if (knotted && index >= 0)
            this.editables.splice(index, 1);
        if(this.encryptionGroup && knotted)
            this.encryptionGroup = ''; // knotted cannot be encrypted
        if(this.checksum && knotted)
            this.checksum = false; // knotted cannot be checksummed
        if(this.equivalent && knotted)
            this.equivalent = false; // knotted cannot be equivalent
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
        var privacy = Defaults.privacy;
        var capsule = Defaults.encapsulation;
        var encryptionGroup = Defaults.encryptionGroup;
        var deletable = Defaults.deletability === 'true';
        var restatable = Defaults.restatability === 'true';
        var idempotent = Defaults.idempotency === 'true';
        var assertive = Defaults.assertiveness === 'true';
        var equivalent = Defaults.equivalence === 'true';
        var checksum = Defaults.checksum === 'true';
        var generator = Defaults.positGenerator === 'true';
        var chronicle = 0;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'metadata')
                metadata = element.childNodes.item(i);
        if(metadata) {
            privacy = metadata.getAttribute("privacy") || privacy;
            capsule = metadata.getAttribute("capsule") || capsule;
            encryptionGroup = metadata.getAttribute("encryptionGroup") || encryptionGroup;
            var _deletable = metadata.getAttribute("deletable");
            deletable = _deletable ? _deletable === 'true' : deletable;
            var _restatable = metadata.getAttribute("restatable") || metadata.getAttribute("restatements");
            restatable = _restatable ? _restatable === 'true' : restatable;
            var _idempotent = metadata.getAttribute("idempotent");
            idempotent = _idempotent ? _idempotent === 'true' : idempotent;
            var _checksum = metadata.getAttribute("checksum");
            checksum = _checksum ? _checksum === 'true' : checksum;
            var _generator = metadata.getAttribute("generator");
            generator = _generator ? _generator === 'true' : generator;
            var _assertive = metadata.getAttribute("assertive");
            assertive = _assertive ? _assertive === 'true' : assertive;
            var _equivalent = metadata.getAttribute("equivalent");
            equivalent = _equivalent ? _equivalent === 'true' : equivalent;
        }
        var description;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'description')
                description = element.childNodes.item(i);
        var mnemonic = element.getAttribute("mnemonic") || '???';
        var descriptor = element.getAttribute("descriptor") || '!Unnamed!';
        var changingRange = element.getAttribute("timeRange") || '';
        var historized = changingRange ? true : false;
        var knotRange = element.getAttribute("knotRange") || '';
        var knotted = knotRange ? true : false;
        var dataRange = element.getAttribute("dataRange") || '';
        var parent = element.parentNode;
        var identity = element.getAttribute("identity") || Defaults.positIdentity;
        var chronicle = element.getAttribute("chronicle");
        chronicle = chronicle ? parseInt(chronicle) : 0;
        var attribute = new Attribute(x, y, historized);
        // WIP: keys
        for(i = 0; i < element.childNodes.length; i++) {
            if(element.childNodes.item(i).nodeName === 'key') {
                var key = element.childNodes.item(i);
                attribute.keys.push({
                    stop: key.getAttribute("stop") || '1',
                    route: key.getAttribute("route"),
                    of: key.getAttribute("of"),
                    branch: key.getAttribute("branch") || '1'
                });
            }
        }
        attribute.setFixed(fixed);
        attribute.setKnotted(knotted);
        attribute.setHistorized(historized);
        attribute.changingRange = changingRange;
        attribute.dataRange = dataRange;
        attribute.description = (description && description.firstChild) ? description.firstChild.nodeValue : '';
        attribute.mnemonic = mnemonic;
        attribute.descriptor = descriptor;
        attribute.privacy = privacy;
        attribute.encapsulation = capsule;
        attribute.deletable = deletable;
        attribute.restatable = restatable;
        attribute.idempotent = idempotent;
        attribute.assertive = assertive;
        attribute.equivalent = equivalent;
        attribute.checksum = checksum;
        attribute.encryptionGroup = encryptionGroup;
        attribute.positIdentity = identity;
        attribute.positGenerator = generator;
        attribute.chronicle = chronicle;
        // the flags of the file were assigned after the first call, which undid its rule that a knotted
        // attribute is not equivalent, checksummed or encrypted
        attribute.setKnotted(knotted);
        var anchorLookup = Model.getLookup('entity');
        var knotLookup = Model.getLookup('knot');
        var anchor = anchorLookup[parent.getAttribute("mnemonic")];
        // Only create role if anchor exists (skip attributes belonging to nexus)
        if(anchor) {
            Model.addComponent(new Role(attribute, anchor, true));
        }
        if(knotted) {
            var grandparent = parent.parentNode;
            var knots = grandparent.getElementsByTagName("knot");
            for(i = 0; i < knots.length; i++) {
                if(knots[i].getAttribute("mnemonic") === knotRange) {
                    var knot = knotLookup[knots[i].getAttribute("mnemonic")];
                    Model.addComponent(new Role(attribute, knot, false));
                    break; // only one should match
                }
            }
        }
        attribute.updateName();
        return attribute;
    },
    addXML: function(element, schema) {
        // create an attribute element
        var attribute = schema.createElement("attribute");
        // set attributes on the element
        attribute.setAttribute("mnemonic", this.isEmpty(this.mnemonic) ? "???" : this.mnemonic);
        attribute.setAttribute("descriptor", this.isEmpty(this.descriptor) ? "!Unnamed!" : this.descriptor);
        if(Defaults.temporalization === 'crt' || Defaults.temporalization === 'bi')
            attribute.setAttribute("identity", this.isEmpty(this.positIdentity) ? '' : this.positIdentity);
        if(this.historized)
            attribute.setAttribute("timeRange", this.isEmpty(this.changingRange) ? '' : this.changingRange);
        if(this.knotted) {
            var knot, edge;
            for(var i = 0; edge = this.node.edges[i]; i++)
                if(edge.otherNode.type === NodeType.KNOT)
                    knot = Model.nodeToComponent(edge.otherNode);
            attribute.setAttribute("knotRange", this.isEmpty(knot.mnemonic) ? '' : knot.mnemonic);
        }
        else {
            attribute.setAttribute("dataRange", this.isEmpty(this.dataRange) ? '' : this.dataRange);
        }
        if(this.chronicle > 0) {
            attribute.setAttribute("chronicle", this.chronicle);
        }
        var metadata = schema.createElement("metadata");
        metadata.setAttribute("privacy", this.isEmpty(this.privacy) ?
                Defaults.privacy : this.privacy);
        if(!this.isEmpty(this.encryptionGroup)) {
            metadata.setAttribute("encryptionGroup", this.encryptionGroup);
        }
        metadata.setAttribute("capsule", this.isEmpty(this.encapsulation) ?
                Defaults.encapsulation : this.encapsulation);
        if(Defaults.equivalence === 'true') {
            metadata.setAttribute("equivalent", this.isEmpty(this.equivalent) ? '' : this.equivalent);
        }
        if(Defaults.temporalization === 'crt' || Defaults.temporalization === 'bi') {
            metadata.setAttribute("generator", this.isEmpty(this.positGenerator) ? '' : this.positGenerator);
            metadata.setAttribute("assertive", this.isEmpty(this.assertive) ? '' : this.assertive);
        }
        if(this.checksum) {
            metadata.setAttribute("checksum", this.isEmpty(this.checksum) ?
                    false : this.checksum);
        }
        if(this.historized) {
            metadata.setAttribute("restatable", this.isEmpty(this.restatable) ?
                    Defaults.restatability === 'true' : this.restatable);
        }
        metadata.setAttribute("idempotent", this.isEmpty(this.idempotent) ?
                Defaults.idempotency === 'true' : this.idempotent);                
        metadata.setAttribute("deletable", this.isEmpty(this.deletable) ?
                Defaults.deletability === 'true' : this.deletable);                
        attribute.appendChild(metadata);
        // WIP: keys
        if(this.keys && this.keys.length > 0) {
            for(var i = 0; i < this.keys.length; i++) {
                var key = schema.createElement("key");
                key.setAttribute("stop", this.keys[i].stop);
                key.setAttribute("route", this.keys[i].route);
                key.setAttribute("of", this.keys[i].of);
                key.setAttribute("branch", this.keys[i].branch);
                attribute.appendChild(key);
            }
        }
        this.addLayoutXML(attribute, schema);
        this.addDescriptionXML(attribute, schema, this.description);
        element.appendChild(attribute);
    },
    contextualName: function() {
        var name = '';
        if(Settings.showMnemonics)
            name += this.toString();
        else
            name += this.descriptor;
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
        return name;
    },
    toString: function() {
        var parent, edge, otherNode;
        for(var i = 0; edge = this.node.edges[i]; i++) {
            otherNode = (edge.node === this.node ? edge.otherNode : edge.node);
            if(otherNode.type === NodeType.ANCHOR || otherNode.type === NodeType.NEXUS) {
                parent = Model.nodeToComponent(otherNode);
                break;
            }
        }
        // Fallback if parent not yet connected (during creation/deletion)
        if(!parent) return this.mnemonic + "_" + this.descriptor;
        return parent.mnemonic + "_" + this.mnemonic + "_" + parent.descriptor + "_" + this.descriptor;
    },
};

// inheritance
Object.setPrototypeOf(Attribute.prototype, Component.prototype);
