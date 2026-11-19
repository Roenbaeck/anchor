// TabularEditor: the table for editing many constructs at once.
"use strict";

function TabularEditor(filter) {
    var self = this;
    Actions.stopKeyboardEvents();
    var i = 0, component;
    this.modalBackground = new ModalBackground();
    this.tabularEditor = document.createElement('div');
    this.tabularEditor.setAttribute('id', 'tabularEditor');
    var close = document.createElement('div');
    close.className = 'closebutton';
    close.addEventListener('click', function(event) { return self.close(event); }, false);
    this.tabularEditor.appendChild(close);

    var components = Model.components.slice();
    // this needs to be smartly sorted such that an anchor and it's attributes follow after each other
    components.sort(function(a,b) { 
        var nameA = (a.node.type === NodeType.KNOT ? "0" : "1") + a.toString().substring(0,2);
        var nameB = (b.node.type === NodeType.KNOT ? "0" : "1") + b.toString().substring(0,2);
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });
    var constructs = {};
    constructs[NodeType.ANCHOR] = true;
    constructs[NodeType.KNOT] = true;
    constructs[NodeType.ATTRIBUTE] = true;
    // ties also need their roles listed and the name is needed as well
    // constructs[NodeType.TIE] = true;
    var somethingIsShowing = false;
    while (component = components[i++]) {
        if (component.node.type in constructs && component.toString().includes(filter)) {
            var tabularComponent = document.createElement('fieldset');
            tabularComponent.setAttribute('class', 'tabularComponent');
            var legend = document.createElement('legend');
            legend.setAttribute(
                'title',
                'All the editable fields of this ' + 
                NodeType[component.node.type].toLowerCase() +
                '.'
            );
            tabularComponent.label = document.createTextNode(component.toString());
            legend.appendChild(tabularComponent.label);
            tabularComponent.appendChild(legend);
            component.tabular(tabularComponent); 
            this.tabularEditor.appendChild(tabularComponent);
            somethingIsShowing = true;
        }
    }
    if (somethingIsShowing) 
        document.body.appendChild(this.tabularEditor);
    else 
        this.close();
}
TabularEditor.prototype = {
    modalBackground: null,
    tabularEditor: null, 
    close: function() {
        this.modalBackground.close();
        if(document.body.contains(this.tabularEditor))
            document.body.removeChild(this.tabularEditor);
        this.tabularEditor = null;
    }
}
