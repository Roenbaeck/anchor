// Model: the model: its constructs, the XML in and out, the history for undo and redo.
import { DEBUG, NAVLayer, SVGLayer, VERSION } from './config.js';
import { DrawingEngine } from './DrawingEngine.js';
import { UniqueIdentity } from './UniqueIdentity.js';
import { EventHandler } from './EventHandler.js';
import { Attribute } from './Attribute.js';
import { Identifier } from './Identifier.js';
import { Anchor } from './Anchor.js';
import { Knot } from './Knot.js';
import { Tie } from './Tie.js';
import { Nexus } from './Nexus.js';
import { Role } from './Role.js';
import { Actions } from './Actions.js';
import { Features } from './Features.js';
import { Settings } from './Settings.js';
export var Model = {
    // where the model came from (a gist, for example): shown in the status line and used as the file name
    name: null,
    id: null,
    description:null,
    // other members
    components: [],
    visibleNodes: [],
    idToComponent: {},
    version: -1,
    versions: [],
    // WIP: keys model
    routes: {},
    interactive: false,
    // in interactive mode keys are added on the fly, in non-interactive mode they need to be prepared
    setInteractive: function(interactive) {
        this.interactive = interactive || false;
    },
    prepareKeys: function() {
        var component; 
        for(var i = 0; i < this.components.length; i++) {
            component = this.components[i];
            if(component.keys && component.keys.length > 0) {
                for(var j = 0; j < component.keys.length; j++)
                    this.addKey(component, component.keys[j]);
            }
        }                
    },
    addKey: function(component, key) {
        var hash = key.of + '|' + key.route; // ugly concat, but that's life
        var anchorLookup = this.getLookup('entity');
        if(!this.routes[hash]) {
            this.routes[hash] = {
                name: key.route,
                start: anchorLookup[key.of],
                stops: {}
            };
        }
        this.routes[hash].stops[key.stop] = {
            component: component, 
            branch: key.branch, // the branch this stop belongs to
            key: key // this is the key as represented in the component
        };
    },
    changeRouteName: function(route, name) {
        var oldHash = route.start.mnemonic + '|' + route.name;
        if(this.routes[oldHash]) 
            delete this.routes[oldHash];
        route.name = name;
        var newHash = route.start.mnemonic + '|' + route.name;
        this.routes[newHash] = route;
        for(var stopNumber in route.stops) {
            var stop = route.stops[stopNumber];
            stop.key.route = name;
        }
    },
    // Generic lookup infrastructure
    _lookups: null,
    _lookupsDirty: true,
    rebuildLookups: function() {
        var lookups = {
            anchor: Object.create(null),
            nexus: Object.create(null),
            knot: Object.create(null),
            attribute: Object.create(null),
            tie: Object.create(null),
            entity: Object.create(null) // merged anchor + nexus
        };
        for(var i = 0; i < this.components.length; i++) {
            var c = this.components[i];
            if(c instanceof Anchor) {
                lookups.anchor[c.mnemonic] = c;
                lookups.entity[c.mnemonic] = c;
            }
            else if(c instanceof Nexus) {
                lookups.nexus[c.mnemonic] = c;
                // treat nexus as entity
                lookups.entity[c.mnemonic] = c;
            }
            else if(c instanceof Knot) {
                lookups.knot[c.mnemonic] = c;
            }
            else if(c instanceof Attribute) {
                lookups.attribute[c.mnemonic] = c;
            }
            else if(c instanceof Tie) {
                // Ties may not need mnemonic uniqueness like anchors, but keep reference
                lookups.tie[c.id] = c;
            }
        }
        this._lookups = lookups;
        this._lookupsDirty = false;
    },
    markLookupsDirty: function() {
        this._lookupsDirty = true;
    },
    getLookup: function(kind) {
        kind = kind || 'entity';
        if(this._lookupsDirty || !this._lookups) this.rebuildLookups();
        return this._lookups[kind] || Object.create(null);
    },
    nodeToComponent: function(node) {
        return this.idToComponent[node.id];
    },
    forgetOrigin: function() {
        this.name = null;
        this.id = null;
        this.description = null;
    },
    isEmpty: function() {
        return this.components.length === 0;
    },
    empty: function() {
        this.components = [];
        this.visibleNodes = [];
        this.routes = {};
        this.idToComponent = Object.create(null);
        SVGLayer.clearAll();
        NAVLayer.clearAll();
    },
    refresh: function() {
        // create a new visibleNodes
        this.visibleNodes = [];
        var component;
        for(var i = 0; component = this.components[i]; i++) {
            // reset all incompleteness
            component.updateIncompleteness();
            if(component.node.visible)
                this.visibleNodes.push(component.node);
        }
    },
    // Who wants to hear about the model (the history buttons, and later an outline, a problems list and so on) listens with
    // on(type, listener) instead of being called by it. The types:
    //   changed   a change was recorded (the detail holds the version of the history)
    //   history   how many changes can be undone and redone (the detail holds undo and redo)
    //   replaced  the whole model was read again (a file, undo, redo)
    listeners: {},
    on: function(type, listener) {
        (this.listeners[type] = this.listeners[type] || []).push(listener);
    },
    off: function(type, listener) {
        var all = this.listeners[type] || [], at = all.indexOf(listener);
        if(at >= 0) all.splice(at, 1);
    },
    emit: function(type, detail) {
        (this.listeners[type] || []).slice().forEach(function(listener) {
            try { listener(detail); } catch(e) { if(console) console.error('A listener of ' + type + ' failed:', e); }
        });
    },
    historyChanged: function() {
        this.emit('history', { undo: Math.max(0, this.version), redo: Math.max(0, this.versions.length - this.version - 1) });
    },
    // how many changes can be undone; every state is a copy of the whole model, so the history is limited
    maxUndoLevels: 100,
    recordState: function() {
        DrawingEngine.restoring = false;
        this.refresh();
        // only record if there is something to record
        if(this.components.length) {
            this.version++;
            this.versions[this.version] = this.toXML(false);
            // a change made after an undo ends the states that could have been redone
            this.versions.length = this.version + 1;
            // forget the oldest state when the history is full
            if(this.version > this.maxUndoLevels) {
                this.versions.shift();
                this.version--;
            }
            this.historyChanged();
            this.emit('changed', { version: this.version });
        }
    },
    clearStates: function() {
        DrawingEngine.restoring = false;
        this.version = -1;
        this.versions = [];
        this.historyChanged();
    },
    undoState: function() {
        this.version -= (this.version === 0 ? 0 : 1);
        this.fromXML(this.versions[this.version]);
        DrawingEngine.restoring = true;
        DrawingEngine.stop();
        EventHandler.clearSelection();
        this.historyChanged();
    },
    redoState: function() {
        this.version += (this.version === this.versions.length - 1 ? 0 : 1);
        this.fromXML(this.versions[this.version]);
        DrawingEngine.restoring = true;
        DrawingEngine.stop();
        this.historyChanged();
    },
    setupMinimal: function(ask) {
        var go = ask ? confirm("Are you sure you want to clear the current model?\n" +
                               "Any unsaved changes will be lost!") : true;
        if(go) {
            this.forgetOrigin();
            this.empty();
            this.addComponent(new Anchor(window.innerWidth/2, window.innerHeight/2));
            this.refresh();
            EventHandler.clearSelection();
            Actions.setModelStatus();
            Actions.resetZoom();
            Actions.centerModel();
            DrawingEngine.start(false);
        }
    },
    isConforming: function() {
        var i, component;
        for(i = 0; component = Model.components[i]; i++)
            if(!component.isConforming())
                return false;
        return true;
    },
    addComponent: function(component) {
        // add node at the end of the array
        if(component) {
            this.components.push(component);
            this.idToComponent[component.id] = component;
            // component set changed: mark lookups dirty so future getLookup() calls rebuild
            this.markLookupsDirty();
            // WIP: keys
            if(this.interactive && component.keys && component.keys.length > 0) {
                for(var i = 0; i < component.keys.length; i++)
                    this.addKey(component, component.keys[i]);
            }
            // this.sort();
            this.invalidateComponent(component);
            this.refresh();
        }
    },
    removeComponent: function(component) {
        var edge;
        if(component.node.type === NodeType.KNOT) {
            for(var j = 0; edge = component.node.edges[j]; j++) {
                var otherNode = edge.node === this ? edge.otherNode : edge.node;
                if(otherNode.type === NodeType.ATTRIBUTE || otherNode.type === NodeType.TIE) {
                    var otherComponent = this.nodeToComponent(otherNode);
                    otherComponent.setKnotted(false);
                }
            }
        }
        else if (component.node.type === NodeType.EDGE) {
            edge = component.node;
            this.deleteElementFromArray(edge.node.edges, edge);
            this.deleteElementFromArray(edge.otherNode.edges, edge);
        }
        component.hide();
        this.deleteElementFromArray(this.components, component);
        delete this.idToComponent[component.id];
        // component removed: mark lookups dirty
        this.markLookupsDirty();
        this.refresh();
    },
    deleteElementFromArray: function(array, element) {
        array.splice(array.indexOf(element), 1);
    },
    invalidateComponent: function(component) {
        var square = LayoutEngine.createSquare(component.node, LayoutEngine.normalDistance);
        for(var i = 0; i < this.visibleNodes.length; i++)
            if(LayoutEngine.withinSquare(this.visibleNodes[i], square))
                this.visibleNodes[i].start();
    },
    formatDate: function(date, dateOrTime) {
        function z(str) {
            return ('0' + str).substr(-2, 2);
        }
        var theDate = date.getFullYear() + '-' + z(date.getMonth() + 1) + '-' + z(date.getDate());
        var theTime = z(date.getHours()) + ':' + z(date.getMinutes()) + ':' + z(date.getSeconds());
        if(dateOrTime.toLowerCase() === 'd')
            return theDate;
        if(dateOrTime.toLowerCase() === 't')
            return theTime;
        return theDate + ' ' + theTime;
    },
    toXML: function(serialize) {
        // create the xml document (not using a namespace simplifies the transformations)
        var schema = document.implementation.createDocument("", "schema", null);
        var schemaElement = schema.documentElement;
        schemaElement.setAttribute('format', VERSION);
        schemaElement.setAttribute('date', this.formatDate(new Date(), 'd'));
        schemaElement.setAttribute('time', this.formatDate(new Date(), 't'));
        var metadata = schema.createElement('metadata');
        for(var def in Defaults)
            if(Defaults.hasOwnProperty(def) && Defaults[def])
                metadata.setAttribute(def, Defaults[def]);
        schemaElement.appendChild(metadata);
        if(this.description) {
            var description = schema.createElement('description');
            description.textContent = this.description;
            schemaElement.appendChild(description);
        }
        for(var i = 0; i < this.components.length; i++) {
            var componentElement = this.components[i].toXML(schema);
            if(componentElement !== null)
                schemaElement.appendChild(componentElement);
        }
        if(serialize) {
            var serializationElement = schema.createElement('serialization');
            var serialization = schema.createTextNode(new XMLSerializer().serializeToString(schema));
            serializationElement.appendChild(serialization);
            schemaElement.appendChild(serializationElement);
        }
        return schema;
    },
    fromXML: function(xml) {
        if(xml) {
            this.setInteractive(false);
            this.empty();
            var schemaElement = xml.documentElement;
            var metadata = schemaElement.getElementsByTagName('metadata');
            var i, def, val, defaults, listOfChanges = [];
            // a model level description is a direct child of the schema element
            for(i = 0; i < schemaElement.childNodes.length; i++)
                if(schemaElement.childNodes.item(i).nodeName === 'description')
                    this.description = schemaElement.childNodes.item(i).textContent;
            if(metadata && metadata.length > 0) {
                metadata = metadata[0]; // from NodeList to Node
                if(metadata && metadata.hasAttributes && metadata.hasAttributes()) {
                    defaults = metadata.attributes;
                    for(i = 0; i < defaults.length; i++) {
                        def = defaults[i].name;
                        val = defaults[i].value;
                        if(Defaults.hasOwnProperty(def) && Defaults[def] != val)
                            listOfChanges.push(def + ': ' + Defaults[def] + ' -> ' + val);
                    }
                    if(listOfChanges.length > 0) {
                        if(confirm(
                            "The loaded model wants to change these defaults:\n\n" +
                            listOfChanges.join('\n') + '\n\n' +
                            "Would you like to accept these changes?\n" +
                            "Accepting overwrites your current settings!"
                        )) {
                            for(i = 0; i < defaults.length; i++) {
                                def = defaults[i].name;
                                val = defaults[i].value;
                                if(Defaults.hasOwnProperty(def) && Defaults[def] != val)
                                    Defaults[def] = val;
                            }
                            // backwards compatibility
                            switch (Defaults.temporalization) {
                                case "mono":
                                    Defaults.temporalization = "uni";
                                    break;
                                /*
                                case "bi":
                                    Defaults.temporalization = "crt";
                                    break;
                                */
                            }
                            Settings.storeSettings(window.localStorage);
                            Settings.loadSettings(window.localStorage);
                        }
                    }
                }
            }
            // the order in which we add these are important (attributes create edges to anchors)
            var knots = xml.getElementsByTagName('knot');
            for (i = 0; i < knots.length; i++)
                this.addComponent(Knot.prototype.fromXML(knots[i]));
            var anchors = xml.getElementsByTagName('anchor');
            for (i = 0; i < anchors.length; i++)
                this.addComponent(Anchor.prototype.fromXML(anchors[i]));
            var nexus = xml.getElementsByTagName('nexus');
            for (i = 0; i < nexus.length; i++)
                this.addComponent(Nexus.prototype.fromXML(nexus[i]));
            var attributes = xml.getElementsByTagName('attribute');
            for (i = 0; i < attributes.length; i++) {
                // Skip attributes that are children of nexus elements (they're handled by nexus)
                if (attributes[i].parentNode.nodeName !== 'nexus') {
                    this.addComponent(Attribute.prototype.fromXML(attributes[i]));
                }
            }
            var ties = xml.getElementsByTagName('tie');
            for (i = 0; i < ties.length; i++)
                this.addComponent(Tie.prototype.fromXML(ties[i]));
            // keys must be added last since they may provide a path through many of the above
            this.prepareKeys();
            // and after keys, identifiers
                var identifiers = xml.getElementsByTagName('identifier');
                for (i = 0; i < identifiers.length; i++)
                    this.addComponent(Identifier.prototype.fromXML(identifiers[i]));
            // implode nodes
            var component, allComponents = [];
            for(i = 0; component = this.components[i]; i++) {
                if(component.imploded) {
                    component.imploded = false;
                    allComponents.push(component);
                }
            }
            this.explode(allComponents, false);
            this.setInteractive(true);
            this.refresh();
            // Post-load integrity validation (logs orphan identifiers and other anomalies)
            if(console && console.groupCollapsed) console.groupCollapsed('Model integrity check');
            try { this.validateIntegrity(); } catch(e) { if(console) console.warn('Integrity check failed:', e); }
            if(console && console.groupEnd) console.groupEnd();
            // the key routes, with the rules of the generators (it reads their scripts, so it ends later)
            Actions.checkKeys().catch(e => { if(console) console.warn('Key check failed:', e); });
            try { Actions.checkNaming(); } catch(e) { if(console) console.warn('Naming check failed:', e); }
            try { Features.apply(); Features.report(); } catch(e) { if(console) console.warn('Features check failed:', e); }
            if(DEBUG) console.log(this);
            this.emit('replaced');
        }
    },
    validateIntegrity: function() {
        var self = this;
        function issue(level, code, msg, ctx) {
            var line = '[Integrity][' + code + '] ' + msg + (ctx ? ' ' + JSON.stringify(ctx) : '');
            switch(level) {
                case 'error': console.error(line); break;
                case 'warn': console.warn(line); break;
                default: console.info(line); break;
            }
            summary[level]++;
        }
        var summary = { error:0, warn:0, info:0 };
        var mnemonicSeen = Object.create(null);
        // Precompute lookups (fresh)
        var anchorLookup = this.getLookup('anchor');
        var nexusLookup = this.getLookup('nexus');
        var knotLookup = this.getLookup('knot');
        var entityLookup = this.getLookup('entity');
        // 1. Uniqueness & validity of mnemonics for entity/knot
        for(var k in entityLookup) {
            if(mnemonicSeen[k]) issue('error','DUPLICATE_MNEMONIC','Duplicate entity mnemonic', { mnemonic:k });
            mnemonicSeen[k] = true;
        }
        for(var kk in knotLookup) {
            if(mnemonicSeen[kk]) issue('error','DUPLICATE_MNEMONIC','Mnemonic reused between entity and knot', { mnemonic:kk });
            mnemonicSeen[kk] = true;
        }
        // 2. Component specific validations
        for(var i = 0; i < this.components.length; i++) {
            var c = this.components[i];
            // Skip edges (Roles handled separately)
            if(c.node.type === NodeType.EDGE) continue;
            // Attribute: must have parent anchor or nexus edge + route keys sanity
            if(c instanceof Attribute) {
                var parent = null;
                if(c.node && c.node.edges) {
                    for(var ae=0; ae<c.node.edges.length; ae++) {
                        var edgeA = c.node.edges[ae];
                        var otherA = edgeA.otherNode === c.node ? edgeA.node : edgeA.otherNode;
                        if(otherA.type === NodeType.ANCHOR || otherA.type === NodeType.NEXUS) {
                            parent = self.nodeToComponent(otherA);
                            break;
                        }
                    }
                }
                if(!parent) issue('warn','ATTRIBUTE_PARENT','Attribute missing parent entity',{ id:c.id, mnemonic:c.mnemonic });
                // Key references inside attribute
                if(c.keys) {
                    for(var ak=0; ak<c.keys.length; ak++) {
                        var keyRef = c.keys[ak];
                        if(!entityLookup[keyRef.of]) issue('error','KEY_OF_UNKNOWN','Key references unknown entity',{ componentId:c.id, of:keyRef.of });
                        if(!keyRef.route) issue('warn','KEY_ROUTE_EMPTY','Key missing route name',{ componentId:c.id });
                    }
                }
            }
            // Identifier validation (existing rules extended)
            if(c instanceof Identifier) {
                var entityRef = c.entity; // anchor or nexus
                var edgeCount = 0, edgeEntity = null;
                if(c.node && c.node.edges) {
                    for(var e = 0; e < c.node.edges.length; e++) {
                        var edge = c.node.edges[e];
                        var other = edge.otherNode === c.node ? edge.node : edge.otherNode;
                        if(other.type === NodeType.ANCHOR || other.type === NodeType.NEXUS) {
                            edgeEntity = self.nodeToComponent(other);
                            edgeCount++;
                        }
                    }
                }
                if(!entityRef || !edgeEntity || edgeCount !== 1) {
                    issue('warn','IDENTIFIER_ORPHAN','Orphan or malformed Identifier',{ id:c.id, route:(c.route?c.route.name:null), edgeCount:edgeCount, entityRef: entityRef ? entityRef.mnemonic : null, edgeEntity: edgeEntity ? edgeEntity.mnemonic : null });
                }
            }
            // Tie validation
            if(c instanceof Tie) {
                // Roles uniqueness by (mnemonic, roleName)
                var rolePairs = Object.create(null);
                var edges = c.node.edges || [];
                for(var te=0; te<edges.length; te++) {
                    var roleComp = self.nodeToComponent(edges[te]);
                    if(!(roleComp instanceof Role)) continue;
                    var otherNode = edges[te].otherNode === c.node ? edges[te].node : edges[te].otherNode;
                    var otherComp = self.nodeToComponent(otherNode);
                    var key = (otherComp ? otherComp.mnemonic : '?') + '|' + roleComp.role;
                    if(rolePairs[key]) issue('error','TIE_ROLE_DUP','Duplicate role name for same participant',{ tie:c.toString(), role:roleComp.role, participant: otherComp ? otherComp.mnemonic : '?' });
                    rolePairs[key] = true;
                }
            }
        }
        // 3. Role edge reciprocity / identifier constraints
        for(var r=0; r < this.components.length; r++) {
            var rc = this.components[r];
            if(rc instanceof Role) {
                // Ensure its edge exists in both node edge arrays
                var nodeA = rc.node.node; var nodeB = rc.node.otherNode;
                if(nodeA.edges.indexOf(rc.node) < 0 || nodeB.edges.indexOf(rc.node) < 0)
                    issue('error','ROLE_EDGE_RECIPROCITY','Role edge missing in one endpoint list',{ roleId:rc.id });
                // Direct nexus role identifier already forced false earlier; double-check
                var tn = nodeA.type, to = nodeB.type;
                var directNexus = (tn === NodeType.NEXUS && (to === NodeType.ANCHOR || to === NodeType.KNOT)) ||
                                  (to === NodeType.NEXUS && (tn === NodeType.ANCHOR || tn === NodeType.KNOT));
                if(directNexus && rc.identifier) issue('warn','ROLE_DIRECT_NEXUS_IDENTIFIER','Direct nexus role should not be identifier',{ roleId:rc.id });
            }
        }
        if(summary.error === 0 && summary.warn === 0) console.info('[Integrity] All checks passed.');
        else console.info('[Integrity] Summary errors=' + summary.error + ' warnings=' + summary.warn + ' infos=' + summary.info);
    },
    erase: function(components) {
        DrawingEngine.stop();
        var i, j, component, role, node, otherNode, otherComponent, edge, affectedComponents = [];
        for(i = 0; component = components[i]; i++) {
            node = component.node;
            if(node.type === NodeType.EDGE && affectedComponents.indexOf(component) < 0)
                affectedComponents.push(component);
            else if (node.type === NodeType.ANCHOR && affectedComponents.indexOf(component) < 0) {
                affectedComponents.push(component);
                for(j = 0; edge = node.edges[j]; j++) {
                    role = this.nodeToComponent(edge);
                    if(affectedComponents.indexOf(role) < 0)
                        affectedComponents.push(role);
                    otherNode = (node === edge.otherNode ? edge.node : edge.otherNode);
                    otherComponent = this.nodeToComponent(otherNode);
                    if(otherNode.type === NodeType.ATTRIBUTE && affectedComponents.indexOf(otherComponent) < 0)
                        affectedComponents.push(otherComponent);
                }
            }
            else if ((node.type === NodeType.TIE ||
                    node.type === NodeType.ATTRIBUTE ||
                    node.type === NodeType.KNOT) &&
                    affectedComponents.indexOf(component) < 0) {
                affectedComponents.push(component);
                for(j = 0; edge = node.edges[j]; j++) {
                    role = this.nodeToComponent(edge);
                    if(affectedComponents.indexOf(role) < 0)
                        affectedComponents.push(role);
                }
            }
        }
        // check for ties in violation
        for(i = 0; component = this.components[i]; i++) {
            node = component.node;
            if(node.type === NodeType.TIE) {
                var anchors = 0;
                for(j = 0; edge = node.edges[j]; j++) {
                    otherNode = (node === edge.otherNode ? edge.node : edge.otherNode);
                    otherComponent = this.nodeToComponent(otherNode);
                    role = this.nodeToComponent(edge);
                    if(affectedComponents.indexOf(otherComponent) < 0 && affectedComponents.indexOf(role) < 0)
                        if(otherNode.type === NodeType.ANCHOR)
                            anchors++;
                }
                if(anchors < 2 && affectedComponents.indexOf(component) < 0) {
                    affectedComponents.push(component);
                    for(j = 0; edge = node.edges[j]; j++) {
                        role = this.nodeToComponent(edge);
                        if(affectedComponents.indexOf(role) < 0)
                            affectedComponents.push(role);
                    }
                }
            }
        }
        // check for dangling knots
        for(i = 0; component = this.components[i]; i++) {
            node = component.node;
            if(node.type === NodeType.KNOT) {
                var dangling = true;
                for(j = 0; edge = node.edges[j]; j++) {
                    otherNode = (node === edge.otherNode ? edge.node : edge.otherNode);
                    otherComponent = this.nodeToComponent(otherNode);
                    role = this.nodeToComponent(edge);
                    if(affectedComponents.indexOf(otherComponent) < 0 && affectedComponents.indexOf(role) < 0)
                        dangling = false;
                }
                if(dangling && affectedComponents.indexOf(component) < 0) {
                    affectedComponents.push(component);
                    for(j = 0; edge = node.edges[j]; j++) {
                        role = this.nodeToComponent(edge);
                        if(affectedComponents.indexOf(role) < 0)
                            affectedComponents.push(role);
                    }
                }
            }
        }
        // need to remove nodes before edges
        affectedComponents.sort(function(firstComponent, secondComponent) {
            return firstComponent.node.type - secondComponent.node.type;
        });
        if(confirm("Are you sure you want to delete the following\n-------- " +
                affectedComponents.length + " nodes and edges --------\n" + affectedComponents.join('\n'))) {
            for(i = 0; component = affectedComponents[i]; i++)
                this.removeComponent(component);
            EventHandler.clearSelection();
            this.recordState();
            this.refresh();
            DrawingEngine.start(true);
        }
        return true; // close menu
    },
    connect: function(components) {
        var node, anchor, attribute, tie, knot;
        for(var i = 0; i < components.length; i++) {
            node = components[i].node;
            if(node.type === NodeType.ANCHOR)
                anchor = components[i];
            else if(node.type === NodeType.ATTRIBUTE)
                attribute = components[i];
            else if(node.type === NodeType.TIE)
                tie = components[i];
            else if(node.type === NodeType.KNOT)
                knot = components[i];
        }
        if(anchor && tie) {
            this.addComponent(new Role(tie, anchor, false));
        }
        else if (attribute && knot) {
            attribute.setKnotted(true);
            this.addComponent(new Role(attribute, knot, false));
        }
        else if (tie && knot) {
            tie.setKnotted(true);
            this.addComponent(new Role(tie, knot, false));
        }
        this.recordState();
        DrawingEngine.start(true);
        return true; // close menu
    },
    toggleKnotted: function(components) {
        var dx, dy;
        for(var i = 0; i < components.length; i++) {
            var knot, role, edge;
            var component = components[i];
            var node = component.node;
            if(component.getKnotted()) {
                for(var j = 0; edge = node.edges[j]; j++) {
                    if(edge.otherNode.type === NodeType.KNOT) {
                        knot = this.nodeToComponent(edge.otherNode);
                        if(edge.otherNode.edges.length === 1) {
                            if(!confirm("This will also delete the knot: " + knot +
                                    ".\nDo you still want to un-knot the attribute?"))
                                break;
                        }
                        this.removeComponent(knot);
                        role = this.nodeToComponent(edge);
                        this.removeComponent(role);
                        if(knot.dataRange)
                            component.dataRange = knot.dataRange;
                        component.setKnotted(false);
                    }
                }
            }
            else {
                this.lastAngle = (this.lastAngle + 0.5) % 14;
                dx = 2 * LayoutEngine.normalDistance * Math.cos(this.lastAngle);
                dy = 2 * LayoutEngine.normalDistance * Math.sin(this.lastAngle);
                knot = new Knot(node.xPosition + dx, node.yPosition + dy);
                if(component.dataRange)
                    knot.dataRange = component.dataRange;
                this.addComponent(knot);
                this.addComponent(new Role(component, knot, true));
                component.setKnotted(true);
            }
        }
        this.recordState();
        this.refresh();
        DrawingEngine.start(true);
        return true; // close menu
    },
    toggleHistorized: function(components) {
        var component, node;
        for(var i = 0; i < components.length; i++) {
            component = components[i];
            component.setHistorized(!component.getHistorized());
            node = component.node;
            if(node.type === NodeType.TIE)
                component.checkIdentifiers();
        }
        this.recordState();
        DrawingEngine.start(false);
        return true; // close menu
    },
    // keys operations: a route starts at the anchor or nexus in the selection, and the other selected items are
    // its stops, in the order they were selected (naturalKeys() in SQL/Helpers.js has the rules they follow)
    createKey: function(components) {
        var i, id, anchor, component, stopComponents = [];
        for(i = 0; component = components[i]; i++) {
            if(component.node.type === NodeType.ANCHOR || component.node.type === NodeType.NEXUS)
                anchor = component;
            else
                stopComponents.push(component);
        }
        if(!anchor)
            return true; // nothing to start the route at
        if(stopComponents.length > 0)
            id = UniqueIdentity.nextId();
        for(i = 0; component = stopComponents[i]; i++) {
            var stopNumber = (i + 1).toString();
            var key = {
                id: id,
                stop: stopNumber,
                route: '?Route ' + id + '?',
                of: anchor.mnemonic, 
                branch: 1 // creation always leads to the first branch
            };
            component.keys.push(key);
            this.addKey(component, key);
        }
        this.recordState();
        EventHandler.clearSelection();
        DrawingEngine.start(false);
        return true; // close menu
    },
    addToKey: function(components) {
        var i, route = EventHandler.selectedRoute;
        if(route) {
            var component, anchor, stopComponents = [];
            for(i = 0; component = components[i]; i++) {
                if(component.node.type === NodeType.ANCHOR || component.node.type === NodeType.NEXUS)
                    anchor = component;
                else
                    stopComponents.push(component);
            }
            var stop, maxStopNumber = 0, maxBranchNumber = 0;
            for(i = 0; i < stopComponents.length; i++) {
                component = stopComponents[i];
                for(var stopNumber in route.stops) {
                    stop = route.stops[stopNumber];
                    if(parseInt(stopNumber) > maxStopNumber)
                        maxStopNumber = parseInt(stopNumber);
                    if(parseInt(stop.branch) > maxBranchNumber) 
                        maxBranchNumber = parseInt(stop.branch);
                }
            }
            var actualBranchNumber = maxBranchNumber;
            if(anchor) // start a new branch if an anchor or a nexus was in the selection
                actualBranchNumber = maxBranchNumber + 1;
            for(i = 0; i < stopComponents.length; i++) {
                component = stopComponents[i];
                // last stop cannot be the same stop
                if(route.stops[maxStopNumber.toString()].component !== component) {
                    maxStopNumber++;
                    var key = {
                        stop: maxStopNumber.toString(),
                        route: route.name,
                        of: route.start.mnemonic,
                        branch: actualBranchNumber.toString()
                    };
                    component.keys.push(key);
                    component.postfixes.push(key.stop);
                    route.stops[maxStopNumber] = {
                        component: component,
                        branch: key.branch, 
                        key: key // this is the key as represented in the component
                    }
                }
            }
            this.recordState();
            EventHandler.clearSelection();
            DrawingEngine.start(false);
        }
        return true; // close menu
    },         
    removeFromKey: function(components) {
        var route = EventHandler.selectedRoute;
        if(route) {
            var component, deletesHaveBeenMade = false, maxStopNumber = 0;
            for(var i = 0; i < components.length; i++) {
                component = components[i];
                for(var stopNumber in route.stops) {
                    if(parseInt(stopNumber) > maxStopNumber)
                        maxStopNumber = parseInt(stopNumber);
                    if(route.stops[stopNumber].component == component) {
                        var keyIndex = component.keys.indexOf(route.stops[stopNumber].key);
                        component.keys.splice(keyIndex, 1);
                        delete route.stops[stopNumber];
                        deletesHaveBeenMade = true;
                    }
                }
            }
            // renumbering of stops
            if(deletesHaveBeenMade) {
                var stops = [];
                for(var stopNumber = 1; stopNumber <= maxStopNumber; stopNumber++) {
                    if(route.stops[stopNumber]) 
                        stops.push(route.stops[stopNumber]);
                }
                if(stops.length > 0) {
                    route.stops = {};
                    for(var s = 0; s < stops.length; s++) {
                        var newStopNumber = (s + 1).toString();
                        stops[s].key.stop = newStopNumber;
                        route.stops[newStopNumber] = stops[s];
                    }
                }
                // we removed the last stop of the route
                else {
                    route.remove();
                    var hash = route.start.mnemonic + '|' + route.name;
                    delete Model.routes[hash];
                }
                // the numbers on the drawing: none on what was removed, and the new numbers of the stops that
                // are left while the route is highlighted
                for(i = 0; i < components.length; i++)
                    components[i].postfixes = [];
                for(var shown in route.stops)
                    route.stops[shown].component.postfixes = [];
                if(route.hightlighted)
                    for(var shown in route.stops)
                        route.stops[shown].component.postfixes.push(shown);
            }
            this.recordState();
            EventHandler.clearSelection();
            DrawingEngine.start(false);                    
        }                
        return true; // close menu
    },   
    toggleIdentifier: function(components) {
        var ties = [], component, node, edge;
        for(var i = 0; i < components.length; i++) {
            component = components[i];
            node = component.node;
            if(node.type === NodeType.EDGE) {
                edge = node;
                component.setIdentifier(!component.identifier);
                if(edge.node.type === NodeType.TIE && ties.indexOf(edge.node) < 0)
                    ties.push(this.nodeToComponent(edge.node));
                if(edge.otherNode.type === NodeType.TIE && ties.indexOf(edge.otherNode) < 0)
                    ties.push(this.nodeToComponent(edge.otherNode));
            }
        }
        for(i = 0; i < ties.length; i++)
            ties[i].checkIdentifiers();
        this.recordState();
        DrawingEngine.start(false);
        return false; // do not close menu
    },
    makeFirstRole: function(components) {
        var tie, component, node, edge;
        for(var i = 0; i < components.length; i++) {
            component = components[i];
            node = component.node;
            if(node.type === NodeType.EDGE) {
                edge = node;
                // Only meaningful for ties; ignore for nexus related edges
                if(tie = edge.node.type === NodeType.TIE ? this.nodeToComponent(edge.node) :
                         edge.otherNode.type === NodeType.TIE ? this.nodeToComponent(edge.otherNode) :
                         null) {
                    tie.setFirstRole(component);
                }
            }
        }
        this.recordState();
        DrawingEngine.start(false);
        return false; // do not close menu
    },
    lastAngle: 0,
    addAttribute: function(components) {
        var dx, dy, node, component;
        for(var i = 0; i < components.length; i++) {
            component = components[i];
            node = component.node;
            this.lastAngle = (this.lastAngle + 0.5) % 14;
            dx = 2 * LayoutEngine.normalDistance * Math.cos(this.lastAngle);
            dy = 2 * LayoutEngine.normalDistance * Math.sin(this.lastAngle);
            var attribute = new Attribute(node.xPosition + dx, node.yPosition + dy);
            this.addComponent(attribute);
            this.addComponent(new Role(attribute, component, true));
        }
        this.recordState();
        this.refresh();
        DrawingEngine.start(true);
        return false; // do not close menu
    },
    addTie: function(components) {
        var tie, node;
        // multiple anchors selected
        if(components.length > 1) {
            var i, xAverage = 0, yAverage = 0;
            for(i = 0; i < components.length; i++) {
                node = components[i].node;
                xAverage += node.xPosition;
                yAverage += node.yPosition;
            }
            xAverage /= components.length;
            yAverage /= components.length;
            tie = new Tie(xAverage, yAverage, false);
            this.addComponent(tie);
            for(i = 0; i < components.length; i++)
                this.addComponent(new Role(tie, components[i], true));
        }
        // single anchor selected
        else {
            var anchor = components[0];
            this.lastAngle = (this.lastAngle + 0.5) % 14;
            var dx = 2 * LayoutEngine.normalDistance * Math.cos(this.lastAngle);
            var dy = 2 * LayoutEngine.normalDistance * Math.sin(this.lastAngle);
            tie = new Tie(anchor.node.xPosition + dx, anchor.node.yPosition + dy, false);
            this.addComponent(tie);
            var role = new Role(tie, anchor, true);
            this.addComponent(role);
            role = new Role(tie, anchor, true);
            this.addComponent(role);
        }
        this.recordState();
        this.refresh();
        DrawingEngine.start(true);
        return false; // do not close menu
    },
    addAnchor: function(components) {
        var dx, dy, component, node;
        for(var i = 0; i < components.length; i++) {
            component = components[i];
            node = component.node;
            this.lastAngle = (this.lastAngle + 0.5) % 14;
            dx = 2 * LayoutEngine.normalDistance * Math.cos(this.lastAngle);
            dy = 2 * LayoutEngine.normalDistance * Math.sin(this.lastAngle);
            var anchor = new Anchor(node.xPosition + dx, node.yPosition + dy);
            this.addComponent(anchor);
            this.addComponent(new Role(component, anchor, true));
        }
        this.recordState();
        this.refresh();
        DrawingEngine.start(true);
        return false; // do not close menu
    },
    addTieAndAnchor: function(components) {
        var dx, dy, component, node;
        for(var i = 0; i < components.length; i++) {
            component = components[i];
            node = component.node;
            this.lastAngle = (this.lastAngle + 0.5) % 14;
            dx = 2 * LayoutEngine.normalDistance * Math.cos(this.lastAngle);
            dy = 2 * LayoutEngine.normalDistance * Math.sin(this.lastAngle);
            var tie = new Tie(node.xPosition + dx, node.yPosition + dy, false);
            this.addComponent(tie);
            var role = new Role(tie, component, true);
            this.addComponent(role);
            var anchor = new Anchor(node.xPosition + 2*dx, node.yPosition + 2*dy);
            this.addComponent(anchor);
            role = new Role(tie, anchor, true);
            this.addComponent(role);
        }
        this.recordState();
        this.refresh();
        DrawingEngine.start(true);
        return false; // do not close menu
    },
    addNexus: function(components) {
        var dx, dy, component, node;
        for(var i = 0; i < components.length; i++) {
            component = components[i];
            node = component.node;
            this.lastAngle = (this.lastAngle + 0.5) % 14;
            dx = 2 * LayoutEngine.normalDistance * Math.cos(this.lastAngle);
            dy = 2 * LayoutEngine.normalDistance * Math.sin(this.lastAngle);
            var nexus = new Nexus(node.xPosition + dx, node.yPosition + dy);
            this.addComponent(nexus);
            var role = new Role(nexus, component, true);
            this.addComponent(role);
        }
        this.recordState();
        this.refresh();
        DrawingEngine.start(true);
        return false; // do not close menu
    },
    addKnot: function(components) {
        var dx, dy, component, node;
        for(var i = 0; i < components.length; i++) {
            component = components[i];
            node = component.node;
            this.lastAngle = (this.lastAngle + 0.5) % 14;
            dx = 2 * LayoutEngine.normalDistance * Math.cos(this.lastAngle);
            dy = 2 * LayoutEngine.normalDistance * Math.sin(this.lastAngle);
            var knot = new Knot(node.xPosition + dx, node.yPosition + dy);
            this.addComponent(knot);
            this.addComponent(new Role(component, knot, true));
        }
        this.recordState();
        this.refresh();
        DrawingEngine.start(true);
        return false; // do not close menu
    },
    explode: function(components, startEngine) {
        var node, component, i, j, k, edge, otherNode, otherComponent;
        var role, knot, knotComponent, knotEdge, knotEdgeComponent, visibleEdges;
        for(i = 0; component = components[i]; i++) {
            node = component.node;
            if(node.type === NodeType.ANCHOR) {
                if(component.imploded) {
                    for(j = 0; edge = node.edges[j]; j++) {
                        otherNode = edge.node === node ? edge.otherNode : edge.node;
                        if(otherNode.type === NodeType.ATTRIBUTE) {
                            var dx = 2 * LayoutEngine.normalDistance * Math.cos(j);
                            var dy = 2 * LayoutEngine.normalDistance * Math.sin(j);
                            otherComponent = this.nodeToComponent(otherNode);
                            if(otherComponent.knotted) {
                                for(k = 0; knotEdge = otherNode.edges[k]; k++) {
                                    knot = knotEdge.node === otherNode ? knotEdge.otherNode : knotEdge.node;
                                    if(knot.type === NodeType.KNOT) {
                                        break;
                                    }
                                }
                                knotComponent = this.nodeToComponent(knot);
                                if(!knot.visible) {
                                    knot.xPosition = node.xPosition + 2*dx;
                                    knot.yPosition = node.yPosition + 2*dy;
                                    knot.start();
                                    knot.visible = true;
                                    knotComponent.setFixed(false);
                                    knotComponent.show();
                                }
                                knotEdgeComponent = this.nodeToComponent(knotEdge);
                                knotEdge.start();
                                knotEdge.visible = true;
                                knotEdgeComponent.show();
                            }
                            otherComponent = this.nodeToComponent(otherNode);
                            otherNode.xPosition = node.xPosition + dx;
                            otherNode.yPosition = node.yPosition + dy;
                            otherNode.start();
                            otherComponent.setFixed(false);
                            otherComponent.show();
                            otherNode.visible = true;
                            role = this.nodeToComponent(edge);
                            edge.start();
                            role.show();
                            edge.visible = true;
                        }
                    }
                }
                else {
                    for(j = 0; edge = node.edges[j]; j++) {
                        otherNode = edge.node === node ? edge.otherNode : edge.node;
                        if(otherNode.type === NodeType.ATTRIBUTE) {
                            otherComponent = this.nodeToComponent(otherNode);
                            if(otherComponent.knotted) {
                                for(k = 0; knotEdge = otherNode.edges[k]; k++) {
                                    knot = knotEdge.node === otherNode ? knotEdge.otherNode : knotEdge.node;
                                    if(knot.type === NodeType.KNOT) {
                                        break;
                                    }
                                }
                                knotComponent = this.nodeToComponent(knot);
                                knotEdgeComponent = this.nodeToComponent(knotEdge);
                                knotEdgeComponent.hide();
                                knotEdge.stop();
                                knotEdge.visible = false;
                                visibleEdges = 0;
                                for(k = 0; knotEdge = knot.edges[k]; k++)
                                    if(knotEdge.visible)
                                        visibleEdges++;
                                if(visibleEdges === 0) {
                                    knotEdgeComponent.hide();
                                    knotComponent.hide();
                                    knot.stop();
                                    knot.visible = false;
                                }
                            }
                            otherComponent.hide();
                            otherNode.stop();
                            otherNode.visible = false;
                            role = this.nodeToComponent(edge);
                            role.hide();
                            edge.stop();
                            edge.visible = false;
                        }
                    }
                }
                component.setImploded(!component.imploded);
            }
        }
        // if at least one imploded component exists
        // hide key layer, otherwise show key layer
        var allExloded = true;
        for(var i = 0; i < this.components.length; i++) {
            component = this.components[i];
            if(component.imploded) {
                SVGLayer.hide('keys');
                allExloded = false;
                break;
            }
        }                
        if(allExloded) {
            SVGLayer.show('keys');
        }
        this.refresh();
        if(startEngine == null || startEngine)
            DrawingEngine.start(true);
        return false; // do not close menu
    }
};
