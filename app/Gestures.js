// Gestures: what a finger (or a pen) does in the graph and in the miniature. A mouse has the hover and the keys (EventHandler), and keeps
// them; these are made of Pointer Events, which a touch screen gives, and only for pointers that are not a mouse:
//   one finger on the background        moves the view
//   one finger on a construct           a tap selects it (and shows the properties, in the panel); a tap on it again, or on the
//                                       background, lets go; moving it moves the construct and leaves it where it was put
//   a finger held on a construct        adds it to the selection, or takes it out, and opens its context menu (for the selection):
//                                       that is how several are selected
//   two fingers                         zoom (pinch) and move the view
//   a finger on the miniature           puts the middle of the view where it is, and follows the finger
// The graph has touch-action: none (application.css), or the browser would use the fingers for scrolling and zooming the page.
import { NAV, SVG } from './config.js';
import { EventHandler } from './EventHandler.js';
import { DrawingEngine } from './DrawingEngine.js';
import { Actions } from './Actions.js';
import { Outline } from './Outline.js';
import { Menus } from './Menus.js';
export var Gestures = {
    pointers: {},       // the fingers that are down, by id: { x, y }
    mode: null,         // null, 'pending' (down, has not moved), 'pan', 'drag', 'pinch', 'held' (a long press was made), 'navigate'
    start: null,        // where and when the one finger went down, and on what
    pinch: null,        // the distance and the middle of two fingers, as they were
    timer: null,
    SLOP: 8,            // pixels that a finger may move and still be tapping
    HOLD: 500,          // milliseconds that a finger has to be down to be a long press
    isFinger: function(event) {
        return event.pointerType === 'touch' || event.pointerType === 'pen';
    },
    // the construct that the element is part of, if it can be touched
    componentOf: function(element) {
        while(element && element !== SVG && element.parentNode) {
            if(element.component && element.component.isInteractive && element.component.isInteractive()) return element.component;
            element = element.parentNode;
        }
        return null;
    },
    count: function() { return Object.keys(Gestures.pointers).length; },
    init: function() {
        ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(function(type) {
            var name = type.replace('pointer', '');
            SVG.addEventListener(type, function(event) { Gestures[name](event, false); }, false);
            NAV.addEventListener(type, function(event) { Gestures[name](event, true); }, false);
        });
    },
    scale: function() {
        return { x: (SVG.viewBox.baseVal.width || window.innerWidth) / window.innerWidth, y: (SVG.viewBox.baseVal.height || window.innerHeight) / window.innerHeight };
    },
    redraw: function() {
        DrawingEngine.invalidateMiniature();
        DrawingEngine.start(false);
    },
    down: function(event, onMiniature) {
        if(!Gestures.isFinger(event)) return;
        event.preventDefault();
        try { event.target.setPointerCapture(event.pointerId); } catch(e) { /* a pointer that is not there (a test) cannot be captured */ }
        Gestures.pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
        Menus.closeAll(); // a menu that a touch opened closes when the model is touched
        if(onMiniature) {
            Gestures.mode = 'navigate';
            Gestures.navigate(event);
            return;
        }
        if(Gestures.count() === 1) {
            var component = Gestures.componentOf(event.target);
            Gestures.start = { x: event.clientX, y: event.clientY, time: Date.now(), component: component };
            Gestures.mode = 'pending';
            clearTimeout(Gestures.timer);
            if(component) Gestures.timer = setTimeout(Gestures.hold, Gestures.HOLD);
        }
        else if(Gestures.count() === 2) {
            // a second finger: what the first one was doing is let go of, and the two make a pinch
            Gestures.letGo();
            clearTimeout(Gestures.timer);
            Gestures.mode = 'pinch';
            Gestures.pinch = Gestures.measure();
        }
    },
    move: function(event, onMiniature) {
        var pointer = Gestures.pointers[event.pointerId];
        if(!pointer || !Gestures.isFinger(event)) return;
        event.preventDefault();
        var dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        if(Gestures.mode === 'navigate') { Gestures.navigate(event); return; }
        if(Gestures.mode === 'pending') {
            var s = Gestures.start;
            if(Math.max(Math.abs(event.clientX - s.x), Math.abs(event.clientY - s.y)) < Gestures.SLOP) return;
            clearTimeout(Gestures.timer);
            if(s.component && s.component.isDraggable && s.component.isDraggable()) {
                Gestures.mode = 'drag';
                s.component.node.setUnstoppable(true);
            }
            else Gestures.mode = 'pan';
        }
        if(Gestures.mode === 'pan') {
            var k = Gestures.scale();
            SVG.viewBox.baseVal.x -= dx * k.x;
            SVG.viewBox.baseVal.y -= dy * k.y;
            Gestures.redraw();
        }
        else if(Gestures.mode === 'drag') {
            var component = Gestures.start.component, point = EventHandler.screenToSVG(event.clientX, event.clientY);
            component.node.xPosition = point.x;
            component.node.yPosition = point.y;
            component.node.start();
            component.setFixed(true);
            DrawingEngine.start(true);
        }
        else if(Gestures.mode === 'pinch' && Gestures.count() === 2) {
            var now = Gestures.measure(), before = Gestures.pinch;
            var zoom = before.distance > 0 && now.distance > 0 ? before.distance / now.distance : 1;
            var box = SVG.viewBox.baseVal, k2 = Gestures.scale();
            // the point of the graph that was between the fingers stays between them, and the view follows the fingers
            var anchorX = box.x + before.x * k2.x, anchorY = box.y + before.y * k2.y;
            box.width = box.width * zoom;
            box.height = box.height * zoom;
            var k3 = Gestures.scale();
            box.x = anchorX - now.x * k3.x;
            box.y = anchorY - now.y * k3.y;
            Gestures.pinch = now;
            Gestures.redraw();
        }
    },
    up: function(event, onMiniature) {
        if(!Gestures.pointers[event.pointerId]) return;
        delete Gestures.pointers[event.pointerId];
        event.preventDefault();
        var mode = Gestures.mode;
        clearTimeout(Gestures.timer);
        if(mode === 'pending' && Gestures.count() === 0 && event.type === 'pointerup') Gestures.tap(Gestures.start.component);
        if(mode === 'drag') Gestures.letGo();
        if(Gestures.count() === 0) { Gestures.mode = null; Gestures.start = null; }
        else if(mode === 'pinch') {
            // one finger is left: it moves the view, and no tap is made of it
            Gestures.mode = 'pan';
            Gestures.start = null;
        }
    },
    cancel: function(event, onMiniature) {
        Gestures.up(event, onMiniature);
    },
    // a construct that was being moved is let go of
    letGo: function() {
        if(Gestures.mode === 'drag' && Gestures.start && Gestures.start.component)
            Gestures.start.component.node.setUnstoppable(false);
    },
    measure: function() {
        var ids = Object.keys(Gestures.pointers), a = Gestures.pointers[ids[0]], b = Gestures.pointers[ids[1]];
        return { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    },
    // the miniature: the middle of the view goes where the finger is
    navigate: function(event) {
        var point = EventHandler.screenToMiniature(event.clientX, event.clientY);
        Actions.centerModelAt(point.x, point.y);
    },
    // a tap: it selects what it is on, or, on the background, lets go of the selection
    tap: function(component) {
        if(!component) {
            EventHandler.clearSelection();
            return;
        }
        if(EventHandler.selectedComponents.length === 1 && EventHandler.selectedComponents[0] === component) {
            EventHandler.clearSelection();
            return;
        }
        EventHandler.clearSelection();
        EventHandler.addComponentToSelection(component);
        Gestures.showProperties(component);
    },
    // the panel is where a construct is changed with a finger: it comes up, and the construct is kept in view above it
    showProperties: function(component) {
        if(!Outline.isOpen) Outline.setOpen(true, true);
        if(Outline.view === 'xml') Outline.showView('outline');
        var box = component.view.svg.graphicsElement.getBoundingClientRect(), area = Actions.visibleArea();
        var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
        if(cx < area.x || cx > area.x + area.width || cy < area.y || cy > area.y + area.height)
            Actions.centerModelOn(component.node);
    },
    // a finger held on a construct: it joins the selection (or leaves it), and its context menu opens for the selection
    hold: function() {
        if(Gestures.mode !== 'pending' || !Gestures.start || !Gestures.start.component) return;
        var component = Gestures.start.component;
        Gestures.mode = 'held';
        if(navigator.vibrate) { try { navigator.vibrate(15); } catch(e) { } }
        if(EventHandler.selectedComponents.indexOf(component) >= 0 && EventHandler.selectedComponents.length > 1) EventHandler.removeComponentFromSelection(component);
        else EventHandler.addComponentToSelection(component);
        if(EventHandler.selectedComponents.length) {
            component.showContextMenu(component, EventHandler.selectedComponents, EventHandler.selectedRoute);
            if(component.contextMenu && component.contextMenu.collapsed) component.contextMenu.toggle();
        }
    }
};
