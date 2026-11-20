// EditForm: the fields that a construct can be edited with, as rows of a table (what it is called, then the field). The context
// menu and the properties panel both show them, so they are made here, once.
import { Features } from './Features.js';
export var EditForm = {
    // Fills the table with a row for each field that the construct can be edited with and that the target supports, and says
    // if there was any. The handlers say what happens when
    //   edit(element)     a field is left or changed (its own event: blur for text, change for lists)
    //   changed(element)  its value changed
    //   keydown(event)    a key is pressed in it
    fill: function(table, component, handlers) {
        var any = false, i, j, editable;
        for(i = 0; editable = component.editables[i]; i++) {
            if(!(editable.editable && Features.has(editable.feature)))
                continue;
            any = true;
            var element = document.createElement(editable.type);
            element.className = 'editable';
            if(editable.prepare)
                editable.prepare(component);
            if(editable.pattern)
                element.setAttribute('pattern', editable.pattern);
            if(editable.attributes) {
                for(j = 0; j < editable.attributes.length;) {
                    var attribute = editable.attributes[j++];
                    var value = editable.attributes[j++];
                    element.setAttribute(attribute, value);
                }
            }
            if(editable.elements) {
                for(j = 0; j < editable.elements.length;)
                    element.appendChild(editable.elements[j++]);
            }
            editable.setElement(element, component);
            element.editable = editable;
            element.addEventListener(editable.event, function() { handlers.edit(this); }, false);
            if(handlers.changed)
                element.addEventListener('change', function() { handlers.changed(this); }, false);
            if(handlers.keydown)
                element.addEventListener('keydown', handlers.keydown, false);
            var tr = document.createElement('tr');
            tr.setAttribute('valign', 'top');
            tr.setAttribute('title', editable.description);
            var label = document.createElement('td');
            label.appendChild(document.createTextNode(editable.name + ":"));
            tr.appendChild(label);
            var field = document.createElement('td');
            field.appendChild(element);
            tr.appendChild(field);
            table.appendChild(tr);
        }
        return any;
    }
};
