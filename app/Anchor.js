// Anchor: an anchor.
"use strict";

function Anchor(x, y) {
    this.id = UniqueIdentity.nextId();
    // call the parent constructor
    Component.call(this, new Node(this.id, x, y, NodeType.ANCHOR));
    this.mnemonic = '?' + this.getId();
    this.descriptor = '!Unnamed!';
    this.editables.push(Editables.descriptorEdit);
    this.editables.push(Editables.twoMnemonicEdit);
    this.editables.push(Editables.encapsulationEdit);
    this.editables.push(Editables.identityEdit);
    this.editables.push(Editables.generatorEdit);
    this.encapsulation = Defaults.encapsulation;
    this.identity = Defaults.identity;
    this.operations.push('addAttribute','addTie','addTieAndAnchor','addNexus','explode', 'addToKey', 'createKey');
    // set up SVG graphics
    this.svg.graphicsElement = document.createElementNS(SVGNS, 'g');
    this.svg.graphicsElement.component = this;
    this.svg.useElement = document.createElementNS(SVGNS, 'use');
    this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', '#anchor');
    this.svg.graphicsElement.appendChild(this.svg.useElement);
    this.svg.graphicsElement.addEventListener('mouseover', EventHandler.beginInteraction, false);
    SVGLayer.nodes.appendChild(this.svg.graphicsElement);
    this.svg.control = this.svg.graphicsElement.transform.baseVal.appendItem(
        this.svg.graphicsElement.ownerSVGElement.createSVGTransform()
    );
    this.svg.control.setTranslate(x, y);
    this.svg.boundingBox = this.svg.graphicsElement.getBBox();
    this.svg.xOffset = 6;
    this.svg.yOffset = 0;
    // set up NAV graphics
    this.nav.graphicsElement = document.createElementNS(SVGNS, 'g');
    this.nav.graphicsElement.component = this;
    this.nav.useElement = document.createElementNS(SVGNS, 'use');
    this.nav.useElement.setAttributeNS(XLINKNS, 'xlink:href', '#nav_anchor');
    this.nav.graphicsElement.appendChild(this.nav.useElement);
    NAVLayer.nodes.appendChild(this.nav.graphicsElement);
    this.nav.control = this.nav.graphicsElement.transform.baseVal.appendItem(
        this.nav.graphicsElement.ownerSVGElement.createSVGTransform()
    );
    this.nav.control.setTranslate(x, y);
    this.setNameable(true);
    this.svg.nameElement.setAttributeNS(null, 'class', 'anchor');
    this.postCreationInitialization();
}
Anchor.prototype = {
    mnemonic: '',
    descriptor: '',
    identity: Defaults.identity,
    generator: true,
    encapsulation: Defaults.encapsulation,
    setImploded: function(imploded) {
        this.imploded = imploded;
        if(imploded) {
            if(this.operations.indexOf('addAttribute') >= 0)
                this.operations.splice(this.operations.indexOf('addAttribute'), 1);
            this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', '#anchor_imploded');
        }
        else {
            this.operations.push('addAttribute');
            this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', '#anchor');
        }
    },
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
        if(this.imploded)
            name = "(" + name + ")";
        if(this.postfixes.length > 0) 
            name += ' [' + this.postfixes.join(', ') + ']'; 
        return name;
    },
    toString: function() {
        return this.mnemonic + "_" + this.descriptor;
    },
    isConforming: function() {
        var i, component, anchor, anchors = [];
        // first find the anchors
        for(i = 0; component = Model.components[i]; i++) {
            if(component.node.type === NodeType.ANCHOR) {
                anchors.push(component);
            }
        }
        // then check mnemonic uniqueness
        for(i = 0; anchor = anchors[i]; i++) {
            if(anchor !== this && anchor.mnemonic === this.mnemonic) {
                return !confirm("The mnemonic '" + this.mnemonic +
                        "' is not unique among other anchors in the model. " +
                        "Please change to a different mnemonic in order to continue.");
            }
        }
        return true;
    },
    fromXML: function(element) {
        var x, y, fixed, i, layout, imploded;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'layout')
                layout = element.childNodes.item(i);
        if(layout) {
            x = layout.getAttribute("x");
            y = layout.getAttribute("y");
            fixed = layout.getAttribute("fixed");
            imploded = layout.getAttribute("imploded");
        }
        x = x ? Number(x) : Math.random() * window.innerWidth;
        y = y ? Number(y) : Math.random() * window.innerHeight;
        fixed = fixed ? fixed === 'true' : false;
        imploded = imploded ? imploded === 'true' : false;
        var metadata, capsule = Defaults.encapsulation, generator = true;
        for(i = 0; i < element.childNodes.length; i++)
            if(element.childNodes.item(i).nodeName === 'metadata')
                metadata = element.childNodes.item(i);
        if(metadata) {
            capsule = metadata.getAttribute("capsule") || capsule;
            generator = metadata.getAttribute("generator") ?
                    metadata.getAttribute("generator") === 'true' : generator;
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
        var mnemonic = element.getAttribute("mnemonic") || "??";
        var descriptor = element.getAttribute("descriptor") || "!Unnamed!";
        var identity = element.getAttribute("identity") || '';
        var anchor = new Anchor(x, y);
        anchor.setFixed(fixed);
        anchor.setImploded(imploded);
        anchor.description = (description && description.firstChild) ? description.firstChild.nodeValue : '';
        anchor.mnemonic = mnemonic;
        anchor.descriptor = descriptor;
        anchor.identity = identity;
        anchor.generator = generator;
        anchor.encapsulation = capsule;
        anchor.updateName();
        return anchor;
    },
    toXML: function(schema) {
        // create an anchor element
        var anchor = schema.createElement("anchor");
        // set attributes on the element
        anchor.setAttribute("mnemonic", this.isEmpty(this.mnemonic) ? "??" : this.mnemonic);
        anchor.setAttribute("descriptor", this.isEmpty(this.descriptor) ? "!Unnamed!" : this.descriptor);
        anchor.setAttribute("identity", this.isEmpty(this.identity) ? "" : this.identity);

        var metadata = schema.createElement("metadata");
        metadata.setAttribute("capsule", this.isEmpty(this.encapsulation) ?
                Defaults.encapsulation : this.encapsulation);
        metadata.setAttribute("generator", this.isEmpty(this.generator) ? false : this.generator);
        anchor.appendChild(metadata);

        var edge;
        for(var i = 0; edge = this.node.edges[i]; i++) {
            if (edge.node.type === NodeType.ATTRIBUTE || edge.node.type === NodeType.IDENTIFIER) {
                var role = Model.nodeToComponent(edge.node);
                role.addXML(anchor, schema);
            }
        }
        this.addLayoutXML(anchor, schema);
        this.addDescriptionXML(anchor, schema, this.description);
        return anchor;
    },
    draw: function(image) {
        image.control.setTranslate(this.node.xPosition, this.node.yPosition);
    }
};

// inheritance
extend(Anchor, Component);
