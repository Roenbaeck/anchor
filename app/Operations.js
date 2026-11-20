// Operations: the operations that the context menu and the keyboard offer.
import { EventHandler } from './EventHandler.js';
export var Operations = {
    // operations are defined as 'method', 'display name', 'description', 'optional rule'
    list: [
        // WIP: keys operations
        ['addToKey',
            'Add selected to key',
            'Adds the selected item(s) to the selected key route.',
            function(allComponents) {
                return EventHandler.selectedRoute;
            }],
        ['removeFromKey',
            'Remove selected from key',
            'Removes the selected item(s) from the selected key route.',
            function(allComponents) {
                return EventHandler.selectedRoute;
            }],
        ['createKey',
            'Create key from selected',
            'Creates a key route from the selected item(s) in the model.',
            function(allComponents) {
                if(EventHandler.selectedRoute)
                    return false;
                if(allComponents.length < 2)
                    return false;
                var component, anchors = 0, ties = 0, knots = 0, attributes = 0, roles = 0;
                for(var i = 0; component = allComponents[i]; i++) {
                    // a route starts at an anchor or a nexus
                    if(component.node.type === NodeType.ANCHOR || component.node.type === NodeType.NEXUS)
                        anchors++;
                    else if(component.node.type === NodeType.TIE)
                        ties++;
                    else if(component.node.type === NodeType.KNOT)
                        knots++;
                    else if(component.node.type === NodeType.ATTRIBUTE) 
                        attributes++;
                    else if(component.node.type === NodeType.EDGE) 
                        roles++;
                }
                // a knot is not a stop: a route reaches its value through a knotted attribute or a knot role
                if(anchors != 1 || roles + attributes == 0 || ties > 0 || knots > 0)
                    return false;
                return true;
            }],
        ['erase',
            '<u>D</u>elete selected...',
            'Deletes the selected item(s) from the model.'],
        ['toggleKnotted',
            'Toggle <u>k</u>notted',
            'Adds or removes a knot from the selected attribute(s).'], // TODO: only remove knot if it is the last attribute
        ['toggleHistorized',
            'Toggle <u>h</u>istorized',
            'Historized items can store versions of values over changing time and are marked by a double outline in the model.'],
        ['addAttribute',
            'Add <u>a</u>ttribute',
            'Add an attribute to the selected anchor(s).'],
        ['addTie',
            'Add <u>t</u>ie',
            'Add a tie between the selected anchors.'],
        ['addAnchor',
            'Add <u>a</u>nchor',
            'Add an anchor to the selected tie(s).'],
        ['addKnot',
            'Add <u>k</u>not',
            'Add a knot to the selected tie(s).'],
        ['addTieAndAnchor',
            'Add <u>t</u>ied anchor',
            'Add a tie with a connected anchor to the selected anchor(s).'],
        ['addNexus',
            'Add <u>n</u>exus',
            'Add a nexus connected to the selected anchor(s).'],
        ['toggleIdentifier',
            'Toggle <u>i</u>dentifier',
            'Toggles whether the selected role(s) should be a part of the primary key or not.'],
        ['makeFirstRole',
            'Make <u>f</u>irst role',
            'Make the selected role(s) the first role in the primary key and tie name.'],
        ['connect',
            '<u>C</u>onnect',
            'Connect the selected node(s).',
            function(allComponents) {
                if(allComponents.length !== 2)
                    return false;
                var component, anchors = 0, ties = 0, knots = 0, knotted, attributes = 0;
                for(var i = 0; component = allComponents[i]; i++) {
                    if(component.node.type === NodeType.ANCHOR)
                        anchors++;
                    else if(component.node.type === NodeType.TIE)
                        ties++;
                    else if(component.node.type === NodeType.KNOT)
                        knots++;
                    else if(component.node.type === NodeType.ATTRIBUTE) {
                        attributes++;
                        knotted = component.getKnotted();
                    }
                }
                return anchors && ties || knots && ties || attributes && knots && !knotted;
            }],
        ['explode',
            'E<u>x</u>plode/Implode',
            'Change the level of detail for the selected item(s) in the model.']
    ],
    isSupported: function(operation, components) {
        for(var i = 0; i < components.length; i++)
            if(components[i].operations.indexOf(operation) < 0)
                return false;
        return true;
    }
};
