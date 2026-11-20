// Knot: a knot.
import { Model } from './Model.js';
import { UniqueIdentity } from './UniqueIdentity.js';
import { Editables } from './Editables.js';
import { Component } from './Component.js';
import { Settings } from './Settings.js';
export function Knot(x, y) {
    this.id = UniqueIdentity.nextId();
    // call the parent constructor
    Component.call(this, new Node(this.id, x, y, NodeType.KNOT));
    this.mnemonic = '?' + this.getId();
    this.descriptor = '!Unnamed!';
    this.keys = [];
    this.editables.push(Editables.descriptorEdit);
    this.editables.push(Editables.threeMnemonicEdit);
    this.editables.push(Editables.encapsulationEdit);
    this.editables.push(Editables.dataRangeEdit);
    this.editables.push(Editables.identityEdit);
    this.editables.push(Editables.generatorEdit);
    this.editables.push(Editables.checksumEdit);
    this.editables.push(Editables.equivalenceEdit);
    this.encapsulation = Defaults.encapsulation;
    this.checksum = false;
    this.equivalent = Defaults.equivalence === 'true';
    // a knot is not a stop of a key route (a route reaches its value through a knotted attribute or a knot role), but
    // a stop on a knot in a model written by hand can still be removed
    this.operations.push('removeFromKey');
    // how it looks, for its view
    this.look = { ref: '#knot', xOffset: 6, yOffset: 0, navComponent: true };
    this.attachView();
    this.setNameable(true);
    this.postCreationInitialization();
}
Knot.prototype = {
    mnemonic: '',
    descriptor: '',
    identity: '',
    dataRange: '',
    generator: false,
    checksum: false,
    equivalent: false,
    encapsulation: Defaults.encapsulation,
    keys: null,
    isInteractive: function() {
        return true;
    },
    isDraggable: function() {
        return true;
    },
    contextualName: function() {
        var name;
        if(Settings.showMnemonics)
            name = this.toString();
        else
            name = this.descriptor;
        if(this.postfixes.length > 0) 
            name += ' [' + this.postfixes.join(', ') + ']'; 
        return name;
    },
    toString: function() {
        return this.mnemonic + "_" + this.descriptor;
    },
    isConforming: function() {
        var i, component, knot, knots = [];
        // first find the knots
        for(i = 0; component = Model.components[i]; i++) {
            if(component.node.type === NodeType.KNOT) {
                knots.push(component);
            }
        }
        // then check mnemonic uniqueness
        for(i = 0; knot = knots[i]; i++) {
            if(knot !== this && knot.mnemonic === this.mnemonic) {
                return !confirm("The mnemonic '" + this.mnemonic +
                        "' is not unique among other knots in the model. " +
                        "Please change to a different mnemonic in order to continue.");
            }
        }
        return true;
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
        var metadata, capsule = Defaults.encapsulation, generator = false;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'metadata')
                metadata = element.childNodes.item(i);
        var checksum = false;
        var equivalent = Defaults.equivalence === 'true';
        if(metadata) {
            capsule = metadata.getAttribute("capsule") || capsule;
            var _generator = metadata.getAttribute("generator");
            generator = _generator ? _generator === 'true' : generator;
            var _checksum = metadata.getAttribute("checksum");
            checksum = _checksum ? _checksum === 'true' : checksum;
            var _equivalent = metadata.getAttribute("equivalent");
            equivalent = _equivalent ? _equivalent === 'true' : equivalent;
        }
        // Begin - handling obsolete XML spec
        var idElement;
        if(idElement = element.getElementsByTagName('identity').item(0))
            generator = idElement.getAttribute("generator") ?
                    idElement.getAttribute("generator") === 'true' : generator;
        // End - handling obsolete XML spec
        var description;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'description')
                description = element.childNodes.item(i);
        var mnemonic = element.getAttribute("mnemonic") || "???";
        var descriptor = element.getAttribute("descriptor") || "!Unnamed!";
        var identity = element.getAttribute("identity") || '';
        var dataRange = element.getAttribute("dataRange") || '';
        var knot = new Knot(x, y);
        // WIP: keys
        for(i = 0; i < element.childNodes.length; i++) {
            if(element.childNodes.item(i).nodeName === 'key') {
                var key = element.childNodes.item(i);
                knot.keys.push({
                    stop: key.getAttribute("stop") || '1',
                    route: key.getAttribute("route"),
                    of: key.getAttribute("of"),
                    branch: key.getAttribute("branch") || '1'
                });
            }
        }
        knot.setFixed(fixed);
        knot.description = (description && description.firstChild) ? description.firstChild.nodeValue : '';
        knot.mnemonic = mnemonic;
        knot.descriptor = descriptor;
        knot.identity = identity;
        knot.dataRange = dataRange;
        knot.generator = generator;
        knot.equivalent = equivalent;
        knot.encapsulation = capsule;
        knot.checksum = checksum;
        knot.updateName();
        return knot;
    },
    toXML: function(schema) {
        // create an anchor element
        var knot = schema.createElement("knot");
        // set attributes on the element
        knot.setAttribute("mnemonic", this.isEmpty(this.mnemonic) ? "???" : this.mnemonic);
        knot.setAttribute("descriptor", this.isEmpty(this.descriptor) ? "!Unnamed!" : this.descriptor);
        knot.setAttribute("identity", this.isEmpty(this.identity) ? '' : this.identity);
        knot.setAttribute("dataRange", this.isEmpty(this.dataRange) ? '' : this.dataRange);

        var metadata = schema.createElement("metadata");
        metadata.setAttribute("capsule", this.isEmpty(this.encapsulation) ?
                Defaults.encapsulation : this.encapsulation);
        metadata.setAttribute("generator", this.isEmpty(this.generator) ? false : this.generator);
        if(this.checksum) {
            metadata.setAttribute("checksum", this.isEmpty(this.checksum) ?
                    false : this.checksum);
        }
        if(Defaults.equivalence === 'true') {
            metadata.setAttribute("equivalent", this.isEmpty(this.equivalent) ? '' : this.equivalent);
        }
        knot.appendChild(metadata);
        // WIP: keys
        if(this.keys && this.keys.length > 0) {
            for(var i = 0; i < this.keys.length; i++) {
                var key = schema.createElement("key");
                key.setAttribute("stop", this.keys[i].stop);
                key.setAttribute("route", this.keys[i].route);
                key.setAttribute("of", this.keys[i].of);
                key.setAttribute("branch", this.keys[i].branch);
                knot.appendChild(key);
            }
        }
        this.addLayoutXML(knot, schema);
        this.addDescriptionXML(knot, schema, this.description);
        return knot;
    },
};

// inheritance
Object.setPrototypeOf(Knot.prototype, Component.prototype);
