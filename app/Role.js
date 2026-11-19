// Role: a role: the edge between a tie or a nexus and what takes part in it.
"use strict";

function Role(component, otherComponent, identifier) {
    this.id = UniqueIdentity.nextId();
    var node = component.node;
    var otherNode = otherComponent.node;
    // call the parent constructor
    Component.call(this, new Edge(this.id, node, otherNode));
    var controlPoint = this.node.controlPoint;
    this.role = '?' + this.id;
    this.component = component;
    this.otherComponent = otherComponent;
    this.identifier = identifier;
    this.keys = [];
    this.tied = (node.type === NodeType.TIE || otherNode.type === NodeType.TIE) ||
               (node.type === NodeType.NEXUS && otherNode.type === NodeType.ANCHOR) ||
               (node.type === NodeType.ANCHOR && otherNode.type === NodeType.NEXUS) ||
               (node.type === NodeType.NEXUS && otherNode.type === NodeType.KNOT) ||
               (node.type === NodeType.KNOT && otherNode.type === NodeType.NEXUS);
    this.chronicable = ((node.type === NodeType.ATTRIBUTE && otherNode.type === NodeType.NEXUS) ||
                          (node.type === NodeType.NEXUS && otherNode.type === NodeType.ATTRIBUTE)) &&
                         !component.historized;
    if(this.chronicable) {
        this.editables.push(Editables.chronicleEdit);
    } else {
        this.editables.push(Editables.roleEdit, Editables.coloringEdit);
        this.operations.push('toggleIdentifier');
    }
    this.operations.push('addToKey', 'removeFromKey', 'createKey');
    // Remove historization toggle for Attribute–Nexus edges (attributes on events are immutable)
    if((node.type === NodeType.ATTRIBUTE && otherNode.type === NodeType.NEXUS) ||
       (node.type === NodeType.NEXUS && otherNode.type === NodeType.ATTRIBUTE)) {
        var thIdx = this.component.operations ? this.component.operations.indexOf('toggleHistorized') : -1;
        if(thIdx >= 0) this.component.operations.splice(thIdx, 1);
    }
    // Remove makeFirstRole if this edge does not involve an actual tie (ordering only affects tie naming)
    if(node.type !== NodeType.TIE && otherNode.type !== NodeType.TIE) {
        var mfrIdx = this.operations.indexOf('makeFirstRole');
        if(mfrIdx >= 0) this.operations.splice(mfrIdx, 1);
    } else {
        this.operations.push('makeFirstRole');
    }
    // Enforce identifier=false for direct Nexus-Anchor and Nexus-Knot roles (both directions)
    var directNexus = (node.type === NodeType.NEXUS && (otherNode.type === NodeType.ANCHOR || otherNode.type === NodeType.KNOT)) ||
                      (otherNode.type === NodeType.NEXUS && (node.type === NodeType.ANCHOR || node.type === NodeType.KNOT));
    if(directNexus) {
        this.identifier = false;
        // Remove toggleIdentifier operation if present
        var idx = this.operations.indexOf('toggleIdentifier');
        if(idx >= 0) this.operations.splice(idx, 1);
    }
    // SVG
    this.svg.pathElement = document.createElementNS(SVGNS, 'path');
    this.svg.pathElement.setAttributeNS(null, 'class', 'edge');
    this.setColoring(this.coloring);
    this.svg.pathElement.setAttributeNS(null, 'd', 'M' + node.xPosition.toFixed(2) + ',' + node.yPosition.toFixed(2) +
            ' Q' + controlPoint.xPosition.toFixed(2) + ',' + controlPoint.yPosition.toFixed(2) +
            ' ' + otherNode.xPosition.toFixed(2) + ',' + otherNode.yPosition.toFixed(2));
    SVGLayer.edges.appendChild(this.svg.pathElement);
    if(this.tied) {
        this.svg.graphicsElement = document.createElementNS(SVGNS, 'g');
        this.svg.graphicsElement.component = this;
        var bubble = document.createElementNS(SVGNS, 'use');
        bubble.setAttributeNS(XLINKNS, 'xlink:href', '#bubble');
        this.svg.graphicsElement.appendChild(bubble);
        this.svg.useElement = document.createElementNS(SVGNS, 'use');
        this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', this.identifier ? '#many' : '#one');
        this.svg.graphicsElement.appendChild(this.svg.useElement);
        this.svg.graphicsElement.addEventListener('mouseover', EventHandler.beginInteraction, false);
        SVGLayer.edges.appendChild(this.svg.graphicsElement);
        this.svg.control = this.svg.graphicsElement.transform.baseVal.appendItem(
            this.svg.graphicsElement.ownerSVGElement.createSVGTransform()
        );
        this.svg.control.setTranslate(controlPoint.xPosition, controlPoint.yPosition);
        this.svg.boundingBox = this.svg.graphicsElement.getBBox();
        this.svg.xOffset = 2;
        this.svg.yOffset = 2;
        this.setNameable(true);
        this.svg.nameElement.setAttributeNS(null, 'class', 'role');
    }
    else if (this.chronicable) {
        this.svg.graphicsElement = document.createElementNS(SVGNS, 'g');
        this.svg.graphicsElement.component = this;
        var bubble = document.createElementNS(SVGNS, 'use');
        bubble.setAttributeNS(XLINKNS, 'xlink:href', '#bubbleOutline');
        this.svg.graphicsElement.appendChild(bubble);
        this.svg.textElement = document.createElementNS(SVGNS, 'text');
        this.svg.textElement.setAttributeNS(null, 'class', 'chronicleLabel');
        this.svg.textElement.setAttributeNS(null, 'text-anchor', 'middle');
        this.svg.textElement.setAttributeNS(null, 'dominant-baseline', 'central');
        this.svg.textElement.textContent = this.component.chronicle || '';
        this.svg.graphicsElement.appendChild(this.svg.textElement);
        this.svg.graphicsElement.addEventListener('mouseover', EventHandler.beginInteraction, false);
        SVGLayer.edges.appendChild(this.svg.graphicsElement);
        this.svg.control = this.svg.graphicsElement.transform.baseVal.appendItem(
            this.svg.graphicsElement.ownerSVGElement.createSVGTransform()
        );
        this.svg.control.setTranslate(controlPoint.xPosition, controlPoint.yPosition);
        this.svg.boundingBox = this.svg.graphicsElement.getBBox();
        this.svg.xOffset = 2;
        this.svg.yOffset = 2;
        this.setNameable(false);
    }
    // NAV
    this.nav.pathElement = document.createElementNS(SVGNS, 'path');
    this.nav.pathElement.setAttributeNS(null, 'd', 'M' + node.xPosition.toFixed(2) + ',' + node.yPosition.toFixed(2) +
            ' Q' + controlPoint.xPosition.toFixed(2) + ',' + controlPoint.yPosition.toFixed(2) +
            ' ' + otherNode.xPosition.toFixed(2) + ',' + otherNode.yPosition.toFixed(2));
    NAVLayer.edges.appendChild(this.nav.pathElement);
    this.postCreationInitialization();
}
Role.prototype = {
    role: '',
    component: null,
    otherComponent: null,
    controlPoint: null,
    identifier: true,
    coloring: '#000000',
    tied: false,
    keys: null,
    setIdentifier: function(identifier) {
        this.identifier = identifier;
        this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', this.identifier ? '#many' : '#one');
    },
    setColoring: function(coloring) {
        this.coloring = coloring;
        if(coloring === '#000' || coloring === '#000000') {
            this.svg.pathElement.style.stroke = null;
            this.svg.pathElement.style.strokeWidth = null;
        }
        else {
            this.svg.pathElement.style.stroke = this.coloring;
            this.svg.pathElement.style.strokeWidth = '10px';
        }
    },
    isInteractive: function() {
        return this.tied || this.chronicable;
    },
    isDraggable: function() {
        return false;
    },
    // edges never fixate
    setFixed: function(fixed) {
        this.fixed = false;
    },
    contextualName: function() {
        var name = this.toString();
        if(this.postfixes.length > 0) 
            name += ' [' + this.postfixes.join(', ') + ']'; 
        return name;
    },
    toString: function() {
        return this.role;
    },
    // The point of the edge that lies ON the drawn curve. The curve is a quadratic Bezier, M start Q control end,
    // and it only passes through its control point when it is straight; at t = 1/2 it passes through
    // (start + 2 * control + end) / 4. The bubble and the role name are placed here, not at the control point,
    // since the control point (the edge's node in the layout) is off the curve whenever the edge is bent,
    // by half its distance from the middle of the chord, and most of all while the layout is moving.
    curvePoint: function() {
        var edge = this.node;
        return {
            x: (edge.node.xPosition + 2 * edge.xPosition + edge.otherNode.xPosition) / 4,
            y: (edge.node.yPosition + 2 * edge.yPosition + edge.otherNode.yPosition) / 4
        };
    },
    drawName: function(x, y) {
        var point = this.curvePoint();
        Component.prototype.drawName.call(this, point.x, point.y);
    },
    draw: function(image) {
        // Sync controlPoint with the laid out Edge position
        this.node.controlPoint.xPosition = this.node.xPosition;
        this.node.controlPoint.yPosition = this.node.yPosition;
        var node = this.node.node;
        var otherNode = this.node.otherNode;
        var controlPoint = this.node.controlPoint;
        var role = this.node;
        if (image.pathElement.setPathData) {
            var pathData = image.pathElement.getPathData();
            pathData[0].values[0] = node.xPosition;
            pathData[0].values[1] = node.yPosition;
            pathData[1].values[0] = controlPoint.xPosition;
            pathData[1].values[1] = controlPoint.yPosition;
            pathData[1].values[2] = otherNode.xPosition;
            pathData[1].values[3] = otherNode.yPosition;
            image.pathElement.setPathData(pathData);
        } else {
            image.pathElement.setAttributeNS(null, 'd', 'M' + node.xPosition.toFixed(2) + ',' + node.yPosition.toFixed(2) +
                ' Q' + controlPoint.xPosition.toFixed(2) + ',' + controlPoint.yPosition.toFixed(2) +
                ' ' + otherNode.xPosition.toFixed(2) + ',' + otherNode.yPosition.toFixed(2));
        }
        if(this.chronicable && image.textElement) {
            image.textElement.textContent = this.component.chronicle || '';
        }
        if((this.tied || this.chronicable) && image.control) {
            var point = this.curvePoint();
            image.control.setTranslate(point.x, point.y);
        }
    }
};

// inheritance
extend(Role, Component);
