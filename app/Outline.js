// Outline: the panel at the right with the outline of the model (a tree of anchors, nexuses, ties and knots, with the attributes
// under their anchors and nexuses) and, under it, the properties of what is selected: its fields and the operations that make
// sense for it. It is a second way to work with the model beside the graph and the keys: whatever is selected in one is selected
// in the other, and nothing here needs the pointer to be over anything. The keys of the tree are those of a tree view:
//   Down, Up        the next and the previous row            Home, End   the first and the last
//   Right, Left     opens a row / goes to its first child; closes it / goes to its parent
//   Enter, Space    selects the row (with Shift or Ctrl it is added to, or taken out of, the selection)
import { Model } from './Model.js';
import { EventHandler } from './EventHandler.js';
import { DrawingEngine } from './DrawingEngine.js';
import { Operations } from './Operations.js';
import { EditForm } from './EditForm.js';
import { Actions } from './Actions.js';
import { XLINKNS, SVGNS } from './config.js';
export var Outline = {
    isOpen: false,
    expanded: {},           // the rows that are open, by id of the construct (or of the group)
    filter: '',
    scheduled: false,
    scrollToSelection: false, // after a selection in the graph, the selected row is brought into view
    shownSelection: '',     // which constructs the properties were made for
    groups: [
        { id: 'anchors', title: 'Anchors', type: NodeType.ANCHOR },
        { id: 'nexuses', title: 'Nexuses', type: NodeType.NEXUS },
        { id: 'ties', title: 'Ties', type: NodeType.TIE },
        { id: 'knots', title: 'Knots', type: NodeType.KNOT }
    ],
    panel: function() { return document.getElementById('panel'); },
    tree: function() { return document.getElementById('outlineTree'); },
    idOf: function(component) { return String(component.getId ? component.getId() : component.id); },
    init: function() {
        var panel = Outline.panel();
        Outline.groups.forEach(function(group) { Outline.expanded['group:' + group.id] = true; });
        var tree = Outline.tree();
        tree.addEventListener('click', Outline.click, false);
        tree.addEventListener('keydown', Outline.keydown, false);
        document.getElementById('outlineFilter').addEventListener('input', function() {
            Outline.filter = this.value.trim().toLowerCase();
            Outline.renderTree();
        }, false);
        // the keys of the modeler (a, t, d ...) must not act on what is typed in the panel
        panel.addEventListener('focusin', function() { Actions.stopKeyboardEvents(); }, false);
        Model.on('changed', Outline.schedule);
        Model.on('replaced', function() { Outline.shownSelection = ''; Outline.schedule(); });
        document.addEventListener('anchor-selection', function() { Outline.revealSelection(); Outline.schedule(); }, false);
        var remembered = null;
        try { remembered = window.localStorage.getItem('outline'); } catch(e) { }
        if(remembered === 'open') Outline.setOpen(true, true);
    },
    toggle: function() { Outline.setOpen(!Outline.isOpen); },
    setOpen: function(open, quietly) {
        Outline.isOpen = open;
        Outline.panel().hidden = !open;
        document.body.classList.toggle('panel-open', open);
        var button = document.getElementById('panelButton');
        if(button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
        try { window.localStorage.setItem('outline', open ? 'open' : 'closed'); } catch(e) { }
        if(open) {
            Outline.revealSelection();
            Outline.render();
            if(!quietly) {
                var row = Outline.tree().querySelector('[tabindex="0"]');
                if(row) row.focus();
            }
        }
        else if(!quietly && Outline.panel().contains(document.activeElement)) {
            var again = document.getElementById('panelButton');
            if(again) again.focus();
        }
    },
    // what is changed is shown a moment later, once, however many changes there were
    schedule: function() {
        if(!Outline.isOpen || Outline.scheduled) return;
        Outline.scheduled = true;
        setTimeout(function() { Outline.scheduled = false; Outline.render(); }, 20);
    },
    render: function() {
        if(!Outline.isOpen) return;
        Outline.renderTree();
        if(Outline.scrollToSelection) {
            Outline.scrollToSelection = false;
            var row = Outline.tree().querySelector('[aria-selected=true]');
            if(row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
        }
        var now = EventHandler.selectedComponents.map(Outline.idOf).join(',');
        if(now !== Outline.shownSelection) {
            Outline.shownSelection = now;
            Outline.renderProperties();
        }
        else if(EventHandler.selectedComponents.length === 1) {
            // a name that was changed shows in the heading
            var heading = document.querySelector('#panelProperties h3');
            if(heading) heading.textContent = Outline.headingFor(EventHandler.selectedComponents[0]);
        }
    },

    // THE TREE ---------------------------------------------------------
    nodeOf: function(edge, node) { return edge.node === node ? edge.otherNode : edge.node; },
    // the attributes and identifiers of an anchor or a nexus
    partsOf: function(owner) {
        var parts = [], seen = {};
        owner.node.edges.forEach(function(edge) {
            var other = Outline.nodeOf(edge, owner.node);
            if((other.type === NodeType.ATTRIBUTE || other.type === NodeType.IDENTIFIER) && !seen[other.id]) {
                seen[other.id] = true;
                var component = Model.nodeToComponent(other);
                if(component) parts.push(component);
            }
        });
        return parts;
    },
    // the knot that an attribute is knotted to
    knotOf: function(attribute) {
        var knot = null;
        attribute.node.edges.forEach(function(edge) {
            var other = Outline.nodeOf(edge, attribute.node);
            if(other.type === NodeType.KNOT) knot = Model.nodeToComponent(other);
        });
        return knot;
    },
    // what a construct is called; a tie is not called anything in the graph (its roles are), so it is named by what it ties
    nameOf: function(component) {
        var name = component.contextualName();
        if(name || component.node.type !== NodeType.TIE) return name;
        return component.node.edges.map(function(edge) {
            var end = Model.nodeToComponent(Outline.nodeOf(edge, component.node)), role = Model.nodeToComponent(edge);
            return (end ? end.contextualName() : '?') + (role && role.role ? ' (' + role.role + ')' : '');
        }).join(' – ');
    },
    byName: function(a, b) { return Outline.nameOf(a).toLowerCase() < Outline.nameOf(b).toLowerCase() ? -1 : 1; },
    matches: function(component) {
        return !Outline.filter || (Outline.nameOf(component) + ' ' + (component.mnemonic || '')).toLowerCase().indexOf(Outline.filter) >= 0;
    },
    icon: function(component) {
        var svg = document.createElementNS(SVGNS, 'svg'), use = document.createElementNS(SVGNS, 'use');
        svg.setAttribute('class', 'icon');
        svg.setAttribute('viewBox', '-18 -18 36 36');
        svg.setAttribute('aria-hidden', 'true');
        var shape = component.view && component.view.svg && component.view.svg.useElement
            ? component.view.svg.useElement.getAttributeNS(XLINKNS, 'href') : null;
        use.setAttributeNS(XLINKNS, 'xlink:href', shape || (component.look && component.look.ref) || '#attribute');
        svg.appendChild(use);
        return svg;
    },
    row: function(component, level, children) {
        var li = document.createElement('li'), line = document.createElement('div'), twisty = document.createElement('span');
        li.setAttribute('role', 'treeitem');
        li.setAttribute('aria-level', level);
        li.setAttribute('data-id', Outline.idOf(component));
        li.setAttribute('tabindex', '-1');
        li.style.setProperty('--level', level);
        var selected = EventHandler.selectedComponents.indexOf(component) >= 0;
        li.setAttribute('aria-selected', selected ? 'true' : 'false');
        line.className = 'line';
        twisty.className = 'twisty';
        if(children) {
            li.setAttribute('aria-expanded', Outline.expanded[Outline.idOf(component)] || Outline.filter ? 'true' : 'false');
            twisty.setAttribute('data-twisty', '');
        }
        line.appendChild(twisty);
        line.appendChild(Outline.icon(component));
        var name = document.createElement('span');
        name.className = 'name';
        name.textContent = Outline.nameOf(component);
        line.appendChild(name);
        if(component.node.type === NodeType.ATTRIBUTE) {
            var knot = Outline.knotOf(component);
            if(knot) {
                var note = document.createElement('span');
                note.className = 'note';
                note.textContent = Outline.nameOf(knot);
                line.appendChild(note);
            }
        }
        li.appendChild(line);
        return li;
    },
    renderTree: function() {
        var tree = Outline.tree(), focused = document.activeElement, focusKey = null;
        if(tree.contains(focused) && focused.getAttribute) focusKey = focused.getAttribute('data-id') || focused.getAttribute('data-group');
        var scroll = tree.scrollTop;
        tree.textContent = '';
        var components = Model.components;
        Outline.groups.forEach(function(group) {
            var members = components.filter(function(c) { return c.node.type === group.type; }).sort(Outline.byName);
            var li = document.createElement('li'), line = document.createElement('div'), title = document.createElement('span');
            li.setAttribute('role', 'treeitem');
            li.setAttribute('aria-level', '1');
            li.setAttribute('data-group', group.id);
            li.setAttribute('tabindex', '-1');
            li.setAttribute('aria-expanded', Outline.expanded['group:' + group.id] ? 'true' : 'false');
            li.setAttribute('aria-selected', 'false');
            li.style.setProperty('--level', 1);
            li.className = 'group';
            line.className = 'line';
            var twisty = document.createElement('span');
            twisty.className = 'twisty';
            twisty.setAttribute('data-twisty', '');
            line.appendChild(twisty);
            title.className = 'name';
            title.textContent = group.title + ' (' + members.length + ')';
            line.appendChild(title);
            li.appendChild(line);
            var shown = [];
            if(Outline.expanded['group:' + group.id] || Outline.filter) {
                members.forEach(function(member) {
                    var parts = (group.type === NodeType.ANCHOR || group.type === NodeType.NEXUS) ? Outline.partsOf(member).sort(Outline.byName) : [];
                    var own = Outline.matches(member), kept = parts.filter(function(p) { return own || Outline.matches(p); });
                    if(!own && kept.length === 0) return;
                    var open = parts.length > 0 && (Outline.expanded[Outline.idOf(member)] || Outline.filter);
                    shown.push(Outline.row(member, 2, parts.length > 0));
                    if(open) kept.forEach(function(part) { shown.push(Outline.row(part, 3, false)); });
                });
            }
            if(Outline.filter && shown.length === 0) return;
            tree.appendChild(li);
            shown.forEach(function(row) { tree.appendChild(row); });
        });
        // one row can be reached with Tab: the one that had the focus, else the first that is selected, else the first
        var rows = Array.prototype.slice.call(tree.querySelectorAll('li'));
        var current = rows.filter(function(r) { return (r.getAttribute('data-id') || r.getAttribute('data-group')) === focusKey; })[0]
            || rows.filter(function(r) { return r.getAttribute('aria-selected') === 'true'; })[0] || rows[0];
        if(current) {
            current.setAttribute('tabindex', '0');
            if(focusKey) current.focus(); // the focus was in the tree, and the rows were made again
        }
        tree.scrollTop = scroll;
    },
    // a construct that is selected in the graph is shown in the tree: its anchor or nexus opens, the selected row comes into view
    revealSelection: function() {
        EventHandler.selectedComponents.forEach(function(component) {
            if(component.node.type === NodeType.ATTRIBUTE || component.node.type === NodeType.IDENTIFIER) {
                component.node.edges.forEach(function(edge) {
                    var other = Model.nodeToComponent(Outline.nodeOf(edge, component.node));
                    if(other && (other.node.type === NodeType.ANCHOR || other.node.type === NodeType.NEXUS))
                        Outline.expanded[Outline.idOf(other)] = true;
                });
            }
        });
        Outline.scrollToSelection = true;
    },
    click: function(event) {
        var li = event.target.closest('li');
        if(!li) return;
        var group = li.getAttribute('data-group'), id = li.getAttribute('data-id');
        if(group || (event.target.closest('[data-twisty]') && li.hasAttribute('aria-expanded'))) {
            var key = group ? 'group:' + group : id;
            Outline.expanded[key] = !Outline.expanded[key];
            Outline.renderTree();
            return;
        }
        Outline.choose(id, event.shiftKey || event.ctrlKey || event.metaKey);
    },
    // selects one construct (and the graph shows it: the view moves to it), or adds it to what is selected, or takes it out
    choose: function(id, add) {
        var component = Model.idToComponent[id];
        if(!component) return;
        if(add) {
            if(EventHandler.selectedComponents.indexOf(component) >= 0) EventHandler.removeComponentFromSelection(component);
            else EventHandler.addComponentToSelection(component);
        }
        else
            Actions.selectNode(id);
    },
    keydown: function(event) {
        var li = event.target.closest('li');
        if(!li || event.ctrlKey || event.altKey || event.metaKey && event.key !== 'Enter') return;
        var rows = Array.prototype.slice.call(Outline.tree().querySelectorAll('li')), at = rows.indexOf(li), target = null;
        var group = li.getAttribute('data-group'), id = li.getAttribute('data-id');
        var key = group ? 'group:' + group : id, expandable = li.hasAttribute('aria-expanded');
        switch(event.key) {
            case 'ArrowDown': target = rows[Math.min(at + 1, rows.length - 1)]; break;
            case 'ArrowUp': target = rows[Math.max(at - 1, 0)]; break;
            case 'Home': target = rows[0]; break;
            case 'End': target = rows[rows.length - 1]; break;
            case 'ArrowRight':
                if(expandable && li.getAttribute('aria-expanded') === 'false') { Outline.expanded[key] = true; Outline.renderTree(); }
                else if(expandable) target = rows[at + 1];
                break;
            case 'ArrowLeft':
                if(expandable && li.getAttribute('aria-expanded') === 'true' && !Outline.filter) { Outline.expanded[key] = false; Outline.renderTree(); }
                else {
                    var level = Number(li.getAttribute('aria-level')), k = at;
                    while(--k >= 0 && Number(rows[k].getAttribute('aria-level')) >= level) { }
                    if(k >= 0) target = rows[k];
                }
                break;
            case 'Enter': case ' ':
                if(group) { Outline.expanded[key] = !Outline.expanded[key]; Outline.renderTree(); }
                else Outline.choose(id, event.shiftKey || event.ctrlKey || event.metaKey);
                break;
            default: return;
        }
        event.preventDefault();
        event.stopPropagation();
        if(target) {
            rows.forEach(function(r) { r.setAttribute('tabindex', '-1'); });
            target.setAttribute('tabindex', '0');
            target.focus();
        }
    },

    // THE PROPERTIES ---------------------------------------------------
    headingFor: function(component) {
        var kind = NodeType[component.node.type];
        return kind.charAt(0) + kind.slice(1).toLowerCase() + ': ' + Outline.nameOf(component);
    },
    renderProperties: function() {
        var box = document.getElementById('panelProperties');
        box.textContent = '';
        var selection = EventHandler.selectedComponents.slice(0);
        var heading = document.createElement('h3');
        box.appendChild(heading);
        if(selection.length === 0) {
            heading.textContent = 'Properties';
            var hint = document.createElement('p');
            hint.className = 'hint';
            hint.textContent = 'Choose something in the outline, or Shift+click it in the graph, to change it.';
            box.appendChild(hint);
            return;
        }
        if(selection.length === 1) {
            var component = selection[0];
            heading.textContent = Outline.headingFor(component);
            var table = document.createElement('table');
            table.className = 'items';
            var commit = function(element) {
                element.dirty = false;
                if(element.checkValidity()) {
                    Model.recordState();
                    DrawingEngine.start(false);
                }
            };
            var any = EditForm.fill(table, component, {
                edit: function(element) {
                    element.editable.setMember(element, component);
                    element.checkValidity();
                    if(element.dirty) commit(element);
                },
                changed: function(element) {
                    element.dirty = true;
                    if(element.editable.event === 'change') commit(element);
                },
                keydown: function(event) { if(event.key === 'Enter') event.target.blur(); }
            });
            if(any) box.appendChild(table);
        }
        else {
            heading.textContent = selection.length + ' selected';
        }
        var operations = Operations.supportedFor(selection);
        if(operations.length) {
            var list = document.createElement('div');
            list.className = 'operations';
            list.setAttribute('role', 'group');
            list.setAttribute('aria-label', 'Operations');
            operations.forEach(function(operation) {
                var button = document.createElement('button');
                button.type = 'button';
                button.title = operation[2];
                button.innerHTML = operation[1];
                button.addEventListener('click', function() {
                    Model[operation[0]](selection);
                    Outline.shownSelection = '';
                    Outline.schedule();
                }, false);
                list.appendChild(button);
            });
            box.appendChild(list);
        }
    }
};
