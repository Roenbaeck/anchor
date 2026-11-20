// XmlText: the model as text a person can read and edit, and the other way: text that is checked before it is believed.
export var XmlText = {
    escape: function(text, attribute) {
        var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return attribute ? escaped.replace(/"/g, '&quot;').replace(/\r?\n/g, '&#10;').replace(/\t/g, '&#9;') : escaped;
    },
    // a document written with two spaces for each level: an element on a line of its own, with its attributes after it, and
    // an element with nothing but text (a description) on one line
    pretty: function(doc) {
        var out = [];
        function write(element, depth) {
            var pad = new Array(depth + 1).join('  '), open = '<' + element.nodeName, i, child;
            for(i = 0; i < element.attributes.length; i++)
                open += ' ' + element.attributes[i].name + '="' + XmlText.escape(element.attributes[i].value, true) + '"';
            var children = Array.prototype.slice.call(element.childNodes).filter(function(n) {
                return n.nodeType === 1 || (n.nodeType === 3 || n.nodeType === 4) && n.nodeValue.trim() !== '';
            });
            if(children.length === 0) { out.push(pad + open + '/>'); return; }
            if(children.every(function(n) { return n.nodeType !== 1; })) {
                out.push(pad + open + '>' + XmlText.escape(children.map(function(n) { return n.nodeValue; }).join('')) + '</' + element.nodeName + '>');
                return;
            }
            out.push(pad + open + '>');
            for(i = 0; child = children[i]; i++) {
                if(child.nodeType === 1) write(child, depth + 1);
                else out.push(pad + '  ' + XmlText.escape(child.nodeValue.trim()));
            }
            out.push(pad + '</' + element.nodeName + '>');
        }
        write(doc.documentElement, 0);
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + out.join('\n') + '\n';
    },
    // Reads text as a model: { doc, problems }. The problems are what is wrong with it (it is not XML, it is not a schema, or
    // ModelCheck finds what a generator would stumble on); the document is there if it could be read as XML at all.
    check: function(text) {
        var doc = new DOMParser().parseFromString(text, 'application/xml');
        var failure = doc.getElementsByTagName('parsererror')[0];
        if(failure) {
            var message = failure.textContent.replace(/\s+/g, ' ').trim().replace(/^error on line/i, 'Line');
            return { doc: null, problems: [message.length > 220 ? message.slice(0, 220) + '...' : message] };
        }
        var problems = typeof ModelCheck !== 'undefined' ? ModelCheck.problems(doc.documentElement) : [];
        if(!problems.length && doc.documentElement.nodeName !== 'schema')
            problems = ['the XML has to start with a schema element'];
        return { doc: doc, problems: problems };
    }
};
