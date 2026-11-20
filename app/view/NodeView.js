// NodeView: how a construct that is a node of the graph is drawn: an anchor, an attribute, an identifier, a knot, a tie or a nexus.
// The construct says how it looks in its look: ref (the shape in the graph; the miniature has the same with nav_ in front),
// xOffset and yOffset (where its name goes), navComponent (the miniature's element knows its component), nameClass, and
// implodedRef (the shape when it is imploded).
import { NAVLayer, SVGLayer, SVGNS, XLINKNS } from '../config.js';
import { EventHandler } from '../EventHandler.js';
import { DrawingEngine } from '../DrawingEngine.js';
import { ComponentView } from './ComponentView.js';

export function NodeView(component) {
    ComponentView.call(this, component);
    var look = component.look;
    var node = component.node, x = node.xPosition, y = node.yPosition;
    var svg = this.svg, nav = this.nav;
    this.look = look;
    this.nameClass = look.nameClass || null;
    // set up SVG graphics
    svg.graphicsElement = document.createElementNS(SVGNS, 'g');
    // expando property as a reference back to the underlying component for use in event handlers
    svg.graphicsElement.component = component;
    // what a finger can hit: a larger circle than the shape, that is there for a finger only (see application.css)
    var hit = document.createElementNS(SVGNS, 'circle');
    hit.setAttribute('class', 'hit');
    svg.graphicsElement.appendChild(hit);
    svg.useElement = document.createElementNS(SVGNS, 'use');
    svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', look.ref);
    svg.graphicsElement.appendChild(svg.useElement);
    svg.graphicsElement.addEventListener('mouseover', EventHandler.beginInteraction, false);
    SVGLayer.nodes.appendChild(svg.graphicsElement);
    svg.control = svg.graphicsElement.transform.baseVal.appendItem(
        svg.graphicsElement.ownerSVGElement.createSVGTransform()
    );
    svg.control.setTranslate(x, y);
    svg.boundingBox = svg.graphicsElement.getBBox();
    svg.xOffset = look.xOffset;
    svg.yOffset = look.yOffset;
    // set up NAV graphics
    nav.graphicsElement = document.createElementNS(SVGNS, 'g');
    if(look.navComponent)
        nav.graphicsElement.component = component;
    nav.useElement = document.createElementNS(SVGNS, 'use');
    nav.useElement.setAttributeNS(XLINKNS, 'xlink:href', look.ref.replace(/#/,'#nav_'));
    nav.graphicsElement.appendChild(nav.useElement);
    NAVLayer.nodes.appendChild(nav.graphicsElement);
    nav.control = nav.graphicsElement.transform.baseVal.appendItem(
        nav.graphicsElement.ownerSVGElement.createSVGTransform()
    );
    nav.control.setTranslate(x, y);
}
Object.assign(NodeView.prototype, {
    look: null,
    draw: function(image) {
        var component = this.component;
        image.control.setTranslate(component.node.xPosition, component.node.yPosition);
    },
    // an anchor or a nexus changes its shape when it is imploded, at once (only what moves is drawn again, so the drawing cannot do it)
    setImploded: function(imploded) {
        if(this.look.implodedRef)
            this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', imploded ? this.look.implodedRef : this.look.ref);
    },
    // the shape follows what the construct is (historized, for example); the miniature has to be drawn again
    setShape: function(ref) {
        this.svg.useElement.setAttributeNS(XLINKNS, 'xlink:href', ref);
        this.nav.useElement.setAttributeNS(XLINKNS, 'xlink:href', ref.replace(/#/,'#nav_'));
        DrawingEngine.invalidateMiniature();
    }
});
Object.setPrototypeOf(NodeView.prototype, ComponentView.prototype);
