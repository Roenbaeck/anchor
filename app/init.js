// init: starting the page, and keeping the model when it is left.
import { ASKBEFOREUNLOAD, NAV, NAVLayer, PARAMETERS, RELEASE, SVG, SVGLayer, VERSION, setAskBeforeUnload, setNAV, setNAVLayer, setSVG, setSVGLayer } from './config.js';
import { Model } from './Model.js';
import { DrawingEngine } from './DrawingEngine.js';
import { EventHandler } from './EventHandler.js';
import { Actions } from './Actions.js';
import { Features } from './Features.js';
import { Settings } from './Settings.js';
import { ControlButtons } from './ControlButtons.js';
import { Layer } from './Layer.js';
import { Wiring } from './Wiring.js';
import { Menus } from './Menus.js';
import { Outline } from './Outline.js';
import { Problems } from './Problems.js';
import { AgentHandoff } from './AgentHandoff.js';
import { ModelStore } from './ModelStore.js';
import { Gestures } from './Gestures.js';
// make sure our init function is called when the page is loaded
window.onload = function() {
    init(this);
};

// implementation of our init function
export function init(window) {
    // a test version says so in a small badge in the corner (the Help/About page links to the issue tracker)
    if(!RELEASE) {
        document.getElementById("disclaimerVersion").textContent = VERSION;
        document.getElementById("disclaimer").style.display = "block";
    }
    // set values in the settings and defaults input fields
    Settings.loadSettings(window.localStorage);
    // hide what the selected database and temporalization do not implement, once the table has been read
    Features.load().then(function() { Features.apply(); Features.report(); });
    // initialize theme (light/dark)
    if(window.Actions && typeof Actions.initTheme === 'function') {
        var storedTheme = window.localStorage.getItem("theme");
        // what the viewer chose, or else what the system prefers
        var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        Actions.initTheme(storedTheme ? storedTheme : (systemDark ? 'dark' : 'light'));
    }
    // Show initial status explicitly (before any model load) so user sees "Local editing mode"
    if(window.Actions && typeof Actions.setModelStatus === 'function') {
        Actions.lastLocalFilename = null;
        Actions.setModelStatus();
    }

    // find any parameters passed in the url
    var gets = window.location.search.substring(1);
    var pair, pairs = gets.split('&');
    for(var i = 0; pair = pairs[i]; i++) {
      pair = pairs[i].split('=');
      PARAMETERS[pair[0]] = pair[1];
    }

    // assign event handlers to buttons
    ControlButtons.init();
    Wiring.init();
    Menus.init();
    Outline.init();
    Problems.init();
    AgentHandoff.init();
    ModelStore.init();
    LayoutEngine.init();

    // set the global svg and graph variable
    setSVG(document.getElementById("graph"));
    SVG.viewBox.baseVal.x = 0;
    SVG.viewBox.baseVal.y = 0;
    SVG.viewBox.baseVal.width = window.innerWidth;
    SVG.viewBox.baseVal.height = window.innerHeight;

    // add layers to the SVG
    setSVGLayer(new Layer(SVG));
    SVGLayer.addLayer('debugPartitions');
    SVGLayer.addLayer('debug');
    SVGLayer.addLayer('keys');
    SVGLayer.addLayer('edges');
    SVGLayer.edges.setAttributeNS(null, 'class', 'edges');
    SVGLayer.addLayer('nodes');
    SVGLayer.nodes.setAttributeNS(null, 'class', 'nodes');
    SVGLayer.addLayer('names');
    SVGLayer.names.setAttributeNS(null, 'class', 'label');

    // set up "global" event handlers
    SVG.addEventListener('wheel', EventHandler.zoom, false);
    SVG.addEventListener('mousedown', EventHandler.preparePanning, false);
    SVG.addEventListener('keydown', EventHandler.keyboardView, false);

    // set up the miniature navigation
    setNAV(document.getElementById("minigraph"));
    NAV.addEventListener('mousedown', EventHandler.prepareNavigation, false);
    Gestures.init(); // what a finger does (a mouse does what is above)

    // add layers to the NAV
    setNAVLayer(new Layer(NAV));
    NAVLayer.addLayer('edges');
    NAVLayer.edges.setAttributeNS(null, 'class', 'edges');
    NAVLayer.addLayer('nodes');
    NAVLayer.nodes.setAttributeNS(null, 'class', 'nodes');
    NAVLayer.addLayer('viewport');

    // nav edges base styling now defined in svg.css (#minigraph g#edges ...)

    DrawingEngine.init();
    // load previous scale and transform
    DrawingEngine.loadSettings(window.localStorage);

    // handle resizing
    window.addEventListener('resize', EventHandler.resize, false);
    // handle the escape button
    window.addEventListener('keydown', EventHandler.escape, false);
    // a shared link pasted into a tab where the modeler is already open only changes the hash
    window.addEventListener('hashchange', function() {
        if(Actions.sharedModelInLink() && confirm(replaceQuestion))
            Actions.loadSharedModel();
    }, false);

    // load url or previous model, if any
    var model;
    var replaceQuestion = 'This link contains a shared model. Open it in place of the model you are working on? ' +
            'Your current model is replaced, unless you save it to a local file first.';
    // a shared model replaces the one kept in the browser, so ask first if there is one (if not, the
    // link stays in the address bar, and the shared model can be opened later by reloading)
    if(Actions.sharedModelInLink() && (!window.localStorage.getItem("model") || confirm(replaceQuestion))) {
        Actions.loadSharedModel();
    }
    else if(PARAMETERS.gist) {
        Actions.loadModelFromGist(PARAMETERS.gist);
    }
    else if(model = window.localStorage.getItem("model")) {
        Model.fromXML(new DOMParser().parseFromString(model, 'text/xml'));
        Model.id = window.localStorage.getItem("modelId");
        Model.name = window.localStorage.getItem("modelName");
        Model.description = window.localStorage.getItem("modelDescription");
        // Update status with restored model name if any
        Actions.setModelStatus();
    }
    else
        Actions.loadFromURL('example.xml');

    // start the engine and let's go
    DrawingEngine.start(true);
}

// Persist model/settings before navigation while still allowing a confirmation
window.onbeforeunload = function() {
    if(ASKBEFOREUNLOAD)
        return "Are you absolutely sure you want to leave?\nAny unsaved changes will be lost!";
    else
        setAskBeforeUnload(true);
};
// Use pagehide (fires for bfcache) instead of deprecated unload; also visibilitychange fallback
export function persistOnPageHide(evt) {
    try { save(window, false); } catch(e) { /* swallow to not block navigation */ }
}
window.addEventListener('pagehide', persistOnPageHide, {capture:false});
document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'hidden') persistOnPageHide();
});

export function save(window, popup) {
    window.localStorage.clear();
    var xml = new XMLSerializer().serializeToString(Model.toXML(false));
    if(xml)
        window.localStorage.setItem("model", xml);
    if(Model.id)
        window.localStorage.setItem("modelId", Model.id);
    if(Model.name)
        window.localStorage.setItem("modelName", Model.name);
    if(Model.description)
        window.localStorage.setItem("modelDescription", Model.description);
    if(Actions.currentTheme)     
        window.localStorage.setItem("theme", Actions.currentTheme);    
    Settings.storeSettings(window.localStorage);
    DrawingEngine.storeSettings(window.localStorage);
    if(popup)
        alert("The model and settings are now saved in the browser cache.");
}
