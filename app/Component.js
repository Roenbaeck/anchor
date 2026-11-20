// Component: what every construct on the canvas has in common.
import { DEBUG, NAVLayer, SVGLayer, SVGNS } from './config.js';
import { UniqueIdentity } from './UniqueIdentity.js';
import { Editables } from './Editables.js';
import { EventHandler } from './EventHandler.js';
import { Symbol } from './Symbol.js';
import { ContextMenu } from './ContextMenu.js';
import { Features } from './Features.js';
// "Abstract" type that other components subclass
export function Component(node) {
    this.node = node;
    this.editables = [];
    this.operations = ['erase', 'connect'];
    this.svg = new Symbol(this);
    this.svg.makeInteractive();
    this.nav = new Symbol(this);
    this.postfixes = [];
}
Object.assign(Component.prototype, {
    node: null,
    description: '',
    editables: null,
    operations: null,
    id: null,
    incomplete: true,
    svg: null,
    nav: null,
    nameable: false,
    highlighted: false,
    selected: false,
    lastName: null,
    imploded: false,
    visible: false,
    postfixes: null,
    // can be overridden by subclasses
    hide: function() {
        this.visible = false;
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
        this.visible = true;
    },
    postCreationInitialization: function() {
        this.editables.push(Editables.descriptionEdit);
        this.show();
    },
    setId: function(id)  {
        if(id) {
            UniqueIdentity.takeId(id);
            this.id = id;
        }
    },
    getId: function() {
        if (!this.id)
            this.id = UniqueIdentity.nextId();
        return this.id;
    },
    setNameable: function(nameable) {
        if(nameable && !this.svg.nameElement) {
            this.svg.nameElement = document.createElementNS(SVGNS, 'text');
            this.svg.nameElement.setAttributeNS(null, 'x', '0');
            this.svg.nameElement.setAttributeNS(null, 'y', '0');
            this.svg.nameText = document.createTextNode('');
            this.svg.nameElement.appendChild(this.svg.nameText);
            SVGLayer.names.appendChild(this.svg.nameElement);
            this.svg.nameControl = {
                x: this.svg.nameElement.x.baseVal.getItem(0),
                y: this.svg.nameElement.y.baseVal.getItem(0)
            };
        }
        this.nameable = nameable;
    },
    updateName: function() {
        if(this.nameable) {
            var name = this.contextualName();
            if(!name || this.isEmpty(name)) {
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
    tabularEdit: function(element, component) {
        if(element && component) {
            element.editable.setMember(element, component);
            element.checkValidity();
        }
    },            
    tabular: function (container) {
        var self = this;
        var j, i = 0, editable;
        var table = document.createElement('table');
        while(editable = this.editables[i++]) {
            if(!Features.has(editable.feature)) continue;
            var element = document.createElement(editable.type);
            element.className = 'tabularEditable';
            if(editable.pattern) {
                element.setAttribute('pattern', editable.pattern);
            }
            if(editable.attributes) {
                for(j = 0; j < editable.attributes.length;) {
                    var attribute = editable.attributes[j++];
                    var value = editable.attributes[j++];
                    element.setAttribute(attribute, value);
                }
            }
            if(editable.elements) {
                for(j = 0; j < editable.elements.length;) {
                    var subElement = editable.elements[j++];
                    element.appendChild(subElement.cloneNode(true));
                }
            }
            editable.setElement(element, self);
            element.setAttribute('valign', 'top');
            element.setAttribute('title', editable.description);                
            element.editable = editable;
            // edit function should move into the component?
            element.addEventListener(editable.event, function() { 
                self.tabularEdit(this, self); 
                container.label.nodeValue = self.toString();
            }, false);
            element.addEventListener('change', function() { 
                self.editsHaveBeenMade = true; 
            }, false);
            var row = document.createElement('tr');
            var label = document.createTextNode(editable.name + ":");
            var labelCell = document.createElement('td');
            labelCell.appendChild(label);
            row.appendChild(labelCell);
            var elementCell = document.createElement('td');
            elementCell.appendChild(element);
            row.appendChild(elementCell);                    
            table.appendChild(row);
        }
        container.appendChild(table);
        return true;
    },
    // override to change behavior
    isInteractive: function() {
        return false;
    },
    isDraggable: function() {
        return false;
    },
    // this should always return the name according to the naming conventions
    toString: function() {
        return null;
    },
    // this should return the name depending on the visual context
    contextualName: function() {
        return this.toString();
    },
    isEmpty: function(value) {
        return typeof value === "undefined" || value == null ||
                value.toString().replace(/^[^\S]+/,'').replace(/[^\S]+$/,'') === '';
    },
    updateIncompleteness: function() {
        this.incomplete = false;
        var editable;
        for(var i = 0; editable = this.editables[i]; i++) {
            // only those that are supposed to contain text (i.e. not checkboxes, select lists, ...)
            // and is not switched off from editing
            if(editable.pattern && editable.editable) {
                if(this.isEmpty(editable.getMember(this)))
                    this.incomplete =  true;
                if(!editable.getMember(this).toString().match(new RegExp('^' + editable.pattern + '$')))
                    this.incomplete =  true;
            }
        }
    },
    // override in order to check conditions under which the node breaks the model
    isConforming: function() {
        return true;
    },
    // subclasses that should appear in the XML need to override this
    toXML: function() {
        return null;
    },
    toSVG: function() {
        return null;
    },
    fromXML: function() {
        return;
    },
    addDescriptionXML: function(element, schema, description) {
        if(!this.isEmpty(description)) {
            var descriptionElement = schema.createElement("description");
            descriptionElement.textContent = description;
            element.appendChild(descriptionElement);
        }
    },
    addLayoutXML: function(element, schema) {
        var node = this.node;
        var layout = schema.createElement("layout");
        layout.setAttribute("x", node.xPosition.toFixed(2));
        layout.setAttribute("y", node.yPosition.toFixed(2));
        layout.setAttribute("fixed", node.fixed);
        if(this.imploded)
            layout.setAttribute("imploded", this.imploded.toString());
        element.appendChild(layout);
    },
    bad: false,
    end: false,
    drawName: function(x, y) {
        var svg = this.svg;
        if(this.visible && svg.nameElement) {
            var node = this.node;
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
            if(this.incomplete) {
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
    // this is how a node draws itself on the visible context, should be overridden by subclasses
    draw: function(image) {
        return;
    },
    drawForce: function(image) {
        var node = this.node;
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
        this.node.fixed = fixed;
        if(fixed && !this.svg.graphicsElement.contains(this.svg.fixationElement)) {
            this.svg.graphicsElement.appendChild(this.svg.fixationElement);
        }
        else if (!fixed && this.svg.graphicsElement.contains(this.svg.fixationElement)) {
            this.svg.graphicsElement.removeChild(this.svg.fixationElement);
        }
    },
    getFixed: function() {
        return this.node.fixed;
    },
    setSelection: function(select) {
        this.selected = select;
        if(select && this.visible && !this.svg.graphicsElement.contains(this.svg.selectionElement)) {
            this.svg.graphicsElement.insertBefore(
                    this.svg.selectionElement,
                    this.svg.graphicsElement.firstChild
            );
        }
        else if (!select && this.visible && this.svg.graphicsElement.contains(this.svg.selectionElement)) {
            this.svg.graphicsElement.removeChild(this.svg.selectionElement);
        }
    },
    setHighlight: function(highlight) {
        this.highlighted = highlight;
        if(highlight && this.visible && !this.svg.graphicsElement.contains(this.svg.highlightElement)) {
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
        else if (!highlight && this.visible && this.svg.graphicsElement.contains(this.svg.highlightElement)) {
            this.svg.graphicsElement.removeChild(this.svg.highlightElement);
            this.svg.highlightElement.removeEventListener('click', EventHandler.clickHighlight, false);
            this.svg.hideName(this.svg.graphicsElement);
            this.drawName(this.node.xPosition, this.node.yPosition);
            this.svg.showName(SVGLayer.names);
        }
    },
    contextMenu: null,
    showContextMenu: function(hoveredComponent, selectedComponents, selectedRoute) {
        if(!this.contextMenu)
            this.contextMenu = new ContextMenu(hoveredComponent, selectedComponents, selectedRoute);
    },
    hideContextMenu: function() {
        if(this.contextMenu) {
            this.contextMenu.close();
            this.contextMenu = null;
        }
    }
});
