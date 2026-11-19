// DrawingEngine: the animation loop that lays out and draws the model.
"use strict";

var DrawingEngine = {
    // holds the "thread" id when the drawing engine is running
    drawId: null,
    initialized: false,
    running: false,
    miniCounter: 0,
    miniature: null,
    showNames: true,
    showKeys: true,
    coloring: true,
    newState: true,
    // set by undo and redo, until the layout has settled
    restoring: false,
    miniatureFramesBetweenRefresh: 50,
    layout: false,
    viewport: null,
    screenCircumference: 0,
    partitionElements: [],
    init: function() {
        var requestAnimationFrame =
                window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
        if(!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, image) {
                return setTimeout(callback, 10);
            };
        }
        var cancelRequestAnimationFrame =
                window.cancelRequestAnimationFrame ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame ||
                window.msCancelRequestAnimationFrame ||
                window.oCancelRequestAnimationFrame;
        window.cancelRequestAnimationFrame = cancelRequestAnimationFrame;
        if(!window.cancelRequestAnimationFrame) {
            window.cancelRequestAnimationFrame = function(id) {
                return clearTimeout(id);
            };
        }
        this.viewport = document.createElementNS(SVGNS, 'rect');
        this.viewport.setAttributeNS(null, 'id', 'viewport');
        this.viewport.setAttributeNS(null, 'x', SVG.viewBox.baseVal.x);
        this.viewport.setAttributeNS(null, 'y', SVG.viewBox.baseVal.y);
        this.viewport.setAttributeNS(null, 'width', SVG.viewBox.baseVal.width);
        this.viewport.setAttributeNS(null, 'height', SVG.viewBox.baseVal.height);
        this.viewport.setAttributeNS(null, 'style', 'stroke: red; stroke-width: 1px; fill: none; vector-effect: non-scaling-stroke;');
        this.initialized = true;
    },
    taint: function() {
        this.partitionElements = [];
    },
    storeSettings: function(storage) {
        storage.setItem("viewportX", SVG.viewBox.baseVal.x);
        storage.setItem("viewportY", SVG.viewBox.baseVal.y);
        storage.setItem("viewportWidth", SVG.viewBox.baseVal.width);
        storage.setItem("viewportHeight", SVG.viewBox.baseVal.height);
    },
    loadSettings: function(storage) {
        SVG.viewBox.baseVal.x = 1 * storage.getItem("viewportX") || 0;
        SVG.viewBox.baseVal.y = 1 * storage.getItem("viewportY") || 0;
        SVG.viewBox.baseVal.width = 1 * storage.getItem("viewportWidth") || window.innerWidth;
        SVG.viewBox.baseVal.height = 1 * storage.getItem("viewportHeight") || window.innerHeight;
        this.invalidateMiniature();
        this.start(false);
    },
    setCursor: function(cursor) {
        document.body.style.cursor = cursor;
    },
    start: function(layoutModel) {
        if(this.initialized) {
            this.layout = layoutModel;
            if(!this.running) {
                this.running = true;
                this.drawId = window.requestAnimationFrame(DrawingEngine.engine, SVG);
                if(this.layout)
                    ControlButtons.setPauseState();
            }
        }
    },
    stop: function() {
        if(this.running) {
            window.cancelRequestAnimationFrame(this.drawId);
            this.running = false;
            ControlButtons.setPlayState();
        }
    },
    engine: function() {
        // layout nodes
        if(DrawingEngine.layout || !LayoutEngine.equilibrium) {
            LayoutEngine.layout(Model.visibleNodes);
            DrawingEngine.newState = true;
        }
        DrawingEngine.draw();
        // check if all nodes have stopped moving and that we may stop
        if(LayoutEngine.equilibrium) {
            DrawingEngine.stop();
            DrawingEngine.invalidateMiniature();
            if(DrawingEngine.newState) {
                DrawingEngine.newState = false;
                // the layout that settles after an undo or a redo is not a change: recording it would replace the
                // newest state and end what could be redone
                if(!DrawingEngine.restoring)
                    Model.recordState();
            }
            DrawingEngine.restoring = false;
            DrawingEngine.layout = false;
            ControlButtons.setPlayState();
        }
        else if(DrawingEngine.running) {
            window.requestAnimationFrame(DrawingEngine.engine, SVG);
        }
    },
    invalidateMiniature: function() {
        this.miniCounter = 0;
    },
    drawPartitions: function() {
        var partition, partitionElement, centerElement, k, key;
        var keys = Object.keys(LayoutEngine.partitions);
        var lost = this.partitionElements.filter(function(i) {return !(keys.indexOf(i) > -1);});
        k = lost.length;
        while(k--) {
            key = lost[k];
            partitionElement = document.getElementById(key);
            SVGLayer.debugPartitions.removeChild(partitionElement);
            this.partitionElements.splice(this.partitionElements.indexOf(key),1);
            centerElement = document.getElementById('c' + key);
            SVGLayer.debugPartitions.removeChild(centerElement);
        }
        k = keys.length;
        while(k--) {
            key = keys[k];
            partition = LayoutEngine.partitions[key];
            partitionElement = document.getElementById(key);
            centerElement = document.getElementById('c' + key);
            if(!partitionElement) {
                partitionElement = document.createElementNS(SVGNS, 'rect');
                partitionElement.setAttributeNS(null, 'id', key);
                SVGLayer.debugPartitions.appendChild(partitionElement);
                this.partitionElements.push(key);
                centerElement = document.createElementNS(SVGNS, 'circle');
                centerElement.setAttributeNS(null, 'id', 'c' + key);
                centerElement.style.strokeWidth = 2;
                SVGLayer.debugPartitions.appendChild(centerElement);
            }
            partitionElement.x.baseVal.value = partition.xMin;
            partitionElement.y.baseVal.value = partition.yMin;
            partitionElement.width.baseVal.value = partition.xMax - partition.xMin;
            partitionElement.height.baseVal.value = partition.yMax - partition.yMin;
            centerElement.cx.baseVal.value = partition.xPosition;
            centerElement.cy.baseVal.value = partition.yPosition;
            centerElement.r.baseVal.value = 100*(Math.abs(partition.xVelocity) + Math.abs(partition.yVelocity));
        }
    },
    // WIP: keys draw
    drawRoutes: function() {
        var route;
        for(var hash in Model.routes) {  
            route = Model.routes[hash];
            // create some utility functions on the route
            if(!route.toggleHighlight) {
                route.hightlighted = false;
                route.toggleHighlight = function() {
                    if(this.svgKeyRoute) {
                        var hash = this.svgKeyRoute.getAttribute('id');
                        if(!this.hightlighted) {
                            this.svgKeyRoute.setAttributeNS(null, 'class', 'routeSelected'); 
                            if(!this.svgKeyRouteText) {
                                this.svgKeyRouteText = document.createElementNS(SVGNS, 'text');
                                this.svgKeyRouteText.setAttributeNS(null, 'class', 'routeText');
                                this.svgKeyRouteText.textPath = document.createElementNS(SVGNS, 'textPath');
                                this.svgKeyRouteText.text = document.createTextNode(this.name);
                                this.svgKeyRouteText.textPath.appendChild(this.svgKeyRouteText.text);
                                this.svgKeyRouteText.textPath.setAttributeNS(null, 'href', '#' + hash);
                                this.svgKeyRouteText.textPath.setAttributeNS(null, 'startOffset', '17');
                                this.svgKeyRouteText.appendChild(this.svgKeyRouteText.textPath);
                                SVGLayer.keys.appendChild(this.svgKeyRouteText);
                            }
                            // Delay creating input until explicit selection (click)
                            for(var stopNumber in this.stops) 
                                this.stops[stopNumber].component.postfixes.push(stopNumber);
                            this.hightlighted = true;
                            DrawingEngine.start(false);
                        }   
                        else {
                            if(this.svgKeyRouteText) {
                                if(SVGLayer.keys.contains(this.svgKeyRouteText))
                                    SVGLayer.keys.removeChild(this.svgKeyRouteText);
                                delete this.svgKeyRouteText;
                            }
                            if(this.routeInput) {
                                if(this._routeResizeHandler) {
                                    window.removeEventListener('resize', this._routeResizeHandler, false);
                                    delete this._routeResizeHandler;
                                }
                                if(document.body.contains(this.routeInput))
                                    document.body.removeChild(this.routeInput);
                                delete this.routeInput;
                            }
                            for(var stopNumber in this.stops) 
                                this.stops[stopNumber].component.postfixes = [];
                            this.svgKeyRoute.setAttributeNS(null, 'class', 'route'); 
                            this.hightlighted = false;
                            DrawingEngine.start(false);
                        }                         
                    }
                }
            }
            // Lazy input creation helper
            if(!route.ensureRouteInput) {
                route.ensureRouteInput = function() {
                    if(this.routeInput || !this.hightlighted) return;
                    var selfRoute = this;
                    this.routeInput = document.createElement('input');
                    this.routeInput.setAttribute('id', 'route');
                    this.routeInput.placeholder = 'Route name';
                    this.routeInput.value = this.name;
                    function computeComponentScreenPosition(component) {
                        if(!component) return {x:window.scrollX + window.innerWidth/2, y:window.scrollY + window.innerHeight/2};
                        var node = component.node ? component.node : component;
                        if(typeof node.xPosition !== 'number' || typeof node.yPosition !== 'number') return {x:window.scrollX + window.innerWidth/2, y:window.scrollY + window.innerHeight/2};
                        var vb = SVG.viewBox.baseVal;
                        var svgRect = SVG.getBoundingClientRect();
                        var scaleX = svgRect.width / vb.width;
                        var scaleY = svgRect.height / vb.height;
                        return { x: svgRect.left + (node.xPosition - vb.x) * scaleX + window.scrollX, y: svgRect.top + (node.yPosition - vb.y) * scaleY + window.scrollY };
                    }
                    try {
                        var comp = this.start ? (this.start.component ? this.start.component : this.start) : null;
                        var center = computeComponentScreenPosition(comp);
                        var provisionalWidth = Math.max(120, this.name.length * 9 + 30);
                        var input = this.routeInput;
                        input.style.position = 'absolute';
                        input.style.width = provisionalWidth + 'px';
                        input.style.zIndex = 10000;
                        input.style.boxSizing = 'border-box';
                        input.style.padding = '2px 6px';
                        input.style.fontSize = '12px';
                        input.style.lineHeight = '1.2';
                        input.style.right = 'auto';
                        input.style.bottom = 'auto';
                        document.body.appendChild(input);
                        var h = input.offsetHeight || 22;
                        var top = center.y - h - 8;
                        if(top < window.scrollY + 4) top = center.y + 8;
                        var left = center.x - provisionalWidth/2;
                        this._routeInputStatic = { left:left, top:top, width:provisionalWidth };
                        input.style.left = left + 'px';
                        input.style.top = top + 'px';
                    } catch(e) {
                        var input = this.routeInput;
                        if(!document.body.contains(input)) document.body.appendChild(input);
                        var vw = window.innerWidth, vh = window.innerHeight;
                        input.style.position = 'absolute';
                        input.style.left = (window.scrollX + vw/2 - 100) + 'px';
                        input.style.top = (window.scrollY + vh/2 - 15) + 'px';
                        input.style.width = '200px';
                        this._routeInputStatic = { left:window.scrollX + vw/2 - 100, top:window.scrollY + vh/2 - 15, width:200 };
                    }
                    this.routeInput.addEventListener('input', function(e) {
                        var route = EventHandler.routeSelected();
                        if(!route) return;
                        var raw = e.target.value;
                        var trimmed = raw.trim();
                        if(trimmed.length) {
                            Model.changeRouteName(route, trimmed);
                            var hash = (route.start.mnemonic + '|' + route.name).trim();
                            route.svgKeyRoute.setAttributeNS(null, 'id', hash);
                            route.svgKeyRouteText.textPath.setAttributeNS(null, 'href', '#' + hash);
                            route.svgKeyRouteText.text.nodeValue = raw;
                        } else {
                            route.svgKeyRouteText.text.nodeValue = ' ';
                        }
                    }, false);
                    // Handle Enter (commit & close) and Escape (cancel close without change)
                    this.routeInput.addEventListener('keydown', function(e){
                        var route = EventHandler.routeSelected();
                        if(!route) return;
                        if(e.key === 'Enter') {
                            // Commit already applied via input handler; just close & deselect
                            e.preventDefault();
                            // simulate deselect: toggle highlight off and clear selection
                            if(route.hightlighted) route.toggleHighlight();
                            EventHandler.clearSelection();
                        } else if(e.key === 'Escape') {
                            e.preventDefault();
                            // Revert visual label if emptied but not committed (trim again)
                            if(!route.name || !route.name.trim()) {
                                route.svgKeyRouteText.text.nodeValue = route.name ? route.name : ' ';
                            }
                            if(route.hightlighted) route.toggleHighlight();
                            EventHandler.clearSelection();
                        }
                    }, false);
                    this._routeResizeHandler = function(){
                        if(!(selfRoute && selfRoute.routeInput)) return;
                        try {
                            var comp = selfRoute.start ? (selfRoute.start.component ? selfRoute.start.component : selfRoute.start) : null;
                            var center = computeComponentScreenPosition(comp);
                            var h = selfRoute.routeInput.offsetHeight || 22;
                            var top = center.y - h - 8;
                            if(top < window.scrollY + 4) top = center.y + 8;
                            var left = center.x - selfRoute._routeInputStatic.width/2;
                            selfRoute._routeInputStatic.left = left;
                            selfRoute._routeInputStatic.top = top;
                            selfRoute.routeInput.style.left = left + 'px';
                            selfRoute.routeInput.style.top = top + 'px';
                        } catch(e) {}
                    };
                    window.addEventListener('resize', this._routeResizeHandler, false);
                    try { this.routeInput.focus(); this.routeInput.select(); } catch(e) {}
                };
            }
            if(!route.remove) {
                route.remove = function() {
                    if(this.hightlighted)
                        this.toggleHighlight();
                    if(this.routeInput) {
                        if(this._routeResizeHandler) {
                            window.removeEventListener('resize', this._routeResizeHandler, false);
                            delete this._routeResizeHandler;
                        }
                        if(document.body.contains(this.routeInput))
                            document.body.removeChild(this.routeInput);
                        delete this.routeInput;
                    }
                    if(this.svgKeyRouteText) {
                        if(SVGLayer.keys.contains(this.svgKeyRouteText))
                            SVGLayer.keys.removeChild(this.svgKeyRouteText);
                        delete this.svgKeyRouteText;
                    }
                    if(this.svgKeyRoute) {
                        if(SVGLayer.keys.contains(this.svgKeyRoute))
                            SVGLayer.keys.removeChild(this.svgKeyRoute);
                        delete this.svgKeyRoute;
                    }
                    var hash = this.start.mnemonic + '|' + this.name;
                    delete Model.routes[hash];                            
                }
            }
            // this is the actual svg element
            if(!route.svgKeyRoute) {
                route.svgKeyRoute = document.createElementNS(SVGNS, 'path');
                route.svgKeyRoute.component = route; // for use in captured events
                route.svgKeyRoute.setAttributeNS(null, 'id', hash);
                route.svgKeyRoute.setAttributeNS(null, 'class', 'route');
                route.svgKeyRoute.addEventListener('mouseover', function(e) { 
                    if(!EventHandler.routeSelected() && !this.component.hightlighted) 
                        this.component.toggleHighlight();
                }, false);
                route.svgKeyRoute.addEventListener('mouseout', function(e) { 
                    if(!EventHandler.routeSelected() && this.component.hightlighted) 
                        this.component.toggleHighlight(); 
                }, false);
                route.svgKeyRoute.addEventListener('click', function(e) {
                    EventHandler.clearInteraction(); // remove the click that would otherwise result in panning
                    var hash = this.getAttribute('id');
                    var route = Model.routes[hash];                            
                    if(!EventHandler.routeSelected()) {
                        if(!route.hightlighted) route.toggleHighlight();
                        EventHandler.selectRoute(route);
                        if(route.ensureRouteInput) route.ensureRouteInput();
                    }
                    else if(EventHandler.routeSelected() == route) {
                        // Already selected: maybe deselect on second click
                        if(route.hightlighted) {
                            route.toggleHighlight();
                            EventHandler.clearSelection();
                        }
                    }
                }, false);
                SVGLayer.keys.appendChild(route.svgKeyRoute);
            }
            if(!route.start || !route.start.node) {
                continue; // Skip routes with invalid start components
            }
            var stops = route.start.node.xPosition.toFixed(2) + ',' + route.start.node.yPosition.toFixed(2);
            // Collect and deterministically order stops by branch then numeric stop number
            var orderedStops = Object.keys(route.stops).map(function(k){ return route.stops[k]; });
            orderedStops.sort(function(a,b){
                var ba = parseInt(a.branch || '1'), bb = parseInt(b.branch || '1');
                if(ba !== bb) return ba - bb;
                var sa = parseInt(a.key.stop || '0'), sb = parseInt(b.key.stop || '0');
                return sa - sb;
            });
            var stop, currentBranch; 
            for(var os = 0; os < orderedStops.length; os++) {
                stop = orderedStops[os];
                if(!stop.component || !stop.component.node) continue; // Skip invalid
                if(stop.branch != currentBranch) {
                    stops += ' M' + route.start.node.xPosition.toFixed(2) + ',' + route.start.node.yPosition.toFixed(2);
                    currentBranch = stop.branch;
                }
                stops += ' ' + stop.component.node.xPosition.toFixed(2) + ',' + stop.component.node.yPosition.toFixed(2);
            }
            route.svgKeyRoute.setAttributeNS(null, 'd', 'M' + stops);
        }
    },
    draw: function() {
        if(DEBUG)
            this.drawPartitions();
        if(this.showKeys)
            this.drawRoutes();
        // draw the miniature every minirate frames
        this.miniCounter = (this.miniCounter + 1) % this.miniatureFramesBetweenRefresh;
        var component, node;
        var i = Model.components.length;
        while(i--) {
            component = Model.components[i];
            node = component.node;
            if(node.visible) {
                if(node.moving || node.type === NodeType.EDGE)
                    component.draw(component.svg);
                if(DEBUG)
                    component.drawForce(component.svg);
                if(this.miniCounter === 1)
                    component.draw(component.nav);
                if(this.showNames)
                    component.drawName(node.xPosition, node.yPosition);
            }
        }
        if(this.miniCounter === 1)
            this.updateMiniature();
    },
    updateMiniature: function() {
        if(!NAVLayer.viewport.contains(this.viewport))
            NAVLayer.viewport.appendChild(this.viewport);
        this.viewport.x.baseVal.value = SVG.viewBox.baseVal.x;
        this.viewport.y.baseVal.value = SVG.viewBox.baseVal.y;
        this.viewport.width.baseVal.value = SVG.viewBox.baseVal.width || window.innerWidth;
        this.viewport.height.baseVal.value = SVG.viewBox.baseVal.height || window.innerHeight;
        var nodeBox = NAV.getElementById('nodes').getBBox();
        var pad = 50;
        var width = nodeBox.width + 2 * pad;
        var height = nodeBox.height + 2 * pad;
        var screenCircumference = window.innerWidth + window.innerHeight;
        var viewportCircumference = width + height;
        var scale;
        if(viewportCircumference < screenCircumference/6) {
            scale = screenCircumference/6/viewportCircumference;
            width *= scale;
            height *= scale;
        }
        else if(viewportCircumference > screenCircumference/4) {
            scale = screenCircumference/4/viewportCircumference;
            height *= scale;
            width *= scale;
        }
        NAV.width.baseVal.value = width;
        NAV.height.baseVal.value = height;
        NAV.viewBox.baseVal.x = nodeBox.x - pad;
        NAV.viewBox.baseVal.y = nodeBox.y - pad;
        NAV.viewBox.baseVal.width = nodeBox.width + 2 * pad;
        NAV.viewBox.baseVal.height = nodeBox.height + 2 * pad;
    }
};
