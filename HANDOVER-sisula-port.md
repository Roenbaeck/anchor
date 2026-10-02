# Handover: porting the generators to the Sisula engine

**Status:** the Snowflake generators for all three temporalizations (uni, bi and crt) are ported and are
what the modeler runs. The other databases still run on the original engine.
**Written on:** 2026-10-01, updated the same day when bi and crt were ported.
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
| Snowflake templates | `SQL/Snowflake/{uni,bi,crt}/*.sisula` | 13 + 10 + 11 templates, one per sisulet. bi and crt reuse `uni/AddDescriptions.sisula`, as their original directives reuse the sisulet. |
| Snowflake derive | `SQL/Snowflake/derive.js` | Facts the templates need that the sisulets computed with helper calls (see below). |
| The directives | `Snowflake_{uni,bi,crt}.directive` | Prelude scripts first, then the templates, in render order. |
| The old directives | `Snowflake_{uni,bi,crt}.legacy.directive` | The previous lists. The golden files are generated from them. The modeler does not read them. |
| The tests | `sisula/examples/anchor-snowflake` (in the **sisula** repo) | 33 models, golden files from the original engine, and the tools that compare. See below. |

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
powershell -File tools\run-all.ps1                       # Anchor's templates against the golden files, all 33 models
powershell -File tools\run-all.ps1 -Temporalization bi -Name CreateKnots   # a part of it; -Anchor <worktree> reads another checkout
powershell -File tools\csharp-check.ps1                  # the C# renderer (SQL Server) on the same templates and bindings
powershell -File tools\browser-check.ps1                 # the real modeler in headless Edge: Generate SQL against the golden files
powershell -File tools\browser-check.ps1 -Bindings       # the modeler's JSON bindings against the resolver's
powershell -File tools\regenerate-golden.ps1             # golden files from the ORIGINAL engine, via the legacy directives
powershell -File tools\make-variants.ps1                 # after a change to base.xml (see the models below)
```

And in this repo: `.\tools\sync-sisula.ps1 -Check`.

`csharp-check.ps1` needs `sisula-mssql/tests/bin/FixtureRunner.exe` (build it with
`tests\run-fixtures.ps1` there). A full run of everything takes a long while on a busy machine; the
Edge checks time out at 120 s per model if the CPU is shared.

### What the golden files are

They come from the **original** engine, unmodified, run under Jint (`golden.ps1`; it only strips
`async`/`await`). That is why the templates are trustworthy: they match an independent implementation
byte for byte. Keep the `Snowflake_*.legacy.directive` files and the `SQL/Snowflake/*/*.js` sisulets for as
long as you want that oracle. (The original bi and crt sisulets could not run at all until eight
places in four of them were corrected; see "Known defects" below.) When a change is deliberate (a new flag, a new default), change the
template, then regenerate the golden files **from the template output** and review the diff, or change
the old sisulet and regenerate from it. `check.ps1` fails if the new directive and the legacy one do not
list the same templates.

### The models

`models/*.xml` are the Anchor Modeler's Snowflake example and variants derived by
`tools/make-variants.ps1`, each saved through the modeler itself (`browser-check.ps1 -Canonicalize`),
because the modeler reinterprets a hand-edited file on load (it fills missing flags from `Defaults`,
and a knotted attribute is never equivalent). `handwritten*` are deliberately not canonical; they are only
compared with the original engine. A variant exists to reach a branch of a template that the base model
does not; the README in that folder lists the mutations that each model caught.

**A model says which temporalization it is for** (`metadata/@temporalization`), and the tools take the
directive, the prelude and the templates from that (`tools/directive.ps1`). There are 11 models for each
of uni, bi and crt: nine variants named `<name>`, `<name>-bi` and `<name>-crt` that differ only in that
setting, plus `flags` (restatement, idempotency, assertion and decisiveness turned over) and `ranges`
(a type and a suffix of its own for everything that belongs to the posit, positor and reliability columns).
A model file that a `make-variants.ps1` run rewrites differs from the committed one in the modeler's
version stamp and in layout coordinates; neither is read by a generator, so the committed uni models were
left as they were.

## How to port the next generator (a worked path)

Do one directive at a time. Uni, bi and crt for Snowflake were done this way (bi and crt in one go, by seven
parallel workers each in its own git worktree, which worked well because the golden files and the exact
test make the pieces independent); the other databases follow the same path.

1. **Pick the directive** (for example `PostgreSQL_uni.directive`) and list its enabled sisulets.
2. **Port each sisulet** to `SQL/PostgreSQL/uni/<Name>.sisula`. The pattern table is in
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
5. **Models and golden files for another database**: the tools are generalized over the temporalization
   but still name `Snowflake` (the directive names, the `SQL/Snowflake/` paths, the prelude and `derive.js`
   in `tools/directive.ps1`, the assertion in `browser-check.ps1`). Parametrize those, put the models for
   the new database in a folder of their own, and make the golden files from its legacy directive. Check first
   that the original sisulets run at all: parse each one after the engine's translation (the Jint parser
   reports the line), because a generator that was never run can fail on a syntax error, as bi and crt did.
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
  match a `timestamp_ntz` `ChangedAt`); every replaced view and function is `COPY GRANTS`, so that object grants survive a regeneration (after the argument list and before `RETURNS` in a function, after the column list and before `COMMENT` and `AS` in a view; tables are `CREATE TABLE IF NOT EXISTS` and need none; `tools/lint-sql.ps1` checks it).
- **Unported means commented out** in the directive, with the `.js` path, as before.

## Open items

- **Port the rest:** the other databases (SQL Server, PostgreSQL, Oracle, Vertica, BigQuery). Delete the
  old `.js` sisulets and the legacy directive of a target when its golden files no longer need an oracle.
- **Run the generated Snowflake SQL** for uni, bi and crt on a real account (nothing has been run, and the lint
  is only a heuristic), and look at what is still open under the defects above.
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

## Defects found in the original Snowflake generators, and what was done

The Snowflake bi and crt sisulets had never run: the first thing the port found was a syntax error that made
the original engine fail on both (`$anchor.mnemonic.*`, fixed in eight places in four sisulets). The port first
reproduced the original output byte for byte, defects included, and then the defects were fixed in the original
sisulets and the templates together, so that the two still agree and the golden files (regenerated from the fixed
sisulets) stay an independent check. Nothing has been run on Snowflake; `tools/lint-sql.ps1` in the sisula
repository is the stand-in. It looks for the defect classes below (nameless columns, a stray colon, `a.,`, an
operator with nothing after it, missing and dangling commas, unbalanced parentheses) and finds none in any of the
33 models. It cannot say that SQL is valid.

**Fixed**

1. The call of an attribute, nexus or tie rewinder, in every anchor, nexus and tie perspective of bi and crt.
   `$(attribute.isHistorized())? changingTimepoint::$attribute.timeRange,` was read with the first `:` of the `::`
   as the colon of the original engine's own `$(cond)? a : b`, giving `changingTimepoint` with no comma for a
   historized attribute and a line with only `:,` for a static one. A historized one now passes
   `changingTimepoint::<type>,` and a static one nothing, which is what the rewinders take. (When an expression
   goes through `${...}$` in an original sisulet it needs its own parentheses: the engine pastes it into a
   string concatenation.)
2. crt: the "reliable" flag. `reliableColumnName` and `reliableCutoff` were never defined, because they belong to an
   older design that SQL Server's crt no longer has (it has `reliability` and a derived `assertion`). They gave
   columns with a type and no name, `a.,` and `when x < then 0`. The flag is removed everywhere, and the latest,
   point-in-time and now views return `cast(null as <reliabilityRange>) as Reliability`, as SQL Server's do. The
   crt `t` functions already had the current `positor` and `assertion` parameters. The other databases' crt
   sisulets (PostgreSQL, Oracle, Vertica, BigQuery) are copies of the same old design and have the same defects.
3. crt tie perspectives: a role is always followed by the temporal columns, so its comma is unconditional.
4. bi knots now get their metadata column (`knot.metadataDefinition` was only set in crt).
5. uni, in configurations that the base model does not reach: with metadata off a knot's dummy column had no
   name (`knot.dummyColumnName` was never set; now in `SQL/Snowflake/NamingConvention.js`), and the dummy columns
   of knots and nexuses were typed `bit`, which Snowflake does not have (now `boolean`). With the original naming
   convention a knotted attribute or nexus attribute had no `knotEquivalentColumnName` and
   `knotChecksumColumnName` (roles had them), giving `pAC.,` and nameless columns; the common
   `SQL/NamingConvention.js` now defines them. That last fix is in the shared file, so it also changes what the other
   databases generate with the original naming convention, from an empty name to the right one.

The uni output of the base model, and of every model with metadata and the improved naming convention, did not
change.

**Still open**

- Equivalence is not handled in bi and crt (equivalent knots are plain tables), and a nexus role to an equivalent
  knot references `identityName` without testing whether equivalence is on, as the uni sisulets do. The reference
  is valid SQL but may name a table that does not exist.
- The other databases' sisulets have these defects too (see 2 and 5) and nobody has looked at them.
- Cosmetic, kept because they are in the golden files: trailing spaces after some commas and column names
  and bi headers without the construct's name line.

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
