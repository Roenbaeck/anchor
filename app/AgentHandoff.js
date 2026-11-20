// AgentHandoff: the model to an agent (an AI assistant that has been asked to change it) and back.
//   Copy model for an agent    puts on the clipboard what an agent needs: what the XML is, what has to stay right in it, and the
//                              model itself without its positions (they are noise to an agent, and they come back, see below)
//   Paste model from an agent  takes what the agent answered, with or without the words around the XML, checks it (it has to be
//                              XML, a schema, and pass ModelCheck) and, if it is right, replaces the model with it. What was in
//                              the model before keeps its place, new things are put beside what they are tied to (Placement).
//                              It is a step that can be undone.
import { Model } from './Model.js';
import { Actions } from './Actions.js';
import { XmlText } from './XmlText.js';
import { XmlView } from './XmlView.js';
export var AgentHandoff = {
    instruction:
        'This is an Anchor Modeling model, in the XML format that the Anchor Modeler reads and writes (anchor.xsd). ' +
        'If you have the anchor-modeling skill, use it (https://github.com/Roenbaeck/anchor-modeling-skill).\n\n' +
        'Change the model as I ask below, and give me back the complete model as one XML code block, with nothing left out. ' +
        'Keep what I did not ask you to change, including the settings in <metadata>. These have to stay right: mnemonics are ' +
        'unique (two letters for an anchor or a nexus, three for a knot or an attribute, and an anchor, a nexus and a knot never ' +
        'share one); an attribute has either a dataRange (its own values) or a knotRange (a knot), never both; a tie has at least ' +
        'two roles that are anchors or nexuses. Positions (<layout>) are left out: the modeler places new things itself.\n\n' +
        'What I want changed:\n\n',
    // the model without its positions, as text
    modelText: function() {
        var doc = Model.toXML(false).cloneNode(true);
        Array.prototype.slice.call(doc.getElementsByTagName('layout')).forEach(function(layout) { layout.parentNode.removeChild(layout); });
        return XmlText.pretty(doc);
    },
    text: function() {
        return AgentHandoff.instruction + '\n```xml\n' + AgentHandoff.modelText() + '```\n';
    },
    copy: function() {
        Actions.copyText(AgentHandoff.text()).then(function(copied) {
            Actions.notify(copied ? 'Copied the model, with what an agent needs to change it. Paste it into the conversation and say what you want.' :
                'The browser would not copy. Use Generate > XML code and copy from there.');
        });
    },

    // what an agent gave back: the schema element, whatever text is around it
    extract: function(text) {
        var found = /<schema[\s>][\s\S]*<\/schema>/.exec(text);
        return found ? found[0] : text.trim();
    },
    describe: function(doc) {
        var count = function(name) { return doc.documentElement.getElementsByTagName(name).length; };
        var part = function(n, one, many) { return n + ' ' + (n === 1 ? one : many); };
        return 'A model with ' + part(count('anchor'), 'anchor', 'anchors') + ', ' + part(count('nexus'), 'nexus', 'nexuses') + ', ' +
            part(count('tie'), 'tie', 'ties') + ', ' + part(count('knot'), 'knot', 'knots') + ' and ' + part(count('attribute'), 'attribute', 'attributes') + '.';
    },

    // THE DIALOG --------------------------------------------------------
    dialog: function() { return document.getElementById('agentPaste'); },
    timer: null,
    checked: null,      // what the text was read as: { doc, problems }
    init: function() {
        var dialog = AgentHandoff.dialog();
        document.getElementById('agentText').addEventListener('input', function() {
            clearTimeout(AgentHandoff.timer);
            AgentHandoff.say('Checking...', []);
            document.getElementById('agentReplace').disabled = true;
            AgentHandoff.timer = setTimeout(AgentHandoff.check, 300);
        }, false);
        dialog.addEventListener('click', function(event) { if(event.target === dialog) AgentHandoff.close(); }, false);
    },
    open: function() {
        var dialog = AgentHandoff.dialog();
        if(!dialog.open) dialog.showModal();
        Actions.stopKeyboardEvents(); // the keys of the modeler must not act on what is pasted
        var text = document.getElementById('agentText');
        text.value = '';
        AgentHandoff.checked = null;
        document.getElementById('agentReplace').disabled = true;
        AgentHandoff.say('Waiting for the model.', []);
        text.focus();
    },
    close: function() {
        clearTimeout(AgentHandoff.timer);
        var dialog = AgentHandoff.dialog();
        if(dialog.open) dialog.close();
    },
    // the clipboard is read where the browser allows it; where it does not, Ctrl+V in the text does the same
    readClipboard: function() {
        var text = document.getElementById('agentText');
        if(!(navigator.clipboard && navigator.clipboard.readText)) { text.focus(); AgentHandoff.say('This browser cannot be asked for the clipboard. Press Ctrl+V in the text.', []); return; }
        navigator.clipboard.readText().then(function(pasted) {
            text.value = pasted;
            AgentHandoff.check();
        }, function() { text.focus(); AgentHandoff.say('The browser would not give the clipboard. Press Ctrl+V in the text.', []); });
    },
    say: function(status, problems) {
        document.getElementById('agentStatus').textContent = status;
        var list = document.getElementById('agentProblems');
        list.textContent = '';
        problems.forEach(function(problem) {
            var li = document.createElement('li');
            li.textContent = problem;
            list.appendChild(li);
        });
        AgentHandoff.dialog().classList.toggle('bad', problems.length > 0);
    },
    check: function() {
        var text = document.getElementById('agentText').value;
        if(!text.trim()) { AgentHandoff.checked = null; AgentHandoff.say('Waiting for the model.', []); document.getElementById('agentReplace').disabled = true; return; }
        var checked = XmlText.check(AgentHandoff.extract(text));
        AgentHandoff.checked = checked;
        if(checked.problems.length) {
            var n = checked.problems.length;
            AgentHandoff.say((n === 1 ? 'One problem' : n + ' problems') + ', so the model cannot be replaced yet.', checked.problems);
            document.getElementById('agentReplace').disabled = true;
        }
        else {
            AgentHandoff.say(AgentHandoff.describe(checked.doc) + ' Replacing the model can be undone.', []);
            document.getElementById('agentReplace').disabled = false;
        }
    },
    replace: function() {
        var checked = AgentHandoff.checked;
        if(!checked || checked.problems.length || !checked.doc) return;
        if(XmlView.apply(checked.doc, { centre: true })) {
            AgentHandoff.close();
            Actions.notify('The model was replaced. Undo brings back the one that was here.');
        }
        else
            AgentHandoff.say('The model could not be built from the text, and has not been changed.', [XmlView.lastError || 'unknown error']);
    }
};
