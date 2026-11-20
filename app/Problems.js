// Problems: what is wrong with the model, and what could be better, kept up to date as the model changes.
//   Problems  are what ModelCheck finds (the rules a generator depends on: a setting missing, two anchors with one mnemonic, a tie
//             with fewer than two anchors, a knot that is not there ...). The number is on the tab and on the button of the panel.
//   Hints     are what the generators do not mind, but a reader would: something still has its placeholder name, has no
//             description, or an anchor has no attributes.
// Each line selects what it is about in the graph and in the outline, and the view moves there.
import { Model } from './Model.js';
import { EventHandler } from './EventHandler.js';
import { Actions } from './Actions.js';
import { Outline } from './Outline.js';
export var Problems = {
    problems: [],
    hints: [],
    timer: null,
    isShown: false,
    init: function() {
        Model.on('changed', Problems.schedule);
        Model.on('replaced', Problems.schedule);
        document.getElementById('problemList').addEventListener('click', Problems.click, false);
        Problems.schedule();
    },
    // the model is looked at a moment after the last change, once (every change starts the moment again)
    schedule: function() {
        clearTimeout(Problems.timer);
        Problems.timer = setTimeout(Problems.update, 150);
    },
    show: function(shown) {
        Problems.isShown = shown;
        if(shown) Problems.update();
    },
    kindOf: function(type) {
        return { anchor: NodeType.ANCHOR, nexus: NodeType.NEXUS, knot: NodeType.KNOT, tie: NodeType.TIE }[type];
    },
    // a message of ModelCheck says where it is: "anchor AC", "anchor AC, attribute NAM", "knot GEN", "tie AC_of_PE_has",
    // "tie 2" (the second tie of the model) or "the metadata". The construct is found from that, if it can be.
    locate: function(where) {
        var m = /^(anchor|nexus|knot|tie) ([^:]+?)(?:, (attribute|role|identifier) ([^:]*))?$/.exec(where);
        if(!m) return null;
        var type = Problems.kindOf(m[1]), name = m[2];
        var candidates = Model.components.filter(function(c) { return c.node.type === type; });
        var owner;
        if(type === NodeType.TIE) {
            if(/^\d+$/.test(name)) owner = candidates[Number(name) - 1];
            else owner = candidates.filter(function(tie) { return Problems.tieName(tie) === name; })[0];
        }
        else owner = candidates.filter(function(c) { return c.mnemonic === name; })[0];
        if(!owner || !m[3] || m[3] !== 'attribute') return owner || null;
        return Outline.partsOf(owner).filter(function(part) { return part.mnemonic === m[4]; })[0] || owner;
    },
    // the name that ModelCheck gives a tie: the type and the name of each role, joined
    tieName: function(tie) {
        return tie.node.edges.map(function(edge) {
            var end = Model.nodeToComponent(Outline.nodeOf(edge, tie.node)), role = Model.nodeToComponent(edge);
            return (end ? end.mnemonic : '') + '_' + (role ? role.role : '');
        }).join('_');
    },
    // the problems and the hints, from the model as it is now
    find: function() {
        var problems = [], hints = [];
        if(typeof ModelCheck !== 'undefined') {
            ModelCheck.problems(Model.toXML(false).documentElement).forEach(function(message) {
                var colon = message.indexOf(': '), where = colon >= 0 ? message.slice(0, colon) : '';
                var component = Problems.locate(where);
                problems.push({
                    where: where,
                    text: colon >= 0 ? message.slice(colon + 2) : message,
                    component: component,
                    settings: /^the metadata/.test(where)
                });
            });
        }
        Model.components.forEach(function(c) {
            var type = c.node.type;
            if([NodeType.ANCHOR, NodeType.NEXUS, NodeType.KNOT, NodeType.ATTRIBUTE, NodeType.TIE].indexOf(type) < 0) return;
            var name = Outline.nameOf(c), kind = NodeType[type].toLowerCase();
            if(type !== NodeType.TIE && (!c.descriptor || c.descriptor === '!Unnamed!' || !c.mnemonic || c.mnemonic === '??'))
                hints.push({ where: kind, text: 'still has a placeholder name or mnemonic: ' + name + ' (' + (c.mnemonic || 'no mnemonic') + ')', component: c });
            else if(!c.description || !String(c.description).trim())
                hints.push({ where: kind + ' ' + name, text: 'has no description', component: c });
            if(type === NodeType.ANCHOR && Outline.partsOf(c).length === 0)
                hints.push({ where: kind + ' ' + name, text: 'has no attributes', component: c });
        });
        return { problems: problems, hints: hints };
    },
    update: function() {
        var found = Problems.find();
        Problems.problems = found.problems;
        Problems.hints = found.hints;
        var n = found.problems.length;
        var badge = document.querySelector('#tab-problems .count'), button = document.querySelector('#panelButton .count');
        [badge, button].forEach(function(b) { if(b) b.textContent = n || ''; });
        var tab = document.getElementById('tab-problems');
        if(tab) tab.setAttribute('aria-label', n ? 'Problems, ' + n : 'Problems');
        document.getElementById('panelButton').setAttribute('title', 'Outline, XML and problems' + (n ? ' (' + n + (n === 1 ? ' problem)' : ' problems)') : ''));
        if(Problems.isShown) Problems.render();
    },
    line: function(item, kind) {
        var li = document.createElement('li'), button = document.createElement('button'), where = document.createElement('strong');
        li.className = kind;
        button.type = 'button';
        button.className = 'problem';
        where.textContent = item.where ? item.where.charAt(0).toUpperCase() + item.where.slice(1) + ': ' : '';
        button.appendChild(where);
        button.appendChild(document.createTextNode(item.text));
        if(item.component) button.setAttribute('data-id', Outline.idOf(item.component));
        else if(item.settings) button.setAttribute('data-settings', '');
        else button.disabled = true;
        li.appendChild(button);
        return li;
    },
    render: function() {
        var list = document.getElementById('problemList'), status = document.getElementById('problemStatus');
        list.textContent = '';
        var p = Problems.problems, h = Problems.hints;
        status.textContent = (p.length ? p.length + (p.length === 1 ? ' problem' : ' problems') : 'No problems') + (h.length ? ', ' + h.length + (h.length === 1 ? ' hint' : ' hints') : '') + '.';
        document.getElementById('problemView').classList.toggle('bad', p.length > 0);
        p.forEach(function(item) { list.appendChild(Problems.line(item, 'error')); });
        if(h.length) {
            var heading = document.createElement('li');
            heading.className = 'heading';
            heading.textContent = 'Hints';
            list.appendChild(heading);
            h.forEach(function(item) { list.appendChild(Problems.line(item, 'hint')); });
        }
    },
    click: function(event) {
        var button = event.target.closest('button.problem');
        if(!button || button.disabled) return;
        if(button.hasAttribute('data-settings')) { Actions.openModelSettings('target'); return; }
        Actions.selectNode(button.getAttribute('data-id'));
    }
};
