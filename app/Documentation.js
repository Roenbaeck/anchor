// Documentation: the model as a document that someone who knows the business, and not the database, can read: what the model is, a
// picture of it, and a section for each anchor, nexus, tie and knot, with what it is, what it has and what it is tied to, in the
// words that the model's own descriptions use. It is one HTML file with everything in it (the style and the picture too), so it
// can be mailed, put on a wiki, or printed. It is made from the XML of the model, as the generators are.
import { Model } from './Model.js';
import { Actions } from './Actions.js';
import { VERSION } from './config.js';
export var Documentation = {
    esc: function(text) {
        return String(text === null || text === undefined ? '' : text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    // a description is text that may have lines: each paragraph is one
    prose: function(text) {
        var paragraphs = String(text || '').split(/\n\s*\n/).map(function(p) { return p.trim(); }).filter(Boolean);
        return paragraphs.map(function(p) { return '<p>' + Documentation.esc(p) + '</p>'; }).join('');
    },
    children: function(element, name) {
        return Array.prototype.filter.call(element.childNodes, function(n) { return n.nodeType === 1 && (!name || n.nodeName === name); });
    },
    descriptionOf: function(element) {
        var d = Documentation.children(element, 'description')[0];
        return d ? d.textContent.trim() : '';
    },
    // the settings of an attribute or a tie that say something about how it behaves, where the model keeps them
    flags: function(element) {
        var found = {}, sources = [element].concat(Documentation.children(element, 'metadata'));
        sources.forEach(function(source) {
            ['restatable', 'idempotent', 'deletable', 'equivalent', 'assertive', 'checksum'].forEach(function(name) {
                if(source.getAttribute(name) === 'true') found[name] = true;
            });
            var group = source.getAttribute('encryptionGroup');
            if(group) found.encrypted = group;
            var privacy = source.getAttribute('privacy');
            if(privacy && privacy !== 'Ignore') found.privacy = privacy;
        });
        return found;
    },
    tags: function(element) {
        var flags = Documentation.flags(element), tags = [];
        var labels = { restatable: 'restatable', idempotent: 'idempotent', deletable: 'deletable', equivalent: 'equivalent', assertive: 'assertive', checksum: 'checksum' };
        Object.keys(labels).forEach(function(key) { if(flags[key]) tags.push(labels[key]); });
        if(flags.encrypted) tags.push('encrypted (' + flags.encrypted + ')');
        if(flags.privacy) tags.push('privacy: ' + flags.privacy);
        return tags.map(function(t) { return '<span class="tag">' + Documentation.esc(t) + '</span>'; }).join(' ');
    },
    // the document, as a string; the picture is the model as it is drawn now, in the light colours whatever the theme is
    html: function() {
        var D = Documentation, esc = D.esc, doc = Model.toXML(false), root = doc.documentElement;
        var name = Actions.modelFileName() === 'Model' ? 'Anchor model' : Actions.modelFileName();
        var knots = D.children(root, 'knot'), anchors = D.children(root, 'anchor'), nexuses = D.children(root, 'nexus'), ties = D.children(root, 'tie');
        var byMnemonic = {}, kindOf = {};
        knots.forEach(function(e) { byMnemonic[e.getAttribute('mnemonic')] = e; kindOf[e.getAttribute('mnemonic')] = 'knot'; });
        anchors.forEach(function(e) { byMnemonic[e.getAttribute('mnemonic')] = e; kindOf[e.getAttribute('mnemonic')] = 'anchor'; });
        nexuses.forEach(function(e) { byMnemonic[e.getAttribute('mnemonic')] = e; kindOf[e.getAttribute('mnemonic')] = 'nexus'; });
        var byName = function(a, b) { return a.getAttribute('descriptor').toLowerCase() < b.getAttribute('descriptor').toLowerCase() ? -1 : 1; };
        var link = function(mnemonic) {
            var e = byMnemonic[mnemonic];
            if(!e) return esc(mnemonic);
            return '<a href="#' + kindOf[mnemonic] + '-' + esc(mnemonic) + '">' + esc(e.getAttribute('descriptor')) + '</a>';
        };
        var plural = function(n, one, many) { return n + ' ' + (n === 1 ? one : many); };

        // ties are told by what they tie
        var tieTitle = function(tie, linked) {
            return D.children(tie, 'role').map(function(r) {
                var type = r.getAttribute('type'), e = byMnemonic[type];
                return (linked ? link(type) : esc(e ? e.getAttribute('descriptor') : type)) + ' <em>' + esc(r.getAttribute('role')) + '</em>';
            }).join(' – ');
        };
        var tieId = function(i) { return 'tie-' + (i + 1); };

        // what makes an anchor or a nexus identifiable: the routes of the identifiers, and what is on them
        var routes = {};
        Array.prototype.forEach.call(root.getElementsByTagName('key'), function(key) {
            var of = key.getAttribute('of'), route = key.getAttribute('route'), parent = key.parentNode;
            if(!of || !route || !parent) return;
            var owner = parent.parentNode, label;
            if(parent.nodeName === 'attribute') label = esc(owner.getAttribute('descriptor') || '') + '.' + esc(parent.getAttribute('descriptor'));
            else if(parent.nodeName === 'role') label = (owner.nodeName === 'tie' ? tieTitle(owner, false) : esc(owner.getAttribute('descriptor'))) + ' ' + esc(parent.getAttribute('role'));
            else return;
            (routes[of] = routes[of] || {})[route] = (routes[of][route] || []).concat([{ stop: Number(key.getAttribute('stop')) || 0, label: label }]);
        });
        var identifiedBy = function(mnemonic) {
            var found = routes[mnemonic];
            if(!found) return '';
            return '<h4>Identified by</h4>' + Object.keys(found).map(function(route) {
                var steps = found[route].sort(function(a, b) { return a.stop - b.stop; }).map(function(s) { return s.label; });
                return '<p class="route"><strong>' + esc(route) + '</strong> ' + steps.join(' → ') + '</p>';
            }).join('');
        };
        var takesPart = function(mnemonic) {
            var inTies = ties.map(function(t, i) { return { t: t, i: i }; }).filter(function(x) {
                return D.children(x.t, 'role').some(function(r) { return r.getAttribute('type') === mnemonic; });
            });
            var inNexuses = nexuses.filter(function(n) { return n.getAttribute('mnemonic') !== mnemonic && D.children(n, 'role').some(function(r) { return r.getAttribute('type') === mnemonic; }); });
            if(!inTies.length && !inNexuses.length) return '';
            return '<h4>Takes part in</h4><ul class="plain">' +
                inTies.map(function(x) { return '<li><a href="#' + tieId(x.i) + '">' + tieTitle(x.t, false) + '</a></li>'; }).join('') +
                inNexuses.map(function(n) { return '<li><a href="#nexus-' + esc(n.getAttribute('mnemonic')) + '">' + esc(n.getAttribute('descriptor')) + '</a> (nexus)</li>'; }).join('') + '</ul>';
        };
        var typeCell = function(attribute) {
            var knotRange = attribute.getAttribute('knotRange');
            return knotRange ? '<span class="knotted">→ ' + link(knotRange) + '</span>' : '<code>' + esc(attribute.getAttribute('dataRange')) + '</code>';
        };
        var historyCell = function(element) {
            var range = element.getAttribute('timeRange');
            return range ? 'changes over time <small>(' + esc(range) + ')</small>' : 'never changes';
        };
        var attributesTable = function(owner) {
            var attributes = D.children(owner, 'attribute').sort(byName);
            if(!attributes.length) return '<p class="none">No attributes.</p>';
            var chronicled = attributes.some(function(a) { return a.getAttribute('chronicle'); });
            return '<table><thead><tr><th>Attribute</th><th>Values</th><th>History</th><th>About</th></tr></thead><tbody>' + attributes.map(function(a) {
                return '<tr><td><strong>' + esc(a.getAttribute('descriptor')) + '</strong> <small>' + esc(a.getAttribute('mnemonic')) + '</small></td><td>' + typeCell(a) + '</td><td>' + historyCell(a) +
                    (chronicled && a.getAttribute('chronicle') ? '<br><small>chronicle ' + esc(a.getAttribute('chronicle')) + '</small>' : '') + '</td><td>' +
                    D.prose(D.descriptionOf(a)) + D.tags(a) + '</td></tr>';
            }).join('') + '</tbody></table>';
        };
        var rolesTable = function(owner) {
            var roles = D.children(owner, 'role');
            if(!roles.length) return '';
            return '<table><thead><tr><th>Role</th><th>Is</th><th>How many</th><th>About</th></tr></thead><tbody>' + roles.map(function(r) {
                var many = r.getAttribute('identifier') === 'true';
                return '<tr><td><strong>' + esc(r.getAttribute('role')) + '</strong></td><td>' + link(r.getAttribute('type')) + '</td><td>' + (many ? 'many' : 'one') + '</td><td>' + D.prose(D.descriptionOf(r)) + '</td></tr>';
            }).join('') + '</tbody></table>';
        };
        var badges = function(element, extra) {
            var metadata = D.children(element, 'metadata')[0], bits = (extra || []).slice();
            if(metadata && metadata.getAttribute('capsule')) bits.push('capsule ' + metadata.getAttribute('capsule'));
            return bits.length ? '<p class="meta">' + bits.map(function(b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</p>' : '';
        };
        var entity = function(element, kind) {
            var mnemonic = element.getAttribute('mnemonic');
            return '<section class="entity ' + kind + '" id="' + kind + '-' + esc(mnemonic) + '"><h3>' + esc(element.getAttribute('descriptor')) + ' <small>' + esc(mnemonic) + '</small></h3>' +
                badges(element, [kind === 'nexus' ? 'nexus' : 'anchor', 'identity ' + element.getAttribute('identity')]) + D.prose(D.descriptionOf(element)) +
                attributesTable(element) + (kind === 'nexus' ? '<h4>Roles</h4>' + rolesTable(element) : '') + identifiedBy(mnemonic) + takesPart(mnemonic) + '</section>';
        };
        // where each knot is used
        var usedBy = function(mnemonic) {
            var uses = [];
            anchors.concat(nexuses).forEach(function(owner) {
                D.children(owner, 'attribute').forEach(function(a) {
                    if(a.getAttribute('knotRange') === mnemonic)
                        uses.push('<a href="#' + (owner.nodeName) + '-' + esc(owner.getAttribute('mnemonic')) + '">' + esc(owner.getAttribute('descriptor')) + '</a>.' + esc(a.getAttribute('descriptor')));
                });
            });
            nexuses.forEach(function(n) {
                D.children(n, 'role').forEach(function(r) {
                    if(r.getAttribute('type') === mnemonic)
                        uses.push('<a href="#nexus-' + esc(n.getAttribute('mnemonic')) + '">' + esc(n.getAttribute('descriptor')) + '</a> <em>' + esc(r.getAttribute('role')) + '</em>');
                });
            });
            ties.forEach(function(t, i) {
                if(D.children(t, 'role').some(function(r) { return r.getAttribute('type') === mnemonic; }))
                    uses.push('<a href="#' + tieId(i) + '">' + tieTitle(t, false) + '</a>');
            });
            return '<h4>Used by</h4><p>' + (uses.length ? uses.join(', ') : '<span class="none">nothing yet</span>') + '</p>';
        };

        var settings = D.children(root, 'metadata')[0];
        var made = [];
        if(settings && settings.getAttribute('databaseTarget')) made.push('for ' + settings.getAttribute('databaseTarget'));
        if(settings && settings.getAttribute('temporalization')) made.push({ uni: 'unitemporal', bi: 'bitemporal', crt: 'concurrent-reliance-temporal' }[settings.getAttribute('temporalization')] || settings.getAttribute('temporalization'));
        var picture = '';
        try {
            // the colours of the picture are the light ones, whatever the theme of the modeler is, for a page that is light
            var dark = document.body.classList.contains('dark');
            if(dark) document.body.classList.remove('dark');
            try { picture = Actions.modelSVG(1).source; } finally { if(dark) document.body.classList.add('dark'); }
            picture = picture.replace(/^<svg\b/, '<svg role="img" aria-label="A picture of the model" style="max-width:100%;height:auto"');
        } catch(e) { picture = ''; }
        var description = D.children(root, 'description')[0];
        var contents = [['Anchors', 'anchors', anchors.length], ['Nexuses', 'nexuses', nexuses.length], ['Ties', 'ties', ties.length], ['Knots', 'knots', knots.length]]
            .filter(function(c) { return c[2] > 0; });
        var summary = [plural(anchors.length, 'anchor', 'anchors'), nexuses.length ? plural(nexuses.length, 'nexus', 'nexuses') : null,
            plural(ties.length, 'tie', 'ties'), plural(knots.length, 'knot', 'knots')].filter(Boolean).join(', ');

        var body = '<header><h1>' + esc(name) + '</h1><p class="summary">' + esc(summary) + (made.length ? ' · ' + esc(made.join(', ')) : '') + '</p>' +
            (description ? D.prose(description.textContent) : '') + '</header>' +
            '<nav aria-label="Contents"><strong>Contents</strong> ' + contents.map(function(c) { return '<a href="#' + c[1] + '">' + c[0] + ' (' + c[2] + ')</a>'; }).join(' · ') + '</nav>' +
            (picture ? '<figure class="picture">' + picture + '<figcaption>The model as drawn in the Anchor Modeler. Squares are anchors, diamonds are ties (double outline when they change over time), circles are attributes, rounded squares are knots.</figcaption></figure>' : '') +
            (anchors.length ? '<h2 id="anchors">Anchors</h2><p class="lead">The things that the model is about. Each is told by what it has.</p>' + anchors.sort(byName).map(function(a) { return entity(a, 'anchor'); }).join('') : '') +
            (nexuses.length ? '<h2 id="nexuses">Nexuses</h2><p class="lead">Things that are events or happenings: they have attributes of their own, and are tied to anchors through roles.</p>' + nexuses.sort(byName).map(function(n) { return entity(n, 'nexus'); }).join('') : '') +
            (ties.length ? '<h2 id="ties">Ties</h2><p class="lead">How the things are related to each other. <em>One</em> and <em>many</em> tell how many of that role can be there for each combination of the others.</p>' + ties.map(function(t, i) {
                return '<section class="entity tie" id="' + tieId(i) + '"><h3>' + tieTitle(t, true) + '</h3>' + badges(t, [historyCell(t).replace(/<[^>]+>/g, '')]) + D.prose(D.descriptionOf(t)) + rolesTable(t) + '</section>';
            }).join('') : '') +
            (knots.length ? '<h2 id="knots">Knots</h2><p class="lead">Fixed sets of values that attributes and ties refer to, such as a list of genders.</p>' + knots.sort(byName).map(function(k) {
                return '<section class="entity knot" id="knot-' + esc(k.getAttribute('mnemonic')) + '"><h3>' + esc(k.getAttribute('descriptor')) + ' <small>' + esc(k.getAttribute('mnemonic')) + '</small></h3>' +
                    badges(k, ['values are ' + k.getAttribute('dataRange')]) +
                    D.prose(D.descriptionOf(k)) + usedBy(k.getAttribute('mnemonic')) + '</section>';
            }).join('') : '') +
            '<footer>Made with the Anchor Modeler ' + esc(VERSION) + ' on ' + esc(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) + '.</footer>';

        var style = 'body{font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1c1c21;background:#fff;margin:0}' +
            'main{max-width:980px;margin:0 auto;padding:32px 24px 64px}h1{font-size:2em;margin:0 0 4px}h2{margin:2.2em 0 .2em;padding-top:.6em;border-top:2px solid #c80514;font-size:1.5em}' +
            'h3{margin:0 0 .3em;font-size:1.2em}h3 small{font-weight:400;color:#62626c;font-size:.7em;margin-left:.3em}h4{margin:1.1em 0 .3em;font-size:.8em;text-transform:uppercase;letter-spacing:.05em;color:#62626c}' +
            'a{color:#b3101c;text-decoration:none}a:hover{text-decoration:underline}p{margin:.4em 0}.summary{color:#62626c;margin:0 0 1em}.lead{color:#62626c}' +
            'nav{margin:1.2em 0;padding:.7em 1em;background:#f6f6f7;border-radius:6px}nav strong{margin-right:.6em}figure.picture{margin:1.5em 0;padding:8px;border:1px solid #d6d6dc;border-radius:6px;text-align:center}' +
            'figcaption{font-size:.8em;color:#62626c;margin-top:6px}section.entity{margin:1.4em 0;padding:1em 1.2em;border:1px solid #d6d6dc;border-left:4px solid #bb5555;border-radius:6px;break-inside:avoid-page}' +
            'section.tie{border-left-color:#a8a8a8}section.knot{border-left-color:#ff8888}.meta{margin:0 0 .5em;color:#62626c;font-size:.85em}.meta span+span:before{content:"\\00b7";margin:0 .5em}' +
            'table{width:100%;border-collapse:collapse;margin:.6em 0;font-size:.92em}th{text-align:left;font-size:.78em;text-transform:uppercase;letter-spacing:.04em;color:#62626c;border-bottom:2px solid #d6d6dc;padding:4px 8px}' +
            'td{vertical-align:top;border-bottom:1px solid #e6e6ea;padding:6px 8px}td p{margin:0 0 .3em}code{font:.92em ui-monospace,"Cascadia Mono",Consolas,Menlo,monospace}.knotted{white-space:nowrap}' +
            '.tag{display:inline-block;margin:0 4px 2px 0;padding:0 6px;border:1px solid #d6d6dc;border-radius:10px;font-size:.78em;color:#62626c}.route{margin:.2em 0}.none{color:#62626c}ul.plain{margin:.2em 0;padding-left:1.2em}' +
            'footer{margin-top:3em;padding-top:1em;border-top:1px solid #d6d6dc;color:#62626c;font-size:.85em}@media print{main{padding:0}nav{display:none}a{color:inherit}h2{break-after:avoid}}';
        return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(name) + ' – documentation</title><style>' + style + '</style></head><body><main>' + body + '</main></body></html>';
    },

    // THE DIALOG --------------------------------------------------------
    dialog: function() { return document.getElementById('docView'); },
    current: '',
    show: function() {
        var dialog = Documentation.dialog();
        Documentation.current = Documentation.html();
        document.getElementById('docFrame').srcdoc = Documentation.current;
        if(!dialog.open) dialog.showModal();
        Actions.stopKeyboardEvents();
    },
    close: function() {
        var dialog = Documentation.dialog();
        if(dialog.open) dialog.close();
        document.getElementById('docFrame').srcdoc = '';
    },
    download: function() {
        Actions.downloadText(Documentation.current, Actions.modelFileName() + '.html', 'text/html');
    },
    openTab: function() {
        var url = URL.createObjectURL(new Blob([Documentation.current], { type: 'text/html;charset=utf-8' }));
        var tab = window.open(url, '_blank');
        if(!tab) Actions.notify('The browser stopped the new tab. Download the file instead.');
        setTimeout(function() { URL.revokeObjectURL(url); }, 60000);
    },
    print: function() {
        var frame = document.getElementById('docFrame');
        frame.contentWindow.focus();
        frame.contentWindow.print();
    }
};
