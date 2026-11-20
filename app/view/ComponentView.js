// ComponentView: how a construct is drawn, in the graph and in the miniature: its elements, its name, and how it shows that it is
// highlighted, selected or fixed. A construct (see Component) has one when it is shown on a page, made by Component.createView;
// without one a model is just data. NodeView and RoleView add what is particular to the kinds of construct.
import { DEBUG, NAVLayer, SVGLayer, SVGNS } from '../config.js';
import { EventHandler } from '../EventHandler.js';
import { Symbol } from '../Symbol.js';
import { ContextMenu } from '../ContextMenu.js';

export function ComponentView(component) {
    this.component = component;
    this.svg = new Symbol(component);
    this.svg.makeInteractive();
    this.nav = new Symbol(component);
    this.lastName = null;
    this.bad = false;
    this.end = false;
    // the class of the name in the graph (anchor, nexus, role), if it has one
    this.nameClass = null;
}
Object.assign(ComponentView.prototype, {
    component: null,
    svg: null,
    nav: null,
    // take the drawing out of the layers (the construct has said that it is no longer visible)
    hide: function() {
        // stop any ongoing interactions
        EventHandler.endInteraction();
        // do not display in layers
        this.svg.hideGraphics(SVGLayer.nodes);
        this.nav.hideGraphics(NAVLayer.nodes);
        this.svg.hidePath(SVGLayer.edges);
        this.nav.hidePath(NAVLayer.edges);
        this.svg.hideName(SVGLayer.names);
        this.svg.hideDebug(SVGLayer.debug);
    },
    show: function() {
        this.svg.showGraphics(SVGLayer.nodes);
        this.nav.showGraphics(NAVLayer.nodes);
        this.svg.showPath(SVGLayer.edges);
        this.nav.showPath(NAVLayer.edges);
        this.svg.showName(SVGLayer.names);
        if(DEBUG)
            this.svg.showDebug(SVGLayer.debug);
        // The drawing engine only draws what is moving. A construct that is shown again has been given a new place (when an anchor or
        // a nexus explodes), and if the layout stops it at once it is never drawn there: its edge goes to the new place, it stays
        // at the old.
        this.draw(this.svg);
    },
    // the text element of the name, made when the construct can have a name
    setNameable: function(nameable) {
        var svg = this.svg;
        if(nameable && !svg.nameElement) {
            svg.nameElement = document.createElementNS(SVGNS, 'text');
            svg.nameElement.setAttributeNS(null, 'x', '0');
            svg.nameElement.setAttributeNS(null, 'y', '0');
            svg.nameText = document.createTextNode('');
            svg.nameElement.appendChild(svg.nameText);
            SVGLayer.names.appendChild(svg.nameElement);
            svg.nameControl = {
                x: svg.nameElement.x.baseVal.getItem(0),
                y: svg.nameElement.y.baseVal.getItem(0)
            };
            if(this.nameClass)
                svg.nameElement.setAttributeNS(null, 'class', this.nameClass);
        }
    },
    updateName: function() {
        var component = this.component;
        if(component.nameable) {
            var name = component.contextualName();
            if(!name || component.isEmpty(name)) {
                this.svg.hideName(SVGLayer.names);
                this.lastName = null;
            }
            else if(name !== this.lastName) {
                if(!this.lastName) this.svg.showName(SVGLayer.names);
                this.lastName = name;
                this.svg.nameText.nodeValue = name;
            }
        }
    },
    drawName: function(x, y) {
        var svg = this.svg;
        var component = this.component;
        if(component.visible && svg.nameElement) {
            var node = component.node;
            this.updateName();
            var i, xAverage = 0, closestEdge = node.edges[0] || node;
            i = node.edges.length;
            while(i--) {
                xAverage += node.edges[i].xPosition;
                if(LayoutEngine.manhattanDistance(node, node.edges[i]) <
                        LayoutEngine.manhattanDistance(node, closestEdge)) {
                    closestEdge = node.edges[i];
                }
            }
            xAverage /= node.edges.length;
            var quarter = svg.yOffset + svg.boundingBox.height / 4;
            var nameYOffset = svg.yPosition < closestEdge.yPosition ? -quarter : quarter;
            var nameXOffset = svg.xOffset + svg.boundingBox.width / 2;
            if(node.xPosition < xAverage) {
                if(!this.end) {
                    svg.nameElement.classList.add('end');
                }
                nameXOffset = -nameXOffset;
                this.end = true;
            }
            else {
                if(this.end) {
                    svg.nameElement.classList.remove('end');
                }
                this.end = false;
            }
            if(component.incomplete) {
                if(!this.bad) {
                    svg.nameElement.classList.add('bad');
                }
                this.bad = true;
            }
            else {
                if(this.bad) {
                    svg.nameElement.classList.remove('bad');
                }
                this.bad = false;
            }
            svg.nameControl.x.value = x + nameXOffset;
            svg.nameControl.y.value = y + nameYOffset;
        }
    },
    // this is how a construct draws itself on the visible context (the graph or the miniature), subclasses say how
    draw: function(image) {
        return;
    },
    drawForce: function(image) {
        var node = this.component.node;
        var element = image.forceElement;
        // draw forces
        element.x1.baseVal.value = node.xPosition;
        element.y1.baseVal.value = node.yPosition;
        // exaggerate the velocity so that forces become visible
        var e = 10*Math.log(1 + 10/(1 + node.velocity));
        element.x2.baseVal.value = node.xPosition + node.xVelocity *e;
        element.y2.baseVal.value = node.yPosition + node.yVelocity *e;
    },
    setFixed: function(fixed) {
        if(fixed && !this.svg.graphicsElement.contains(this.svg.fixationElement)) {
            this.svg.graphicsElement.appendChild(this.svg.fixationElement);
        }
        else if (!fixed && this.svg.graphicsElement.contains(this.svg.fixationElement)) {
            this.svg.graphicsElement.removeChild(this.svg.fixationElement);
        }
    },
    setSelection: function(select) {
        if(select && this.component.visible && !this.svg.graphicsElement.contains(this.svg.selectionElement)) {
            this.svg.graphicsElement.insertBefore(
                    this.svg.selectionElement,
                    this.svg.graphicsElement.firstChild
            );
        }
        else if (!select && this.component.visible && this.svg.graphicsElement.contains(this.svg.selectionElement)) {
            this.svg.graphicsElement.removeChild(this.svg.selectionElement);
        }
    },
    setHighlight: function(highlight) {
        var visible = this.component.visible;
        if(highlight && visible && !this.svg.graphicsElement.contains(this.svg.highlightElement)) {
            this.svg.highlightElement.addEventListener('click', EventHandler.clickHighlight, false);
            this.svg.graphicsElement.insertBefore(
                    this.svg.highlightElement,
                    this.svg.graphicsElement.firstChild
            );
            if(!SVGLayer.isShowing('names')) {
                this.svg.hideName(SVGLayer.names);
                this.drawName(0, 0);
                this.svg.showName(this.svg.graphicsElement);
            }
        }
        else if (!highlight && visible && this.svg.graphicsElement.contains(this.svg.highlightElement)) {
            this.svg.graphicsElement.removeChild(this.svg.highlightElement);
            this.svg.highlightElement.removeEventListener('click', EventHandler.clickHighlight, false);
            this.svg.hideName(this.svg.graphicsElement);
            this.drawName(this.component.node.xPosition, this.component.node.yPosition);
            this.svg.showName(SVGLayer.names);
        }
    },
    showContextMenu: function(hoveredComponent, selectedComponents, selectedRoute) {
        if(!this.component.contextMenu)
            this.component.contextMenu = new ContextMenu(hoveredComponent, selectedComponents, selectedRoute);
    },
    hideContextMenu: function() {
        if(this.component.contextMenu) {
            this.component.contextMenu.close();
            this.component.contextMenu = null;
        }
    }
});
