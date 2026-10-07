// A minimal DOM, built from a neutral tree, that is just big enough for the Anchor Modeler's
// Sisulator.objectify and MAP key functions. It is for hosts that have no DOM of their own: the
// generator that runs in Snowflake (tools/build-snowflake-generator.ps1) and the tests under Jint in the
// sisula repository. modules/XmlTree.js makes the tree from XML text. ES5, so it runs under Jint as well
// as in Node.
//
// Neutral tree: an element is { t: 1, n: name, a: [[name, value], ...], c: [children] }
// and a text node is { t: 3, v: text }. Any other node type is left out.
//
// Only the XPath that MAP.key.tie uses, '*[@attribute]', is supported; anything else throws.

var XPathResult = { ORDERED_NODE_ITERATOR_TYPE: 5 };

function buildDom(tree) {
    function make(n, parent) {
        var node = { parentNode: parent, firstChild: null, nextSibling: null };
        if (n.t === 3) {
            node.nodeType = 3;
            node.nodeName = '#text';
            node.nodeValue = n.v;
            node.attributes = { length: 0, item: function () { return null; } };
            return node;
        }
        node.nodeType = 1;
        node.nodeName = n.n;
        node.nodeValue = null;
        var attrs = [];
        for (var i = 0; i < n.a.length; i++) {
            attrs.push({ nodeName: n.a[i][0], nodeValue: n.a[i][1] });
        }
        node.attributes = { length: attrs.length, item: function (j) { return attrs[j]; } };
        node.getAttribute = function (name) {
            for (var k = 0; k < attrs.length; k++) if (attrs[k].nodeName === name) return attrs[k].nodeValue;
            return null;
        };
        node.childNodes = [];
        var previous = null;
        for (var c = 0; c < n.c.length; c++) {
            var child = make(n.c[c], node);
            node.childNodes.push(child);
            if (previous) previous.nextSibling = child; else node.firstChild = child;
            previous = child;
        }
        return node;
    }

    var root = make(tree, null);
    return {
        documentElement: root,
        evaluate: function (expression, context) {
            var m = /^\*\[@(\w+)\]$/.exec(expression);
            if (!m) throw new Error('dom-facade: unsupported XPath: ' + expression);
            var hits = [];
            for (var i = 0; i < context.childNodes.length; i++) {
                var child = context.childNodes[i];
                if (child.nodeType === 1 && child.getAttribute(m[1]) !== null) hits.push(child);
            }
            var index = 0;
            return { iterateNext: function () { return index < hits.length ? hits[index++] : null; } };
        }
    };
}
