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
| Snowflake templates | `SQL/Snowflake/{uni,bi,crt}/*.sisula` | 13 + 11 + 12 templates, one per sisulet. bi and crt reuse `uni/AddDescriptions.sisula`, as their original directives reuse the sisulet. |
| Snowflake derive | `SQL/Snowflake/derive.js` | Facts the templates need that the sisulets computed with helper calls (see below). |
| The directives | `Snowflake_{uni,bi,crt}.directive` | Prelude scripts first, then the templates, in render order. |
| The tests | `sisula/examples/anchor-snowflake` (in the **sisula** repo) | 33 models, golden files (approved output from the templates), and the tools that compare. See below. |

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
powershell -File tools\regenerate-golden.ps1             # golden files from the templates; read git diff afterwards
powershell -File tools\make-variants.ps1                 # after a change to base.xml (see the models below)
```

And in this repo: `.\tools\sync-sisula.ps1 -Check`.

`csharp-check.ps1` needs `sisula-mssql/tests/bin/FixtureRunner.exe` (build it with
`tests\run-fixtures.ps1` there). A full run of everything takes a long while on a busy machine; the
Edge checks time out at 120 s per model if the CPU is shared.

### What the golden files are

They are **approved output**: `regenerate-golden.ps1` writes them from the templates (`check.ps1 -Update`), and
the diff is read before it is committed. Until 2026-10-02 they were made by the original sisulets, run unmodified
under Jint, which made them an independent check: the templates matched those sisulets byte for byte, and every fix
was made in both. Once the Snowflake output had been run on Snowflake (uni, bi, crt and equivalence) the sisulets
that had a template, and the three `.legacy.directive` files, were removed from Anchor, which halves the work of a
change. They are in the git history: Anchor at `b9c6948` has them, and `tools/golden.ps1` in the sisula repo at
`34d0b93` shows how they were run (use it for the next database, see below). What checks the golden files now:
the other implementations (`csharp-check.ps1`, `browser-check.ps1`), the lint, and above all running the SQL.

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
4. **Switch the directive**: write the new one with the prelude first and the templates after it, as above.
   While you port, keep the original directive and sisulets (rename the directive `<Name>.legacy.directive`) so
   that they can make the golden files.
5. **Models and golden files for another database**: the tools are generalized over the temporalization
   but still name `Snowflake` (the directive names, the `SQL/Snowflake/` paths, the prelude and `derive.js`
   in `tools/directive.ps1`, the assertion in `browser-check.ps1`). Parametrize those, put the models for
   the new database in a folder of their own, and make the golden files from the original sisulets with
   `golden.ps1` (restore it from sisula `34d0b93`; it takes the original directive and splits the output per
   sisulet), then, once the templates match, switch to `check.ps1 -Update` as for Snowflake. Check first
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

- **Port the rest:** the other databases (SQL Server, PostgreSQL, Oracle, Vertica, BigQuery), only when someone
  needs one. Delete a database's old `.js` sisulets, as was done for Snowflake, once its output has been run.
- **Run the generated Snowflake SQL** for uni, bi and crt on a real account (nothing has been run, and the lint
  is only a heuristic), and look at what is still open under the defects above.
- **The Snowflake skill** (`anchor-snowflake-skill`): the generator hosted in Snowflake exists.
  `tools/build-snowflake-generator.ps1` writes one SQL script that creates `SISULATE` (the engine as a JavaScript
  function), `ANCHOR_BINDINGS` (the model XML to the bindings; `modules/XmlTree.js` reads the XML, since a JavaScript
  function has no `DOMParser`, and `modules/DomFacade.js` gives `Sisulator.objectify` a DOM; the prelude scripts of
  the directive are compiled into a function, since there is no `eval`), `ANCHOR_TEMPLATE` (the templates, base64)
  and `ANCHOR_GENERATE(model_xml, temporalization)`. The skill repository holds the built script, with its
  provenance in the first lines, and the docs (`references/generator.md`, `model-xml.md`) and workflow that use it.
  `hosted-check.ps1` in the sisula repository runs the JavaScript of the two functions under Jint on all models
  and compares with the golden files; the SQL around it (the `CREATE`s, `LISTAGG`) is only run by Snowflake, and
  **has not been run yet**. To update the skill: rebuild into `.snowflake/cortex/skills/anchor-modeling/generator/`.
  Identities: every identity that is generated takes its value from a sequence, never `IDENTITY(1,1)` (no generated
  script has one): knots, anchors and nexuses with `generator="true"` (`<name>_ID_SEQ`), and in bi and crt the posit
  identity of attributes and ties (`<posit table>_ID_SEQ`, for example `ST_NAM_Stage_Name_Posit_ID_SEQ`). The names
  of the nexus, attribute and tie sequences are made in `SQL/Snowflake/NamingConvention.js`. This is what the
  skill's load patterns draw from, and what a bi/crt load needs too, since annex rows refer to the posit identity.
  The skill installs the generator itself: with a Git repository object and `EXECUTE IMMEDIATE FROM`, or the
  Snowflake CLI (`references/generator.md`; neither has been run against an account). The build fails if the
  script holds a template delimiter (`{{`, `{%`, `{#`, `<%`, `&{`).
- **`schema.serialization`** is large (the model XML again) and its time stamp makes every export
  differ. A hosted generator does not need it; consider leaving it out for targets whose templates
  do not read it.
- **Modeler's data type converter** (`modules/DataTypeConverter.js`) converts between all six databases, through
  the generic types: every database has a `<DB>_to_Generic` and a `Generic_to_<DB>` list, so a new one is two lists
  and works with all the others. Snowflake and BigQuery have theirs. Only the values of the attributes in
  `DataTypeConverter.ATTRIBUTES` are converted (not any text that looks like a type), the first matching rule
  of a list decides (the rules used to chain: `real` became `double`), and `convertText` is the DOM-free part, which
  `examples/anchor-snowflake/tools/converter-check.ps1` in the sisula repository tests for every pair. Lossy
  conversions are by design and come from the target (BigQuery has no time with a zone, no money; Snowflake no
  time with a zone, no uuid or XML type; Oracle widens `tinyint` to `number(3)`): converting there and back does not
  restore the original. Not covered: the modeler's own menu (the page is tested through `convert`, in headless Edge,
  by hand) and database-specific defaults other than `now` and the schema.
- **Unverified on a server:** the T-SQL in `sisula-mssql` (`sql/test_fixtures.sql` was generated and
  never run).
- **The sisula repo's example** refers to an Anchor checkout next to it for the templates. If that is
  awkward, the example's tools could move here.

## Defects found in the original Snowflake generators, and what was done

The Snowflake bi and crt sisulets had never run: the first thing the port found was a syntax error that made
the original engine fail on both (`$anchor.mnemonic.*`, fixed in eight places in four sisulets). The port first
reproduced the original output byte for byte, defects included, and then the defects were fixed in the original
sisulets and the templates together, so that the two still agreed (the sisulets are gone now, see "What the golden
files are"). Everything below was found by running the generated SQL on Snowflake; `tools/lint-sql.ps1` in the sisula
repository learnt a rule from each. It looks for the defect classes below (nameless columns, a stray colon, `a.,`, an
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

6. bi and crt: the attribute assembled views were missing. SQL Server's bi and crt generate, for each attribute, a
   view that joins its posit and annex tables under the name the attribute table has in uni, and the difference
   (`d`) functions read it; the Snowflake directives had it commented out (bi) or lacked it (crt), so the `d`
   functions named a table that did not exist (`public.ST_NAM_Stage_Name`). Found by the user when the first run on
   Snowflake failed to create a `d` function; confirmed with the object check in `lint-sql.ps1`, which flags any
   `schema.name` that the script uses and never creates. The views are now generated
   (`SQL/Snowflake/{bi,crt}/CreateAttributeAssembledViews`), as views with `COPY GRANTS` and without SQL Server's
   index.
7. bi and crt with equivalence on: in these temporalizations a knot is always one table, but foreign keys and
   `AddDescriptions` used the identity table of an equivalent knot (`knots.ETY_EventType_ID`), which only uni creates.
   They now use the knot's own table, as SQL Server's bi and crt do.

8. bi and crt: `CROSS JOIN LATERAL TABLE(udtf(…))` is not accepted in the body of a SQL function on Snowflake
   (found by running the bi difference function: "syntax error … unexpected 'SELECT'", at the first token of the
   body). The comma join, `FROM x, TABLE(udtf(x.column))`, is, and is what uni's difference functions use. All 14
   places (bi: the anchor and nexus `d`; crt: `t`, `p` and `d`) are now comma joins. This was isolated with five tiny
   functions, one construct each, which is the way to find the next one of these: the error message says nothing
   about the cause, and the lint cannot know what Snowflake accepts. `tools/lint-sql.ps1` now flags the construct.

9. bi and crt: a tie with no identifier roles (a one-to-one tie such as `AC_subset_PN_of`) got an empty
   `CLUSTER BY ( )`, which Snowflake rejects (found by running the bi script). A tie is clustered by its identifier
   roles, or by all its roles when none is marked, which is the rule that its unique constraint and uni's primary
   key use; a historized tie adds its changing column, as before. `lint-sql.ps1` flags an empty `CLUSTER BY`.

10. crt: the `d` function of every tie read `<tie>_Positor` from the tie's Posit table, but in crt the positor
    is a column of the Annex table (found by running the crt script: "invalid identifier"). SQL Server's crt reads
    the tie's assembled view there, which joins posit and annex; `CreateTieAssembledViews` is ported for bi and
    crt (a view with `COPY GRANTS`, named as the tie table is in uni), and crt's `d` reads it. bi's `d` reads only
    columns that the Posit table has and is unchanged. `lint-sql.ps1` now also checks columns
    (`tools/lint-columns.ps1`): the columns of every table, view and function are read off the script, and every
    `alias.column`, and every bare column of a single-table query, has to exist where it is taken from. It finds the
    error above in the previous output, and nothing in the uni models that do not use equivalence.

11. uni, bi and crt with equivalence on: a knotted attribute whose file said `equivalent="true"` made rewinders and
    perspectives select a `…_EQ` column that its table never has (`rEV_LVL_Event_Level` returned and selected
    `EV_LVL_EQ`; `lAC_Actor` selected `GEN.AC_GEN_EQ`). Found by the column check. The modeler states a rule,
    "knotted cannot be equivalent" (also not checksummed or encrypted), in `Attribute.setKnotted`, but
    `Attribute.fromXML` applied it *before* assigning the flags that it read from the file, which undid it, so the
    modeler wrote `equivalent="true"` on knotted attributes (the `flags` model has it on `GEN`). Two fixes: `fromXML`
    applies the rule again after the flags are assigned, and `attribute.isEquivalent()` and `nxAttribute.isEquivalent()`
    in `SQL/Helpers.js` are false for a knotted attribute, so that files that were saved before the fix generate
    correctly too. `Helpers.js` is shared, so SQL Server and the other databases get the same correction; for them it
    changes only models with that contradiction, which generated references to a column that did not exist. The example
    models were left as they are, so they test the helper.

12. uni with equivalence on: the equivalent latest function (`el`) of an anchor or a tie is `SELECT * FROM
    TABLE(ep…(equivalent, now))`, but the script created it before `ep`, and Snowflake needs a function to exist when
    another function that calls it is created ("Unknown user-defined table function"; found by running the
    equivalence script). In the three anchors and the seven ties of the example, `ep` is now created before `el`. The
    nexus `el` has its own full select and was fine. `lint-sql.ps1` now flags any statement that uses a table, view
    or function that the script creates later (it also covers a foreign key to a table created later).

The uni output of the base model, and of every model with metadata and the improved naming convention, did not
change.

**Still open**

- Equivalence is not handled in bi and crt (equivalent knots are plain tables, as in SQL Server), so a model with
  equivalence on is generated without any equivalent tables there. The references are valid, though.
- A uni model whose knots are flagged equivalent while equivalence is off (only a hand-written file can be like
  that, see the `handwritten` model) refers to tables that are never created.
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
