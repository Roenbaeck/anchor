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
// ---- end triggers-b ----

// ---- perspectives-a: anchor and nexus perspectives ----
// ---- end perspectives-a ----

// ---- perspectives-b: tie perspectives, keys ----
// ---- end perspectives-b ----

// ---- business: the business perspectives ----
// ---- end business ----

// ---- schema tracking ----
//   serialization.chunks  the model's XML (serialization._serialization) cut into pieces of at most 3000
//                         characters, as objects with a text. SQL Server reads a string value from JSON
//                         as at most 4000 characters (JSON_VALUE), so the whole text, which is tens of
//                         thousands, can only reach a template in pieces. A piece never ends inside a
//                         surrogate pair.
if (schema.serialization && typeof schema.serialization._serialization === 'string') {
    var serializedText = schema.serialization._serialization, serializedPieces = [], serializedFrom = 0, serializedTo;
    while (serializedFrom < serializedText.length) {
        serializedTo = Math.min(serializedFrom + 3000, serializedText.length);
        if (serializedTo < serializedText.length && /[\uD800-\uDBFF]/.test(serializedText.charAt(serializedTo - 1)))
            serializedTo--;
        serializedPieces.push({ text: serializedText.substring(serializedFrom, serializedTo) });
        serializedFrom = serializedTo;
    }
    schema.serialization.chunks = serializedPieces;
}
// ---- end schema tracking ----
