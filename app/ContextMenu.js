// ContextMenu: the context menu of a construct: its fields and operations.
import { Model } from './Model.js';
import { DrawingEngine } from './DrawingEngine.js';
import { EventHandler } from './EventHandler.js';
import { ModalBackground } from './Popovers.js';
import { Operations } from './Operations.js';
import { Features } from './Features.js';
import { EditForm } from './EditForm.js';
export function ContextMenu(hoveredComponent, selectedComponents, selectedRoute) {
    var self = this;

    this.hoveredComponent = hoveredComponent;
    this.selectedComponents = selectedComponents;
    var contextMenu = document.createElement('div');
    contextMenu.setAttribute('id', 'contextMenu');
    this.toggler = document.createElement('div');
    this.toggler.setAttribute('class', 'toggler collapsed');
    this.toggler.setAttribute('title', 'Click to open the context menu.');
    this.toggler.addEventListener('click', function(event) { self.toggle(); }, false);
    contextMenu.appendChild(this.toggler);
    this.contextMenu = contextMenu;

    this.topper = document.createElement('div');
    this.topper.setAttribute('class', 'topper unselectable');
    this.topper.addEventListener('mousedown', function(event) { self.mousedown(event); }, false);

    var editable;
    this.editsHaveBeenMade = false;
    this.editables = document.createElement('table');
    this.editables.setAttribute('class', 'items');
    this.showEditables = false;

    var i, j, tr;
    // WIP: keys edit
    if(selectedRoute) {
        this.topper.appendChild(document.createTextNode("Edit key of " + selectedRoute.start.mnemonic));
    }
    // if we are operating a single node, show its editable fields
    else if(selectedComponents.length === 0 || (selectedComponents.length === 1 && selectedComponents[0] === hoveredComponent)) {
        this.topper.appendChild(document.createTextNode("Edit " + NodeType[hoveredComponent.node.type]));
        this.keydown = this.keydown.bind(this);
        this.showEditables = EditForm.fill(this.editables, hoveredComponent, {
            edit: function(element) { self.edit(element, hoveredComponent); },
            changed: function() { self.editsHaveBeenMade = true; },
            keydown: this.keydown
        });
    }
    else {
        this.topper.appendChild(document.createTextNode("Edit selection"));
    }

    var allComponents = selectedComponents.slice(0);
    if(allComponents.indexOf(hoveredComponent) < 0)
        allComponents.push(hoveredComponent);

    var supportedOperations = Operations.supportedFor(allComponents);

    this.operators = document.createElement('fieldset');
    this.operators.setAttribute('class', 'operators');
    var operations = document.createElement('legend');
    operations.setAttribute(
            'title',
            'Context sensitive list of operations that can be performed ' +
            'on the selected item(s). Shift+click in order to select ' +
            'multiple items in the model graph.'
    );
    operations.appendChild(document.createTextNode('OPERATIONS'));
    this.operators.appendChild(operations);
    for(i = 0; i < supportedOperations.length; i++) {
        var operator = document.createElement('div');
        operator.setAttribute('class', 'operator');
        operator.setAttribute('title', supportedOperations[i][2]);
        operator.innerHTML = supportedOperations[i][1];
        operator.method = supportedOperations[i][0];
        operator.addEventListener('click', function() { self.operate(this, allComponents); }, false);
        this.operators.appendChild(operator);
    }

    this.updatePosition();
    document.body.appendChild(this.contextMenu);
    this.keepInWindow();
    return this;
}
ContextMenu.prototype = {
    contextMenu: null,
    hoveredComponent: null,
    selectedComponents: null,
    showEditables: false,
    editables: null,
    operators: null,
    divider: null,
    topper: null,
    toggler: null,
    collapsed: true,
    modalBackground: null,
    editsHaveBeenMade: false,
    dragging: false,
    operate: function(button, components) {
        if(Model[button.method](components))
            this.close();
    },
    edit: function(element, component) {
        if(element && component) {
            element.editable.setMember(element, component);
            element.checkValidity();
        }
    },
    mousedown: function(event) {
        this.mousemove = this.mousemove.bind(this);
        this.mouseup = this.mouseup.bind(this);
        window.addEventListener('mousemove', this.mousemove, false);
        window.addEventListener('mouseup', this.mouseup, false);
        this.dragging = true;
    },
    mousemove: function(event) {
        if(this.dragging) {
            var xScreen, yScreen;
            xScreen = event.clientX
                    - this.contextMenu.offsetWidth / 2;
            yScreen = event.clientY
                    - this.topper.offsetHeight / 2;
            this.updatePosition(xScreen, yScreen);
        }
    },
    mouseup: function(event) {
        this.dragging = false;
        window.removeEventListener('mousemove', this.mousemove, false);
        window.removeEventListener('mouseup', this.mouseup, false);
    },
    updatePosition: function(x, y) {
        var point = EventHandler.svgToScreen(
                this.hoveredComponent.node.xPosition + 15, // inside the highlight ring with radius 30
                this.hoveredComponent.node.yPosition + 15
        );
        x = x ? x : point.x;
        y = y ? y : point.y;
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
    },
    keydown: function(event) {
        if(event.key === 'Enter' && !event.isComposing) {
            event.target.blur();
            if(Model.isConforming())
                this.close();
        }
    },
    toggle: function() {
        var self = this;
        if(this.collapsed) {
            this.toggler.className = 'toggler expanded';
            this.toggler.setAttribute('title', 'Click to close the context menu.');
            this.collapsed = false;
            this.modalBackground = new ModalBackground();
            // a touch (or a click) beside the menu closes it, as there is no pointer to leave it with
            this.modalBackground.modalBackground.addEventListener('click', function() { if(!self.collapsed) self.toggle(); }, false);
            this.contextMenu.appendChild(this.topper);
            if(this.showEditables) {
                this.contextMenu.appendChild(this.editables);
                var editables = this.editables.getElementsByClassName('editable');
                if(editables.length > 0) {
                    editables[0].focus();
                    if(editables[0].setSelectionRange && editables[0].type !== 'number')
                        editables[0].setSelectionRange(0, editables[0].value.length);
                }
            }
            window.removeEventListener('keydown', EventHandler.keydown, false);
            this.contextMenu.appendChild(this.operators);
            this.keepInWindow();
        }
        else {
            if(this.editsHaveBeenMade && !Model.isConforming())
                return;
            this.toggler.className = 'toggler collapsed';
            this.toggler.setAttribute('title', 'Click to open the context menu.');
            this.collapsed = true;
            this.contextMenu.removeChild(this.operators);
            if(this.showEditables) {
                this.contextMenu.removeChild(this.editables);
            }
            this.contextMenu.removeChild(this.topper);
            this.unmodal();
            window.addEventListener('keydown', EventHandler.keydown, false);
            DrawingEngine.start(false);
        }
    },
    // the menu is where it can be seen: not past the edges of the window (it opens beside the construct, which may be at the edge)
    keepInWindow: function() {
        var box = this.contextMenu.getBoundingClientRect(), margin = 8, top = document.getElementById('header') ? document.getElementById('header').getBoundingClientRect().bottom : 0;
        var x = Math.max(margin, Math.min(box.left, window.innerWidth - box.width - margin));
        var y = Math.max(top + margin, Math.min(box.top, window.innerHeight - box.height - margin));
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
    },
    unmodal: function() {
        if(this.modalBackground) {
            this.modalBackground.close();
            this.modalBackground = null;
        }
    },
    close: function() {
        this.unmodal();
        if(this.editsHaveBeenMade)
            Model.recordState();
        if(document.body.contains(this.contextMenu))
            document.body.removeChild(this.contextMenu);
        window.addEventListener('keydown', EventHandler.keydown, false);
        DrawingEngine.start(false);
    }
};

// Legacy FileHandler removed: functionality consolidated into Actions._applyLoadedModel and modern file input script.
