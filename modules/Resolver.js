// Resolver: turns the modeler's `schema` object into the plain JSON that Sisula templates render.
//
// It does not reimplement any model logic. The `schema` object is the one the modeler builds
// (Sisulator.objectify, then Helpers.js and the naming conventions run on it) and this module
// flattens it into plain acyclic data:
//
//   - keyed maps plus their id lists (knot/knots, anchor/anchors, role/roles, ...) become one
//     array of objects, so that a template can `foreach` over them;
//   - isX()/hasX() predicates are called once and stored as booleans under the same name;
//   - iterator plumbing and other functions are dropped;
//   - back-references (parent, knot, anchor, nexus, entity) become shallow summaries, which is
//     what breaks the cycles. A summary holds the scalar fields, the predicates and the
//     metadata/description of the referenced object, not its collections.
//
// `schema.attributes` is the modeler's global attribute list (`allAttributes`), in its order.
//
// ES5 and no DOM: this file also runs outside the browser (Jint, for one), and must keep doing so.
// Anything that needs the page, such as fetching the scripts to run, lives in the caller.
var Resolver = (function () {
    // Properties that point back at another entity. They are serialised as summaries.
    var REFERENCES = { parent: 1, knot: 1, anchor: 1, nexus: 1, entity: 1 };
    // Inside an entity's `keys` (route -> stops), these point at entities too.
    var KEY_REFERENCES = { attribute: 1, tie: 1, role: 1, anchor: 1 };

    function isArray(v) { return Object.prototype.toString.call(v) === '[object Array]'; }
    function isObject(v) { return v !== null && typeof v === 'object' && !isArray(v); }
    function isBlank(s) { return typeof s === 'string' && !/\S/.test(s); }
    function isPredicate(name) { return /^(is|has)[A-Z]/.test(name) && !/^(isFirst|hasMore)/.test(name); }

    function allIn(ids, map) {
        for (var i = 0; i < ids.length; i++) {
            if (typeof ids[i] !== 'string' || !Object.prototype.hasOwnProperty.call(map, ids[i])) return false;
        }
        return true;
    }

    // Finds the keyed map that an array of ids points into. The map named after the array without
    // its plural 's' wins (roles/role, knotRoles/knotRole); otherwise any sibling map holding all ids.
    function findMap(obj, name, ids) {
        var single = name === 'nexuses' ? 'nexus' : name.replace(/s$/, '');
        if (single !== name && isObject(obj[single]) && allIn(ids, obj[single])) return { key: single, map: obj[single], paired: true };
        for (var k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k) && k !== name && isObject(obj[k]) && allIn(ids, obj[k])) {
                return { key: k, map: obj[k], paired: false };
            }
        }
        return null;
    }

    function serialize(schema) {
        function serializeValue(v, inKeys) {
            if (isArray(v)) {
                var items = [];
                for (var i = 0; i < v.length; i++) items.push(serializeValue(v[i], inKeys));
                return items;
            }
            if (isObject(v)) return serializeObject(v, false, inKeys);
            return v;
        }

        function serializeObject(obj, summary, inKeys) {
            var out = {}, handled = {}, name, v;

            // Id lists become arrays of the objects they point at.
            if (!summary) {
                for (name in obj) {
                    if (!Object.prototype.hasOwnProperty.call(obj, name)) continue;
                    v = obj[name];
                    if (!isArray(v) || v.length === 0 || typeof v[0] !== 'string') continue;
                    var found = findMap(obj, name, v);
                    if (!found) continue;
                    var resolved = [];
                    for (var i = 0; i < v.length; i++) resolved.push(serializeValue(found.map[v[i]], inKeys));
                    out[name] = resolved;
                    handled[name] = true;
                    if (found.paired) handled[found.key] = true;
                }
            }

            for (name in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, name) || handled[name]) continue;
                v = obj[name];
                if (typeof v === 'function') {
                    if (isPredicate(name)) out[name] = !!v.call(obj);
                    else if (name === 'getEncryptionGroup') out.encryptionGroup = v.call(obj) || null;
                    continue;
                }
                if (v === undefined) continue;
                // Internals start with an underscore. Text content is stored the same way
                // (`_description`), but whitespace between elements is noise.
                if (name.charAt(0) === '_' && !(typeof v === 'string' && !isBlank(v))) continue;
                if (isObject(v) && (REFERENCES[name] || (inKeys && KEY_REFERENCES[name]))) {
                    out[name] = serializeObject(v, true, false);
                } else if (summary) {
                    if (!isObject(v) || name === 'metadata' || name === 'description') out[name] = serializeValue(v, false);
                } else {
                    out[name] = serializeValue(v, inKeys || name === 'keys');
                }
            }
            return out;
        }

        var result = serializeObject(schema, false, false);
        // The modeler's global attribute list, under a name that reads naturally in templates.
        result.attributes = serializeValue(schema.allAttributes, false);
        delete result.allAttributes;
        return result;
    }

    return {
        // Runs the given scripts on `schema`, in order and in one scope (so a later script can use
        // what an earlier one defined): Helpers.js, the naming conventions, and any script that
        // derives values the templates need. Then flattens the result.
        resolve: function (schema, scripts) {
            var run = new Function('schema', 'DEBUG', 'alert', 'console', scripts.join('\n'));
            run(schema, false, function () {}, { log: function () {}, error: function () {} });
            return serialize(schema);
        },
        serialize: serialize
    };
})();
