// derive.js: the values the SQL Server templates need that Anchor's sisulets compute with helper
// functions or small expressions at generation time. The resolver runs it after Helpers.js and
// the naming conventions, in the same scope, so it can use their helpers and iterators.
//
// Only facts are derived here, never SQL. A template reaches only what the JSON holds, so what a
// sisulet asks of a helper or an array (a count, a length) is computed here and stored as data.
//
// Every group of templates has a block of its own, so that the work on them merges cleanly.

// ---- common ----
//   attributeCount  the number of attributes of an anchor or nexus
var anchor;
while (anchor = schema.nextAnchor())
    anchor.attributeCount = anchor.attributes ? anchor.attributes.length : 0;
// ---- end common ----

// ---- tables: CreateKnots, CreateNexuses, CreateAttributes, CreateTies, equivalence, rewinders, encryption, CLR, descriptions ----
// ---- end tables ----

// ---- triggers-a: attribute and anchor triggers, restatement constraints ----
// ---- end triggers-a ----

// ---- triggers-b: nexus and tie triggers, key generators ----
//   equivalentKnotColumnName  on a knotted nexus attribute: the column that carries the equivalent of its
//                             knot, the attribute's own with the improved naming, else the knot's
(function () {
    var nexus, attribute;
    while (nexus = schema.nextNexus()) {
        while (attribute = nexus.nextAttribute()) {
            if (attribute.isKnotted())
                attribute.equivalentKnotColumnName = schema.IMPROVED ? attribute.knotEquivalentColumnName : attribute.knot.equivalentColumnName;
        }
    }
})();
// ---- end triggers-b ----

// ---- perspectives-a: anchor and nexus perspectives ----
// ---- end perspectives-a ----

// ---- perspectives-b: tie perspectives, keys ----
// ---- end perspectives-b ----

// ---- business: the business perspectives ----
// ---- end business ----

// ---- schema tracking ----
// ---- end schema tracking ----
