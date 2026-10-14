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
powershell -File tools\sqlserver-tests.ps1 -Server <name>   # needs SQL Server: what the SQL Server triggers do
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
- **Snowflake names are quoted** (2026-10-08, after national characters failed: an unquoted identifier is upper case and allows
  only A-Z, digits, `_` and `$`). Every name that comes from the model is written in double quotes in all Snowflake templates:
  table, view, function, column, constraint, sequence and alias names, composed ones included (`"pk$knot.name$"`, `"l$anchor.name$"`). It
  keeps the case, so the names are case sensitive (`SELECT * FROM public."AC_Actor"`; `AC_Actor` is `AC_ACTOR`), and a database made by
  an earlier script gets a second set of objects, because `CREATE TABLE IF NOT EXISTS public."AC_Actor"` does not see `AC_ACTOR`. The schema
  is not quoted (`public` must stay the default `PUBLIC`): `SQL/Snowflake/derive.js` quotes a schema name only when it has to be. Names
  that the generators fix themselves (`IntegrityViolations`) and inside string literals and comments are left alone. The templates were
  converted by a script (every word with a name token in it), and `models/national*.xml` have Swedish names for every kind of construct.
  The lint takes the quotes off before it reads; the golden files are approved output.
- **Snowflake DDL**, for every generator, tested or not: `CLUSTER BY` on every table, with `ChangedAt`
  left out of the key of historized attribute tables; every key declared `RELY` (join elimination;
  Snowflake does not enforce keys, so ship integrity checks); the default `now` is `sysdate()` (UTC, to
  match a `timestamp_ntz` `ChangedAt`); every replaced view and function is `COPY GRANTS`, so that object grants survive a regeneration (after the argument list and before `RETURNS` in a function, after the column list and before `COMMENT` and `AS` in a view; tables are `CREATE TABLE IF NOT EXISTS` and need none; `tools/lint-sql.ps1` checks it).
- **Unported means commented out** in the directive, with the `.js` path, as before.

## Open items

- **Port the rest:** SQL Server bi and crt (uni is done, see above), and the other databases (PostgreSQL, Oracle, Vertica, BigQuery), only when someone
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
   name (`knot.dummyColumnName` was never set; it was set in `SQL/Snowflake/NamingConvention.js`, and since
   2026-10-09 is in the common `SQL/NamingConvention.js`, for every database), and the dummy columns
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

## SQL Server uni on the Sisula engine (ported 2026-10-08)

`SQLServer_uni.directive` lists 31 Sisula templates (`SQL/SQLServer/{uni,biz,clr}/*.sisula`, `SQL/SQLServer/CreateSchemaTracking.sisula`)
and the prelude `Helpers.js`, `NamingConvention.js`, `SQL/SQLServer/NamingConvention.js`, `SQL/SQLServer/derive.js`. The original sisulets and
their directive, `SQLServer_uni.legacy.directive`, are still here: they are what `golden.ps1` runs to make the independent output. bi and crt
for SQL Server are ported too, see the next section.

**What was verified (no SQL Server on the development machine):** for 18 models (`models/sqlserver-*.xml`: the uni models of Snowflake converted
with the data type converter and saved through the modeler, plus variants for business views and knot aliases, no triggers, partitioning, natural
keys, deletability, encryption, and the knot roles of two ties moved from last) every template renders byte for byte what the original sisulet gave
(`run-all.ps1`), in the C# renderer of `sisula-mssql` too (`csharp-check.ps1`), and the modeler itself in headless Edge produces the same whole script
(`browser-check.ps1`, with the schema tracking text, which carries a time stamp, compared as a placeholder) and the same JSON bindings. **The SQL has
not been run on a SQL Server.** Since it is the original output except for the corrections below, running one script of each kind is the check.

**Differences from the original output** (everything else is identical):
- The generated SQL was corrected where the original crashed or gave invalid SQL: a tie role that is a nexus (`role.anchor` was used as if every
  non-knot role were an anchor: `CreateTieTriggers`, `AddTieRestatementConstraints`); the key table of a nexus with equivalence on (`CreateKeys` used
  `$anchor.mnemonic` in the nexus section); a missing comma after the last role of an equivalent nexus perspective (`el`, `ep` in
  `CreateNexusPerspectives`, and the equivalence perspectives of `CreateNexusBusinessPerspectives`); the missing type of the identity column of a
  nexus key table (`nexus.identityRange` does not exist, it is `nexus.identity`).
- **Restatement check with equivalence** (found by running it): the restatement checking trigger of an attribute with equivalence selected
  `p.<equivalent column>` in a subquery that has no alias `p` (`SELECT DISTINCT p.AC_NAM_EQ, AC_NAM_AC_ID FROM @AC_NAM_Actor_Name`), which is not valid
  T-SQL; the column is now written without the alias (`AddAttributeRestatementConstraints`, the original and the template). No other SQL Server
  sisulet had it.
- **Natural key tables and checksums** (found by running the example model on SQL Server: "Column ... is of a type that is invalid for use as a key
  column in an index", for a geography): the key table of a route, for an attribute that has a checksum, has a persisted checksum column beside the value
  column (`ST_LOC_Checksum as cast(dbo.MD5(cast(ST_LOC_Stage_Location as varbinary(max))) as varbinary(16)) persisted`, the expression that the attribute
  tables and knots use), and its unique constraint names the checksum column instead of the value. The same in the key tables of nexuses. The
  naming convention gives each routed value its routed checksum name (`routedChecksumColumnName`). At the same time each position of the unique
  constraint names its own stop (the original named the stop before, with the last stop's column for the first: the same columns in another order, but
  `undefined,` after a tie stop). The key *view* still shows the values only.
- `AddEncryption` asked for the master key password with `prompt()`. A template cannot ask: it prints the text that the dialog offered, `<TYPE STRONG
  PASSWORD HERE>`, in `CREATE MASTER KEY ENCRYPTION BY PASSWORD = '...'`, which has to be replaced in the script before it is run.
- `AddDescriptions` doubles a single quote in a description (the original pasted it as it was, so a description with a quote gave invalid SQL).
- `CreateSchemaTracking` embeds the model in pieces of at most 3000 characters (`schema.serialization.chunks`, made in `derive.js`): SQL Server's
  `JSON_VALUE`, which the C# renderer reads values with, returns at most 4000 characters, so a longer value is invisible to a template there.
  **That limit applies to any template that reads a long text from the bindings.**

**Known defects of the original that are kept, because the golden files carry them** (none is hit by the 18 models unless said):
- `CreateKeys`, equivalence with natural keys: `$anchor.mnemonic$schema.metadata.equivalentSuffix` is read as the token followed by literal text, so the
  column is called `STschema.metadata.equivalentSuffix` (invalid SQL; it is in the golden files of the equivalence models with natural keys). What the
  column should be called, and in the nexus section too, is a decision.
- `CreateKeys`: the view counts the stops twice when natural keys are on, so a one-stop route gets the long join. A route through a tie
  crashes the original under Jint (stops are visited in insertion order there, ascending in a browser): the template does not crash.
- `CreateTies`: every tie gets the header "Knotted static tie table" (`tie.isKnotted()` is always true).
- `CreateNexuses`, `CreateTies`, `CreateAttributes`: a knot flagged equivalent in a model with equivalence off references an `_ID` table that is never
  created (the `handwritten` model).
- `AddEncryption` and the CLR check look at the attributes of anchors only, not those of nexuses.
- `CreateTieTriggers`: the delete-in-update block of a historized tie has no `;` before `IF(@@ROWCOUNT > 0)`; some deletion trigger blocks end `ELSE ... END`
  without `;`. Only reached for deletable ties.
- `CreateSchemaTracking`: the serialization is not escaped for the T-SQL literal `N'...'`, so a model with an apostrophe anywhere in its XML breaks the
  script.

**To update this port:** change the template and the original sisulet together while the original is still here (the golden files come from it:
`golden.ps1`, see `tools/make-sqlserver-models.ps1` and the tools README), or regenerate the golden files from the templates (`regenerate-golden.ps1`) once
the originals are removed. The originals can go when someone has run the output on a SQL Server.

## SQL Server bi and crt on the Sisula engine (ported 2026-10-08)

`SQLServer_bi.directive` (28 templates) and `SQLServer_crt.directive` (31) list Sisula templates only: `SQL/SQLServer/{bi,crt,biz,clr}/*.sisula` and
`SQL/SQLServer/CreateSchemaTracking.sisula`, after the same prelude as uni. The original sisulets, and their directives `SQLServer_bi.legacy.directive`
and `SQLServer_crt.legacy.directive`, are still here for `golden.ps1`. The work was done by seven parallel workers (tables; attributes; tie views;
perspectives and key generators; anchor triggers; attribute and nexus triggers; tie triggers), each in its own worktree, starting from the uni templates
and the difference between the uni and the bi/crt originals. `derive.js` got two small blocks (`bi-crt attributes`, `bi-crt tieviews`: whether any
anchor attribute is historized, or may not store restatements, and whether a historized tie has values); the rest was reachable by paths.

**What was verified (no SQL Server on the development machine):** the 38 models `models/sqlserver-*-bi.xml` and `-crt.xml` (the 18 uni models of SQL Server
with `temporalization` changed, saved through the modeler, plus `tieflags`, see below): every template renders byte for byte what the original sisulet gave
(`run-all.ps1`), and in the C# renderer of `sisula-mssql` (`csharp-check.ps1`). **The SQL has not been run on a SQL Server.**
Results of the last full run: `run-all.ps1` over every model in `models/` (Snowflake and SQL Server): all 92 models identical, per template and as a whole;
`csharp-check.ps1` on the 38 bi and crt models of SQL Server: 1121 of 1121 template renderings identical; `browser-check.ps1` (the modeler in headless Edge,
Generate SQL, schema tracking time stamp as a placeholder): the output of all 36 models equals the golden files, and with `-Bindings` the modeler's JSON
bindings equal the resolver's (the two `handwritten` models are left out, as for uni: they are not canonical).

**The oracle had a gap, and a model was added for it.** None of the 36 copies had an idempotent tie, so the code that handles one (the restatement of a
historized tie, the statement types of the posit and annex rows) was never compared. `tools/make-sqlserver-tieflags-models.ps1` makes
`sqlserver-tieflags-bi` and `-crt` (every tie idempotent and assertive); the tie triggers worker had also compared three such variants by hand.

**Differences from the original output:** one. `bi/AddTieRestatementConstraints` took `role.anchor` for every role that is not a knot, so a tie with a nexus role
crashed it (`anchor is undefined`; the `flags` and `handwritten` models have one); it takes `role.entity`, as `uni/AddTieRestatementConstraints` does, in
the original and the template. The uni corrections to `AddDescriptions` (a single quote in a description is doubled) apply to the templates only: the `.js`
originals of bi and crt, like the uni one, still paste it as it is.

**Behaviour that differs between bi and crt, worth a look** (kept, the oracle has it): in crt the update trigger of an attribute leaves out `UPDATE(value)` for an
attribute that is not historized, so a value update of a static attribute creates no posit and only a change of reliability or positor does; bi has no such condition.

**Known defects of the original that are kept, because the golden files carry them:**
- The `handwritten` models (no `identity` on attributes and one tie): the identity column of the posit and annex tables, of the restatement tables and of
  the `@inserted` and `@posit` table variables is declared without a type (`EV_DAT_ID not null,`), which is invalid SQL. It is the model, not the generator.
- `CreateTies`: every tie gets the header "Knotted static tie table" (`tie.isKnotted()` is always true), as in uni.
- `CreateNexuses` (bi, crt): a knot role of a nexus that is equivalent refers to an `_ID` table that bi and crt never create; only with equivalence on.
- `AddDescriptions`, the CLR check and the restatement checks of bi and crt look at the attributes of anchors only, not those of nexuses.
- `CreateNexusPerspectives` (bi, crt): every role line of the time traveling function gets a comma (the original tests `hasMoreAttributes()` inside the branch
  where it is always true); the bi and crt nexus functions use unbracketed names (`[capsule].tNAME`) where the crt anchor functions bracket them. The
  perspectives of bi and crt have no equivalence perspectives, and the "drop" block is written for every anchor and nexus, also one without attributes.
- `CreateTieTriggers` (bi): Swedish text in an SQL comment (`-- ta bort isnull för assertive`), a tab-indented `DELETE @inserted` / `WHERE`, and `U.` in capitals.
- Trailing spaces and tabs that the original engine left in a few lines (after `JOIN`, `OR`, `AND`, `AFTER INSERT`, `AS`, `p.*,`) are reproduced with `$--$`,
  because the golden files have them. They are harmless.

**To update this port:** as for uni: change the template and the original sisulet together while the original is still here, or regenerate the golden files
from the templates once the originals are removed (`regenerate-golden.ps1`). The originals can go when someone has run the output on a SQL Server.

## SQL Server triggers made consistent (2026-10-09)

After the port, the triggers of the latest views (insert, update, delete) and of the attributes and ties (insert)
were made to follow one set of rules in uni, bi and crt. The rules are in `docs/ANCHOR.md` ("Loading through the
latest views"); in short:

- **The flags.** Every incoming statement is identical (already stored: always ignored), a repetition (the same value
  again later in changing time, a restatement; or the same reliability again later in positing time, a
  re-assertion), or a contradiction (another value for a slot that is taken). `restatable` says whether restatements
  may exist (if not, the restatement checks raise an error), `idempotent` makes the triggers skip restatements, and
  `assertive` makes them keep re-assertions (off: skipped). No flag swallows a contradiction, which is an error
  ("Contradiction in <name> for: <key>"): in uni another value at a changing time that has one, in bi and crt another
  reliability for a posit at a positing time that has an assertion of it (by the same positor in crt). Otherwise bi
  and crt have no contradictions, since a later assertion corrects an earlier one.
  This reading follows from the code and from the history: idempotency was defined in 2012 as ignoring a value
  identical to the current one, assertiveness took over the positing-time half of it in 2014, and in 2021 static
  idempotency was changed to "only ignore identical".
- **An update states what it changes.** A value (or a reliability) left as it is states nothing, unless a changing
  time, a positing time or a positor is set too. A static attribute or tie is updated like a historized one at a
  fixed changing time: in uni a missing value is filled and another one is a contradiction, in bi and crt another
  one is a correction. A reliability without a new value asserts the shown version again at its own changing time;
  0 retracts it. Null retracts the shown posit in bi and crt (attributes and ties).
- **A delete** retracts each shown posit once, for the row's positor (bi and crt).

**Defects fixed on the way** (each in the original and the template):
- bi and crt: the attributes of a nexus had no assembled view and no insert trigger, so an insert into the latest
  view of a nexus failed with an invalid object name.
- bi and crt: DELETE on a latest view wrote one retraction per annex row of the shown posit, which collides on the
  annex key once a posit has been asserted twice, and crt retracted for every positor.
- bi and crt ties: a value role set to null went on to the insert trigger, whose table variable does not allow
  nulls. crt ties: an update was always positor 0's statement, and so was an insert through the latest view that
  gave only the Positor column.
- crt: an identical assertion was not excluded first, so with Assertive on (the default) the same row loaded twice
  violated the annex key.
- crt ties: the restatement check and the restatement finder used `SELECT TOP 1 ... ORDER BY ... UNION SELECT TOP 1
  ... ORDER BY ...`, which T-SQL does not accept.
- crt: an update of a row without a value (for a positor that shows none) was positor 0's statement.
- bi, not assertive: a re-assertion was compared with the posit's own previous assertion instead of what is shown,
  so A, then B, then A again at the same changing time lost the last A.
- crt, idempotent: a new version that restates the following one was dropped (the earlier start was lost); it is now
  kept and the following one retracted, as uni and bi do.
- uni: a static attribute or tie that is not idempotent had no insert trigger, so the same value again violated
  the key; and a static tie's update was silently ignored.
- uni: the insert triggers of an attribute with a checksum compared the stored checksum with the computed checksum
  column of `inserted`, which an instead of trigger may leave unfilled; they now compute it from the incoming value,
  as bi and crt do.
- uni, bi and crt: an insert through the latest view of a nexus gave the new nexus rows only their metadata, but
  every role column is not null, so no nexus row could be inserted that way (found while writing the tests below).
- uni, bi and crt: the same trigger paired the identities it made with the inserted rows by row numbers, in an order
  that SQL Server does not guarantee, so in an insert of several rows the attributes of one could end up with the
  roles of another. It now makes the new nexus rows with `MERGE ... ON 1 = 0 WHEN NOT MATCHED THEN INSERT`, whose
  `OUTPUT` gives every new identity together with the values of its own row (an `INSERT`'s `OUTPUT` cannot name the
  source row, and a nexus row has no key to find it by); rows that give an identity are added after it. The anchors
  still pair by row numbers, which is harmless there, since new anchor rows are alike. The `OUTPUT` of a `MERGE` may
  only call schema-bound functions that read no data: the generated `MD5` (HASHBYTES, SQL Server 2016 and later) is
  one, and it is called there only for a knotted attribute of a nexus whose knot has a checksum.

**Behaviour that changes for existing users** (all deliberate, see above): `UPDATE ... SET x = x` no longer stores a
restatement at now; changing a uni static value raises a contradiction error instead of a key violation, and changing
a uni static tie raises it instead of being ignored; bi and crt static values can be corrected by an update; in crt an
update of a positor's row is that positor's statement; the same static value inserted again in uni is ignored instead
of violating the key.

**What was verified** (last run after the nexus merge and the fixes below): the golden files were made from the
changed originals (`golden.ps1`) and every template matches them for all 59 SQL Server models (1 828 comparisons with
the whole outputs); the Snowflake templates still give their committed golden files (36 models), also through the
hosted generator; the C# renderer gives the same for the SQL Server models and the Snowflake models that the fixes
reach (1 898 renderings); the modeler gives the same SQL for the 56 canonical SQL Server models and those Snowflake
models, and its JSON bindings equal the resolver's for the same 65 models. On a SQL Server, the uni output of
the base and equivalence models has run (before these changes), and that of the three test models, with the tests
(see below); the other output has not.

**Tests of what the triggers do.** `sisula/examples/anchor-snowflake/models/sqlserver-triggers.xml` (and `-bi`, `-crt`)
is a model made for them: an attribute for each combination of the settings that the triggers read, ties with and
without identifiers, and a nexus with an attribute. `sqlserver-tests/triggers-<t>.sql` there inserts, updates and
deletes through its views and prints PASS or FAIL for each rule above (37, 35 and 42 checks), and
`tools/sqlserver-tests.ps1 -Server <name>` makes an empty database per temporalization, runs the golden output of the
model and then the script in it, drops the database again, and exits 1 if a check failed. Run it after every change
to a trigger, once the golden files of the three models have been regenerated.

**The first run on a SQL Server (2026-10-14)**: the generated SQL of all three test models ran without errors, uni
passed all its checks, and so did the nexus merge in all three. Five checks of bi and crt failed for one reason: the
server's `sysdatetime()` did not move between statements in a row, so a retraction or a new reliability got the
positing time of the assertion it was about. The insert triggers of the assembled views then took it for the identical
statement and skipped it (b08, b09, c08), and a delete collided on the annex key (c13). Two changes followed: the
tests give every statement about a posit a positing time of its own, as their header promised, and the triggers treat
another reliability at a taken positing time as the contradiction it is (see the flags above), instead of losing it.
Deletes, and a tie value set to null, write their retractions to the annex directly and are refused by its key in the
same case. `docs/ANCHOR.md` advises giving positing times explicitly when statements about one version follow each
other closely. After the change the 40 bi and crt models were made from the changed originals and every template
matches them (1 220 comparisons), in the C# renderer too (1 180), and the modeler gives the same SQL for the 38
canonical ones; on the SQL Server all the checks then passed (37, 35 and 42).

**A syntax check of the generated SQL.** Every one of the 59 generated scripts, and the test scripts, were parsed once
with Microsoft's T-SQL parser (ScriptDom, SQL Server 2016 grammar, the SQL inside `EXEC('...')` strings included),
from a scratch folder; it is not a tool in the repository. It checks syntax, not names, and it accepts some things
that SQL Server does not (an `ORDER BY` in a `UNION` member); a lexical error (such as `[]`) ends its run, so what it
reports for a file is not always all there is. The test models and the test scripts parse. What it found is in the
originals too, in models that reach it:
- the known `STschema.metadata.equivalentSuffix` column (uni, natural keys with equivalence: `equivalence`,
  `distinct-equivalence`, `equivalence-original`, `equivalence-plain`, `flags`, `partitioned`) and the identity
  columns without a type of the `handwritten` bi and crt models (the model), both listed above; kept;
- fixed (2026-10-09): with the original naming convention a knotted attribute had no `knotBusinessName`, so the
  business perspectives aliased it `[]` (`plain` and `equivalence-original`, all temporalizations);
  `SQL/NamingConvention.js` sets it as the improved naming does;
- fixed: an encrypted knotted attribute was decrypted with `CAST(DECRYPTBYKEY(...) AS )`, without a type (uni
  `encrypted`). A knotted attribute cannot be encrypted, which is the modeler's rule, but the modeler tested the
  group name with `> 0`, which a name never is, so it kept and saved the group; the generators then decrypted and
  encrypted a knot reference that the table stores as the knot's identity. The modeler applies the rule now, and
  `getEncryptionGroup` in `SQL/Helpers.js` is empty for a knotted attribute (as `isEquivalent` is false), so older
  files generate correctly too; the three `encrypted` models were saved through the modeler again;
- fixed: with metadata off the tables of an equivalent knot had a dummy column without a name (` bit null`, uni
  `equivalence-plain`): `knot.dummyColumnName` was set for Snowflake only. The dummy column is a SQL Server
  workaround (a table of nothing but an identity column cannot take several new rows in one insert), so the name is
  now set in `SQL/SQLServer/NamingConvention.js` too, not in the common naming convention: other databases may need
  something else. PostgreSQL, BigQuery and Vertica read `knot.dummyColumnName` in their `CreateKnots` and still get no
  name there.

Not a syntax error, so not found by the parser: with the original naming convention a knotted attribute's columns in
the perspectives are named after its knot alone (`UTL_Utilization`, `UTL_ID`), so two knotted attributes of one
anchor on the same knot (`AVG` and `MIN` in the `plain` and `equivalence-original` models) give a view the same
column twice, which SQL Server rejects. That is a limit of the original naming, left as it is.

**Not done or kept:**
- PostgreSQL has its own copies of these triggers (`SQL/PostgreSQL/*/Create*Triggers.js`); they were not changed.
- An encrypted historized attribute in uni compares encrypted values in its insert trigger, so neither identical
  rows nor restatements are recognised (as before); a static one now compares the decrypted values.
- crt, idempotent: the following version is retracted only when it is visible at the positing time of the new one;
  a statement posited earlier than the following version is stored as before.
- Two different values for the same slot in one insert statement still fail on the key of the trigger's table
  variable rather than with the contradiction message.
- In bi and crt, retracting the newest posit shows the one before it, also after a correction of a static value
  (the corrected posit stays asserted). This is how corrections work in the posit model and was left as it is.
- The key generator of a uni nexus (`k<nexus>`) inserts only the metadata too, so it cannot make rows for a nexus
  with roles. It was left as it is.

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
  `MERGE`/`INSERT` itself. The skill documents load patterns for that. **Decided (with the user): not generated
  load procedures**, which would serialise the inserts. Once an anchor's identities exist, every one of its attributes
  can be loaded in parallel, and a tie once the anchors it joins are in. So the load is a **task graph**: a task per
  anchor (and nexus) as the parent, and a task per attribute and per tie as its children, each a plain idempotent
  `INSERT ... SELECT` that draws identities from the sequences. The skill's Data Loading Workflow already describes
  these statements. What a generator would need and the model does not hold is the source: a staging table and a column
  for each key and value. That is a mapping, which would be a binding of its own (like the model's JSON), and a
  `CreateLoadTasks` template over model and mapping. A design task, not a port.
- **Natural-key lookups** (`uni/CreateKeys`, 500 lines). The example model defines nine `<key>` elements, so
  this is used: key tables and views that resolve an anchor's identity from its business key by walking
  attributes and ties. It is the read half of the write path, and a loader needs it.
- **Integrity checking.** SQL Server enforces primary, foreign and unique keys, the restatement
  constraints (`AddAttributeRestatementConstraints`, `AddTieRestatementConstraints`) and, in bi and crt,
  entity integrity through indexed assembled views. Snowflake enforces none of it, and since every key is
  declared `RELY`, a violation gives silently wrong results. The Snowflake counterpart is generated
  integrity-check queries or views (duplicate identities, orphans, restatements, overlapping intervals).
  **Done for keys and uni restatement:** `CreateIntegrityChecks.sisula` in uni, bi and crt makes a view `ic_<table>`
  for every table and `IntegrityViolations` for the model (a check for every key the tables declare, and for an
  attribute or tie that may not restate). The orphan checks use a column of the referred table in the WHERE clause
  so that a `RELY` foreign key cannot make the optimizer remove the join; whether that holds is only shown by a test
  on an account (the skill's `generator.md` says how). **Not done:** restatement in bi and crt (posit and annex
  semantics), overlapping intervals, and entity integrity in the bitemporal sense.

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
  (models, golden files, tools, and `sqlserver-tests` for the SQL Server triggers), `lib/Jint.2.11.58.dll`.
- **sisula-mssql:** the C# renderer (`clr/SisulaRenderer.cs`) and `tests/run-fixtures.ps1`.
- **workflower:** vendors the engine the same way (`tools/sync-sisula.ps1`, `webapp/sisula.js`).
- **dw-framework:** the old ETL framework, which uses dialect A and is not meant to change.
