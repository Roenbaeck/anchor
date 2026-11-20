// Component: what every construct on the canvas has in common. It is the model: what the construct is, its rules and its XML.
// How it is drawn is the business of its view (see attachView and app/view/), which it has when it is shown on a page.
import { UniqueIdentity } from './UniqueIdentity.js';
import { Editables } from './Editables.js';
// "Abstract" type that other components subclass
export function Component(node) {
    this.node = node;
    this.editables = [];
    this.operations = ['erase', 'connect'];
    this.postfixes = [];
}
// Makes the view of a component, when there is a page to show it on (app/main.js sets it). A component without a view is data only.
Component.createView = null;
// Whether the names show the mnemonics of the constructs (PN_Person) or only what they are called (Person); the menu Layout toggles it.
Component.showMnemonics = false;
Object.assign(Component.prototype, {
    node: null,
    description: '',
    editables: null,
    operations: null,
    id: null,
    incomplete: true,
    // how it is drawn (see attachView); null when it is not shown
    view: null,
    // how it looks, said by each kind of construct for its view (NodeView and RoleView explain what is in it)
    look: null,
    nameable: false,
    highlighted: false,
    selected: false,
    imploded: false,
    visible: false,
    postfixes: null,
    contextMenu: null,
    // called by a construct when it has said how it looks
    attachView: function() {
        if(Component.createView)
            this.view = Component.createView(this);
    },
    // can be overridden by subclasses
    hide: function() {
        this.visible = false;
        if(this.view)
            this.view.hide();
    },
    show: function() {
        if(this.view)
            this.view.show();
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
        if(this.view)
            this.view.setNameable(nameable);
        this.nameable = nameable;
    },
    updateName: function() {
        if(this.view)
            this.view.updateName();
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
    // the name is placed from a position, by the view
    drawName: function(x, y) {
        if(this.view)
            this.view.drawName(x, y);
    },
    setFixed: function(fixed) {
        this.node.fixed = fixed;
        if(this.view)
            this.view.setFixed(fixed);
    },
    getFixed: function() {
        return this.node.fixed;
    },
    setSelection: function(select) {
        this.selected = select;
        if(this.view)
            this.view.setSelection(select);
    },
    setHighlight: function(highlight) {
        this.highlighted = highlight;
        if(this.view)
            this.view.setHighlight(highlight);
    },
    // the shape follows what the construct is (historized, for example)
    setShape: function(ref) {
        if(this.view)
            this.view.setShape(ref);
    },
    showContextMenu: function(hoveredComponent, selectedComponents, selectedRoute) {
        if(this.view)
            this.view.showContextMenu(hoveredComponent, selectedComponents, selectedRoute);
    },
    hideContextMenu: function() {
        if(this.view)
            this.view.hideContextMenu();
    }
});
