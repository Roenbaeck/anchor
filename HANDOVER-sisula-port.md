# Handover: porting the generators to the Sisula engine

**Status:** the Snowflake and SQL Server generators for all three temporalizations (uni, bi and crt) are ported
and are what the modeler runs. The other databases (PostgreSQL, Oracle, Vertica, BigQuery) still run on the
original engine.
**Written on:** 2026-10-01, last updated on 2026-10-14 (natural keys for Snowflake).
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
| Snowflake templates | `SQL/Snowflake/{uni,bi,crt}/*.sisula` | The directives list 15, 15 and 16 templates. bi and crt reuse `uni/AddDescriptions.sisula`, as their original directives reuse the sisulet, and `uni/CreateKeys.sisula`. |
| Snowflake derive | `SQL/Snowflake/derive.js` | Facts the templates need that the sisulets computed with helper calls (see below). |
| The directives | `Snowflake_{uni,bi,crt}.directive` | Prelude scripts first, then the templates, in render order. |
| The tests | `sisula/examples/anchor` (in the **sisula** repo) | 98 models, golden files (approved output from the templates), and the tools that compare. See below. |

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
The engines run under the Jint in `sisula/lib`. Run from `sisula/examples/anchor`:

```
powershell -File tools\run-all.ps1                       # Anchor's templates against the golden files, every model
powershell -File tools\run-all.ps1 -Temporalization bi -Name CreateKnots   # a part of it; -Anchor <worktree> reads another checkout
powershell -File tools\csharp-check.ps1                  # the C# renderer (SQL Server) on the same templates and bindings
powershell -File tools\browser-check.ps1                 # the real modeler in headless Edge: Generate SQL against the golden files
powershell -File tools\browser-check.ps1 -Bindings       # the modeler's JSON bindings against the resolver's
powershell -File tools\browser-check.ps1 -Features       # the modeler hides what the selected database does not implement
powershell -File tools\regenerate-golden.ps1             # golden files from the templates; read git diff afterwards
powershell -File tools\make-variants.ps1                 # after a change to base.xml (see the models below)
powershell -File tools\sqlserver-tests.ps1 -Server <name>   # needs SQL Server: the triggers, the natural keys, and deploying every model
powershell -File tools\snowflake-tests.ps1 -Account <id> -TokenFile <path> -Warehouse <name> -Role <name>
                                                         # needs a Snowflake account: what the perspectives show
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
`34d0b93` shows how they were run (use it for the next database, see below). The same was done for SQL Server on
2026-10-14, once its output had been run on a SQL Server (the DDL, and the trigger tests of uni, bi and crt): its 74
sisulets and three legacy directives are at Anchor `729cd9c`, and `golden.ps1` in the sisula repo at `2115504`, which
reads a model's database from the model. What checks the golden files now: the other implementations
(`csharp-check.ps1`, `browser-check.ps1`), the lint, the trigger tests, and above all running the SQL.

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
   `sisula/examples/anchor/README.md` ("Porting the sisulets"): `while (x = schema.nextX())`
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
   `golden.ps1` (restore it from sisula `2115504`, where it reads the database from the model; it takes the original directive and splits the output per
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

- **Port the rest:** the other databases (PostgreSQL, Oracle, Vertica, BigQuery), only when someone needs one.
  SQL Server uni, bi and crt are ported, and their output has been run on a SQL Server (the DDL, and every suite of
  `tools/sqlserver-tests.ps1`: the triggers of all three temporalizations with the bi upgrade, the natural keys, and crt
  without decisiveness, all passing on 2026-10-15); so have the tests of `sisula-mssql` (`sql/test_fixtures.sql`,
  2026-10-14). Its original sisulets were then removed, as Snowflake's had been, so a fix is made once.
- **Assertions that arrive late** in bi and decisive crt are left as they are (the user, 2026-10-16); see *Corrections
  and what nexuses lacked*.
- **Run the generated Snowflake SQL** after a change: uni, bi, crt and equivalence have been run on Snowflake
  (2026-10-02), and so have the integrity checks (2026-10-08). The natural keys (2026-10-14) have not.
- **Natural keys** (see *Natural keys as routes* below): Snowflake and SQL Server generate them from `naturalKeys()`,
  and the modeler checks routes with the same rules. The SQL Server key tests pass; the Snowflake output has not been
  run on Snowflake. Whether a route may use another route (composition) is left for later (the user, 2026-10-14).
- **The Snowflake skill** (`anchor-snowflake-skill`): the generator hosted in Snowflake exists.
  `tools/build-snowflake-generator.ps1` writes one SQL script that creates `SISULATE` (the engine as a JavaScript
  function), `ANCHOR_BINDINGS` (the model XML to the bindings; `modules/XmlTree.js` reads the XML, since a JavaScript
  function has no `DOMParser`, and `modules/DomFacade.js` gives `Sisulator.objectify` a DOM; the prelude scripts of
  the directive are compiled into a function, since there is no `eval`), `ANCHOR_TEMPLATE` (the templates, base64)
  and `ANCHOR_GENERATE(model_xml, temporalization)`. The skill repository holds the built script, with its
  provenance in the first lines, and the docs (`references/generator.md`, `model-xml.md`) and workflow that use it.
  `hosted-check.ps1` in the sisula repository runs the JavaScript of the two functions under Jint on all models
  and compares with the golden files; the SQL around it (the `CREATE`s, `LISTAGG`) is only run by Snowflake. On
  2026-10-21 the script built from Anchor 3f14aa0 was installed on a test account, and `ANCHOR_GENERATE` gave the
  golden file for each of the 39 Snowflake models, byte for byte. To update the skill, after a change to a template or
  a prelude script: rebuild into `.snowflake/cortex/skills/anchor-modeling/generator/`.
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
  `examples/anchor/tools/converter-check.ps1` in the sisula repository tests for every pair. Lossy
  conversions are by design and come from the target (BigQuery has no time with a zone, no money; Snowflake no
  time with a zone, no uuid or XML type; Oracle widens `tinyint` to `number(3)`): converting there and back does not
  restore the original. Not covered: the modeler's own menu (the page is tested through `convert`, in headless Edge,
  by hand) and database-specific defaults other than `now` and the schema.
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
their directive, `SQLServer_uni.legacy.directive`, were what `golden.ps1` ran to make the independent output while the port was checked; they were
removed on 2026-10-14 (see *What the golden files are*). bi and crt for SQL Server are ported too, see the next section.

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

**To update this port:** change the template, regenerate the golden files from the templates (`regenerate-golden.ps1`), and read the diff; the
originals are gone, so a change is made once. Run `tools/sqlserver-tests.ps1` on a SQL Server when it touches the triggers or the keys.

## SQL Server bi and crt on the Sisula engine (ported 2026-10-08)

`SQLServer_bi.directive` (28 templates) and `SQLServer_crt.directive` (31) list Sisula templates only: `SQL/SQLServer/{bi,crt,biz,clr}/*.sisula` and
`SQL/SQLServer/CreateSchemaTracking.sisula`, after the same prelude as uni. The original sisulets, and their directives `SQLServer_bi.legacy.directive`
and `SQLServer_crt.legacy.directive`, were there for `golden.ps1` until 2026-10-14. The work was done by seven parallel workers (tables; attributes; tie views;
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

**Behaviour that differed between bi and crt** (kept at the port, the oracle had it): in crt the update trigger of an attribute left out `UPDATE(value)` for an
attribute that is not historized, so a value update of a static attribute created no posit. Fixed when the triggers were made consistent (2026-10-09), and
since 2026-10-15 such an update is a correction that also retracts what it corrects (see *Corrections and what nexuses lacked*).

**Known defects of the original that were kept, because the golden files carried them**, and what became of them (fixed 2026-10-15 unless said otherwise):
- The `handwritten` models (no `identity` on attributes and one tie): the identity column of the posit and annex tables, of the restatement tables and of
  the `@inserted` and `@posit` table variables is declared without a type (`EV_DAT_ID not null,`), which is invalid SQL. It is the model, not the generator,
  and is left as it is.
- `CreateTies`: every tie got the header "Knotted static tie table" (`tie.isKnotted()` was always true, since `Helpers.js` makes `knotRole` empty for every
  tie). It now looks at the list of knot roles, which also changes the headers of the other databases back to what the original modeler wrote.
- `CreateNexuses` (bi, crt): a knot role of a nexus that is equivalent referred to an `_ID` table that bi and crt never create. The branch is gone.
- `AddDescriptions`, the CLR check and the restatement checks of bi and crt looked at the attributes of anchors only. They take those of nexuses too, and
  the descriptions of nexus roles are added in all three temporalizations; so are the encryption groups of nexus attributes in uni.
- `CreateNexusPerspectives` (bi, crt): the unbracketed names (`[capsule].tNAME`) are bracketed. The comma after every role is right, since the functions are
  made only for a nexus with attributes, and the "drop" block for every nexus is harmless; both are left. The difference perspective called functions that
  no SQL Server template makes (`_AnchorTimepoints`, `_SplitMnemonic`, `_AttributeTimepoints`); it is now made the way the anchor one is.
- `CreateTieTriggers` and `CreateAttributeTriggers` (bi): the Swedish comment says in English what the line does, the tabs are spaces, and `U.` is `u.`.
- Trailing spaces and tabs that the original engine left in a few lines were reproduced with `$--$`. The markers and the spaces are gone from the SQL Server
  templates (not from Snowflake's).

**To update this port:** as for uni: change the template, regenerate the golden files from the templates (`regenerate-golden.ps1`) and read the diff.

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

**Tests of what the triggers do.** `sisula/examples/anchor/models/sqlserver-triggers.xml` (and `-bi`, `-crt`)
is a model made for them: an attribute for each combination of the settings that the triggers read, ties with and
without identifiers, and a nexus with an attribute. `sqlserver-tests/triggers-<t>.sql` there inserts, updates and
deletes through its views and prints PASS or FAIL for each rule above (37, 35 and 42 checks), and
`tools/sqlserver-tests.ps1 -Server <name>` makes an empty database per suite (triggers, and keys since 2026-10-14) and temporalization, runs the golden output of the
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
- In bi and crt, retracting the newest posit showed the one before it, also after a correction of a static value
  (the corrected posit stayed asserted). Since 2026-10-15 a correction retracts what it corrects, so this is gone.
- The key generator of a uni nexus (`k<nexus>`) inserts only the metadata too, so it cannot make rows for a nexus
  with roles. It was left as it is, and bi and crt were not given one.

## Corrections and what nexuses lacked (2026-10-15)

**Corrections.** The rules come from the transitional modeling paper (`transitional.tex`, at commit 4c5b7e89 of the
`transitional` repository): a correction is a retraction of the posit that was held and an assertion of another, at
the same positing time; information in effect excludes what is retracted. The triggers now write that retraction:

- bi (decisive by nature) and crt with decisiveness: the insert trigger of an attribute or a tie with identifiers and
  other roles retracts, at the positing time of a positive assertion, the posit in effect for the positor at the same
  changing time when it has another value. Only the one in effect: a database loaded before this can hold several
  from older corrections, and retracting them all would break the unique index of a decisive crt assembled view (one
  uncertain assertion per positing time). Loading out of order in positing time does not retract a later assertion.
- crt without decisiveness: an insert is an alternative and retracts nothing; the update triggers of the latest views
  (anchors, nexuses, ties with identifiers) write a retraction of the shown posit when the value changes at its
  changing time. The latest and point-in-time views still show one row for each identity and positor; the assembled
  views show every value held (the user's choice).
- bi's assembled views had a unique index on (entity, changing, positing): one row per positing time, which a
  correction and its retraction break. The index has the reliability now (for ties only those with identifiers and
  other roles), and the generated SQL makes an older index again with `DROP_EXISTING` when it finds one without the
  reliability, since the views themselves are made only when they are missing. The existing data of the bi insert
  triggers is read as one row per positing time (the assertion wins over a retraction at the same time), and the bi
  restatement triggers key their table on the reliability too.

**Defects found on the way.** A crt insert in which two positors state the same posit made the posit twice, and so
did a bi insert with one new posit at two positing times (an assertion and its retraction, for one): the posit is
made once now. The table of the crt tie insert trigger had no positor and, for a static tie, no version in its key.
The crt sheet stacks (`ss<attribute>`) ran their statement with `EXEC`, where the parameter of the procedure is not
seen, so they always failed; they use `sp_executesql` and are made for nexus attributes too. The schema tracking read
the roles of ties as `anchorRole` and `knotRole`, which the modeler no longer writes, so `_Tie` gave empty names and
everything built on it (`_Evolution`, `_GenerateCopyScript`, `_DeleteWhereMetadataEquals`, `_FindWhatToRemove`,
`_Key` for ties) was wrong; it reads `role` elements now (and still the old ones). `_Evolution` and
`_GenerateCopyScript` knew uni and crt only; bi is there now.

**Nexuses** came late to Anchor, so what anchors have and nexuses lacked was added (the user's direction: assume a
nexus should have it): update and delete triggers on the latest views of bi and crt (uni had them), roles that cannot
be updated (all three), the restatement constraints of bi and crt, the crt sheet stacks, descriptions of nexus
attributes (bi, crt) and roles (all), the CLR and encryption setup for nexus attributes, a difference perspective
that works (bi, crt), and in the schema tracking a `_Nexus` view, nexus attributes in `_Attribute` (with a `parent`
column), nexuses in `_Evolution`, the copy script and the delete procedure, and keys on nexus roles in `_Key`. Not
added: a key generator for nexuses in bi and crt, since the uni one cannot work for a nexus with roles. The Snowflake
templates were only compared by what they iterate over, where nothing was missing.

**Tests.** `triggers-bi.sql` b16 to b20, `triggers-crt.sql` c17 to c23, a new suite `indecisive` (crt only, the trigger
model with decisiveness off, `indecisive-crt.sql`), and an upgrade step for bi (`triggers-bi-upgrade.sql`, then the
generated SQL again, then `triggers-bi-upgraded.sql`). The nexus of the trigger models got a historized attribute
that may not be restated (`EV_PLC_Event_Place`). All of them pass on the user's SQL Server (2026-10-15, after a fix to
c22, which filtered the crt difference perspective on a column it did not have).

**The positor in the crt difference perspectives** (2026-10-15, the user: "a necessity"). The difference perspectives of
crt anchors and nexuses gave a row for each positor that changed something, but no column said whose row it was (the
attribute columns each have a positor, which is empty where the attribute has no value). They now start with
`Positor`, as Snowflake's crt difference perspectives do and as the other crt perspectives have it (`p.*`). Test c24.

**Assertions that arrive late (decided 2026-10-16: left as they are, documented).** A positor's assertions are ordered
by their positing time, which is when the positor made them, not when they reach the database. With decisiveness each
assertion holds until the positor's next assertion of another value at the same changing time, or until it is
retracted: A at T1, C at T3, then B at T2, then D at T2.5 mean A held over [T1, T2), B over [T2, T2.5), D over
[T2.5, T3) and C from T3, whatever the order in which they arrive. What cannot be done is to store the retractions that
decisiveness implies so that the rows do not depend on the order of arrival: when C arrives first, the trigger retracts
A at T3; once B and D are known, it is D that ends at T3, and A ended at T2. The stored rows would have to change, the
trigger cannot tell a retraction it derived from one that a positor stated, and keeping both gives two retractions at
T3, which the decisive crt and bi indexes refuse. Three choices were put to the user: let the views apply decisiveness
and store only what is stated; mark derived retractions and move them on a late arrival; or leave it. The user rejected
the first ("what is written should be consistent, and not resolved at query time", since not everyone reads through the
views), doubted that the second can always know what was meant ("it would be even worse if we enforce consistency at
write time, but end up with something the user did not intend"), and chose the third. A late assertion gets its start
(it retracts what was held before it) but nothing ends it; `docs/ANCHOR.md` says so, and to load in positing order.

**Consistency for data that arrives in order (2026-10-16).** Asked whether in-order data is now safe, the answer was yes
for positive assertions with positing times of their own, with these exceptions, which were then fixed:
- **Another value at the same positing time** (two statements in one tick of the clock, for one): bi refused it with a
  key error, decisive crt with entity integrity with an index error, and decisive crt without it stored both. The bi and
  decisive crt insert triggers now raise "Contradiction in <name> for: <key>", for a value already stored and for two in
  one insert, since which one was meant cannot be told.
- **A correction to the value of the version before** is a restatement, which an idempotent attribute or tie skipped
  entirely, so the corrected version stayed held. In crt the skipped statement (type `R`) now writes the decisive
  retraction; in bi the restatements that the idempotent part drops are kept in `@skipped` for it. One that may not be
  restated still refuses it.
- **Negative assertions.** The paper defines a decisive positor as one with a single assertion in effect, positive or
  negative, so the decisive crt triggers now count any assertion that is not a retraction, on both sides. bi has only 0
  and 1.
- **Non-contradiction without decisiveness** (the user pointed to the formula): the crt insert triggers check, for each
  new assertion that is not a retraction, the slice it is in (its positor, its changing time, as of its positing time):
  positive reliabilities count as they are, negative ones as one plus them, and the sum may not exceed one. The user's
  example: "40% not A" and "40% not B" are 60% A and 60% B. The update triggers therefore retract the shown posit before
  they assert the new value, or a replacement at full reliability would count twice. The working table of the crt
  insert triggers is keyed on the value too (ties: on all roles) when the model is not decisive, so that one insert can
  hold alternatives with the same positing time and reliability.
- In bi, a retraction followed by an assertion at the same positing time (a correction written in two statements) broke
  the key of the insert trigger's table; the existing data at a positing time that a new row has is now left out of it.
Tests: b21, c25 to c27, i07 (and i05 at reliabilities that leave room for an alternative).

**Supersession in the crt views (2026-10-21).** The crt time-traveling functions picked, for each identity, the
assertion of the requested kind with the latest changing time: asked for positive ones (as the latest, point-in-time,
now and difference perspectives are), they left a negative assertion out first and so showed the version before it,
"Red" from 2000 under "certainly not Green" from 2001. The user's reasoning, which is the paper's information in effect:
the latest changing time with an assertion that is not a retraction decides, an assertion there supersedes those at
earlier changing times whatever its sign, and a belief that is to last past it has to be asserted at that changing time
too (Red at 2001, concurrent with not Green). Asked for positive or negative assertions, the functions now keep only
those at that changing time (SQL Server: a correlated `max` over the rewinder; Snowflake: a window over it, so that no
correlated subquery is nested in another); asked for all or for the uncertain, they are as they were. The views stay
limited to positive assertions (the user's decision): a negative assertion in effect shows as nothing. The same change
found that the Snowflake crt tie function returned every posit of a tie whose latest assertion was of the requested
kind, every version and every corrected value, where uni and bi pick the one in effect for the identifiers; it now picks
it too. Tests c28 and i08; on Snowflake, c02 and c06 of the Snowflake tests (see the next section).

## The Snowflake perspectives run on Snowflake (2026-10-21)

The user gave a programmatic access token for a test account, and the generated SQL was run there with rows in it for
the first time. Before, only the DDL had been run, and Snowflake compiles the body of a view or a function only when it
is used, so that said little. `tools/snowflake-tests.ps1` in the sisula repo talks to the SQL API. For distinct,
distinct-bi, distinct-crt and distinct-equivalence it makes a database and runs the golden SQL in it. It then runs
`snowflake-tests/<suite>-<t>.sql`, which puts rows straight into the tables and writes its checks to `test_result`, and
last `compile.sql`, which queries every view and calls every function once. What it found:

- **A subquery that refers to the outer row and takes the first row of an ordering** (`ORDER BY ... LIMIT 1`): every bi
  and crt latest, point-in-time, now and difference perspective failed with "Unsupported subquery type". They use windows
  now (`QUALIFY row_number() ...`), as SQL Server uses `TOP 1`.
- **A function called for each row of another table** fails when its argument is used in an outer join, a window or a
  subquery, and empty tables hide it. This affected three groups:
  - the uni and equivalence difference perspectives, which called the point-in-time function for each change;
  - every bi and crt difference perspective, which called the time-traveling function the same way;
  - the crt latest, point-in-time and now perspectives, once a second positor had stated something, since they call the
    time-traveling function for each positor.

  The fixes:
  - The difference perspectives join each change with every value and the changing time until which it holds, a
    `lead()` over its history. In bi that is the latest asserted posit at each changing time; in crt it is the positive
    posit at each changing time with an assertion that is not a retraction, or nothing if there is none.
  - The crt time-traveling functions work out the views of all positors and keep the one asked for in the outermost
    WHERE. Their rewinders take a null positor for all positors.
  - A knotted attribute's knot is joined inside its derived table; joined outside, Snowflake failed again.

  So a crt positor has to be in `_Positor` to show (documented in ANCHOR.md, "Perspectives in Snowflake").
- **A wrong result from Snowflake.** The uni one-to-one tie perspectives compared with the `max()` changing time of
  the rows that share either anchor, a subquery correlated with OR, and Snowflake kept rows that it should not. The same
  subquery in the select list gives the right maximum. They use windows partitioned by each anchor role now, joined
  with AND.
- **`varbinary(max)`** for an attribute in an encryption group, which Helpers.js gives in every database. Snowflake
  has `binary` (derive.js), and the lint flags `(max)` now.

The uni point-in-time and latest perspectives keep their correlated `max()`. It is right, and Snowflake takes it as long
as nothing calls them for each row of another table. The difference perspectives are now built apart from the
time-traveling functions, and the tests check that they show the same at each change. Checks: perspectives uni 22, bi
15, crt 17 (two positors and the Red/Green supersession), equivalence 13, each with the compile check.

## SQL Server tests from the development machine (2026-10-21 and 22)

The user's test server, s-k1dw-db-t, can be reached from the laptop: SQL Server 2014 (12.0.6433.1, Developer Edition),
Windows authentication, with an expired certificate, so `-TrustServerCertificate`. There is no sqlcmd here, so
`sqlserver-tests.ps1` runs the scripts with the .NET Framework's SqlClient when it finds none: one connection for a script,
the batches split at GO, rows, messages and errors printed as sqlcmd prints them, and an error that does not end its
batch, as in sqlcmd. The tests run on 2014, and the docs now ask for 2014 or later.

**The update triggers and SQL Server 2014's memory.** Creating the crt update trigger of an anchor with twelve
attributes, `ut_lSU_Subject`, took 59 s and failed with error 701. All the while `MEMOBJ_PARSE` grew from 60 MB to over
6.5 GB. Narrowed down on the server:
- The cost grew faster than the trigger: about 1.4 GB for two attributes, 4.2 GB for four.
- Empty nested triggers on the views it inserts into changed nothing.
- `UPDATE(column)` replaced by a constant, or `inserted` and `deleted` copied into temporary tables, made it cheap.

So the cost is `UPDATE(column)` inside a statement that reads `inserted` or `deleted`, presumably binding the view behind
them again for each call. The user remembered a 2014 bug with nested triggers that made memory run wild. The update
triggers of anchors, nexuses and ties, in uni, bi and crt, now ask each `UPDATE()` once into `@updated_<column>`, and
the checks that a column is not updatable keep `IF(UPDATE(...))`.

The crt trigger is now created in about a second, and the updates run as fast as before (uni and bi, old against new,
2,000 rows). A variable name holds 128 characters with the `@`, so a column name of 120 or more would need a shorter
flag. The server's max server memory is unlimited, and SQL Server kept about 12 GB of free memory after the spike. That
is the user's to change.

**The deploy suite** (`-Suite deploy`, in the default run) runs the generated SQL of every SQL Server model but the
handwritten ones, each in an empty database. The generated SQL creates no schemas; the original sisulets did not
either, so the suite makes them first. It also replaces the placeholder of the encryption password. It found three
defects, and the user decided each:
- Encryption groups exist only in SQL Server uni. In bi and crt an encrypted attribute became an unencrypted
  `varbinary(max)` that the posit table's key cannot hold. **Ignored in bi and crt.**
- The business views, shared by uni, bi and crt, read the equivalence functions that only uni makes. **Equivalence is
  ignored in bi and crt**, as Snowflake does.
- With the original naming, two attributes on one knot give a perspective two columns of one name, in every database.
  **Left as it is:** documented in ANCHOR.md ("Generated objects and naming"), and the modeler warns in the console
  when it loads such a model (`Actions.checkNaming`). The deploy suite reports these models as KNOWN, not as failures.

The first fix uncovered two more defects, which encryption had hidden:
- The business views named the positor column `Positor` instead of using the model's positor suffix.
- With knot aliases on, the bi time-traveling functions selected a knot's value a second time, without a name.

Both are fixed. All 60 SQL Server models now deploy, except the six known cases.

The first two are done with a table of features in `SQL/Helpers.js` (`FEATURES`): what the templates of a database
implement for each temporalization. A feature that they do not implement is ignored, as if the model did not have it.
`isEquivalent()` and `schema.EQUIVALENCE` are false, and `getEncryptionGroup()` gives nothing; the attribute's
`ignoredEncryptionGroup` names the group instead, for a comment in the SQL. A database that is not listed has every
feature. Snowflake implements no encryption, so its encrypted attributes keep their own type now, instead of the
`binary` of the day before. The modeler hides it too (2026-10-22, the user wanted hidden, not disabled): `Features` in `index.html` reads the
table from `SQL/Helpers.js` (the JSON between `/*features*/` and `/*end features*/`, so that there is one table),
sets the body classes `no-equivalence` and `no-encryption` that `application.css` hides the settings with, and the
editables carry a `feature` that the hover panel and the tabular editor check. It does it when the database or the
temporalization changes and when a model is loaded; before the table is read, and for a database it does not list,
nothing is hidden. Nothing in the model is changed, only reported in the console. `browser-check.ps1 -Features` in the
sisula repository checks it in headless Edge for seven combinations against the table.

## Model checks in the hosted generator (2026-10-30)

The generator that runs in Snowflake used to take whatever XML it was given: a missing setting in `<metadata>` gave names
such as `GEN_undefined`, and a knot or role that referred to nothing gave an error far from its cause. `modules/ModelCheck.js`
now checks the model first and throws one error that lists every problem and where it is (`The model has N problems, so
nothing was generated`). It is the rules of `anchor.xsd` that need no XML Schema 1.1 processor, plus the 46 settings that the
generators read (with the value that the modeler would give each, which the message shows). It reads the model through the
parts of the DOM that a browser and `DomFacade.js` share, so the modeler could use it as well; it does not yet.

`hosted-check.ps1` in the sisula repository runs the 39 Snowflake models through it (none may be refused) and eleven models
that were broken in one way each, and checks what the message says. One check is not made, on purpose: with the original
naming, two attributes on one knot give a perspective two columns of one name (see *Generated objects and naming* in
ANCHOR.md). Several models in the tests have that, to show it, so the generator cannot refuse it without refusing them.

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
  attributes and ties. It is the read half of the write path, and a loader needs it. **Done for Snowflake**
  (uni, bi and crt, 2026-10-14), differently and more completely than SQL Server does it; see *Natural keys as
  routes*.
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

## Natural keys as routes (2026-10-14)

The user asked for natural-key lookups in Snowflake, and for a check that treating keys as routes and stops in
the graph holds up, in theory and in the implementation. `docs/ANCHOR.md` ("Keys and identifiers") has the rules
as a modeler reads them; `naturalKeys()` in `SQL/Helpers.js` has them as code.

**The idea holds up.** A natural key is a tuple of values reached from the anchor or nexus it identifies. The
`<key>` elements describe a tree rooted there: each branch is a path to one value, `stop` orders the walk along a
path and the values of the key among themselves, and `route` names one of several keys. That expresses the keys
that occur: the entity's own attributes, one or many; attributes of other anchors through nexus roles and ties,
at any depth; and the values of knots. Two stops per tie are necessary, since an anchor can play two roles in one
tie (`parent`, `child`); one stop per nexus role is enough, since a nexus role is a direct edge. What the format
cannot promise, and what therefore has to be checked, is:

- that a route is well formed: each branch a connected path from the entity that ends in a value, every stop a
  number used once. Nothing checked it before; `naturalKeys()` does, and gives the first thing that is wrong.
- that every step is functional, so an identity has one value of each kind. An attribute and a role leaving a nexus
  are; a tie is when no role other than the one it is entered by is an identifier (the identifier roles are the
  tie's key, and none means one-to-one); a branch that enters a nexus by one of its roles is not. The model shows it,
  so `naturalKeys()` notes it; the data shows it, so `ic_key_` checks it.
- that the key is unique: no model can promise it, Snowflake cannot enforce it (`ic_key_` reports it), and the key
  tables of SQL Server could, but nothing fills them.

A route that passes something historized, an attribute or a tie, gives a key that changes, so a lookup is made at a
time, and uniqueness holds at each time; a `UNIQUE (values, ChangedAt)` constraint, which SQL Server's key table has,
does not say that. Limits of the format, left as they are: a stop on a knot (the modeler allows it, the XML schema
does not) adds nothing that a knotted attribute or a knot role does not, so it is an error; a route cannot use
another route (the event's key repeats the stage's path, and has to be changed with it), where a branch that ends in
the related identity, found first by its own key, would match how loads run; and a key on an equivalent attribute
takes what the perspective shows, with no way to name the equivalent.

**The implementation did not hold up.** Found by rendering models with more routes (the scratch copy of
`sqlserver-base` with a tie route, two ties in a row and a knotted attribute, and `keys.xml`):

- `Helpers.js` builds `keys` from anchor attributes and tie roles only, so keys on nexus attributes and nexus roles
  are dropped. The example's own event key (`EV 1st`, in `docs/ANCHOR.md`) keeps two of its five stops, and a nexus
  whose keys are on its own attributes gets none. Fixed: those `keys` are gone, and every generator reads
  `naturalKeys()`.
- The stops are an object read with `for..in`, which a browser orders by number and Jint, which makes the golden
  files, by insertion (`3,1,10,2` stays `3,1,10,2`). Attribute stops are inserted before tie role stops, so every
  route through a tie came out in another order in Jint than in the modeler; the JSON bindings of `keys.xml` differed
  between the two. Fixed: `Helpers.js` adds the stops and routes again in a browser's order, so every engine reads
  the same one; no golden file changed.
- SQL Server's `CreateKeys` (the original and the template, which match): a branch of one stop takes the identity of
  the attribute's own anchor and calls it the key's (`ST_LOC_ST_ID AS EV_ID`), so the event key view pairs events with
  the stages that have the same number, and the key table's `UNIQUE` without the date rejects valid data; a knotted
  attribute gets no data type (`CAST(... AS )`, `ST_MIN_UTL_ID  NOT NULL`); a second tie in a row is joined without an
  `ON`; in Jint even one tie renders `SELECT  AS EV_ID` and joins to the anchor of the previous route; a historized
  tie does not make the key historized, and the view takes the `MAX` over all of its versions; and the key tables of
  `naturalKeyAttributes` are created but never filled. Fixed: replaced, see below.
- `NamingConvention.js`: the role of the last stop of a route prefixed the first column of the next route (in the
  test, `PR 1st` became `child_PR_NAM_Program_Name` after a route of `AC`). Fixed; no test model changes. The first
  assignment of `routedChangingColumnName` is dead, which changes nothing.
- The modeler (`index.html`, "WIP: keys"): a route can only start at an anchor, so a nexus key has to be written by
  hand; knots offer the key operations and write `<key>` into `<knot>`; a route is not checked beyond its `of` and
  its name; a removed stop keeps its number on the drawing (the numbers are added as numbers and removed as text).
  Fixed, see below; a knot still reads and writes the `<key>` of a file that has one, so nothing is lost.

**What was done.** `naturalKeys()` (shared, in `Helpers.js`; called from a `derive.js`) reads every `<key>`, orders
stops by number, follows the rules above, and returns plain data: per route the joins (only the anchors and nexuses
whose columns are read; one without attributes is read as its table, since it has no perspectives), the columns,
the columns that are compared (the checksum where there is one), notes and the problem. `SQL/Snowflake/derive.js`
calls it, types the checksums and refuses a value that cannot be compared (a geography without a checksum).
`SQL/Snowflake/uni/CreateKeys.sisula`, listed by all three Snowflake directives before the integrity checks, makes
per route `key_<entity>_<route>` (from the latest perspectives), `pkey_<entity>_<route>(changingTimepoint)` (from
the point-in-time perspectives, when the route passes something historized) and `ic_key_<entity>_<route>`, which
`IntegrityViolations` includes; crt keys are per positor, and an entity without perspectives gets its positors from
`_Positor`. A route that breaks a rule is a comment in the script with the reason. Tests: `keys.xml`, `-bi`, `-crt`
in the sisula example (made by `tools/make-keys-models.ps1`), which reach every rule and every way of breaking one.
SQL Server is unchanged; its output is identical for every test model.

**Then, after the merge (2026-10-14; the user decided the shape):** SQL Server's keys are the same as Snowflake's, in
uni, bi and crt: `SQL/SQLServer/uni/CreateKeys.sisula`, listed by all three directives after the perspectives it reads,
makes `key_`, `pkey_` and `ic_key_` (the key of a violation as text, `name=value, ...`, with checksums in hex), and,
with `naturalKeyAttributes`, a key table per route with a primary key on the identity and a unique constraint on the
key, filled by `refresh_<entity>_<route>`, which fails, and leaves the table as it was, on a duplicate key. A (max) value
without a checksum can be compared but not be in a unique index, so such a route gets no key table, and a geography,
geometry, xml, text, ntext or image without one makes the route unusable (`SQL/SQLServer/derive.js`). The `keys`
that Helpers.js built, their naming in `NamingConvention.js` and `keyRoutes` in the SQL Server `derive.js` are gone.
The modeler: a route can start at a nexus; a knot is not offered as a stop (one already in a file can still be
removed); a removed stop takes its number off the drawing and the others are renumbered there too; and when a model is
opened, `Actions.checkKeys()` runs `naturalKeys()` after the shared naming convention and writes every route that the
generators leave out, and every step that is not functional, to the console, next to the integrity check. Tests:
`sqlserver-keys.xml`, `-bi`, `-crt` (the same routes on `sqlserver-base`) and `sqlserver-tests/keys-<t>.sql`, which
`tools/sqlserver-tests.ps1` now runs after the trigger tests (`-Suite triggers,keys`): lookups through every kind of
route, the point-in-time key, the checks, the refresh procedure and its failure, and crt per positor.

**The first run of the key tests on a SQL Server** failed before any test: the checks used `FOR JSON` for the key of a
violation, which SQL Server reads only at compatibility level 130 and later, and the databases that the tests create
take their level from `model`, which on the user's server must be lower (the server runs JSON functions; "Incorrect syntax near 'WITHOUT_ARRAY_WRAPPER'").
The trigger tests use nothing of the kind. The checks now write the key with `CONCAT`. Generated SQL should not depend
on the compatibility level: parse it with the grammar of SQL Server 2014 too (ScriptDom's `TSql120Parser`), which
gives "Expected XML but encountered JSON" for the old checks and nothing for the new ones or the trigger tests.

## Where things are, by repository

- **anchor:** this file, the engine copy, the resolver, the templates, the directives, the modeler.
- **sisula:** the engine's source, the language reference, the fixtures, `examples/anchor`
  (models, golden files, tools, `sqlserver-tests` for the SQL Server triggers and `snowflake-tests` for the Snowflake
  perspectives), `lib/Jint.2.11.58.dll`.
- **sisula-mssql:** the C# renderer (`clr/SisulaRenderer.cs`) and `tests/run-fixtures.ps1`.
- **workflower:** vendors the engine the same way (`tools/sync-sisula.ps1`, `webapp/sisula.js`).
- **dw-framework:** the old ETL framework, which uses dialect A and is not meant to change.
