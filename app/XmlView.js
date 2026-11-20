// XmlView: the XML of the model, as text in the panel, that can be edited. It goes both ways: a change in the model shows in the
// text, and a change in the text is read after a moment, checked (it has to be XML, a schema, and pass ModelCheck, the rules a
// generator depends on), and when it is right it becomes the model, as a step that can be undone. Text that is not right is
// left where it is and the problems are listed, so the model is never replaced with something that does not work.
import { Model } from './Model.js';
import { EventHandler } from './EventHandler.js';
import { DrawingEngine } from './DrawingEngine.js';
import { XmlText } from './XmlText.js';
export var XmlView = {
    isShown: false,
    dirty: false,       // the text has been typed in since it was made from the model
    applying: false,    // the model is being replaced from the text, which is not a reason to make the text again
    timer: null,
    delay: 800,
    text: function() { return document.getElementById('xmlText'); },
    init: function() {
        var text = XmlView.text();
        text.addEventListener('input', function() {
            XmlView.dirty = true;
            XmlView.say('Checking...', []);
            clearTimeout(XmlView.timer);
            XmlView.timer = setTimeout(XmlView.read, XmlView.delay);
        }, false);
        // a tab key in the text is a tab, not a move to the next control, as in any editor; Escape leaves the text
        text.addEventListener('keydown', function(event) {
            if(event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
                event.preventDefault();
                document.execCommand('insertText', false, '  ');
            }
            else if(event.key === 'Escape') { text.blur(); event.stopPropagation(); }
        }, false);
        Model.on('changed', XmlView.fromModel);
        Model.on('replaced', XmlView.fromModel);
    },
    // the panel shows this view, or no longer does
    show: function(shown) {
        XmlView.isShown = shown;
        if(shown) { XmlView.dirty = false; XmlView.fromModel(); }
    },
    // the text made from the model, unless it is being typed in
    fromModel: function() {
        if(!XmlView.isShown || XmlView.applying) return;
        var text = XmlView.text();
        if(XmlView.dirty && document.activeElement === text) return;
        var pretty = XmlText.pretty(Model.toXML(false));
        if(text.value !== pretty) text.value = pretty;
        XmlView.dirty = false;
        clearTimeout(XmlView.timer);
        XmlView.say('The text is the model.', []);
    },
    say: function(status, problems) {
        document.getElementById('xmlStatus').textContent = status;
        var list = document.getElementById('xmlProblems');
        list.textContent = '';
        problems.forEach(function(problem) {
            var li = document.createElement('li');
            li.textContent = problem;
            list.appendChild(li);
        });
        document.getElementById('xmlView').classList.toggle('bad', problems.length > 0);
    },
    // the text is read: if it is right it becomes the model
    read: function() {
        var checked = XmlText.check(XmlView.text().value);
        if(checked.problems.length) {
            var n = checked.problems.length;
            XmlView.say(n === 1 ? 'One problem. The model has not been changed.' : n + ' problems. The model has not been changed.', checked.problems);
            return false;
        }
        return XmlView.apply(checked.doc);
    },
    // Replaces the model with the document, as a step in its history. If that fails the model is put back as it was.
    apply: function(doc) {
        var before = Model.toXML(false), confirmed = window.confirm;
        XmlView.applying = true;
        // the text may change the settings of the model, which the person has just done on purpose
        window.confirm = function() { return true; };
        try {
            EventHandler.clearSelection();
            Model.fromXML(doc);
            Model.recordState();
            DrawingEngine.start(true);
            XmlView.dirty = false;
            XmlView.say('Applied to the model.', []);
            return true;
        } catch(e) {
            try { Model.fromXML(before); DrawingEngine.start(false); } catch(again) { }
            XmlView.say('The model could not be built from the text, and has not been changed.', [String(e && e.message || e)]);
            return false;
        } finally {
            window.confirm = confirmed;
            XmlView.applying = false;
        }
    },
    // the text is put on the clipboard; if the browser will not let a page write to it, the text is selected for Ctrl+C
    copy: function() {
        var text = XmlView.text();
        var done = function() { XmlView.say('Copied.', []); };
        var selected = function() {
            text.select();
            var copied = false;
            try { copied = document.execCommand('copy'); } catch(e) { }
            XmlView.say(copied ? 'Copied.' : 'The browser would not copy. The text is selected: press Ctrl+C.', []);
        };
        if(navigator.clipboard && navigator.clipboard.writeText)
            navigator.clipboard.writeText(text.value).then(done, selected);
        else
            selected();
    }
};
