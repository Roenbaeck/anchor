// Placement: where the things of a model are put when the XML that it is made from does not say. A model that the modeler saves
// has a <layout> in each of its constructs; one that a person or an agent wrote has none, and one that was changed has some
// constructs that are new. Instead of throwing the new ones on the page at random, they are put by what they are connected to
// (the force layout then polishes it):
//   - what was in the model before keeps its place (it is found by what it is: an anchor by its mnemonic, an attribute by its
//     anchor and its mnemonic, a tie by its roles), with its fixation and its imploded state;
//   - a new anchor or nexus is put beside what it is tied to if that has a place, or else on a circle, in the order in which
//     they are connected, so that those that are tied are near each other;
//   - a new tie is put between the anchors and nexuses that it ties, an attribute on a ring around its anchor or nexus, a knot
//     beside what uses it.
// It works on the XML document, before the model is made from it.
export var Placement = {
    ENTITIES: ['anchor', 'nexus'],
    children: function(element, name) {
        return Array.prototype.filter.call(element.childNodes, function(n) { return n.nodeType === 1 && (!name || n.nodeName === name); });
    },
    // what a construct is called, in a way that does not change when its place does
    keyOf: function(element, owner) {
        var name = element.nodeName, mn = element.getAttribute('mnemonic');
        if(name === 'anchor' || name === 'nexus' || name === 'knot') return name + ':' + mn;
        if(name === 'attribute') return owner + '/' + mn;
        if(name === 'tie') {
            return 'tie:' + Placement.children(element, 'role').map(function(r) { return r.getAttribute('type') + '_' + r.getAttribute('role'); }).join('_');
        }
        return null;
    },
    // all the constructs that have a place in the document: { element, key, owner, kind }
    constructs: function(doc) {
        var list = [], root = doc.documentElement;
        Placement.children(root).forEach(function(element) {
            var name = element.nodeName;
            if(['knot', 'anchor', 'nexus', 'tie'].indexOf(name) < 0) return;
            var key = Placement.keyOf(element);
            list.push({ element: element, key: key, kind: name });
            if(name === 'anchor' || name === 'nexus') {
                Placement.children(element, 'attribute').forEach(function(attribute) {
                    list.push({ element: attribute, key: Placement.keyOf(attribute, key), kind: 'attribute', owner: key });
                });
                // an identifier of an anchor has no name of its own: it is told by its number
                Placement.children(element, 'identifier').forEach(function(identifier, i) {
                    list.push({ element: identifier, key: key + '/identifier ' + (i + 1), kind: 'identifier', owner: key });
                });
            }
        });
        return list;
    },
    layoutOf: function(element) {
        return Placement.children(element, 'layout')[0] || null;
    },
    // where everything that has a place is: key -> { x, y, fixed, imploded }
    positions: function(doc) {
        var found = {};
        Placement.constructs(doc).forEach(function(c) {
            var layout = Placement.layoutOf(c.element);
            if(layout && layout.getAttribute('x') !== null && layout.getAttribute('y') !== null) {
                found[c.key] = {
                    x: Number(layout.getAttribute('x')), y: Number(layout.getAttribute('y')),
                    fixed: layout.getAttribute('fixed'), imploded: layout.getAttribute('imploded')
                };
            }
        });
        return found;
    },
    // gives a <layout> to each construct that has none; 'previous' is what positions() found in the model before, and the centre is
    // where a model that has nothing to go by is put
    seed: function(doc, previous, centre) {
        previous = previous || {};
        centre = centre || { x: 500, y: 350 };
        var distance = typeof LayoutEngine !== 'undefined' && LayoutEngine.normalDistance ? LayoutEngine.normalDistance : 30;
        var constructs = Placement.constructs(doc), at = {}, byKey = {}, missing = [];
        constructs.forEach(function(c) {
            byKey[c.key] = c;
            var layout = Placement.layoutOf(c.element), own = layout && layout.getAttribute('x') !== null && layout.getAttribute('y') !== null;
            if(own) at[c.key] = { x: Number(layout.getAttribute('x')), y: Number(layout.getAttribute('y')) };
            else if(previous[c.key]) {
                at[c.key] = { x: previous[c.key].x, y: previous[c.key].y, fixed: previous[c.key].fixed, imploded: previous[c.key].imploded, write: true };
            }
            else missing.push(c);
        });
        if(missing.length === 0 && !Object.keys(at).some(function(k) { return at[k].write; })) return 0;
        var jitter = function(i, size) { return { x: Math.cos(i * 2.399) * size, y: Math.sin(i * 2.399) * size }; };
        var entities = constructs.filter(function(c) { return Placement.ENTITIES.indexOf(c.kind) >= 0; });
        var ties = constructs.filter(function(c) { return c.kind === 'tie'; });
        // which entities are tied to which: through the ties, and through the roles of a nexus
        var entityOf = function(type) { return entities.filter(function(e) { return e.element.getAttribute('mnemonic') === type; })[0]; };
        var neighbours = {};
        entities.forEach(function(e) { neighbours[e.key] = []; });
        var connect = function(a, b) { if(a && b && a !== b && neighbours[a.key].indexOf(b.key) < 0) { neighbours[a.key].push(b.key); neighbours[b.key].push(a.key); } };
        ties.forEach(function(tie) {
            var ends = Placement.children(tie.element, 'role').map(function(r) { return entityOf(r.getAttribute('type')); }).filter(Boolean);
            ends.forEach(function(a) { ends.forEach(function(b) { connect(a, b); }); });
        });
        entities.forEach(function(e) {
            if(e.kind !== 'nexus') return;
            Placement.children(e.element, 'role').forEach(function(r) { connect(e, entityOf(r.getAttribute('type'))); });
        });
        // the entities in the order of their connections (a walk through each group that is connected)
        var order = [], seen = {};
        entities.forEach(function(start) {
            if(seen[start.key]) return;
            var queue = [start.key];
            seen[start.key] = true;
            while(queue.length) {
                var key = queue.shift();
                order.push(byKey[key]);
                neighbours[key].forEach(function(n) { if(!seen[n]) { seen[n] = true; queue.push(n); } });
            }
        });
        // new entities: beside a neighbour that has a place, or on the circle
        var unplaced = order.filter(function(e) { return !at[e.key]; });
        var radius = distance * (5 + 1.2 * entities.length);
        // a model that has no place for any of its entities is spread on the circle in the order of the connections; one that has
        // some puts what is new beside what it is tied to
        var anyPlaced = entities.some(function(e) { return at[e.key]; });
        // those that start a group of connected entities (nothing they are tied to has a place or comes before them) share the circle
        var roots = 0, willHave = {};
        unplaced.forEach(function(e) {
            if(!anyPlaced || !neighbours[e.key].some(function(k) { return at[k] || willHave[k]; })) roots++;
            willHave[e.key] = true;
        });
        var slot = 0, offset = 0;
        unplaced.forEach(function(e) {
            var placed = neighbours[e.key].filter(function(n) { return at[n]; });
            if(anyPlaced && placed.length) {
                var base = at[placed[0]], away = jitter(offset++, 6 * distance);
                // a step away from the middle of what is already there
                var cx = 0, cy = 0, n = 0;
                Object.keys(at).forEach(function(k) { if(byKey[k] && Placement.ENTITIES.indexOf(byKey[k].kind) >= 0) { cx += at[k].x; cy += at[k].y; n++; } });
                var dx = base.x - (n ? cx / n : centre.x), dy = base.y - (n ? cy / n : centre.y), length = Math.sqrt(dx * dx + dy * dy) || 1;
                at[e.key] = { x: base.x + dx / length * 6 * distance + away.x * 0.3, y: base.y + dy / length * 6 * distance + away.y * 0.3, write: true };
            }
            else {
                var angle = 2 * Math.PI * (slot++) / Math.max(1, roots);
                at[e.key] = { x: centre.x + radius * Math.cos(angle), y: centre.y + radius * Math.sin(angle), write: true };
            }
        });
        // new ties: between the entities that they tie; knots are put beside what uses them below
        var middle = function(points) {
            return { x: points.reduce(function(s, p) { return s + p.x; }, 0) / points.length, y: points.reduce(function(s, p) { return s + p.y; }, 0) / points.length };
        };
        ties.forEach(function(tie, i) {
            if(at[tie.key]) return;
            var points = Placement.children(tie.element, 'role').map(function(r) { var e = entityOf(r.getAttribute('type')); return e && at[e.key]; }).filter(Boolean);
            var j = jitter(i, 2 * distance), m = points.length ? middle(points) : centre;
            at[tie.key] = { x: m.x + j.x, y: m.y + j.y, write: true };
        });
        // new attributes and identifiers: on a ring around the entity
        entities.forEach(function(e) {
            var owner = at[e.key];
            var parts = constructs.filter(function(c) { return c.owner === e.key; });
            var fresh = parts.filter(function(p) { return !at[p.key]; });
            fresh.forEach(function(p, j) {
                var angle = 2 * Math.PI * j / fresh.length + 0.5;
                at[p.key] = { x: owner.x + 3 * distance * Math.cos(angle), y: owner.y + 3 * distance * Math.sin(angle), write: true };
            });
        });
        // new knots: beside the first attribute (or the first tie) that uses them, a step further out
        constructs.filter(function(c) { return c.kind === 'knot' && !at[c.key]; }).forEach(function(knot, i) {
            var mn = knot.element.getAttribute('mnemonic'), user = null, from = null;
            constructs.forEach(function(c) {
                if(user) return;
                if(c.kind === 'attribute' && c.element.getAttribute('knotRange') === mn) { user = at[c.key]; from = at[c.owner]; }
                else if(c.kind === 'tie' && Placement.children(c.element, 'role').some(function(r) { return r.getAttribute('type') === mn; })) { user = at[c.key]; from = user; }
            });
            if(user) {
                var dx = user.x - from.x, dy = user.y - from.y, length = Math.sqrt(dx * dx + dy * dy);
                var j = jitter(i, 2 * distance);
                at[knot.key] = length > 1 ? { x: user.x + dx / length * 3 * distance, y: user.y + dy / length * 3 * distance, write: true } : { x: user.x + j.x, y: user.y + j.y, write: true };
            }
            else { var k = jitter(i, 6 * distance); at[knot.key] = { x: centre.x + k.x, y: centre.y + k.y, write: true }; }
        });
        // the places are written into the document
        var written = 0;
        constructs.forEach(function(c) {
            var place = at[c.key];
            if(!place || !place.write) return;
            var layout = doc.createElement('layout');
            layout.setAttribute('x', place.x.toFixed(2));
            layout.setAttribute('y', place.y.toFixed(2));
            layout.setAttribute('fixed', place.fixed === 'true' ? 'true' : 'false');
            if(place.imploded === 'true') layout.setAttribute('imploded', 'true');
            var description = Placement.children(c.element, 'description')[0];
            if(description) c.element.insertBefore(layout, description);
            else c.element.appendChild(layout);
            written++;
        });
        return written;
    }
};
