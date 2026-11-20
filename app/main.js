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
import './files.js';

var exposed = { Model: Model, DrawingEngine: DrawingEngine, Editables: Editables, EventHandler: EventHandler, Operations: Operations,
    TabularEditor: TabularEditor, Actions: Actions, Features: Features, Settings: Settings, ControlButtons: ControlButtons,
    Wiring: Wiring, save: save, VERSION: VERSION };
Object.keys(exposed).forEach(function(name) { window[name] = exposed[name]; });
// these are set when the page has loaded, so they are read when they are asked for
Object.defineProperty(window, 'SVG', { configurable: true, get: function() { return SVG; } });
Object.defineProperty(window, 'SVGLayer', { configurable: true, get: function() { return SVGLayer; } });
Object.defineProperty(window, 'NAV', { configurable: true, get: function() { return NAV; } });
Object.defineProperty(window, 'NAVLayer', { configurable: true, get: function() { return NAVLayer; } });
// index.html shows a notice if this has not happened when the page has loaded (modules are not loaded from a file)
window.AnchorStarted = true;
