// ModelStore: models that are kept in this browser, each under a name, with a list that shows the most recently saved first.
// (The model that is being worked on is also kept when the page is left, as before; this is for several models.) They live in
// localStorage, which is the browser's and nobody else's: it is not sent anywhere, and it goes if the browser's data is cleared.
// A browser keeps about 5 MB there, which is some dozens of models, so a model that does not fit is told, not lost.
import { Model } from './Model.js';
import { Actions } from './Actions.js';
export var ModelStore = {
    key: 'anchor-models',
    read: function() {
        try {
            var stored = JSON.parse(window.localStorage.getItem(ModelStore.key) || '{}');
            return stored && typeof stored === 'object' ? stored : {};
        } catch(e) { return {}; }
    },
    // false if the browser would not keep it (it is full, or does not keep anything)
    write: function(models) {
        try { window.localStorage.setItem(ModelStore.key, JSON.stringify(models)); return true; }
        catch(e) { return false; }
    },
    // the names, most recently saved first
    names: function() {
        var models = ModelStore.read();
        return Object.keys(models).sort(function(a, b) { return models[a].saved < models[b].saved ? 1 : -1; });
    },
    summary: function(doc) {
        var count = function(name) { return doc.documentElement.getElementsByTagName(name).length; };
        return { anchors: count('anchor'), nexuses: count('nexus'), ties: count('tie'), knots: count('knot'), attributes: count('attribute') };
    },
    // keeps the model that is being worked on under the name; true if it was kept
    save: function(name) {
        name = (name || '').trim();
        if(!name) return false;
        var doc = Model.toXML(false), models = ModelStore.read();
        models[name] = { saved: new Date().toISOString(), xml: new XMLSerializer().serializeToString(doc), summary: ModelStore.summary(doc) };
        return ModelStore.write(models);
    },
    remove: function(name) {
        var models = ModelStore.read();
        delete models[name];
        ModelStore.write(models);
    },
    // makes the model of a name the model that is worked on
    open: function(name) {
        var entry = ModelStore.read()[name];
        if(!entry) return false;
        var doc = new DOMParser().parseFromString(entry.xml, 'application/xml');
        if(doc.getElementsByTagName('parsererror').length) return false;
        Actions.lastLocalFilename = name;
        Actions._applyLoadedModel(doc, false);
        return true;
    },

    // THE DIALOG --------------------------------------------------------
    dialog: function() { return document.getElementById('modelStore'); },
    init: function() {
        var dialog = ModelStore.dialog(), field = document.getElementById('storeName');
        field.addEventListener('input', ModelStore.render, false);
        field.addEventListener('keydown', function(event) { if(event.key === 'Enter') { event.preventDefault(); ModelStore.saveFromDialog(); } }, false);
        dialog.addEventListener('click', function(event) {
            if(event.target === dialog) return ModelStore.close();
            var button = event.target.closest('button[data-store]');
            if(!button) return;
            var name = button.getAttribute('data-name'), what = button.getAttribute('data-store');
            if(what === 'open') {
                if(ModelStore.open(name)) { ModelStore.close(); Actions.notify('Opened ' + name + '.'); }
                else ModelStore.say('That model could not be read.', true);
            }
            else if(what === 'delete') {
                // the first press asks, the second does it
                if(button.getAttribute('data-sure')) { ModelStore.remove(name); ModelStore.render(); ModelStore.say('Removed ' + name + '.'); }
                else {
                    button.setAttribute('data-sure', 'true');
                    button.textContent = 'Sure?';
                    setTimeout(function() { if(button.isConnected) { button.removeAttribute('data-sure'); button.textContent = 'Remove'; } }, 3000);
                }
            }
        }, false);
    },
    show: function() {
        var dialog = ModelStore.dialog();
        if(!dialog.open) dialog.showModal();
        Actions.stopKeyboardEvents();
        var field = document.getElementById('storeName');
        field.value = Actions.modelFileName() === 'Model' ? '' : Actions.modelFileName();
        ModelStore.say('', false);
        ModelStore.render();
        field.focus();
        field.select();
    },
    close: function() {
        var dialog = ModelStore.dialog();
        if(dialog.open) dialog.close();
    },
    say: function(text, bad) {
        var status = document.getElementById('storeStatus');
        status.textContent = text;
        ModelStore.dialog().classList.toggle('bad', !!bad);
    },
    saveFromDialog: function() {
        var field = document.getElementById('storeName'), name = field.value.trim();
        if(!name) { ModelStore.say('Give the model a name to keep it under.', true); field.focus(); return; }
        if(ModelStore.save(name)) {
            ModelStore.say('Kept as ' + name + '.');
            ModelStore.render();
        }
        else ModelStore.say('The browser would not keep it: its storage for this page is full. Remove a model, or save the model to a file.', true);
    },
    when: function(iso) {
        var d = new Date(iso);
        return isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    },
    render: function() {
        var list = document.getElementById('storeList'), models = ModelStore.read(), names = ModelStore.names();
        var typed = document.getElementById('storeName').value.trim();
        document.getElementById('storeSave').textContent = typed && models[typed] ? 'Replace' : 'Keep';
        list.textContent = '';
        document.getElementById('storeEmpty').hidden = names.length > 0;
        names.forEach(function(name) {
            var entry = models[name], li = document.createElement('li'), text = document.createElement('div'), title = document.createElement('strong'), meta = document.createElement('small');
            title.textContent = name;
            var s = entry.summary || {};
            var many = function(n, one, more) { return n + ' ' + (n === 1 ? one : more); };
            meta.textContent = [many(s.anchors || 0, 'anchor', 'anchors'), s.nexuses ? many(s.nexuses, 'nexus', 'nexuses') : null, many(s.ties || 0, 'tie', 'ties'), many(s.knots || 0, 'knot', 'knots'), ModelStore.when(entry.saved)].filter(Boolean).join(' \u00b7 ');
            text.appendChild(title);
            text.appendChild(meta);
            li.appendChild(text);
            ['open', 'delete'].forEach(function(what) {
                var button = document.createElement('button');
                button.type = 'button';
                button.setAttribute('data-store', what);
                button.setAttribute('data-name', name);
                button.textContent = what === 'open' ? 'Open' : 'Remove';
                li.appendChild(button);
            });
            list.appendChild(li);
        });
    }
};
