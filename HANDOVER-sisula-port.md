# Handover: porting the generators to the Sisula engine

**Status:** Snowflake uni-temporal is ported and is what the modeler runs. Everything else still
runs on the original engine.
**Written on:** 2026-10-01. **Branch:** `export-bindings-json` (this file is part of it).
**Read first:** `docs/SISULA.md` (the language), then this file.

## The goal

One template engine for every project that generates text from a model (this repo, `sisula`,
`sisula-mssql`, `workflower`, `anchor-snowflake-skill`), so a template is written once and runs in the
browser, in SQL Server (C#) and in Snowflake (a JavaScript UDF). The new dialect ("dialect B") is
declarative and works on plain JSON. It has no `eval`. The original dialect ("dialect A") translates
templates to JavaScript with regular expressions and evaluates them against a live object graph.

The engine's source of truth is the `sisula` repository (`core/sisula.js`, `docs/LANGUAGE.md`,
`tests/fixtures/*.json`, tag `v1.0.0`). Consumers keep a byte-identical copy and update it
deliberately. No submodules.

## What is in place

| Piece | Where | What it does |
|---|---|---|
| The engine | `modules/sisula.js` | A vendored copy of `sisula/core/sisula.js`. **Do not edit it.** |
| The lock | `modules/sisula.lock.json` | The commit it came from and the SHA-256 of the engine and of `docs/SISULA.md`. |
| The sync tool | `tools/sync-sisula.ps1` | `-Check` verifies the copies. `-Ref <tag>` updates them, from committed and pushed sisula commits only. |
| The resolver | `modules/Resolver.js` | ES5, no DOM. Runs the directive's prelude scripts on the modeler's `schema` object and flattens it to plain JSON. |
| The export | `Actions.bindings()` in `index.html` | The model as JSON for the selected target: `{bindingsVersion, database, temporalization, schema}`. Menu: Generate > JSON bindings. |
| Generate SQL | `Actions.sql()` in `index.html` | A directive that lists `.sisula` templates is rendered by the new engine, one template after the other, output concatenated. A directive that lists `.js` sisulets runs on the original `Sisulator`. |
| Snowflake uni templates | `SQL/Snowflake/uni/*.sisula` | 13 templates, one per sisulet. |
| Snowflake derive | `SQL/Snowflake/derive.js` | Facts the templates need that the sisulets computed with helper calls (see below). |
| The directive | `Snowflake_uni.directive` | Prelude scripts first, then the templates, in render order. |
| The old directive | `Snowflake_uni.legacy.directive` | The previous list. The golden files are generated from it. The modeler does not read it. |
| The tests | `sisula/examples/anchor-snowflake` (in the **sisula** repo) | Nine models, golden files from the original engine, and the tools that compare. See below. |

### The directive

```
# comments start with #
SQL/Helpers.js                          <- prelude: matches Helpers|NamingConvention|derive .js
SQL/NamingConvention.js
SQL/Snowflake/NamingConvention.js
SQL/Snowflake/derive.js
SQL/Snowflake/uni/CreateKnots.sisula    <- templates, in order
...
```

The prelude scripts run once, in one scope, in this order, on the `schema` object. A later one can use
what an earlier one defined (`derive.js` calls `describe()` from the naming convention). A directive
is either all `.sisula` (new engine) or all `.js` (original engine); they are not mixed.

### The bindings JSON

Resolver rules (`modules/Resolver.js`, the header says it all): keyed maps plus their id lists become
one array; `isX()`/`hasX()` become booleans; back-references (`parent`, `knot`, `anchor`, `nexus`,
`entity`) become shallow summaries (no cycles); functions and iterator plumbing are dropped. It also
holds `schema.serialization` (the model's own XML, with a time stamp, which SQL Server and PostgreSQL
schema tracking read) and `schema.format/date/time`.

**Helper functions become data, never language features.** A path in a template reaches only JSON
properties and array indexes. There is no `.length`. Where a sisulet called a helper
(`describe(x)`, `x.attributes.length`), `derive.js` computes the value once and stores it:
`comment`, `hasComment`, `attributeCount`, `roleCount`. The language stays small, which matters because
the C# implementation in `sisula-mssql` must follow every feature.

## How to test

Everything below runs on Windows PowerShell 5.1 with the repos side by side
(`anchor`, `sisula`, `sisula-mssql`). No Node, no .NET SDK, no SQL Server, no Snowflake on that machine.
The engines run under the Jint in `sisula/lib`. Run from `sisula/examples/anchor-snowflake`:

```
powershell -File tools\run-all.ps1                       # Anchor's templates against the golden files, 9 models
powershell -File tools\browser-check.ps1                 # the real modeler in headless Edge: Generate SQL against the golden files
powershell -File tools\browser-check.ps1 -Bindings       # the modeler's JSON bindings against the resolver's
powershell -File tools\regenerate-golden.ps1             # golden files from the ORIGINAL engine, via the legacy directive
```

And in this repo: `.\tools\sync-sisula.ps1 -Check`.

The C# renderer (`sisula-mssql/tests/bin/FixtureRunner.exe --render <template> <bindings.json> <out>`)
must give the same bytes; the last run was 117 of 117 (9 models x 13 templates).

### What the golden files are

They come from the **original** engine, unmodified, run under Jint (`golden.ps1`; it only strips
`async`/`await`). That is why the templates are trustworthy: they match an independent implementation
byte for byte. Keep `Snowflake_uni.legacy.directive` and the `SQL/Snowflake/uni/*.js` sisulets for as
long as you want that oracle. When a change is deliberate (a new flag, a new default), change the
template, then regenerate the golden files **from the template output** and review the diff, or change
the old sisulet and regenerate from it. `check.ps1` fails if the new directive and the legacy one do not
list the same templates.

### The models

`models/*.xml` are the Anchor Modeler's Snowflake example and variants derived by
`tools/make-variants.ps1`, each saved through the modeler itself (`browser-check.ps1 -Canonicalize`),
because the modeler reinterprets a hand-edited file on load (it fills missing flags from `Defaults`,
and a knotted attribute is never equivalent). `handwritten` is deliberately not canonical; it is only
compared with the original engine. A variant exists to reach a branch of a template that the base model
does not; the README in that folder lists the mutations that each model caught.

## How to port the next generator (a worked path)

Do one directive at a time. Snowflake bi and crt are the closest; the other databases follow the same
path.

1. **Pick the directive** (for example `Snowflake_bi.directive`) and list its enabled sisulets.
2. **Port each sisulet** to `SQL/Snowflake/bi/<Name>.sisula`. The pattern table is in
   `sisula/examples/anchor-snowflake/README.md` ("Porting the sisulets"): `while (x = schema.nextX())`
   becomes `$/ foreach x in schema.xs`; `$(cond)? a : b` becomes `$/ if cond` / `$/ else`; escaping
   uses `$'path'$` (SQL string literal) and `$|path|$` (safe in a `--` comment). The templates must
   produce the final text, because the original engine removes blank lines and runs of spaces
   afterwards and the new one does not.
3. **Anything a template needs that a path cannot reach** goes into the target's `derive.js` as data
   (a count, a boolean, a pre-built string). Never extend the language for it unless the C# renderer
   gets it too, with a fixture in the sisula repo.
4. **Switch the directive**: move the old one to `<Name>.legacy.directive`, write the new one with the
   prelude first, as above.
5. **Make models** that exercise the new temporalization (bi and crt need models with the matching
   settings; the example folder has only uni models today), canonicalize them, make golden files from
   the legacy directive, and generalize `check.ps1`/`golden.ps1` (they name `Snowflake_uni` and
   `SQL/Snowflake/uni` in a few places).
6. **Run everything above**, including the C# renderer, then merge.

Things that cost time before, so check them early: Jint 2 is ES5 only (no `async`, no arrow functions,
no dotAll regex flag, unmatched regex groups give `""` instead of `undefined`); JSON arrays have no
`length`; an unparseable condition throws; an empty array is false; `not`/`!` work, and `>=`, `<=`
match (they never did before).

## Decisions made (so they are not re-argued)

- **Vendor, do not submodule.** A consumer pulls a new engine deliberately, after checking it.
- **C# in `sisula-mssql` stays.** It is in production. The fixtures in the sisula repo decide; the C#
  follows them.
- **The modeler exports the bindings**, and a hosted generator (the Snowflake skill) consumes the same
  JSON and templates, so there is one pipeline from model to SQL.
- **Snowflake DDL**, for every generator, tested or not: `CLUSTER BY` on every table, with `ChangedAt`
  left out of the key of historized attribute tables; every key declared `RELY` (join elimination;
  Snowflake does not enforce keys, so ship integrity checks); the default `now` is `sysdate()` (UTC, to
  match a `timestamp_ntz` `ChangedAt`); no `COPY GRANTS` (grants belong on the schema).
- **Unported means commented out** in the directive, with the `.js` path, as before.

## Open items

- **Port the rest:** Snowflake bi and crt, then the other databases. Delete the old `.js` sisulets and
  the legacy directive of a target when its golden files no longer need an oracle.
- **The Snowflake skill** (`anchor-snowflake-skill`): the plan is a generator hosted in Snowflake, a
  JavaScript UDF made from `modules/sisula.js` (it already runs as one: it is ES5, no DOM) that takes
  the bindings JSON from the modeler and the templates as text. Someone has to try it in a real
  account; no Snowflake was available while this was written. The skill's docs also still say "no
  `CLUSTER BY` by default" and its load statements have no `ORDER BY` on the id; both disagree with the
  decisions above.
- **`schema.serialization`** is large (the model XML again) and its time stamp makes every export
  differ. A hosted generator does not need it; consider leaving it out for targets whose templates
  do not read it.
- **Modeler's data type converter** has no Snowflake or BigQuery section (picking Snowflake with
  "convert" only alerts).
- **Unverified on a server:** the T-SQL in `sisula-mssql` (`sql/test_fixtures.sql` was generated and
  never run), and the generated Snowflake SQL has been compared with the original engine's but not
  executed on Snowflake.
- **The sisula repo's example** refers to an Anchor checkout next to it for the templates. If that is
  awkward, the example's tools could move here.

## Snowflake compared with SQL Server (checked 2026-10-01)

What the SQL Server generators produce that the Snowflake ones do not, from comparing the directives
(`SQLServer_*.directive` against `Snowflake_*.directive`) and reading what each missing sisulet does.
Reading and structure are on par: tables, knots, ties, nexuses, rewinders, and the latest, point-in-time,
now and difference perspectives exist in all three temporalizations. What is missing is the **loading
and governance layer**.

**Substantial** (these decide whether Snowflake is usable for more than reading):

- **The write path.** SQL Server's latest views accept `INSERT` through `INSTEAD OF` triggers
  (`CreateAnchorTriggers`, `CreateAttributeTriggers`, `CreateNexusTriggers`, `CreateTieTriggers`; about
  500 lines each, 870 for the bitemporal tie). They look up or generate identities, apply idempotency
  (a value equal to its neighbour is not stored), handle restatement, assertions and reliability, and for
  crt the positor. Snowflake has no triggers and no insertable views, so a loader has to write the
  `MERGE`/`INSERT` itself. The skill documents load patterns for that. A Snowflake-native equivalent would
  be generated load procedures, one per anchor and tie. That is a design task, not a port.
- **Natural-key lookups** (`uni/CreateKeys`, 500 lines). The example model defines nine `<key>` elements, so
  this is used: key tables and views that resolve an anchor's identity from its business key by walking
  attributes and ties. It is the read half of the write path, and a loader needs it.
- **Integrity checking.** SQL Server enforces primary, foreign and unique keys, the restatement
  constraints (`AddAttributeRestatementConstraints`, `AddTieRestatementConstraints`) and, in bi and crt,
  entity integrity through indexed assembled views. Snowflake enforces none of it, and since every key is
  declared `RELY`, a violation gives silently wrong results. The Snowflake counterpart is generated
  integrity-check queries or views (duplicate identities, orphans, restatements, overlapping intervals).
  Worth doing soon, because `RELY` depends on it.

**Not applicable on Snowflake:** the CLR (`clr/Anchor.js`); partitioning (`Setup*Partitioning`; micro-partitions
and `CLUSTER BY` do that job); key generator procedures (`CreateKeyGenerators`; sequences do it);
assembled views (they exist to carry an index); encryption groups (`AddEncryption` creates SQL Server
certificates; Snowflake masking policies would be a different feature, not a port).

**Nice to have, can wait:** business perspectives (`biz/*`, off unless `businessViews` is set; renamed views
over the same perspectives); schema tracking (`CreateSchemaTracking`; the model's XML and its versions kept in
the database, useful for governance, and the bindings already carry `schema.serialization`); the crt
sheet stacks (`CreateAttributeSheetStacks`, a procedure returning one temporal sheet per positor).

Unported Snowflake sisulets stay as commented lines in the directives, so nothing is hidden.

## Where things are, by repository

- **anchor:** this file, the engine copy, the resolver, the templates, the directives, the modeler.
- **sisula:** the engine's source, the language reference, the fixtures, `examples/anchor-snowflake`
  (models, golden files, tools), `lib/Jint.2.11.58.dll`.
- **sisula-mssql:** the C# renderer (`clr/SisulaRenderer.cs`) and `tests/run-fixtures.ps1`.
- **workflower:** vendors the engine the same way (`tools/sync-sisula.ps1`, `webapp/sisula.js`).
- **dw-framework:** the old ETL framework, which uses dialect A and is not meant to change.
