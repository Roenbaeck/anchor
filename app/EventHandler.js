// EventHandler: mouse and keyboard, selection and interaction state.
import { NAV, SVG } from './config.js';
import { Model } from './Model.js';
import { DrawingEngine } from './DrawingEngine.js';
import { Operations } from './Operations.js';
import { TabularEditor } from './TabularEditor.js';
import { Actions } from './Actions.js';
export var EventHandler = {
    selectedComponents: [], // may be larger than interacted with SHIFT clicks
    interactedComponents: [], // currently "touched" components
    interaction: null,
    previousInteraction: null,
    lastX: null,
    lastY: null,
    scaleX: null,
    scaleY: null,
    // track the initial pointer position when preparing a drag so a pure click
    // (no or sub-pixel movement) does not accidentally trigger dragging
    dragStartX: null,
    dragStartY: null,
    // WIP: keys event
    selectedRoute: null,
    selectRoute: function(key) {
        this.selectedRoute = key;
    },
    routeSelected: function() {
        return this.selectedRoute;
    },
    addComponentToSelection: function(component) {
        if(this.selectedComponents.indexOf(component) < 0)
            this.selectedComponents.push(component);
        component.setSelection(true);
    },
    removeComponentFromSelection: function(component) {
        if(this.selectedComponents.indexOf(component) >= 0)
            this.selectedComponents.splice(this.selectedComponents.indexOf(component), 1);
        component.setSelection(false);
    },
    clearSelection: function() {
        var component;
        while(component = this.selectedComponents.pop()) {
            this.removeComponentFromSelection(component);
        }
        if(this.selectedRoute) {
            if(this.selectedRoute.highlighed)
                this.selectedRoute.toggleHighlight();
            this.selectedRoute = null;
        }
        this.setInteraction(null);
    },
    escape: function (event) {
        if (event.key === 'Escape') {
            // an open dialog (the SQL, a page, the mass editor) is closed first, as its close button does
            var close = document.querySelector('#codePopover .closebutton, #urlPopover .closebutton, #tabularEditor .closebutton');
            if(close) {
                close.click();
                return;
            }
            EventHandler.clearSelection();
            var component = EventHandler.interactedComponents[0];
            if(component) {
                component.hideContextMenu();
            }
        }
    },
    isSelected: function(component) {
        return this.selectedComponents.indexOf(component) >= 0;
    },
    setInteraction: function(interaction) {
        if(this.interaction) this.previousInteraction = this.interaction;
        this.interaction = interaction;
    },
    getInteraction: function() {
        return this.interaction;
    },
    getPreviousInteraction: function() {
        return this.previousInteraction;
    },
    addComponentToInteraction: function(component) {
        if(this.interactedComponents.indexOf(component) < 0)
            this.interactedComponents.push(component);
        component.setHighlight(true);
    },
    removeComponentFromInteraction: function(component) {
        if(this.interactedComponents.indexOf(component) >= 0)
            this.interactedComponents.splice(this.interactedComponents.indexOf(component), 1);
        component.setHighlight(false);
    },
    clearInteraction: function() {
        var component;
        while(component = this.interactedComponents.pop()) {
            this.removeComponentFromInteraction(component);
        }
        this.setInteraction(null);
    },
    isInteracted: function(component) {
        return this.interactedComponents.indexOf(component) >= 0;
    },
    hasOngoingInteractions: function() {
        return this.interaction != null;
    },
    beginInteraction: function(event) {
        event.preventDefault();
        var component = this.component; // note that _this_ refers to the SVG element here
        if(!EventHandler.hasOngoingInteractions() && component.isInteractive()) {
            EventHandler.setInteraction("beginInteraction");
            if(!EventHandler.isInteracted(component))
                EventHandler.addComponentToInteraction(component);
            window.addEventListener('keydown', EventHandler.keydown, false);
            SVG.addEventListener('mouseover', EventHandler.endInteraction, false);
            component.view.svg.graphicsElement.addEventListener('mousedown', EventHandler.prepareDragging, false);
            component.view.svg.graphicsElement.addEventListener('click', EventHandler.clickComponent, false);
            component.showContextMenu(component, EventHandler.selectedComponents, EventHandler.selectedRoute);
            DrawingEngine.setCursor('pointer');
        }
        event.stopPropagation();
    },
    prepareDragging: function(event) {
        event.preventDefault();
        if(EventHandler.getInteraction() === "beginInteraction") {
            EventHandler.setInteraction("prepareDragging");
            // remember initial pointer position to distinguish click vs drag
            EventHandler.dragStartX = event.clientX;
            EventHandler.dragStartY = event.clientY;
            var component, i;
            for(i = 0; component = EventHandler.interactedComponents[i]; i++) {
                if(event.shiftKey) {
                    if(EventHandler.isSelected(component)) {
                        EventHandler.removeComponentFromSelection(component);
                        component.setHighlight(true);
                    }
                    else {
                        EventHandler.addComponentToSelection(component);
                        component.setHighlight(false);
                    }
                }
                component.hideContextMenu();
                component.view.svg.graphicsElement.removeEventListener('mousedown', EventHandler.prepareDragging, false);
            }
            SVG.addEventListener('mousemove', EventHandler.whileDragging, false);
            // Attach a one-time mouseup listener to conclude dragging or treat as click
            window.addEventListener('mouseup', EventHandler.mouseupComponent, false);
        }
        event.stopPropagation();
    },
    mouseupComponent: function(event) {
        // Conclude dragging logic: if we never transitioned into whileDragging,
        // let the click handler toggle fixation; otherwise finalize drag.
        window.removeEventListener('mouseup', EventHandler.mouseupComponent, false);
        if(EventHandler.getInteraction() === 'prepareDragging') {
            // Synthesize a click (browser will still fire click after mouseup on same element)
            // but we ensure interaction state is not stuck
            EventHandler.setInteraction('awaitClick');
        }
        else if(EventHandler.getInteraction() === 'whileDragging') {
            EventHandler.setInteraction('completeDragging');
            // Keep fixation state as already set during dragging; end interaction soon after click fires
        }
    },
    whileDragging: function(event) {
        event.preventDefault();
        if(EventHandler.getInteraction() === "whileDragging" ||
                EventHandler.getInteraction() === "prepareDragging") {
            var component, i, svgPoint;
            for(i = 0; component = EventHandler.interactedComponents[i]; i++) {
                if(component.isInteractive() && component.isDraggable()) {
                    svgPoint = EventHandler.screenToSVG(event.clientX, event.clientY);
                    if(EventHandler.getInteraction() === "whileDragging") {
                        component.node.xPosition = svgPoint.x;
                        component.node.yPosition = svgPoint.y;
                        component.node.start();
                        component.setFixed(true);
                        component.node.setUnstoppable(true);
                        DrawingEngine.start(true);
                    }
                    else if(EventHandler.getInteraction() === "prepareDragging") {
                        // Determine drag start purely on screen-space pixel movement.
                        // The previous Manhattan distance (layout-space) check caused
                        // premature drag initiation for Nexus after it had been moved
                        // because minor pointer jitter translated into larger coordinate
                        // deltas due to transform offsets. Using only a small pixel
                        // threshold creates uniform behavior across component types.
                        var pixelDeltaX = Math.abs(event.clientX - EventHandler.dragStartX);
                        var pixelDeltaY = Math.abs(event.clientY - EventHandler.dragStartY);
                        var pixelDistance = (pixelDeltaX > pixelDeltaY ? pixelDeltaX : pixelDeltaY); // max axis movement
                        var DRAG_PIXEL_THRESHOLD = 5; // conservative threshold for intentional drag
                        if(pixelDistance < DRAG_PIXEL_THRESHOLD) {
                            // Still treat as click preparation (no drag yet)
                            continue;
                        }
                        EventHandler.setInteraction("whileDragging");
                        DrawingEngine.setCursor('move');
                    } // switch behavior if we actually move the thing a fair distance
                }
            }
        }
        event.stopPropagation();
    },
    clickComponent: function(event) {
        event.preventDefault();
        // Single click now only finalizes drag (if any) or selects; fixation moved to double-click
        if(EventHandler.getInteraction() === "whileDragging") {
            EventHandler.setInteraction("completeDragging");
        } else if(EventHandler.getInteraction() === 'prepareDragging' || EventHandler.getInteraction() === 'awaitClick') {
            // treat as simple selection click; no fixation toggle
            EventHandler.setInteraction("clicked");
        }
        event.stopPropagation();
    },
    clickHighlight: function(event) {
        // nothing assigned to this action right now
    },
    // (there was a clickSelection here that was never set: it was written as this.clickHighlight where this is not the object,
    // so nothing ever listened for a click on the selection mark, and nothing does now)
    endInteraction: function(event) {
        if(event) event.preventDefault();
        var component = EventHandler.interactedComponents[EventHandler.interactedComponents.length - 1];
        if(!event || (event.toElement !== component.view.svg.graphicsElement &&
                EventHandler.getInteraction() !== "whileDragging")) {
            for(var i = 0; component = EventHandler.interactedComponents[i]; i++) {
                component.hideContextMenu();
                component.node.setUnstoppable(false);
                component.view.svg.graphicsElement.removeEventListener('click', EventHandler.clickComponent, false);
            }
            EventHandler.clearInteraction();
            SVG.removeEventListener('mousemove', EventHandler.whileDragging, false);
            window.removeEventListener('mouseup', EventHandler.mouseupComponent, false);
            SVG.removeEventListener('mouseover', EventHandler.endInteraction, false);
            window.removeEventListener('keydown', EventHandler.keydown, false);
            EventHandler.dragStartX = null;
            EventHandler.dragStartY = null;
            DrawingEngine.setCursor('default');
        }
        if(event) event.stopPropagation();
    },
    preparePanning: function(event) {
        event.preventDefault();
        if(event.shiftKey) {
            // we are shift clicking the background
            EventHandler.clearSelection();
        }
        else if(!EventHandler.hasOngoingInteractions()) {
            EventHandler.setInteraction("preparePanning");
            var screenWidth = window.innerWidth;
            var screenHeight = window.innerHeight;
            var viewBoxWidth = SVG.viewBox.baseVal.width || screenWidth;
            var viewBoxHeight = SVG.viewBox.baseVal.height || screenHeight;
            EventHandler.scaleX = viewBoxWidth / screenWidth;
            EventHandler.scaleY = viewBoxHeight / screenHeight;
            EventHandler.lastX = event.clientX;
            EventHandler.lastY = event.clientY;
            SVG.addEventListener('mousemove', EventHandler.whilePanning, false);
            SVG.addEventListener('mouseup', EventHandler.completePanning, false);
            DrawingEngine.setCursor('move');
        }
        event.stopPropagation();
    },
    whilePanning: function(event) {
        event.preventDefault();
        if(EventHandler.getInteraction() === "whilePanning" ||
                EventHandler.getInteraction() === "preparePanning") {
            EventHandler.setInteraction("whilePanning");
            SVG.viewBox.baseVal.x -= (event.clientX - EventHandler.lastX) * EventHandler.scaleX;
            SVG.viewBox.baseVal.y -= (event.clientY - EventHandler.lastY) * EventHandler.scaleY;
            EventHandler.lastX = event.clientX;
            EventHandler.lastY = event.clientY;
        }
        DrawingEngine.invalidateMiniature();
        DrawingEngine.start(false); // TODO: this should halt layouting and just pan, but it does not
        event.stopPropagation();
    },
    completePanning: function(event) {
        event.preventDefault();
        if(EventHandler.getInteraction() === "whilePanning") {
            EventHandler.setInteraction("completePanning");
            EventHandler.clearInteraction();
            SVG.removeEventListener('mousemove', EventHandler.whilePanning, false);
            SVG.removeEventListener('mouseup', EventHandler.completePanning, false);
            DrawingEngine.setCursor('default');
        }
        event.stopPropagation();
    },
    scaling: 0.03,
    zoom: function(event) {
        event.preventDefault();
        var zoom = 1 + ((event.deltaY > 0) ? 1 : -1) * EventHandler.scaling;
        var width = SVG.viewBox.baseVal.width || SVG.width.baseVal.value;
        var height = SVG.viewBox.baseVal.height || SVG.height.baseVal.value;
        var x = SVG.viewBox.baseVal.x;
        var y = SVG.viewBox.baseVal.y;
        var svgPoint = EventHandler.screenToSVG(event.clientX, event.clientY);
        SVG.viewBox.baseVal.width = width * zoom;
        SVG.viewBox.baseVal.height = height * zoom;
        SVG.viewBox.baseVal.x = x + (1 - zoom) * (svgPoint.x - x);
        SVG.viewBox.baseVal.y = y + (1 - zoom) * (svgPoint.y - y);
        DrawingEngine.invalidateMiniature();
        DrawingEngine.start(false);
        event.stopPropagation();
    },
    resize: function(event) {
        var northwest = EventHandler.screenToSVG(0, 0);
        var southeast = EventHandler.screenToSVG(window.innerWidth, window.innerHeight);
        SVG.viewBox.baseVal.x = northwest.x;
        SVG.viewBox.baseVal.y = northwest.y;
        SVG.viewBox.baseVal.width = southeast.x - northwest.x;
        SVG.viewBox.baseVal.height = southeast.y - northwest.y;
    },
    screenToSVG: function(x, y) {
        var screenPoint = SVG.createSVGPoint();
        screenPoint.x = x;
        screenPoint.y = y;
        var matrix = SVG.getScreenCTM();
        return screenPoint.matrixTransform( matrix.inverse() );
    },
    svgToScreen: function(x, y) {
        var svgPoint = SVG.createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        var matrix = SVG.getScreenCTM();
        return svgPoint.matrixTransform( matrix );
    },
    screenToMiniature: function(x, y) {
        var screenPoint = NAV.createSVGPoint();
        screenPoint.x = x;
        screenPoint.y = y;
        var matrix = NAV.getScreenCTM();
        return screenPoint.matrixTransform( matrix.inverse() );
    },
    miniatureToScreen: function(x, y) {
        var svgPoint = NAV.createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        var matrix = NAV.getScreenCTM();
        return svgPoint.matrixTransform( matrix );
    },
    prepareNavigation: function(event) {
        event.preventDefault();
        if(!EventHandler.hasOngoingInteractions()) {
            EventHandler.setInteraction("prepareNavigation");
            var miniature = document.getElementById("miniature");
            var miniatureWidth = miniature.offsetWidth;
            var miniatureHeight = miniature.offsetHeight;
            var viewBoxWidth = NAV.viewBox.baseVal.width || miniatureWidth;
            var viewBoxHeight = NAV.viewBox.baseVal.height || miniatureHeight;
            EventHandler.scaleX = viewBoxWidth / miniatureWidth;
            EventHandler.scaleY = viewBoxHeight / miniatureHeight;
            EventHandler.lastX = event.clientX;
            EventHandler.lastY = event.clientY;
            // move to the clicked point
            var svgPoint = EventHandler.screenToMiniature(event.clientX, event.clientY);
            Actions.centerModelAt(svgPoint.x, svgPoint.y);
            NAV.addEventListener('mousemove', EventHandler.whileNavigating, false);
            NAV.addEventListener('mouseup', EventHandler.completeNavigation, false);
            SVG.addEventListener('mouseover', EventHandler.completeNavigation, false);
            DrawingEngine.setCursor('move');
        }
        event.stopPropagation();
    },
    whileNavigating: function(event) {
        event.preventDefault();
        if(EventHandler.getInteraction() === "whileNavigating" ||
                EventHandler.getInteraction() === "prepareNavigation") {
            EventHandler.setInteraction("whileNavigating");
            SVG.viewBox.baseVal.x += (event.clientX - EventHandler.lastX) * EventHandler.scaleX;
            SVG.viewBox.baseVal.y += (event.clientY - EventHandler.lastY) * EventHandler.scaleY;
            EventHandler.lastX = event.clientX;
            EventHandler.lastY = event.clientY;
        }
        DrawingEngine.invalidateMiniature();
        DrawingEngine.start(false);
        event.stopPropagation();
    },
    completeNavigation: function(event) {
        event.preventDefault();
        if(EventHandler.getInteraction() === "whileNavigating" ||
                EventHandler.getInteraction() === "prepareNavigation") {
            EventHandler.setInteraction("completeNavigation");
            EventHandler.clearInteraction();
            NAV.removeEventListener('mousemove', EventHandler.whileNavigating, false);
            NAV.removeEventListener('mouseup', EventHandler.completeNavigation, false);
            SVG.removeEventListener('mouseover', EventHandler.completeNavigation, false);
            DrawingEngine.setCursor('default');
        }
        event.stopPropagation();
    },
    reduce: function(array, fromArray) {
        var i = array.length, reduced = [];
        while(i--) {
            if(fromArray.indexOf(array[i]) < 0) {
                reduced.push(array[i]);
            }
        }
        return reduced;
    },
    // acts on what is under the mouse pointer (or selected) when a character key is pressed; everything else (arrows, Tab, F5,
    // Ctrl+C and the like, text being composed) is left to the browser
    keydown: function(event) {
        if(!event.key || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.isComposing)
            return;
        event.preventDefault();
        var allComponents = EventHandler.selectedComponents.concat(
                EventHandler.reduce(
                        EventHandler.interactedComponents,
                        EventHandler.selectedComponents
                ));
        var component = EventHandler.interactedComponents.pop();
        var selectedRoute = EventHandler.selectedRoute;
        switch(event.key) {
            case "e":
                component.showContextMenu(component, allComponents, selectedRoute);
                component.contextMenu.toggle();
                break;
            case "E":
                new TabularEditor(component.descriptor);
                break;
            case "a":
                if(Operations.isSupported("addAttribute", allComponents))
                    Model.addAttribute(allComponents);
                else if(Operations.isSupported("addAnchor", allComponents))
                    Model.addAnchor(allComponents);
                break;
            case "t":
                if(Operations.isSupported("addTie", allComponents) && allComponents.length > 1)
                    Model.addTie(allComponents);
                else if(Operations.isSupported("addTieAndAnchor", allComponents))
                    Model.addTieAndAnchor(allComponents);
                break;
            case "n":
                if(Operations.isSupported("addNexus", allComponents))
                    Model.addNexus(allComponents);
                break;
            case "c":
                if(Operations.isSupported("connect", allComponents)) {
                    var i, operation, validator;
                    for(i = 0; operation = Operations.list[i]; i++)
                        if(operation[0] == "connect")
                            validator = operation[3];
                    if(validator(allComponents))
                        Model.connect(allComponents);
                }
                break;
            case "h":
                if(Operations.isSupported("toggleHistorized", allComponents))
                    Model.toggleHistorized(allComponents);
                break;
            case "k":
                if(Operations.isSupported("toggleKnotted", allComponents))
                    Model.toggleKnotted(allComponents);
                else if(Operations.isSupported("addKnot", allComponents))
                    Model.addKnot(allComponents);
                break;
            case "i":
                if(Operations.isSupported("toggleIdentifier", allComponents))
                    Model.toggleIdentifier(allComponents);
                break;
            case "f":
                if(Operations.isSupported("makeFirstRole", allComponents))
                    Model.makeFirstRole(allComponents);
                break;
            case "x":
                if(Operations.isSupported("explode", allComponents))
                    Model.explode(allComponents);
                break;
            case "d":
                if(Operations.isSupported("erase", allComponents))
                    Model.erase(allComponents);
                break;
            case "p":
                // Toggle fixation for all selected/interacted components
                var j, comp;
                for(j = 0; comp = allComponents[j]; j++) {
                    if(comp.setFixed && comp.getFixed) {
                        comp.setFixed(!comp.getFixed());
                    }
                }
                DrawingEngine.start(false);
                break;
        }
        EventHandler.interactedComponents.push(component);
        event.stopPropagation();
    }
};
