// XmlTree: a small XML reader for Anchor models. It exists for hosts that have no DOMParser, such as a
// JavaScript function in Snowflake, and produces the neutral tree that buildDom (modules/DomFacade.js) turns
// into the DOM that Sisulator.objectify reads:
//
//   an element is { t: 1, n: name, a: [[name, value], ...], c: [children] }
//   a text node is { t: 3, v: text }, and whitespace between elements is kept, as a browser keeps it
//
// It reads elements, attributes and text, takes CDATA as text, decodes the five predefined entities and
// numeric character references, and skips the XML declaration, comments, processing instructions and a
// DOCTYPE without an internal subset. It does not read namespaces (a prefix is part of the name), entities
// that a DTD defines, or anything else that an Anchor model does not use. ES5, no DOM.
var XmlTree = (function () {
    var ENTITIES = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };

    function fail(text, at, message) {
        var line = 1, column = 1;
        for (var i = 0; i < at && i < text.length; i++) {
            if (text.charAt(i) === '\n') { line++; column = 1; } else column++;
        }
        throw new Error('XML, line ' + line + ' column ' + column + ': ' + message);
    }

    function decode(text, value, at) {
        return value.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/g, function (whole, name) {
            if (name.charAt(0) === '#') {
                var code = name.charAt(1) === 'x' ? parseInt(name.substring(2), 16) : parseInt(name.substring(1), 10);
                if (code > 0xFFFF) {
                    code -= 0x10000;
                    return String.fromCharCode(0xD800 + (code >> 10), 0xDC00 + (code & 0x3FF));
                }
                return String.fromCharCode(code);
            }
            if (Object.prototype.hasOwnProperty.call(ENTITIES, name)) return ENTITIES[name];
            fail(text, at, 'the entity &' + name + '; is not defined');
        });
    }

    function parse(source) {
        var text = String(source).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
        var i = 0, root = null, stack = [];
        var attributePattern = /\s*([^\s=\/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

        function add(node) {
            if (stack.length === 0) {
                if (node.t === 1) {
                    if (root) fail(text, i, 'more than one root element');
                    root = node;
                }
                return;   // text outside the root element is ignored
            }
            stack[stack.length - 1].c.push(node);
        }

        while (i < text.length) {
            var lt = text.indexOf('<', i);
            if (lt < 0) lt = text.length;
            if (lt > i) {
                if (stack.length > 0) add({ t: 3, v: decode(text, text.substring(i, lt), i) });
                i = lt;
                continue;
            }
            if (text.substr(i, 4) === '<!--') {
                var endComment = text.indexOf('-->', i + 4);
                if (endComment < 0) fail(text, i, 'a comment is not closed');
                i = endComment + 3;
            } else if (text.substr(i, 9) === '<![CDATA[') {
                var endCdata = text.indexOf(']]>', i + 9);
                if (endCdata < 0) fail(text, i, 'a CDATA section is not closed');
                if (stack.length > 0) add({ t: 3, v: text.substring(i + 9, endCdata) });
                i = endCdata + 3;
            } else if (text.substr(i, 2) === '<?') {
                var endPi = text.indexOf('?>', i + 2);
                if (endPi < 0) fail(text, i, 'a processing instruction is not closed');
                i = endPi + 2;
            } else if (text.substr(i, 2) === '<!') {
                var endDoctype = text.indexOf('>', i + 2);
                if (endDoctype < 0) fail(text, i, 'a declaration is not closed');
                i = endDoctype + 1;
            } else if (text.charAt(i + 1) === '/') {
                var endClose = text.indexOf('>', i + 2);
                if (endClose < 0) fail(text, i, 'an end tag is not closed');
                var closing = text.substring(i + 2, endClose).replace(/\s+$/, '');
                if (stack.length === 0 || stack[stack.length - 1].n !== closing) {
                    fail(text, i, 'the end tag </' + closing + '> does not match ' + (stack.length ? '<' + stack[stack.length - 1].n + '>' : 'any open element'));
                }
                stack.pop();
                i = endClose + 1;
            } else {
                // a start tag: find its end, outside the quotes of the attribute values
                var j = i + 1, quote = '';
                while (j < text.length) {
                    var ch = text.charAt(j);
                    if (quote) { if (ch === quote) quote = ''; }
                    else if (ch === '"' || ch === "'") quote = ch;
                    else if (ch === '>') break;
                    j++;
                }
                if (j >= text.length) fail(text, i, 'a start tag is not closed');
                var inner = text.substring(i + 1, j);
                var selfClosing = /\/$/.test(inner);
                if (selfClosing) inner = inner.substring(0, inner.length - 1);
                var nameMatch = /^([^\s\/>]+)/.exec(inner);
                if (!nameMatch) fail(text, i, 'a start tag has no name');
                var element = { t: 1, n: nameMatch[1], a: [], c: [] };
                var rest = inner.substring(nameMatch[1].length);
                attributePattern.lastIndex = 0;
                var consumed = 0, match;
                while ((match = attributePattern.exec(rest)) !== null) {
                    if (match.index !== consumed) break;
                    var raw = match[2] !== undefined && match[2] !== '' ? match[2] : (match[3] !== undefined ? match[3] : (match[2] || ''));
                    element.a.push([match[1], decode(text, raw.replace(/[\t\n]/g, ' '), i)]);
                    consumed = attributePattern.lastIndex;
                }
                if (rest.substring(consumed).replace(/\s+/g, '') !== '') fail(text, i, 'the attributes of <' + element.n + '> are not well formed');
                add(element);
                if (!selfClosing) stack.push(element);
                i = j + 1;
            }
        }
        if (stack.length > 0) fail(text, text.length, 'the element <' + stack[stack.length - 1].n + '> is not closed');
        if (!root) fail(text, 0, 'there is no root element');
        return root;
    }

    return { parse: parse };
})();
