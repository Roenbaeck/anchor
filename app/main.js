// main: the entry point of the page. It loads every part, and puts on window what the markup (Wiring), the tests and the tools reach by name.
import { Model } from './Model.js';
import { DrawingEngine } from './DrawingEngine.js';
import { Editables } from './Editables.js';
import { EventHandler } from './EventHandler.js';
import { Operations } from './Operations.js';
import { TabularEditor } from './TabularEditor.js';
import { Actions } from './Actions.js';
import { Features } from './Features.js';
import { Settings } from './Settings.js';
import { ControlButtons } from './ControlButtons.js';
import { Wiring } from './Wiring.js';
import { save } from './init.js';
import { VERSION, SVG, SVGLayer, NAV, NAVLayer } from './config.js';
import { Component } from './Component.js';
import { Anchor } from './Anchor.js';
import { Attribute } from './Attribute.js';
import { Identifier } from './Identifier.js';
import { Knot } from './Knot.js';
import { Nexus } from './Nexus.js';
import { Role } from './Role.js';
import { Tie } from './Tie.js';
import { NodeView } from './view/NodeView.js';
import { RoleView } from './view/RoleView.js';
import './files.js';

// The constructs have a view when there is a page to show them on: a role is drawn by a RoleView, anything else by a NodeView.
Component.createView = function(component) {
    return component.node.type === NodeType.EDGE ? new RoleView(component) : new NodeView(component);
};

// The kinds of construct that the model makes (see Model.kinds).
Model.kinds = { Anchor: Anchor, Attribute: Attribute, Identifier: Identifier, Knot: Knot, Nexus: Nexus, Role: Role, Tie: Tie };

// What the model asks of the page around it (see Model.surroundings), done with the real views.
Model.surroundings = {
    selectedRoute: function() { return EventHandler.selectedRoute; },
    clearSelection: function() { EventHandler.clearSelection(); },
    layout: function(fresh) { DrawingEngine.start(fresh); },
    stopLayout: function() { DrawingEngine.stop(); },
    restoring: function(on) { DrawingEngine.restoring = on; },
    clearDrawing: function() {
        SVGLayer.clearAll();
        NAVLayer.clearAll();
    },
    showKeys: function(show) {
        if(show) SVGLayer.show('keys'); else SVGLayer.hide('keys');
    },
    viewReset: function() {
        Actions.setModelStatus();
        Actions.resetZoom();
        Actions.centerModel();
    },
    adoptSettings: function() {
        Settings.storeSettings(window.localStorage);
        Settings.loadSettings(window.localStorage);
    },
    checks: function() {
        // the key routes, with the rules of the generators (it reads their scripts, so it ends later)
        Actions.checkKeys().catch(e => { if(console) console.warn('Key check failed:', e); });
        try { Actions.checkNaming(); } catch(e) { if(console) console.warn('Naming check failed:', e); }
        try { Features.apply(); Features.report(); } catch(e) { if(console) console.warn('Features check failed:', e); }
    }
};

var exposed = { Model: Model, DrawingEngine: DrawingEngine, Editables: Editables, EventHandler: EventHandler, Operations: Operations,
    TabularEditor: TabularEditor, Actions: Actions, Features: Features, Settings: Settings, ControlButtons: ControlButtons,
    Wiring: Wiring, save: save, VERSION: VERSION, Component: Component };
Object.keys(exposed).forEach(function(name) { window[name] = exposed[name]; });
// these are set when the page has loaded, so they are read when they are asked for
Object.defineProperty(window, 'SVG', { configurable: true, get: function() { return SVG; } });
Object.defineProperty(window, 'SVGLayer', { configurable: true, get: function() { return SVGLayer; } });
Object.defineProperty(window, 'NAV', { configurable: true, get: function() { return NAV; } });
Object.defineProperty(window, 'NAVLayer', { configurable: true, get: function() { return NAVLayer; } });
// index.html shows a notice if this has not happened when the page has loaded (modules are not loaded from a file)
window.AnchorStarted = true;
