// Role: a role: the edge between a tie or a nexus and what takes part in it.
import { UniqueIdentity } from './UniqueIdentity.js';
import { Editables } from './Editables.js';
import { Component } from './Component.js';
export function Role(component, otherComponent, identifier) {
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
    this.attachView();
    if(this.tied)
        this.setNameable(true);
    else if(this.chronicable)
        this.setNameable(false);
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
        if(this.view)
            this.view.setIdentifier(identifier);
    },
    setColoring: function(coloring) {
        this.coloring = coloring;
        if(this.view)
            this.view.setColoring(coloring);
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
    }
};

// inheritance
Object.setPrototypeOf(Role.prototype, Component.prototype);
