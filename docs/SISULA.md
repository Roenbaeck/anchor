# Sisula language reference

This document describes the Sisula template language. The reference implementation is `core/sisula.js`; `sisula-mssql` implements the same language as a SQLCLR function (`SisulaRenderer`) and must behave identically. Both are checked against the shared fixtures in `tests/fixtures/`.

Blocks and tokens
- Template blocks are delimited by `/*~ ... ~*/`. Everything outside blocks is passed through unchanged. If a template has no `/*~ ... ~*/` delimiters, the entire template is treated as a Sisula script (tokens + line directives).
- Tokens are written as `$path.to.value$` or `${path.to.value}$` and support bracket indexing (e.g. `source.parts[0].name`). Token values are resolved against the JSON bindings or loop variables.
- Path segments may use Unicode letters (e.g. `$VARIABLES.ÅÄÖ$`); they are quoted appropriately in JSON queries.

Escaping token forms
- `$'path'$` renders the value as a **quoted SQL string literal**, including the surrounding quotes. Use it everywhere a value lands inside a literal:

        COMMENT = $'task.description'$
        CALL SYSTEM$SET_RETURN_VALUE($'step.message'$);

  It doubles the single quote, doubles the backslash, turns carriage returns and newlines into `\r` and `\n`, and turns a dollar into `\x24`. The last of those matters because a doubled dollar inside a value would otherwise close the enclosing procedure body. A missing path renders `''`, which keeps the SQL valid.

- `$|path|$` renders the value as **text safe on a single SQL comment line**. Newlines and tabs collapse to spaces and adjacent dollars are separated:

        -- Execute: $|step.description|$

  Without this a two-line description would put its second line outside the `--` comment, as executable SQL.

- The plain `$path$` form interpolates verbatim. It is correct only where the value is genuinely SQL, such as a step's `sql` or an imported task body, or where it is a bare identifier.

All three forms are resolved in a single pass, so a dollar that appears in a *rendered value* is never reinterpreted as a token.

Line directives
- All line directives require the `$/` prefix.
- Foreach:
  - Syntax: `$/ foreach <var> in <path> [where <expr>] [order by <path> [desc]]` ... `$/ endfor`
  - Iterates over a JSON array found at `<path>` (supports loop variable scoping and nesting).
  - Optional `where` filters items using the same expression language as `$/ if`.
  - Optional `order by` supports numeric-aware sorting and an optional `desc` flag.
    - Inline form: `$/ foreach <var> in <path> <content> $/ endfor` — repeats `<content>` for each item (content is evaluated with the loop variable in scope and supports inline-if tokens).
- If:
    - Block form: `$/ if <condition>` ... `[ $/ else ... ]` ... `$/ endif` — optional `$/ else` renders an alternate branch when the condition is false.
    - Single-line form (inline-if): `$/ if <cond> <when-true> $/ else <when-false> $/ endif` — optional `$/ else` controls the false branch; omit it to render nothing on false. The inline content respects the indentation where the directive appears.
        - Inline-if directives can also appear inside a content line to add or remove inline fragments (useful for trailing commas or comments that depend on metadata). An inline if cannot contain another inline if; use block ifs for nested choices.

Comments
- Line comments: start a line with `$-` (optionally indented) to remove it, newline and all, from the rendered output.
- Inline comments: wrap comment text as `$- ... -$` to drop the span while keeping the surrounding content.
- Comments are stripped before token or directive evaluation.

Loop metadata
- Each `foreach` injects per-loop metadata that's accessible by the loop variable name via method calls.
    - Use the method form to access loop metadata: `varName.index()`, `varName.count()`, `varName.first()`, `varName.last()`.
    - Tokens can reference these methods directly, e.g. `$c.index()$`, `$t.count()$`.
  - Only the method form is supported to avoid ambiguity in nested loops and path parsing.

Expression language
- Comparison operators: `==, !=, >=, <=, >, <`. A single `=` means the same as `==`. Numbers are compared as numbers and everything else as text, ignoring case.
- Logical operators: `and`, `or` (case-insensitive). Operator precedence: `and` is evaluated before `or`.
- Negation: `not x` or `!x` (case-insensitive) negates the single term that follows it, which can be a path, a loop-metadata call, a function call or a comparison (`not a == b` means `not (a == b)`). `not` binds tighter than `and` and `or`, so `not a or b` is `(not a) or b`. There are no parentheses.
- Functions: `contains(x,"y")`, `startswith(x,"y")`, `endswith(x,"y")`.
- String literals use double quotes (`"value"`). Escape a double quote inside a literal with `""`.
- Single-quoted literals are not supported (use double quotes exclusively).
- Truthy checks on paths: null/empty/false/"0"/"null" and an empty array are falsey. Any other array or object is truthy.
- A condition the renderer cannot parse, for example `x y z`, is an error. It is never silently treated as false.
- Expressions are used by `$/ if` and `foreach where`.

JSON binding and resolution
- Bindings are passed as a single JSON document: `sisulate(template, bindingsJson)`. Hosts wrap this as they see fit (`SISULATE` in Snowflake, `fn_sisulate` in SQL Server).
- `foreach` iterates over a JSON array.
- Scalar values are returned as strings; complex values (objects/arrays) are returned as JSON text.
- **A path reaches only what the JSON itself holds**: the properties of an object, and the elements of an array by index, `[n]`. A path that names anything else, such as a property that is not there, an index past the end, a name on an array or a segment below a scalar, has no value, and renders as an empty string. In particular there is no `length`: an array has no named members, and neither does a string. Where a template needs a count, put the count in the bindings. This is what lets the same template give the same output in every host: the JavaScript implementation reads the document as JavaScript objects, which have members JSON does not (`length`, `constructor`, `toString`), and the SQL Server implementation reads it with `JSON_VALUE`, `JSON_QUERY` and `OPENJSON`, which do not see them.
- A property whose name happens to be `length` is an ordinary property and is read like any other.
- Hosts differ in limits that are not part of the language. SQL Server reads a scalar through `JSON_VALUE`, which returns at most 4000 characters, so a longer scalar renders as an empty string there.

Examples

Inline token example:

    SELECT $S_SCHEMA$.$table.name$

Foreach example with order by:

    /*~
    $/ foreach part in source.parts order by part.ordinal
    CREATE TABLE [$S_SCHEMA$].[$part.name$] (...);
    $/ endfor
    ~*/

Foreach example with where:

    /*~
    $/ foreach part in source.parts where part.type == "table"
    DROP TABLE [$S_SCHEMA$].[$part.name$];
    $/ endfor
    ~*/

Nested foreach example with loop metadata:

    /*~
    $/ foreach table in source.tables
    $- loop over tables
    $/ if t.first()
    -- First table comment
    $/ endif
    $/ foreach col in table.columns
    $- loop over columns
    $/ if c.last()
    ALTER TABLE [$S_SCHEMA$].[$table.name$] ADD [$col.name$] $col.type$;
    $/ endif
    $/ endfor
    $/ endfor
    ~*/

Inline-if example (single-line, follows indentation):

    $/ if c.first() -- first column $/ else -- not first $/ endif

Inline-if embedded within a line (e.g., mark the last column):

    [$c.name$] $c.type$$/ if c.last() -- last column marker $/ endif $- inline sisula comment -$

Inline foreach example (single-line):

    $/ foreach col in table.columns $col.name$, $/ endfor

Multi-line if example with truthy check:

    $/ if source.enabled
    -- Enable feature
    $/ endif

Multi-line if example with function:

    $/ if contains(table.name, "temp")
    -- Temporary table logic
    $/ endif

Multi-line if example with comparison:

    $/ if table.priority > 5
    -- High priority table
    $/ endif

Multi-line if example with else branch:

    $/ if table.enabled
    -- Feature enabled branch
    $/ else
    -- Feature disabled branch
    $/ endif

Multi-line if example with AND operator:

    $/ if item.price > 50 and item.category == "electronics"
    -- High-value electronics
    $/ endif

Multi-line if example with OR operator:

    $/ if item.featured == true or item.discount > 0
    -- Special item
    $/ endif

Foreach with WHERE using AND/OR:

    $/ foreach item in items where item.price > 30 and item.stock > 0 or item.category == "sale"
    -- Available or on sale: [$item.name$]
    $/ endfor

Whitespace & inline directive rules
------------------------------------

Small templates often rely on precise spacing when embedding inline directives. The renderer follows these ergonomic rules so authors get intuitive results:

- Trailing whitespace that is written inside a branch is preserved. Example: `Index $c.index()$ found ` will keep the trailing space after `found` when rendered.
- Whitespace between a `$/` marker and the following keyword (for example the space in `$/ else`) is ignored and does not affect branch content.
- When an inline directive is embedded in a larger inline `foreach`/`if`, spacing between directives is treated as separation, not as part of a branch. In practice this means you can add a single space before/after branch content as a separator and it will be preserved consistently.
    - The inline-if parser avoids splitting the condition at whitespace that is adjacent to logical operators (`and`/`or`) or binary operators (`==`, `=`, `!=`, `>=` etc.). This prevents accidental branch splitting for expressions like `c.type == "varchar" or c.type == "char"`.

- Whitespace after `$/ endif` is swallowed, and so is the whitespace between an inline condition and its first branch. Put spaces that belong to the output inside a branch: `$/ if x $x.count$ $/ else 0 $/ endif items`.
- In `$/ if c A $/ else B$/ endif` the true branch keeps the space before `$/ else`, and the false branch keeps anything before `$/ endif`.
- A line that holds only an inline if renders as an empty line when the chosen branch is empty. Use a block if to leave out a whole line.
- To end a line with a space that an editor might trim, write it before an empty inline comment: `x $--$` renders as `x ` followed by the newline.
- A line that holds a complete inline `if` or `foreach` never opens a block, so it is safe inside the body of a block `if` or `foreach`.

If you need separators only between items (but not after the final item) prefer using a conditional that inspects `varName.last()`, for example `$c.name$$/ if not c.last() ,$/ endif`, or generate separators in a separate `foreach` pass.
