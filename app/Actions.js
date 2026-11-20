// Actions: what the menus do: files, layout, generation, sharing, theme.
import { DEBUG, NAVLayer, SVG, SVGLayer, SVGNS, THEME, XLINKNS, setAskBeforeUnload } from './config.js';
import { Component } from './Component.js';
import { Model } from './Model.js';
import { DrawingEngine } from './DrawingEngine.js';
import { EventHandler } from './EventHandler.js';
import { CodePopover, URLPopover } from './Popovers.js';
import { save } from './init.js';
import { Outline } from './Outline.js';
import { AgentHandoff } from './AgentHandoff.js';
import { Placement } from './Placement.js';
import { ModelStore } from './ModelStore.js';
import { Documentation } from './Documentation.js';
export var Actions = {
    startKeyboardEvents: function() {
        window.addEventListener('keydown', EventHandler.keydown, false);
    },
    // what the page does that does not say itself (undo, redo, the layout, the theme), for those who do not see it happen;
    // the region is emptied first so that the same words are read again when they are the same
    announce: function(text) {
        var region = document.getElementById('announcer');
        if(!region) return;
        region.textContent = '';
        setTimeout(function() { region.textContent = text; }, 50);
    },
    // Puts text on the clipboard: true if it got there. The browser's clipboard is tried first; where a page may not use it, a
    // field is made, selected and copied from, as it was done before there was a clipboard to ask.
    copyText: function(text) {
        var fallback = function() {
            var field = document.createElement('textarea');
            field.value = text;
            field.setAttribute('readonly', '');
            field.style.cssText = 'position:fixed;left:-9999px;top:0';
            document.body.appendChild(field);
            field.select();
            var copied = false;
            try { copied = document.execCommand('copy'); } catch(e) { }
            document.body.removeChild(field);
            return copied;
        };
        if(navigator.clipboard && navigator.clipboard.writeText)
            return navigator.clipboard.writeText(text).then(function() { return true; }, function() { return fallback(); });
        return Promise.resolve(fallback());
    },
    // a short message that goes away by itself, and is read out
    notify: function(text) {
        var toast = document.getElementById('toast');
        if(!toast) return;
        toast.textContent = text;
        toast.classList.add('show');
        clearTimeout(Actions.toastTimer);
        Actions.toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 4500);
        Actions.announce(text);
    },
    toastTimer: null,
    // the model, for an agent that is asked to change it, and what the agent gives back
    copyForAgent: function() {
        AgentHandoff.copy();
    },
    openAgentPaste: function() {
        AgentHandoff.open();
    },
    closeAgentPaste: function() {
        AgentHandoff.close();
    },
    // models kept in this browser, each under a name
    openModelStore: function() {
        ModelStore.show();
    },
    closeModelStore: function() {
        ModelStore.close();
    },
    closeDocumentation: function() {
        Documentation.close();
    },
    stopKeyboardEvents: function() {
        window.removeEventListener('keydown', EventHandler.keydown, false);
    },
    populateSelector: function(selector, searchString) {
        this.startKeyboardEvents();
        var node, component;
        var selected = selector.value;
        while(selector.options.length > 0)
            selector.options.remove(0);
        selector.options.add(new Option("None selected", "none"));
        var components = Model.components.slice();
        components.sort(
            function(a, b) {
                var aStr, bStr;
                try { aStr = a.toString(); } catch(e) { aStr = '!ERR!'; }
                try { bStr = b.toString(); } catch(e) { bStr = '!ERR!'; }
                var nameA = a.encapsulation + '.' + aStr;
                var nameB = b.encapsulation + '.' + bStr;
                return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
            }
        );
        for(var i = 0; component = components[i]; i++) {
            node = component.node;
            var safeString;
            try { safeString = component.toString(); } catch(e) { safeString = ''; }
            if(safeString && node.type !== NodeType.EDGE) {
                var fullName = component.encapsulation + '.' + safeString;
                if(component.incomplete)
                    fullName = "* " + fullName;
                var option = new Option(fullName, component.id);
                if(searchString && searchString.trim() !== '') {
                    if(fullName.indexOf(searchString) >= 0)
                        selector.options.add(option);
                }
                else {
                    selector.options.add(option);
                }
            }
        }
        selector.value = selected;
    },
    // serializes an SVG with all styling inlined, so it looks the same outside the modeler
    toSVGString: function(image) {
        // Clone the live SVG so we don't mutate what's on screen
        var graph = image.cloneNode(true);
        // Remove transient viewport helper if present
        var viewport = graph.getElementById('viewport');
        if(viewport) graph.removeChild(viewport);
        // Replace every <use> with a real copy of the symbol it references. Symbols get their colors
        // through currentColor and selectors on their surroundings (such as the layer they are in),
        // which only resolve correctly where each symbol is used, not inside <defs>.
        var uses = graph.querySelectorAll('use'), copies = [];
        for(var u = 0; u < uses.length; u++) {
            var use = uses[u];
            var href = use.getAttribute('href') || use.getAttributeNS(XLINKNS, 'href');
            var symbol = href ? image.querySelector(href) : null;
            if(!symbol) continue;
            // the copy keeps the symbol id, so selectors such as g#one match it
            var copy = symbol.cloneNode(true);
            for(var a = 0; a < use.attributes.length; a++) {
                var attribute = use.attributes[a];
                if(['x', 'y', 'width', 'height'].indexOf(attribute.localName) < 0 && attribute.localName !== 'href')
                    copy.setAttribute(attribute.name, attribute.value);
            }
            // temporary, so that selectors such as [href="#one"] match the copy as they match the use
            copy.setAttribute('href', href);
            var x = use.getAttribute('x') || 0, y = use.getAttribute('y') || 0;
            if(x || y)
                copy.setAttribute('transform', (copy.getAttribute('transform') || '') + ' translate(' + x + ',' + y + ')');
            use.parentNode.replaceChild(copy, use);
            copies.push(copy);
        }
        // Properties worth preserving for visual fidelity
        var STYLE_PROPS = [
            'fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-dasharray',
            'stroke-dashoffset','opacity','fill-opacity','stroke-opacity','paint-order','font-family','font-size',
            'font-weight','font-style','text-anchor','dominant-baseline'
        ];
        // Attach the copy, hidden, so the page's CSS (including the current theme) applies to it in the
        // same context as on screen, and inline the computed styles
        var rootStyle = graph.getAttribute('style');
        graph.style.position = 'absolute';
        graph.style.visibility = 'hidden';
        graph.style.pointerEvents = 'none';
        document.body.appendChild(graph);
        try {
            var elements = graph.querySelectorAll('*');
            for(var i = 0; i < elements.length; i++) {
                var element = elements[i];
                var cs = window.getComputedStyle(element);
                if(!cs) continue;
                var existingStyle = element.getAttribute('style') || '';
                var styleParts = [];
                for(var j = 0; j < STYLE_PROPS.length; j++) {
                    var prop = STYLE_PROPS[j];
                    // keep what is already explicitly set inline
                    if(new RegExp('(^|;)\\s*' + prop + '\\s*:').test(existingStyle)) continue;
                    var val = cs.getPropertyValue(prop);
                    // none is kept, since it prevents inheriting a fill or stroke the element does not have
                    if(val) styleParts.push(prop + ':' + val);
                }
                if(styleParts.length > 0)
                    element.setAttribute('style', styleParts.join(';') + (existingStyle ? ';' + existingStyle : ''));
            }
        } catch(inlineErr) {
            if(DEBUG) console.warn('SVG export style inlining failed', inlineErr);
        } finally {
            document.body.removeChild(graph);
            if(rootStyle) graph.setAttribute('style', rootStyle); else graph.removeAttribute('style');
            // with styles inlined, the copies no longer need the attributes used for matching selectors
            for(var c = 0; c < copies.length; c++) {
                copies[c].removeAttribute('href');
                copies[c].removeAttribute('id');
            }
        }
        return (new XMLSerializer()).serializeToString(graph);
    },
    // The whole model as one SVG document (a string) with its colours (the theme's) and a background of the colour of the canvas, so
    // that it looks as it does on the screen wherever it is opened, with room around the model. The size of the picture is the size
    // of the model times the scale (1 if none is given; never more than 8000 pixels wide or high): { source, width, height } in pixels.
    // Both the SVG file and the PNG are made of it.
    modelSVG: function(scale) {
        var box = null;
        [SVGLayer.edges, SVGLayer.nodes, SVGLayer.names].forEach(function(layer) {
            var b = layer.getBBox();
            if(!b.width && !b.height) return;
            box = box ? { x0: Math.min(box.x0, b.x), y0: Math.min(box.y0, b.y), x1: Math.max(box.x1, b.x + b.width), y1: Math.max(box.y1, b.y + b.height) } :
                { x0: b.x, y0: b.y, x1: b.x + b.width, y1: b.y + b.height };
        });
        if(!box) throw new Error('there is nothing in the model to draw');
        var pad = 60, x = box.x0 - pad, y = box.y0 - pad, width = box.x1 - box.x0 + 2 * pad, height = box.y1 - box.y0 + 2 * pad;
        var doc = new DOMParser().parseFromString(Actions.toSVGString(SVG), 'image/svg+xml'), root = doc.documentElement;
        root.setAttribute('viewBox', [x, y, width, height].join(' '));
        scale = Math.min(scale || 1, 8000 / width, 8000 / height);
        root.setAttribute('width', Math.round(width * scale));
        root.setAttribute('height', Math.round(height * scale));
        root.removeAttribute('style');
        var background = doc.createElementNS(SVGNS, 'rect');
        background.setAttribute('x', x); background.setAttribute('y', y);
        background.setAttribute('width', width); background.setAttribute('height', height);
        background.setAttribute('fill', getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#ffffff');
        var defs = root.getElementsByTagName('defs')[0];
        root.insertBefore(background, defs ? defs.nextSibling : root.firstChild);
        return { source: new XMLSerializer().serializeToString(root), width: Math.round(width * scale), height: Math.round(height * scale) };
    },
    // The whole model as a PNG picture (a Promise of a Blob), drawn on a canvas at the given scale (never more than 8000 pixels
    // wide or high). The SVG has no references to anything outside it, so the canvas is not tainted.
    pngBlob: function(scale) {
        return new Promise(function(resolve, reject) {
            var drawing;
            try { drawing = Actions.modelSVG(scale || 2); } catch(e) { reject(e); return; }
            var width = drawing.width, height = drawing.height, source = drawing.source;
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                try {
                    canvas.toBlob(function(blob) { if(blob) resolve(blob); else reject(new Error('the browser could not make a picture')); }, 'image/png');
                } catch(e) { reject(e); }
            };
            img.onerror = function() { reject(new Error('the browser could not read the drawing')); };
            // the names may have letters that btoa does not take as they are
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));
        });
    },    savePNG: function() {
        Actions.pngBlob(2).then(function(blob) {
            Actions.downloadBlob(blob, Actions.modelFileName() + '.png');
        }, function(error) {
            Actions.notify('The picture could not be made: ' + (error && error.message || error));
        });
    },
    findNodeToExplode: function(node) {
        var edge, otherNode;
        for(var i = 0; edge = node.edges[i]; i++) {
            otherNode = edge.node === node ? edge.otherNode : edge.node;
            if((otherNode.type === NodeType.ANCHOR || otherNode.type === NodeType.NEXUS) && otherNode.imploded) {
                Model.explode([Model.nodeToComponent(otherNode)]);
                break;
            }
        }
    },
    selectNode: function(id) {
        if(id !== 'none') {
            var i, edge, otherNode;
            var component = Model.idToComponent[id];
            var node = component.node;
            // find the closest imploded node and explode it
            if(!node.visible) {
                if(node.type === NodeType.ATTRIBUTE)
                    this.findNodeToExplode(node);
                else if(node.type === NodeType.KNOT) {
                    this.findNodeToExplode(node);
                    if(!node.visible) {
                        for(i = 0; edge = node.edges[i]; i++) {
                            otherNode = edge.node === node ? edge.otherNode : edge.node;
                            if(otherNode.type === NodeType.ATTRIBUTE) {
                                this.findNodeToExplode(otherNode);
                                break;
                            }
                        }
                    }
                }
            }
            EventHandler.clearSelection();
            EventHandler.addComponentToSelection(component);
            Actions.centerModelOn(node);
        }
        else {
            EventHandler.clearSelection();
        }
    },
    getDirectives: async function(scriptname) {
        var database = Defaults.databaseTarget;
        var temporalization = Defaults.temporalization;
        var filename = scriptname || database + '_' + temporalization + '.directive';

        var cacheDisabler = '';
        if(DEBUG) cacheDisabler = '?r=' + Math.random();

        // process and evaluate all sisulas in the directive
        var response = await fetch(filename + cacheDisabler);
        var responseText = await response.text();
        return responseText;
    },            
    transform: async function (xmlDocument, transformationURL, ownerDocument) {
        var result;
        // Added random parameter to prevent caching...
        var url = transformationURL + '?r=' + Math.random();
        var xml = await this.loadXML(url);
        var processor = new XSLTProcessor();
        processor.importStylesheet(xml.documentElement);
        result = processor.transformToFragment(xmlDocument, ownerDocument);
        return result;
    },
    createEmail: function(str) {
        setAskBeforeUnload(false); // prevent onbeforeunload behavior
        var save = document.createElement('a');
        var modelName = Model.name || 'Model';
        save.href = "mailto:?subject=" + modelName + "&body=" + str;
        save.target = '_self';
        var event = document.createEvent('Event');
        event.initEvent('click', true, true);
        save.dispatchEvent(event);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    },
    // what the file of the model is called: the name of the model, or of the file it was loaded from, or Model
    modelFileName: function() {
        return Model.name || (Actions.lastLocalFilename ? Actions.lastLocalFilename.replace(/\.[^.\\/]*$/, '') : '') || 'Model';
    },
    saveToDisk: function (str, type) {
        Actions.downloadBlob(new Blob([str], { type: type === 'svg' ? 'image/svg+xml' : 'text/' + type }), Actions.modelFileName() + '.' + type);
    },
    downloadText: function (text, filename, type) {
        Actions.downloadBlob(new Blob([text], { type: type + ';charset=utf-8' }), filename);
    },
    downloadBlob: function (blob, filename) {
        var save = document.createElement('a');
        save.href = (window.URL || window.webkitURL).createObjectURL(blob);
        save.target = '_blank';
        save.download = filename;
        var event = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': false
                    });
        save.dispatchEvent(event);
        // give the download time to start before releasing the blob
        setTimeout(function() { (window.URL || window.webkitURL).revokeObjectURL(save.href); }, 1000);
    },
    // Shares the model through a link carrying the compressed model XML after #model=. The part
    // after # is never sent to the web server, so the model only exists in the link itself.
    shareModel: async function() {
        if(typeof CompressionStream === 'undefined') {
            alert('Sharing models requires a newer browser, with support for compression streams.');
            return;
        }
        var xml = new XMLSerializer().serializeToString(Model.toXML(false));
        var stream = new Blob([xml]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        var bytes = new Uint8Array(await new Response(stream).arrayBuffer());
        var binary = '';
        for(var i = 0; i < bytes.length; i += 0x8000)
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        var encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        var url = window.location.href.split(/[?#]/)[0] + '#model=' + encoded +
                (Model.name ? '&name=' + encodeURIComponent(Model.name) : '');
        try {
            await navigator.clipboard.writeText(url);
            alert('A link to this model has been copied to the clipboard (' + url.length + ' characters). ' +
                  'Anyone opening it gets a copy of the model as it looks now.');
        }
        catch(e) {
            // clipboard access can be refused, so show the link for copying by hand
            var fragment = document.createDocumentFragment();
            var pre = document.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.wordBreak = 'break-all';
            pre.appendChild(document.createTextNode(url));
            fragment.appendChild(pre);
            new CodePopover(fragment, true);
        }
    },
    sharedModelInLink: function() {
        return /^#model=/.test(window.location.hash);
    },
    loadSharedModel: async function() {
        if(this.loading) return;
        var parameters = {};
        window.location.hash.substring(1).split('&').forEach(function(pair) {
            var separator = pair.indexOf('=');
            if(separator > 0) parameters[pair.substring(0, separator)] = pair.substring(separator + 1);
        });
        this.lastLocalFilename = null;
        this.showLoading('Loading shared model…');
        try {
            if(typeof DecompressionStream === 'undefined')
                throw new Error('opening shared models requires a newer browser, with support for compression streams.');
            var base64 = parameters.model.replace(/-/g, '+').replace(/_/g, '/');
            var binary = atob(base64 + '==='.slice((base64.length + 3) % 4));
            var bytes = Uint8Array.from(binary, function(c) { return c.charCodeAt(0); });
            var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
            var xml = new DOMParser().parseFromString(await new Response(stream).text(), 'text/xml');
            if(xml.getElementsByTagName('parsererror').length > 0)
                throw new Error('the link does not contain a valid model.');
            this._applyLoadedModel(xml, false);
            if(parameters.name) {
                Model.name = decodeURIComponent(parameters.name);
                this.setModelStatus();
            }
            // remove the model from the address bar, so a reload does not replace later edits
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        catch(err) {
            console.error('Failed to load shared model', err);
            alert('Failed to load the shared model: ' + err.message + ' The link may have been cut short when it was copied.');
            this.hideLoading();
        }
    },
    loadModelFromGist: async function(gist_id) {
        var url = "https://api.github.com/gists/" + gist_id;
        var response = await fetch(url);
        var responseText = await response.text();
        const gist = JSON.parse(responseText);
        // console.log(gist);
        var file, raw_url;
        for (file in gist.files) {
            if(gist.files[file].language == 'XML') {
                raw_url = gist.files[file].raw_url;
                Model.id = gist_id;
                Model.name = gist.description;
                Model.description = gist.owner.login;
                break;
            }
        }
        this.loadFromURL(raw_url, false);
    },
    loadXML: async function(url) {
        var response = await fetch(url);
        var responseText = await response.text();
        var xml = new DOMParser().parseFromString(responseText, 'text/xml');
        return xml;                
    },
    _applyLoadedModel: function(xml, layout) {
        layout = typeof layout !== 'undefined' ? layout : false;
        EventHandler.clearSelection();
        SVGLayer.clearAll();
        NAVLayer.clearAll();
        // forget where the previous model came from, so that its name does not linger
        Model.forgetOrigin();
        Model.clearStates();
        // a model without places (one that was written by hand or by an agent) is placed by what is tied to what, not at random
        var placed = Placement.seed(xml, {}, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
        Model.fromXML(xml);
        Actions.setModelStatus();
        Actions.resetZoom();
        if(placed > 0) Actions.fitModel(); // placed by Placement, which can make it larger than the window
        else Actions.centerModel();
        DrawingEngine.taint();
        // what was placed (not by the modeler) is polished by the layout
        DrawingEngine.start(layout || placed > 0);
        this.hideLoading();
    },
    loadFromURL: function (url, layout) {
        layout = typeof layout !== 'undefined' ? layout : false;
        // Treat example.xml like a local file name for status purposes
        if(url === 'example.xml')
            this.lastLocalFilename = 'example.xml';
        else
            this.lastLocalFilename = null; // avoid stale filename when loading other sources
        if(this.loading) return; // guard against double-clicks
        this.showLoading('Loading ' + (this.lastLocalFilename || url) + '…');
        this.loadXML(url)
        .then(xml => {
            this._applyLoadedModel(xml, layout);
        })
        .catch(err => {
            console.error('Failed to load model from URL', err);
            alert('Failed to load model: ' + err.message);
            this.hideLoading();
        });
    },
    modelStatusText: null,
    lastLocalFilename: null,
    loading: false,
    showLoading: function(message) {
        var overlay = document.getElementById('loadingOverlay');
        var label = document.getElementById('loadingIndicator');
        if(!overlay || !label) return;
        if(!message) message = 'Loading…';
        label.textContent = message;
        overlay.style.display = 'block';
        document.body.setAttribute('aria-busy', 'true');
        this.loading = true;
    },
    hideLoading: function() {
        var overlay = document.getElementById('loadingOverlay');
        if(overlay) overlay.style.display = 'none';
        document.body.removeAttribute('aria-busy');
        this.loading = false;
    },
    newModel: function() {
        if(this.loading) return; // do nothing if a load is in progress
        this.lastLocalFilename = null;
        Model.forgetOrigin();
        Model.setupMinimal(true);
        this.setModelStatus();
    },
    setModelStatus: function() {
        var statusElement = document.getElementById("model");
        var status = "Local editing mode";
        if(Model.name && Model.id)
            status = "Editing " + Model.name + " (gist " + Model.id + ")";
        else if(this.lastLocalFilename)
            status += " (" + this.lastLocalFilename + ")";
        if(Actions.modelStatusText)
            statusElement.removeChild(Actions.modelStatusText);
        Actions.modelStatusText = document.createTextNode(status);
        statusElement.appendChild(Actions.modelStatusText);
    },
    // THEME MANAGEMENT -----------------------------------------------
    currentTheme: THEME,
    applyTheme: function(theme) {
        Actions.currentTheme = theme;
        document.body.classList.toggle('dark', theme === 'dark');
        // Force a full SVG redraw to ensure external svg.css styles are recognized
        // Wait for DrawingEngine and layers to be available before redrawing (avoids load-time TypeError)
        if(window.DrawingEngine && typeof DrawingEngine.draw === 'function' && DrawingEngine.initialized) {
            var i = Model.components.length;
            while(i--) {
                var component = Model.components[i];
                if(component.node.visible) {
                    component.view.draw(component.view.svg);
                    if(component.view.nav) component.view.draw(component.view.nav);
                }
            }
            DrawingEngine.draw();
        }
        // the button says what it will do (and shows the sun in the dark theme, the moon in the light, see application.css)
        var item = document.getElementById('themeToggle');
        if(item) {
            var label = theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme';
            item.setAttribute('title', label);
            item.setAttribute('aria-label', label);
        }
    },
    toggleTheme: function() {
        this.applyTheme(Actions.currentTheme === 'dark' ? 'light' : 'dark');
        Actions.announce(Actions.currentTheme === 'dark' ? 'Dark theme' : 'Light theme');
    },
    initTheme: function(theme) {
        if(theme === 'dark') this.applyTheme('dark');
        else this.applyTheme('light');
    },
    resetZoom: function() {
        SVG.viewBox.baseVal.width = window.innerWidth;
        SVG.viewBox.baseVal.height = window.innerHeight;
        DrawingEngine.invalidateMiniature();
        DrawingEngine.start(false);
    },
    centerModel: function() {
        var boundingBox = SVGLayer.nodes.getBBox();
        var xCenter = boundingBox.x + boundingBox.width/2;
        var yCenter = boundingBox.y + boundingBox.height/2;
        this.centerModelAt(xCenter, yCenter);
    },
    // the view is made as large as it has to be for all of the model to be in it (never smaller than the window), and centred on it
    fitModel: function() {
        var box = SVGLayer.nodes.getBBox(), scale = Math.max(1, box.width * 1.15 / window.innerWidth, box.height * 1.15 / window.innerHeight);
        SVG.viewBox.baseVal.width = window.innerWidth * scale;
        SVG.viewBox.baseVal.height = window.innerHeight * scale;
        this.centerModelAt(box.x + box.width / 2, box.y + box.height / 2);
    },
    centerModelOn: function(node) {
        this.centerModelAt(node.xPosition, node.yPosition);
    },
    centerModelAt: function(x, y) {
        SVG.viewBox.baseVal.x = x - SVG.viewBox.baseVal.width/2;
        SVG.viewBox.baseVal.y = y - SVG.viewBox.baseVal.height/2;
        DrawingEngine.invalidateMiniature();
        DrawingEngine.start(false);
    },
    randomizeLayout: function () {
        for(var i = 0; i < Model.visibleNodes.length; i++) {
            if(!Model.visibleNodes[i].fixed) {
                Model.visibleNodes[i].xPosition = Math.random() * window.innerWidth;
                Model.visibleNodes[i].yPosition = Math.random() * window.innerHeight;
            }
        }
        DrawingEngine.start(true);
    },
    toggleFixation: function () {
        for(var i = 0; i < Model.components.length; i++)
            Model.components[i].setFixed(!Model.components[i].getFixed());
        DrawingEngine.start(true);
    },
    releaseAll: function () {
        for(var i = 0; i < Model.components.length; i++)
            Model.components[i].setFixed(false);
        DrawingEngine.start(true);
    },
    toggleNames: function () {
        DrawingEngine.showNames = !DrawingEngine.showNames;
        if(DrawingEngine.showNames)
            SVGLayer.show('names');
        else
            SVGLayer.hide('names');
        DrawingEngine.start(false);
    },
    toggleKeys: function() {
        EventHandler.clearSelection();
        DrawingEngine.showKeys = !DrawingEngine.showKeys;
        if(DrawingEngine.showKeys) 
            SVGLayer.show('keys');
        else
            SVGLayer.hide('keys');
        DrawingEngine.start(false);                
    },
    toggleMnemonics: function () {
        Component.showMnemonics = !Component.showMnemonics;
        DrawingEngine.start(false);
    },
    toggleColoring: function() {
        DrawingEngine.coloring = !DrawingEngine.coloring;
        DrawingEngine.start(false);
    },
    implodeAll: function() {
        var i, component, allComponents = [];
        for(i = 0; component = Model.components[i]; i++) {
            if((component.node.type === NodeType.ANCHOR || component.node.type === NodeType.NEXUS) && !component.imploded)
                allComponents.push(component);
        }
        EventHandler.clearSelection();
        Model.explode(allComponents);
        Actions.announce('All anchors and nexuses are imploded');
    },
    explodeAll: function() {
        var i, component, allComponents = [];
        for(i = 0; component = Model.components[i]; i++) {
            if((component.node.type === NodeType.ANCHOR || component.node.type === NodeType.NEXUS) && component.imploded)
                allComponents.push(component);
        }
        Model.explode(allComponents);
        Actions.announce('All anchors and nexuses are exploded');
    },
    // What menu items do that takes more than one call. The markup only names a function (see Wiring.js).
    chooseModelFile: function() {
        document.getElementById('modelFileInput').click();
    },
    saveSettingsInBrowser: function() {
        save(window, true);
    },
    saveModelToDisk: function() {
        Actions.saveToDisk(new XMLSerializer().serializeToString(Model.toXML(false)), 'xml');
    },
    saveSVGToDisk: function() {
        try { Actions.saveToDisk(Actions.modelSVG().source, 'svg'); }
        catch(e) { Actions.notify('The picture could not be made: ' + (e && e.message || e)); }
    },
    mailModel: function() {
        Actions.createEmail(new XMLSerializer().serializeToString(Model.toXML(false)));
    },
    resetView: function() {
        Actions.resetZoom();
        Actions.centerModel();
    },
    openTutorials: function() {
        new URLPopover('http://www.anchormodeling.com/?page_id=186');
    },
    openAbout: function() {
        new URLPopover('about.html');
    },
    // the panel with the outline and the properties, at the right
    togglePanel: function() {
        Outline.toggle();
    },
    // the panel shows the outline of the model ('outline') or its XML ('xml')
    showPanelView: function(name) {
        Outline.showView(name);
    },
    // MODEL SETTINGS -------------------------------------------------
    // The dialog holds the settings of the generated code (target, features, names, types, defaults for new items) and of the
    // layout engine. It is a modal <dialog>: the browser holds the focus in it and closes it on Escape.
    openModelSettings: function(group) {
        var dialog = document.getElementById('modelSettings');
        if(!dialog.open)
            dialog.showModal();
        Actions.stopKeyboardEvents(); // the keys of the modeler must not act on what is typed in the fields
        document.getElementById('settingsSearch').value = '';
        Actions.filterSettings('');
        Actions.showSettingsGroup(typeof group === 'string' ? group : 'target');
    },
    closeModelSettings: function() {
        var dialog = document.getElementById('modelSettings');
        if(dialog.open)
            dialog.close();
        // the keys of the modeler act again as soon as the pointer is over a construct (EventHandler.beginInteraction)
    },
    showSettingsGroup: function(group) {
        var section = document.getElementById('settings-' + group);
        if(!section)
            return;
        var groups = document.querySelector('#modelSettings .groups');
        groups.scrollTop = section.offsetTop;
        Array.prototype.forEach.call(document.querySelectorAll('#modelSettings nav button'), function(button) {
            var current = button.getAttribute('data-args') === JSON.stringify([group]);
            if(current) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });
    },
    // only the settings that match what is typed are shown (what they are called, what they say, their value), and only the
    // groups that have any
    filterSettings: function(text) {
        var words = text.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
        Array.prototype.forEach.call(document.querySelectorAll('#modelSettings section.group'), function(section) {
            var any = 0;
            Array.prototype.forEach.call(section.querySelectorAll('li'), function(item) {
                var haystack = (item.textContent + ' ' + item.id).toLowerCase();
                var matches = words.every(function(word) { return haystack.indexOf(word) >= 0; });
                item.classList.toggle('filtered', !matches);
                if(matches) any++;
            });
            section.classList.toggle('filtered', any === 0);
            shown += any;
        });
        document.getElementById('settingsNone').hidden = shown > 0;
    },
    generateSQL: function() {
        Actions.sql().then(sql => {
            new CodePopover(Actions.preformat(sql), true, { file: Actions.modelFileName() + '.sql', type: 'text/plain' })
        }, error => {
            console.error(error);
            alert('The SQL could not be generated: ' + (error && error.message || error));
        });
    },
    // The SQL for the selected target database and temporalization, rendered from JSON bindings.
    sql: async function() {
        var directive = await Actions.getDirectives();
        var entries = Actions.directiveEntries(directive);
        var templates = entries.filter(entry => /\.sisula$/.test(entry));
        var legacy = entries.filter(entry => /\.js$/.test(entry) && !/(^|\/)(Helpers|NamingConvention|derive)\.js$/.test(entry));
        if(legacy.length)
            throw new Error('Legacy JavaScript sisulets are no longer supported: ' + legacy.join(', '));
        if(templates.length === 0)
            throw new Error('The directive does not list any Sisula templates.');
        var bindings = await Actions.bindings();
        var sql = '';
        for(var i = 0; i < templates.length; i++) {
            var template = (await Actions.getDirectives(templates[i])).replace(/\r/g, '');
            try {
                sql += sisulate(template, bindings);
            } catch(e) {
                e.message = templates[i] + ': ' + e.message;
                throw e;
            }
        }
        return sql;
    },
    // The lines of a directive that are scripts: not empty, not comments, trimmed.
    directiveEntries: function(directive) {
        var lines = directive.replace(/\r/g, '').match(/^[^#].+/gm) || [];
        return lines.map(line => line.trim());
    },
    generateXML: function() {
        Actions.transform(Model.toXML(false), 'xml2html.xsl', document)
        .then(fragment => {
            new CodePopover(fragment, false, { file: Actions.modelFileName() + '.xml', type: 'application/xml' });
        });
    },
    // the model as a document for those who know the business (see app/Documentation.js)
    generateHTML: function() {
        Documentation.show();
    },
    // The input of the Sisula templates for the selected target database and temporalization:
    // the model as the generators see it (Helpers.js and the naming conventions applied, plus
    // the target's derive.js if it has one), flattened to plain JSON by modules/Resolver.js.
    bindings: async function() {
        var database = Defaults.databaseTarget;
        var temporalization = Defaults.temporalization;
        var schema = Objectifier.objectify(Model.toXML(true), MAP)[MAP.root];
        // the directive starts with the scripts that prepare the schema (Helpers.js, the naming
        // conventions, and derive.js if the target has one); they are run in its order
        var entries = Actions.directiveEntries(await Actions.getDirectives());
        var scripts = [];
        for(var i = 0; i < entries.length; i++) {
            if(/(^|\/)(Helpers|NamingConvention|derive)\.js$/.test(entries[i]))
                scripts.push(await Actions.getDirectives(entries[i]));
        }
        return JSON.stringify({
            bindingsVersion: 1,
            database: database,
            temporalization: temporalization,
            schema: Resolver.resolve(schema, scripts)
        }, null, 2);
    },
    // Checks the key routes of the model with the rules that the generators follow (naturalKeys() in
    // SQL/Helpers.js), after the naming conventions that name what it reads, and logs a route that the
    // generators leave out, with the reason, and a step that is not functional, as the integrity check logs.
    checkKeys: async function() {
        var schema = Objectifier.objectify(Model.toXML(true), MAP)[MAP.root];
        var scripts = [
            await Actions.getDirectives('SQL/Helpers.js'),
            await Actions.getDirectives('SQL/NamingConvention.js'),
            'schema.keyCheck = naturalKeys();'
        ];
        var keys = Resolver.resolve(schema, scripts).keyCheck || [];
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i], where = '[Keys] ' + key.route + ' key of ' + key.entityName + ': ';
            if(!key.usable)
                console.warn(where + key.problem + '; it is left out of the generated SQL');
            for(var j = 0; j < key.notes.length; j++)
                console.info(where + key.notes[j].text);
        }
        return keys;
    },
    // With the original naming the knot value of a knotted attribute is named after the knot alone in the
    // perspectives, so two attributes of an anchor or a nexus on the same knot give a view two columns of one
    // name, which no database takes (docs/ANCHOR.md, "Generated objects and naming"). Logs where that happens.
    checkNaming: function() {
        var schema = Objectifier.objectify(Model.toXML(true), MAP)[MAP.root];
        if(!schema.metadata || schema.metadata.naming !== 'original') return;
        var owners = [];
        (schema.anchors || []).forEach(function(mnemonic) { owners.push(schema.anchor[mnemonic]); });
        (schema.nexuses || []).forEach(function(mnemonic) { owners.push(schema.nexus[mnemonic]); });
        owners.forEach(function(owner) {
            var byKnot = Object.create(null);
            (owner.attributes || []).forEach(function(mnemonic) {
                var attribute = owner.attribute[mnemonic];
                if(attribute && attribute.knotRange) (byKnot[attribute.knotRange] = byKnot[attribute.knotRange] || []).push(mnemonic);
            });
            for(var knot in byKnot) {
                if(byKnot[knot].length > 1)
                    console.warn('[Naming] ' + owner.mnemonic + ': the attributes ' + byKnot[knot].join(', ') + ' are all knotted to ' + knot +
                        ', so with the original naming their knot values get the same column name in the perspectives, which the database' +
                        ' refuses; use the improved naming, or a knot for each of them');
            }
        });
    },
    generateBindings: function() {
        Actions.bindings().then(json => {
            new CodePopover(Actions.preformat(json), true, { file: Actions.modelFileName() + '.json', type: 'application/json' })
        });
    },
    // creates a preformatted document fragment from the given text
    preformat: function(text) {
        var fragment = document.createDocumentFragment();
        var pre = document.createElement('pre');
        pre.appendChild(document.createTextNode(text));
        fragment.appendChild(pre);
        return fragment;
    }
};
