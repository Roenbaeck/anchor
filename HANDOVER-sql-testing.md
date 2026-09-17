# Handover: automated testing for generated SQL

**Status:** planning only — nothing implemented yet.
**Written on:** 2026-09-17, Windows corporate laptop (no Node/Python/Docker available).
**Resume on:** macOS developer laptop.
**Baseline commit:** `8ee44c7` "Snowflake uni generates properly", branch `master`, working tree clean.

## Why this exists

Multiple database targets (SQL Server, PostgreSQL, Oracle, Vertica, Snowflake, BigQuery) now
generate a lot of SQL, and there is no automated way to tell whether a change to one target
breaks another, or whether a newly ported target behaves the same as the reference one. This
file captures what was learned about the codebase and the plan that came out of it, so work can
restart without re-deriving any of it.

## Findings about the current architecture

These were verified by reading the code on 2026-09-17. Re-check if the code has moved since.

### Generation is already a pure function

`Sisulator.sisulate(xml, map, directives)` in `modules/Sisulator.js:53` takes a model XML
document, the `MAP` object, and an async `directives(name)` callback, and returns the generated
SQL as a string. That callback is the **only** I/O in the whole pipeline — in the browser it is
`Actions.getDirectives` (`index.html:5886`), which `fetch`es the `.directive` file when called
with no argument and an individual sisula when called with a filename.

### Generation is deterministic

No `new Date`, `Date.now`, `Math.random`, or `getTime()` anywhere under `SQL/` or `modules/`.
Same inputs produce byte-identical output. This is what makes golden-file testing viable — do
not introduce nondeterminism into generated output without revisiting the plan below.

### The directive file is self-contained

Each `<Target>_<temporality>.directive` lists `SQL/Helpers.js` and `SQL/NamingConvention.js` as
its first entries. Those are themselves sisulas, `eval`'d into the same scope as everything that
follows, so a harness does not need to know anything about load order or module wiring — it just
resolves names to file contents.

### Browser coupling is small and enumerable

- `DOMParser` — to parse the model XML.
- `xml.evaluate` / `XPathResult` — used **only** in the `tie` key function, `modules/Map.js:22`.
- `alert()` — four calls in `SQL/NamingConvention.js` (lines 36, 184, 193, 359). In Node these
  would throw `ReferenceError`, producing a confusing failure instead of a clear message.
- A `DEBUG` global, read in `modules/Sisulator.js` for diagnostic logging.

jsdom (recent versions ship XPath support) covers the first two directly; `@xmldom/xmldom` plus
the `xpath` package also works but needs a small shim for `xml.evaluate`/`XPathResult`. Verify
whichever is chosen actually provides `document.evaluate` before committing to it.

### Settings reach the generator through the model XML

Sisulas never read `Defaults` directly (a grep for `Defaults.` under `SQL/` returns nothing).
Instead, `index.html:401-403` stamps every key of `Defaults` onto a `<metadata>` element on the
model XML at serialization time, and the sisulas read `schema.metadata.*`. The most-used ones
are `metadataType`, `chronon`, `positingRange`, `encapsulation`, `positorSuffix`,
`equivalentRange`, `reliabilityRange`, and `now`.

This matters twice over: it is the knob the test matrix turns, **and** it is a piece of logic
living inside `index.html` that a harness would otherwise have to re-implement and then drift
from.

### `Helpers.js` carries iterator state on `schema`

`SQL/Helpers.js` attaches `schema._iterator.*` counters and `nextKnot()` / `hasMoreKnots()` style
helpers that mutate as sisulas walk the model. Fine for a harness that replays the same sequence
the browser does, but worth remembering if anything ever runs sisulas out of order or in
parallel against a shared `schema`.

## Plan

Layers are ordered so each one is useful on its own. Suggested build order is at the end.

### Layer 0 — headless generation (enabler)

A `bin/generate.mjs` of roughly 60 lines: jsdom for the DOM, a `directives` callback reading from
disk instead of `fetch`, a `DEBUG` global, an `alert` shim.

```
node bin/generate.mjs --model example.xml --target BigQuery --temporality uni \
     --set naming=improved --set triggers=false
```

Two small refactors keep the harness honest rather than a parallel implementation:

- **Extract the settings stamping** from `index.html:401-403` into `modules/Defaults.js` (e.g.
  `Defaults.applyTo(xmlDoc)`) and call it from both the app and the harness.
- **Replace the four `alert()` calls** in `SQL/NamingConvention.js` with a reporting hook, so
  headless runs fail with a real message.

Side benefit: this gives the project a CLI, which it has never had.

### Layer 1 — golden files (best value per hour)

Commit expected output to `SQL/Tests/expected/<target>/<temporality>/<profile>/<model>.sql` and
diff in CI. No database, runs in seconds, every sisula change becomes a reviewable diff.

Matrix = models × targets × temporalizations × setting profiles. Keep it small on purpose:

- **Models:** `example.xml`, plus one new "kitchen sink" model exercising every construct exactly
  once — knotted historized attribute, knot role, three-way tie, nexus, deletable, equivalent,
  checksum, encryption group, natural-key attributes.
- **Profiles:** not the full cross-product of the ~40 `Defaults` flags. Pin about five named
  profiles (defaults, all-features-on, all-off, `privacy=Encrypt`, `naming=legacy`); if more
  coverage is wanted later, generate pairwise combinations rather than exhaustive ones.

Give the runner an `--update` flag so regeneration is one command.

Specific payoff for the multi-target work: diffing `expected/BigQuery/uni/…` against
`expected/SQLServer/uni/…` makes port divergences visible, including unintended ones.

### Layer 2 — dialect parsing (no database)

Feed every generated statement to a dialect-aware parser; a parse failure is a test failure.
`sqlglot` covers `bigquery`, `snowflake`, `postgres`, `tsql`, `oracle`. Vertica is unsupported —
approximate with `postgres`.

Known limit: sqlglot handles DDL and queries well but is weak on procedural code, so the
trigger-heavy targets only get partial coverage here. Still worth it for the "this clause does
not exist in BigQuery" class of bug.

### Layer 3 — DDL execution against real engines

Running the generated script and dropping it again catches most of what Layer 2 cannot.

- **Docker:** PostgreSQL, SQL Server, Oracle Free, Vertica CE.
- **BigQuery:** no official emulator; `goccy/bigquery-emulator` handles a lot of DDL, or use a
  real sandbox dataset.
- **Snowflake:** no emulator; needs a real account, a trial is enough.

Run on pull requests rather than every push; put cloud targets on a nightly job so credentials
and quota stay off the critical path.

### Layer 4 — cross-target behavioral conformance (the real goal)

This is the layer that answers "does BigQuery behave like SQL Server?", and nothing above
substitutes for it. Write the suite **once, target-neutrally**, run it against every engine:

```yaml
- given: [{anchor: AC, attribute: NAM, value: "Alice", at: "2020-01-01"}, ...]
  when:  {perspective: lAC_Actor}       # or a point-in-time / rewinder query
  then:  [{AC_NAM_Actor_Name: "Alice"}]
```

The harness turns each spec into target-specific INSERTs and SELECTs using the same
`SQL/NamingConvention.js` the generator uses, runs them, and compares result sets.

**Critical discipline: assert on returned rows, never on SQL text.** That is what makes one
suite portable across six dialects.

`SQL/Tests/InsertAndVerifyExample.sql` is a good seed — it is hand-written T-SQL for a single
target, which does not scale to six, but its scenarios are worth lifting into specs. Prioritize
the semantics that are hard to port: historization boundaries, restatement rejection,
point-in-time perspectives, rewinders, tie cardinality enforcement.

### Layer 5 — later, if it earns its place

Model fuzzing against `anchor.xsd` with metamorphic invariants: generating twice yields identical
output; create-then-drop leaves a clean schema; adding an unrelated anchor does not perturb other
objects' DDL. Only after 0–4 are paying rent.

## Suggested build order

**0 → 1 → 4 (PostgreSQL + SQL Server only at first) → 2 → 3 for the cloud targets.**

Layers 0 and 1 together are roughly a day's work and immediately make the BigQuery port
reviewable. Layer 4 is the real investment; start narrow — two engines, a dozen scenarios —
rather than designing the whole spec format up front.

## CI structure

Keep generation and execution in separate tiers:

- **Every push:** Layers 1–2, under a minute, no infrastructure.
- **Pull requests:** Layer 3 via Docker.
- **Nightly:** Snowflake and BigQuery.

Note that `.github/` currently contains only `copilot-instructions.md` — there are no workflows
yet, so the CI side is greenfield.

## Open questions to settle on the Mac

1. jsdom or `@xmldom/xmldom` + `xpath`? Decide by checking which actually provides working
   `document.evaluate` for the `tie` key function in `modules/Map.js:22`.
2. Test runner: plain `node --test`, or Vitest/Jest? The project has no `package.json` today, so
   this is a from-scratch choice.
3. Does the golden-file corpus go in this repo or a sibling one? Volume could get large across
   6 targets × 3 temporalizations × 5 profiles × 2 models.
4. Which Snowflake/BigQuery credentials are available for CI, and who owns them?
5. Should `bin/generate.mjs` be a supported user-facing CLI, or internal to tests only? Affects
   how much attention its argument handling and error messages deserve.

## First actions when picking this up

1. `git pull`, confirm the findings above still hold (the file:line references especially).
2. Create `package.json`, add the DOM library and test runner chosen in question 1–2.
3. Write `bin/generate.mjs`; verify its output for `example.xml` / SQLServer / uni matches what
   the browser produces for the same model and settings — that byte-comparison is the proof the
   harness is faithful.
4. Only then start committing golden files.
