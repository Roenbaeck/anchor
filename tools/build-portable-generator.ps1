<#
    Builds the Anchor generator as one JavaScript file for each database: anchor-generator-<database>.js. A file is plain ES5 with no
    dependencies and no use of the file system, the network or a browser, so it runs in Node, Deno, Bun, a browser, Jint, a
    Snowflake JavaScript function or any other engine that runs ES5 (see tools/build-snowflake-generator.ps1 for the one that is
    made into SQL for Snowflake). It reads an Anchor model, as XML in the form that the Anchor Modeler saves (Generate > XML code), and
    gives the SQL script for it, the same text as Generate SQL in the modeler:

      var sql = AnchorGenerator.generate(modelXml, 'bi');   // 'uni', 'bi', 'crt', or null for what the model says

    Everything is assembled from the Anchor checkout, nothing is written by hand: the Sisula engine, the XML reader, the DOM
    facade, the model check, the map and the resolver (modules/), the scripts that prepare the schema (Helpers.js, the naming
    conventions and derive.js, as the directive lists them) and the templates, in the order of the directive. The scripts that
    prepare the schema are compiled into a function, so nothing is evaluated at run time.

    What a file holds:

      AnchorGenerator.target                  the database, as the modeler names it (SQLServer, Snowflake, PostgreSQL, Vertica, BigQuery, Oracle)
      AnchorGenerator.temporalizations        the ones that are generated for this database
      AnchorGenerator.generate(xml, t)        the SQL script, one string; throws an Error that says what is wrong with the model
      AnchorGenerator.bindings(xml, t)        the JSON bindings that the templates render (Generate > JSON bindings)
      AnchorGenerator.check(xml)              null if the model is fine, else the text that says what is wrong with it
      AnchorGenerator.defaults()              the settings of a new model for this database, as an object
      AnchorGenerator.metadataElement()       the same, as the <metadata .../> element that a model starts with
      AnchorGenerator.version                 where it was built from

    Only the databases whose templates are Sisula templates can be built: SQL Server, Snowflake, PostgreSQL, Vertica, BigQuery
    and Oracle (a temporalization that still lists a .js sisulet in its directive is left out: Oracle has no bi-temporal one).

    Usage:
      build-portable-generator.ps1 [-Output <directory>] [-Target SQLServer,Snowflake,PostgreSQL,Vertica,BigQuery,Oracle] [-Anchor <checkout>]
#>
[CmdletBinding()]
param(
    [string] $Output = '.',
    [string[]] $Target = @('SQLServer', 'Snowflake', 'PostgreSQL', 'Vertica', 'BigQuery', 'Oracle'),
    [string] $Anchor
)
Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
if (-not $Anchor) { $Anchor = Split-Path -Parent $PSScriptRoot }
$Anchor = (Resolve-Path $Anchor).Path
$utf8 = New-Object Text.UTF8Encoding($false)
$Target = @($Target | ForEach-Object { $_ -split ',' } | Where-Object { $_ })

function Read-Source([string] $relative) {
    $path = Join-Path $Anchor $relative
    if (-not (Test-Path $path)) { throw "Not found in the Anchor checkout: $relative" }
    ([IO.File]::ReadAllText($path, [Text.Encoding]::UTF8).TrimStart([char]0xFEFF)) -replace "`r`n", "`n"
}

# The text of a function that is written as `name: function(...) { ... }` in an object, up to its closing brace.
function Get-MethodText([string] $source, [string] $header) {
    $at = $source.IndexOf($header)
    if ($at -lt 0) { throw "Cannot find '$header'" }
    $open = $source.IndexOf('{', $at)
    $depth = 0
    for ($i = $open; $i -lt $source.Length; $i++) {
        if ($source[$i] -eq '{') { $depth++ } elseif ($source[$i] -eq '}') { $depth--; if ($depth -eq 0) { return $source.Substring($at, $i - $at + 1) } }
    }
    throw "'$header' is not closed"
}

# A string as a JavaScript literal that holds nothing but ASCII, so that no engine has to read the file as anything else.
function ConvertTo-JsString([string] $text) {
    $b = New-Object Text.StringBuilder
    [void] $b.Append('"')
    foreach ($c in $text.ToCharArray()) {
        $n = [int] $c
        if ($c -eq '"') { [void] $b.Append('\"') }
        elseif ($c -eq '\') { [void] $b.Append('\\') }
        elseif ($n -eq 10) { [void] $b.Append('\n') }
        elseif ($n -eq 13) { [void] $b.Append('\r') }
        elseif ($n -eq 9) { [void] $b.Append('\t') }
        elseif ($n -lt 32 -or $n -gt 126) { [void] $b.Append(('\u{0:x4}' -f $n)) }
        else { [void] $b.Append($c) }
    }
    [void] $b.Append('"')
    $b.ToString()
}

# What a new model has for each database in the settings that differ between databases (the data types, the schema, and what is now);
# everything else is the modeler's default (the list in modules/ModelCheck.js, which the check in the sisula repository compares with
# the metadata of the models that the modeler has saved for each database).
$settingsOf = @{
    Snowflake = [ordered]@{}
    BigQuery = [ordered]@{ chronon = 'datetime'; equivalentRange = 'int64'; identity = 'int64'; metadataType = 'int64'; now = 'current_datetime()'
        positIdentity = 'int64'; positorRange = 'int64'; reliabilityRange = 'numeric(5,2)' }
    SQLServer = [ordered]@{ changingRange = 'datetime2'; chronon = 'datetime2'; encapsulation = 'dbo'; now = 'sysdatetime()'; positingRange = 'datetime2' }
    PostgreSQL = [ordered]@{ changingRange = 'timestamp'; chronon = 'timestamp'; equivalentRange = 'smallint'; identity = 'integer'; metadataType = 'integer'
        now = 'current_timestamp'; positIdentity = 'integer'; positingRange = 'timestamp'; positorRange = 'smallint' }
    Vertica = [ordered]@{ changingRange = 'timestamp'; chronon = 'timestamp(9)'; identity = 'integer'; metadataType = 'integer'
        now = 'current_timestamp'; positIdentity = 'integer'; positingRange = 'timestamp' }
    Oracle = [ordered]@{ changingRange = 'timestamp'; chronon = 'timestamp(9)'; equivalentRange = 'number(3)'; identity = 'number(10)'; metadataType = 'number(10)'
        now = 'current_timestamp'; positIdentity = 'number(10)'; positingRange = 'timestamp'; positorRange = 'number(3)'; reliabilityRange = 'number(5,2)' }
}

function Read-Directive([string] $database, [string] $temporalization) {
    $path = "${database}_$temporalization.directive"
    $entries = (Read-Source $path) -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') }
    $templates = @($entries | Where-Object { $_ -like '*.sisula' })
    $legacy = @($entries | Where-Object { $_ -like '*.js' -and $_ -notmatch '(^|/)(Helpers|NamingConvention|derive)\.js$' })
    if ($legacy.Count -gt 0) { return $null }   # sisulets in JavaScript: the original Sisulator runs those, in a browser
    [pscustomobject]@{
        Prelude = @($entries | Where-Object { $_ -match '(^|/)(Helpers|NamingConvention|derive)\.js$' })
        Templates = $templates
    }
}

# --- provenance ---------------------------------------------------------------------------------------------------
$lock = Get-Content (Join-Path $Anchor 'modules\sisula.lock.json') -Raw | ConvertFrom-Json
$commit = 'unknown'
try { $c = (& git -C $Anchor rev-parse --short HEAD 2>$null); if ($LASTEXITCODE -eq 0 -and $c) { $commit = $c.Trim() } } catch { }
$dirty = $false
try { $s = (& git -C $Anchor status --porcelain 2>$null); if ($s) { $dirty = $true } } catch { }
$version = "Anchor $commit$(if ($dirty) { ' with changes that were not committed' }), Sisula $($lock.commit.Substring(0, 7))"

# --- the parts that are the same for every database ---------------------------------------------------------------
$engine = (Read-Source 'modules/sisula.js')
$engine = [regex]::Replace($engine, '(?s)\s*if \(typeof module !== "undefined" && module\.exports\) \{.*?\}\s*$', "`n")
$shared = New-Object System.Collections.Generic.List[string]
$shared.Add("// ---- modules/sisula.js (the Sisula engine)`n" + $engine.TrimEnd())
$shared.Add("// ---- modules/XmlTree.js`n" + (Read-Source 'modules/XmlTree.js').TrimEnd())
$shared.Add("// ---- modules/DomFacade.js`n" + (Read-Source 'modules/DomFacade.js').TrimEnd())
$shared.Add("// ---- modules/ModelCheck.js`n" + (Read-Source 'modules/ModelCheck.js').TrimEnd())
$shared.Add("// ---- modules/Map.js`n" + (Read-Source 'modules/Map.js').TrimEnd())
$shared.Add("// ---- Sisulator.objectify, from modules/Sisulator.js`nvar Sisulator = {`n    " + (Get-MethodText (Read-Source 'modules/Sisulator.js') 'objectify: function(xml, map)') + "`n};")
$shared.Add("// ---- modules/Resolver.js`n" + (Read-Source 'modules/Resolver.js').TrimEnd())
$sharedText = $shared -join "`n`n"

$modelCheckSettings = [ordered]@{}
$settingsBlock = [regex]::Match((Read-Source 'modules/ModelCheck.js'), '(?s)var METADATA = \{(.*?)\n    \};')
if (-not $settingsBlock.Success) { throw 'modules/ModelCheck.js has no METADATA list.' }
foreach ($m in [regex]::Matches($settingsBlock.Groups[1].Value, "(\w+): '([^']*)'")) { $modelCheckSettings[$m.Groups[1].Value] = $m.Groups[2].Value }
if ($modelCheckSettings.Count -lt 40) { throw "Read only $($modelCheckSettings.Count) settings from modules/ModelCheck.js." }

New-Item -ItemType Directory -Force $Output | Out-Null
$Output = (Resolve-Path $Output).Path

foreach ($database in $Target) {
    if (-not $settingsOf.ContainsKey($database)) { throw "Unknown database '$database'; known: $($settingsOf.Keys -join ', ')." }
    $directives = [ordered]@{}
    foreach ($t in 'uni', 'bi', 'crt') {
        $d = Read-Directive $database $t
        if ($d) { $directives[$t] = $d }
    }
    if ($directives.Count -eq 0) { throw "$database has no temporalization with Sisula templates only." }
    $first = $null
    foreach ($t in $directives.Keys) {
        if ($null -eq $first) { $first = $directives[$t].Prelude }
        elseif (($directives[$t].Prelude -join '|') -cne ($first -join '|')) { throw "${database}_$t.directive prepares the schema differently from the other temporalizations of $database; the generator would have to know both." }
    }

    # the settings of a new model: ModelCheck's list (which is the modeler's own, with the values of a Snowflake model) with this database's
    $defaults = [ordered]@{}
    foreach ($k in $modelCheckSettings.Keys) { $defaults[$k] = $modelCheckSettings[$k] }
    foreach ($k in $settingsOf[$database].Keys) { $defaults[$k] = $settingsOf[$database][$k] }
    $defaults['databaseTarget'] = $database
    $defaults['temporalization'] = @($directives.Keys)[0]   # the first the database has: Vertica has no uni-temporal generator here
    $ordered = [ordered]@{}
    foreach ($k in ($defaults.Keys | Sort-Object)) { $ordered[$k] = $defaults[$k] }
    $defaultsJs = '{' + (($ordered.Keys | ForEach-Object { (ConvertTo-JsString $_) + ': ' + (ConvertTo-JsString $ordered[$_]) }) -join ', ') + '}'
    $checkJs = '{' + (($modelCheckSettings.Keys | ForEach-Object { (ConvertTo-JsString $_) + ': ' + (ConvertTo-JsString $defaults[$_]) }) -join ', ') + '}'

    $body = New-Object System.Collections.Generic.List[string]
    foreach ($p in $first) { $body.Add("// ---- $p`n" + (Read-Source $p).TrimEnd()) }

    $templates = New-Object System.Collections.Generic.List[string]
    foreach ($t in $directives.Keys) {
        $items = @($directives[$t].Templates | ForEach-Object {
            '{ name: ' + (ConvertTo-JsString ([IO.Path]::GetFileNameWithoutExtension($_))) + ', body: ' + (ConvertTo-JsString (Read-Source $_)) + ' }'
        })
        $templates.Add("    $t`: [`n        " + ($items -join ",`n        ") + "`n    ]")
    }
    $temporalizations = ($directives.Keys | ForEach-Object { ConvertTo-JsString $_ }) -join ', '

    $js = New-Object Text.StringBuilder
    function Add-Js([string] $text = '') { [void] $js.Append($text).Append("`n") }
    Add-Js "// The Anchor generator for $database, as one file. Generated by tools/build-portable-generator.ps1 from $version. Do not edit; build it again."
    Add-Js '//'
    Add-Js '// Plain ES5, no dependencies, no file system, network or browser. It runs in Node (require), a browser (a script tag), Deno, Bun, Jint and'
    Add-Js '// any other ES5 engine; where there is no module system the object is the global AnchorGenerator.'
    Add-Js '//'
    Add-Js "//   var sql = AnchorGenerator.generate(modelXml, 'uni');   // 'uni', 'bi', 'crt', or null for what the model says"
    Add-Js '//   AnchorGenerator.check(modelXml)                        // null, or the text that says what is wrong with the model'
    Add-Js '//   AnchorGenerator.metadataElement()                      // the <metadata .../> element that a model starts with'
    Add-Js '//   AnchorGenerator.bindings(modelXml, t), .defaults(), .target, .temporalizations, .version'
    Add-Js '//'
    Add-Js 'var AnchorGenerator = (function () {'
    [void] $js.Append($sharedText).Append("`n`n")
    Add-Js '// ---- the scripts that prepare the schema, as the directives list them'
    Add-Js 'function prepareSchema(schema, DEBUG, alert, console) {'
    [void] $js.Append(($body -join "`n")).Append("`n")
    Add-Js '}'
    Add-Js
    Add-Js "var TARGET = $(ConvertTo-JsString $database);"
    Add-Js "var VERSION = $(ConvertTo-JsString $version);"
    Add-Js "var TEMPORALIZATIONS = [$temporalizations];"
    Add-Js "var DEFAULTS = $defaultsJs;"
    Add-Js "var REQUIRED = $checkJs;"
    Add-Js 'var TEMPLATES = {'
    [void] $js.Append(($templates -join ",`n")).Append("`n")
    Add-Js '};'
    Add-Js @'

function readModel(modelXml, wanted) {
    var tree = XmlTree.parse(modelXml);
    var metadata = null;
    for (var i = 0; i < tree.c.length; i++) if (tree.c[i].t === 1 && tree.c[i].n === 'metadata') metadata = tree.c[i];
    if (!metadata) throw new Error('The model has no metadata element; it has to be an Anchor model as the modeler saves it (Generate > XML code). ' +
        'AnchorGenerator.metadataElement() is what one starts with.');
    function setMetadata(name, value) {
        for (var k = 0; k < metadata.a.length; k++) if (metadata.a[k][0] === name) { metadata.a[k][1] = value; return; }
        metadata.a.push([name, value]);
    }
    setMetadata('databaseTarget', TARGET);
    if (wanted !== null && wanted !== undefined && wanted !== '') {
        var known = false;
        for (var w = 0; w < TEMPORALIZATIONS.length; w++) if (TEMPORALIZATIONS[w] === wanted) known = true;
        if (!known) throw new Error("The temporalization has to be one of '" + TEMPORALIZATIONS.join("', '") + "' for " + TARGET + ", not '" + wanted + "'.");
        setMetadata('temporalization', wanted);
    }
    var temporalization = 'uni';
    for (var m = 0; m < metadata.a.length; m++) if (metadata.a[m][0] === 'temporalization') temporalization = metadata.a[m][1];
    var known2 = false;
    for (var x = 0; x < TEMPORALIZATIONS.length; x++) if (TEMPORALIZATIONS[x] === temporalization) known2 = true;
    if (!known2) throw new Error('The temporalization ' + temporalization + ' is not generated for ' + TARGET + ' (it is ' + TEMPORALIZATIONS.join(', ') + ').');
    // what the modeler adds when it generates: the model's own XML, as text (schema.serialization; the schema tracking of SQL Server reads it)
    tree.c.push({ t: 1, n: 'serialization', a: [], c: [{ t: 3, v: XmlTree.serialize(tree) }] });
    var dom = buildDom(tree);
    // a mistake in the model is an error that says what and where, not names such as GEN_undefined
    ModelCheck.assert(dom.documentElement, REQUIRED, TARGET);
    return { dom: dom, temporalization: temporalization };
}

function bindings(modelXml, wanted) {
    var model = readModel(modelXml, wanted);
    var schema = Sisulator.objectify(model.dom, MAP)[MAP.root];
    prepareSchema(schema, false, function () {}, { log: function () {}, error: function () {} });
    return { bindingsVersion: 1, database: TARGET, temporalization: model.temporalization, schema: Resolver.serialize(schema) };
}

function generate(modelXml, wanted) {
    var b = bindings(modelXml, wanted);
    var json = JSON.stringify(b);
    var templates = TEMPLATES[b.temporalization];
    var sql = [];
    for (var i = 0; i < templates.length; i++) sql.push(sisulate(templates[i].body, json));
    return sql.join('');
}

function check(modelXml) {
    try { readModel(modelXml, null); return null; } catch (e) { return String(e && e.message ? e.message : e); }
}

function defaults() {
    var copy = {};
    for (var k in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) copy[k] = DEFAULTS[k];
    return copy;
}

function metadataElement() {
    var parts = [];
    for (var k in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) {
        parts.push(k + '="' + String(DEFAULTS[k]).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '"');
    }
    return '<metadata ' + parts.join(' ') + '/>';
}

return {
    target: TARGET,
    temporalizations: TEMPORALIZATIONS.slice(0),
    version: VERSION,
    generate: generate,
    bindings: bindings,
    check: check,
    defaults: defaults,
    metadataElement: metadataElement
};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AnchorGenerator;
'@
    $text = $js.ToString()
    $file = Join-Path $Output ("anchor-generator-{0}.js" -f $database.ToLowerInvariant())
    [IO.File]::WriteAllText($file, $text, $utf8)
    $count = 0; foreach ($t in $directives.Keys) { $count += $directives[$t].Templates.Count }
    Write-Host ("wrote {0}: {1:N0} characters, {2} templates ({3}), {4} scripts that prepare the schema" -f $file, $text.Length, $count, ($directives.Keys -join ', '), $first.Count)
}
