// RoleView: how a role is drawn: a curve between the two things that it connects, and, for a role of a tie or a nexus, a bubble on
// the curve that says how many (one or many) and carries the name of the role, or, for the role of an attribute of a nexus, a
// bubble with the number of its chronicle. Here this.component is the role, and role.component is the construct on its one end.
import { NAVLayer, SVGLayer, SVGNS, XLINKNS } from '../config.js';
import { EventHandler } from '../EventHandler.js';
import { ComponentView } from './ComponentView.js';

export function RoleView(role) {
    ComponentView.call(this, role);
    var edge = role.node;
    var node = edge.node;
    var otherNode = edge.otherNode;
    var controlPoint = edge.controlPoint;
    var svg = this.svg, nav = this.nav;
    this.nameClass = role.tied ? 'role' : null;
    // SVG
    svg.pathElement = document.createElementNS(SVGNS, 'path');
    svg.pathElement.setAttributeNS(null, 'class', 'edge');
    this.setColoring(role.coloring);
    svg.pathElement.setAttributeNS(null, 'd', 'M' + node.xPosition.toFixed(2) + ',' + node.yPosition.toFixed(2) +
            ' Q' + controlPoint.xPosition.toFixed(2) + ',' + controlPoint.yPosition.toFixed(2) +
            ' ' + otherNode.xPosition.toFixed(2) + ',' + otherNode.yPosition.toFixed(2));
    SVGLayer.edges.appendChild(svg.pathElement);
    if(role.tied) {
        svg.graphicsElement = document.createElementNS(SVGNS, 'g');
        svg.graphicsElement.component = role;
        var bubble = document.createElementNS(SVGNS, 'use');
        bubble.setAttributeNS(XLINKNS, 'xlink:href', '#bubble');
        svg.graphicsElement.appendChild(bubble);
        svg.useElement = document.createElementNS(SVGNS, 'use');
        svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', role.identifier ? '#many' : '#one');
        svg.graphicsElement.appendChild(svg.useElement);
        svg.graphicsElement.addEventListener('mouseover', EventHandler.beginInteraction, false);
        SVGLayer.edges.appendChild(svg.graphicsElement);
        svg.control = svg.graphicsElement.transform.baseVal.appendItem(
            svg.graphicsElement.ownerSVGElement.createSVGTransform()
        );
        svg.control.setTranslate(controlPoint.xPosition, controlPoint.yPosition);
        svg.boundingBox = svg.graphicsElement.getBBox();
        svg.xOffset = 2;
        svg.yOffset = 2;
    }
    else if (role.chronicable) {
        svg.graphicsElement = document.createElementNS(SVGNS, 'g');
        svg.graphicsElement.component = role;
        var bubble = document.createElementNS(SVGNS, 'use');
        bubble.setAttributeNS(XLINKNS, 'xlink:href', '#bubbleOutline');
        svg.graphicsElement.appendChild(bubble);
        svg.textElement = document.createElementNS(SVGNS, 'text');
        svg.textElement.setAttributeNS(null, 'class', 'chronicleLabel');
        svg.textElement.setAttributeNS(null, 'text-anchor', 'middle');
        svg.textElement.setAttributeNS(null, 'dominant-baseline', 'central');
        svg.textElement.textContent = role.component.chronicle || '';
        svg.graphicsElement.appendChild(svg.textElement);
        svg.graphicsElement.addEventListener('mouseover', EventHandler.beginInteraction, false);
        SVGLayer.edges.appendChild(svg.graphicsElement);
        svg.control = svg.graphicsElement.transform.baseVal.appendItem(
            svg.graphicsElement.ownerSVGElement.createSVGTransform()
        );
        svg.control.setTranslate(controlPoint.xPosition, controlPoint.yPosition);
        svg.boundingBox = svg.graphicsElement.getBBox();
        svg.xOffset = 2;
        svg.yOffset = 2;
    }
    // NAV
    nav.pathElement = document.createElementNS(SVGNS, 'path');
    nav.pathElement.setAttributeNS(null, 'd', 'M' + node.xPosition.toFixed(2) + ',' + node.yPosition.toFixed(2) +
            ' Q' + controlPoint.xPosition.toFixed(2) + ',' + controlPoint.yPosition.toFixed(2) +
            ' ' + otherNode.xPosition.toFixed(2) + ',' + otherNode.yPosition.toFixed(2));
    NAVLayer.edges.appendChild(nav.pathElement);
}
Object.assign(RoleView.prototype, {
    setIdentifier: function(identifier) {
        this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', identifier ? '#many' : '#one');
    },
    setColoring: function(coloring) {
        if(coloring === '#000' || coloring === '#000000') {
            this.svg.pathElement.style.stroke = null;
            this.svg.pathElement.style.strokeWidth = null;
        }
        else {
            this.svg.pathElement.style.stroke = coloring;
            this.svg.pathElement.style.strokeWidth = '10px';
        }
    },
    // the name of the role is placed from the point of the curve that the bubble is on, whatever it is asked
    drawName: function(x, y) {
        var point = this.component.curvePoint();
        ComponentView.prototype.drawName.call(this, point.x, point.y);
    },
    draw: function(image) {
        var role = this.component;
        // Sync controlPoint with the laid out Edge position
        role.node.controlPoint.xPosition = role.node.xPosition;
        role.node.controlPoint.yPosition = role.node.yPosition;
        var node = role.node.node;
        var otherNode = role.node.otherNode;
        var controlPoint = role.node.controlPoint;
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
        if(role.chronicable && image.textElement) {
            image.textElement.textContent = role.component.chronicle || '';
        }
        if((role.tied || role.chronicable) && image.control) {
            var point = role.curvePoint();
            image.control.setTranslate(point.x, point.y);
        }
    }
});
Object.setPrototypeOf(RoleView.prototype, ComponentView.prototype);
