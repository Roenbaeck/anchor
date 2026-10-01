// sisula.js — the Sisula template renderer (dialect B: declarative, JSON bindings, no eval).
// Canonical source; runs unchanged as a Snowflake JavaScript UDF, in browsers, in Node and in
// ES5 hosts such as Jint. Keep it ES5. Originally ported from sisula-mssql/clr/SisulaRenderer.cs,
// which is maintained separately and must track this file. See docs/LANGUAGE.md.

var RE_FOREACH = /^\s*\$\/\s*foreach\s+(\w+)\s+in\s+(.+?)\s*$/i;
var RE_FOREACH_INLINE = /^\s*\$\/\s*foreach\s+(\w+)\s+in\s+(.+?)\s+(.*?)\$\/\s*endfor\s*$/i;
var RE_FOREACH_INLINE_EMBEDDED = /\$\/\s*foreach\s+(\w+)\s+in\s+(.+?)\s+(.*?)\$\/\s*endfor/gi;
var RE_ENDFOR = /^\s*\$\/\s*endfor\s*$/i;
// [\s\S] rather than the dotAll flag, which ES5 hosts such as Jint do not parse.
var RE_IF_INLINE = /^\s*\$\/\s*if\s+([\s\S]*?)\s*\$\/\s*endif\s*$/i;
var RE_IF_INLINE_EMBEDDED = /\$\/\s*if\s+(.*?)\$\/\s*endif\s*/gi;
var RE_IF = /^\s*\$\/\s*if\s+(.+?)\s*$/i;
var RE_ENDIF = /^\s*\$\/\s*endif\s*$/i;
var RE_ELSE = /^\s*\$\/\s*else\s*$/i;
var RE_COMMENT_LINE = /^\s*\$-.*$/;
var RE_INLINE_COMMENT = /\$-.*?-\$/g;

// Use ASCII-safe token patterns for Snowflake's JS engine compatibility.
var PATH_SOURCE = "[A-Za-z0-9_]+(?:\\[\\d+\\])?(?:\\.[A-Za-z0-9_]+(?:\\[\\d+\\])?)*(?:\\(\\))?";
// All three token forms in one pattern, so a single pass renders them. $'path'$ emits a
// quoted SQL string literal and $|path|$ emits text that is safe on one SQL comment line.
var TOKEN_PATTERN = new RegExp(
    "\\$'(" + PATH_SOURCE + ")'\\$" +
    "|\\$\\|(" + PATH_SOURCE + ")\\|\\$" +
    "|\\$\\{?(" + PATH_SOURCE + ")\\}?\\$", "g");

var RE_FUNC_CALL = /^(\w+)\s*\(([\s\S]*)\)$/;
var RE_METHOD_CALL = /^(\w+)\.(first|last|index|count)\s*\(\s*\)\s*$/i;
var RE_PATH_PROP = /^(\w+)\.(.+)$/;
// Negation of one term: "not x" or "!x". Binds tighter than and/or; "!=" is a comparison, not a negation.
var RE_NOT = /^(?:not\s+|!(?!=)\s*)([\s\S]+)$/i;

// Longest first: ">=" and "<=" contain "=", so "=" must be tried after them, and ">" and "<" last.
var COMPARISON_OPS = ["==", "!=", ">=", "<=", "=", ">", "<"];

function sisulate(template, bindings) {
    if (template == null) return null;
    var ctx = parseJSON(bindings || "{}");
    return render(template, ctx);
}

function render(tpl, ctx, loopVars) {
    if (!tpl) return "";
    if (tpl.indexOf("/*~") < 0 && loopVars === undefined) {
        return renderScript(tpl, ctx, null);
    }
    return renderBlocks(tpl, ctx, loopVars || null);
}

function renderBlocks(tpl, ctx, loopVars) {
    if (!tpl) return "";
    var sb = [];
    var i = 0;
    while (i < tpl.length) {
        var open = tpl.indexOf("/*~", i);
        if (open < 0) {
            sb.push(tpl.substring(i));
            break;
        }
        if (open > i) sb.push(tpl.substring(i, open));

        var pos = open + 3;
        var depth = 1;
        while (pos < tpl.length && depth > 0) {
            var nextOpen = tpl.indexOf("/*~", pos);
            var nextClose = tpl.indexOf("~*/", pos);
            if (nextClose < 0) {
                sb.push(tpl.substring(open));
                i = tpl.length;
                return sb.join("");
            }
            if (nextOpen >= 0 && nextOpen < nextClose) {
                depth++;
                pos = nextOpen + 3;
            } else {
                depth--;
                pos = nextClose + 3;
            }
        }
        var close = pos - 3;
        if (depth === 0) {
            var blockContent = tpl.substring(open + 3, close);
            sb.push(renderBlock(blockContent, ctx, loopVars));
            i = close + 3;
        } else {
            sb.push(tpl.substring(open));
            i = tpl.length;
        }
    }
    return sb.join("");
}

function renderBlock(block, ctx, loopVars) {
    return renderScript(block, ctx, loopVars);
}

// A line opens a block only when the directive is alone on it. "$/ if c A $/ endif" and
// "$/ foreach x in xs A $/ endfor" close on the same line, so they are inline and must not change
// the nesting depth while a block's body is being scanned for its end.
function opensBlockIf(line) {
    return RE_IF.test(line) && !/\$\/\s*endif/i.test(line);
}

function opensBlockForeach(line) {
    return RE_FOREACH.test(line) && !/\$\/\s*endfor/i.test(line);
}

function renderScript(text, ctx, loopVars) {
    if (!text) return "";
    var sb = [];
    var pos = 0;

    while (pos < text.length) {
        var lineEnd = text.indexOf("\n", pos);
        var hasNewline = lineEnd >= 0;
        var lineStop = hasNewline ? lineEnd : text.length;
        var lineStopTrim = lineStop;
        if (lineStopTrim > pos && text[lineStopTrim - 1] === "\r") lineStopTrim--;
        var line = text.substring(pos, lineStopTrim);

        if (RE_COMMENT_LINE.test(line)) {
            pos = hasNewline ? (lineEnd + 1) : text.length;
            continue;
        }

        line = line.replace(RE_INLINE_COMMENT, "");

        var mForInline = RE_FOREACH_INLINE.exec(line);
        if (mForInline) {
            pos = hasNewline ? (lineEnd + 1) : text.length;
            var rendered = renderInlineForeachMatch(mForInline, ctx, loopVars);
            sb.push(rendered);
            if (hasNewline) sb.push("\n");
            continue;
        }

        var mFor = RE_FOREACH.exec(line);
        if (mFor) {
            pos = hasNewline ? (lineEnd + 1) : text.length;
            var bodyStart = pos;
            var depth = 1;
            while (pos < text.length && depth > 0) {
                var nextLineEnd = text.indexOf("\n", pos);
                var nl = nextLineEnd >= 0;
                var stop = nl ? nextLineEnd : text.length;
                var stopTrim = stop;
                if (stopTrim > pos && text[stopTrim - 1] === "\r") stopTrim--;
                var innerLine = text.substring(pos, stopTrim);

                if (opensBlockForeach(innerLine)) depth++;
                else if (RE_ENDFOR.test(innerLine)) {
                    depth--;
                    if (depth === 0) {
                        pos = nl ? (nextLineEnd + 1) : text.length;
                        break;
                    }
                }

                if (depth > 0) {
                    pos = nl ? (nextLineEnd + 1) : text.length;
                }
            }
            var body = text.substring(bodyStart, pos);

            var varName = mFor[1];
            var spec = mFor[2].trim();
            var parsed = parseForeachSpec(spec);
            var items = prepareForeachItems(ctx, loopVars, parsed.path, parsed.whereExpr, parsed.orderPath, parsed.orderDesc, varName);

            for (var idx = 0, n = items.length; idx < n; idx++) {
                var itemObj = items[idx];
                var childVars = loopVars ? cloneLoopVars(loopVars) : {};
                childVars[varName] = itemObj;
                childVars["__LOOP__" + varName] = {
                    index: idx,
                    count: n,
                    first: idx === 0,
                    last: idx === n - 1
                };
                sb.push(renderScript(body, ctx, childVars));
            }
            continue;
        }

        if (RE_ENDFOR.test(line)) {
            pos = hasNewline ? (lineEnd + 1) : text.length;
            continue;
        }
        if (RE_ENDIF.test(line)) {
            pos = hasNewline ? (lineEnd + 1) : text.length;
            continue;
        }

        // Expand inline directives on content lines BEFORE checking block directives.
        // This prevents inline $/ if ... $/ endif on a content line from being
        // mistaken for a block-level if.
        if (RE_FOREACH_INLINE_EMBEDDED.test(line)) {
            line = expandInlineForeach(line, ctx, loopVars);
        }
        if (RE_IF_INLINE_EMBEDDED.test(line)) {
            line = expandInlineIfs(line, ctx, loopVars);
        }

        var mIfInline = RE_IF_INLINE.exec(line);
        if (mIfInline) {
            var parts = splitInlineIfBody(mIfInline[1]);
            var condResult = evalConditionInContext(parts.condition, ctx, loopVars);
            var branch = condResult ? parts.whenTrue : parts.whenFalse;
            if (branch) {
                sb.push(renderInline(branch, ctx, loopVars));
            }
            if (hasNewline) sb.push("\n");
            pos = hasNewline ? (lineEnd + 1) : text.length;
            continue;
        }

        var mIf = RE_IF.exec(line);
        if (mIf) {
            pos = hasNewline ? (lineEnd + 1) : text.length;
            var bodyStart = pos;
            var depth = 1;
            var elseFound = false;
            var trueBodyEnd = -1;
            var elseBodyStart = -1;
            var endIfStart = -1;
            while (pos < text.length && depth > 0) {
                var nextLineEnd = text.indexOf("\n", pos);
                var nl = nextLineEnd >= 0;
                var stop = nl ? nextLineEnd : text.length;
                var stopTrim = stop;
                if (stopTrim > pos && text[stopTrim - 1] === "\r") stopTrim--;
                var innerLine = text.substring(pos, stopTrim);

                if (opensBlockIf(innerLine)) depth++;
                else if (depth === 1 && RE_ELSE.test(innerLine)) {
                    elseFound = true;
                    trueBodyEnd = pos;
                    pos = nl ? (nextLineEnd + 1) : text.length;
                    elseBodyStart = pos;
                    continue;
                } else if (RE_ENDIF.test(innerLine)) {
                    depth--;
                    if (depth === 0) {
                        endIfStart = pos;
                        pos = nl ? (nextLineEnd + 1) : text.length;
                        break;
                    }
                }

                if (depth > 0) {
                    pos = nl ? (nextLineEnd + 1) : text.length;
                }
            }
            if (endIfStart < 0) endIfStart = pos;
            if (!elseFound) trueBodyEnd = endIfStart;
            else if (trueBodyEnd < 0) trueBodyEnd = endIfStart;

            var trueBody = text.substring(bodyStart, trueBodyEnd);
            var elseBody = "";
            if (elseFound && elseBodyStart >= 0) {
                elseBody = text.substring(elseBodyStart, endIfStart);
            }

            var condition = mIf[1].trim();
            var condResult = evalConditionInContext(condition, ctx, loopVars);
            var branchBody = condResult ? trueBody : elseBody;
            if (branchBody) {
                sb.push(renderScript(branchBody, ctx, loopVars));
            }
            continue;
        }

        if (line.trim().length > 0) {
            sb.push(renderInline(line, ctx, loopVars));
        }
        if (hasNewline) sb.push("\n");
        pos = hasNewline ? (lineEnd + 1) : text.length;
    }

    return sb.join("");
}

function parseForeachSpec(spec) {
    var whereExpr = null;
    var orderPath = null;
    var orderDesc = false;
    var path = spec;
    if (!spec) return { path: "", whereExpr: null, orderPath: null, orderDesc: false };

    var specLower = spec.toLowerCase();
    var obIdx = specLower.lastIndexOf(" order by ");
    var left = spec;
    if (obIdx >= 0) {
        left = spec.substring(0, obIdx).trimRight ? spec.substring(0, obIdx).trimRight() : rtrim(spec.substring(0, obIdx));
        var right = spec.substring(obIdx + 10).trim();
        if (right) {
            var parts = right.split(/\s+/);
            if (parts.length > 0) {
                orderPath = parts[0];
                if (parts.length > 1) {
                    orderDesc = parts[1].toLowerCase() === "desc";
                }
            }
        }
    }
    var wIdx = left.toLowerCase().lastIndexOf(" where ");
    if (wIdx >= 0) {
        path = rtrim(left.substring(0, wIdx));
        whereExpr = left.substring(wIdx + 7).trim();
    } else {
        path = left.trim();
    }
    return { path: path, whereExpr: whereExpr, orderPath: orderPath, orderDesc: orderDesc };
}

function prepareForeachItems(ctx, loopVars, path, whereExpr, orderPath, orderDesc, varName) {
    var items = enumerateJsonArray(ctx, loopVars, path);
    if (whereExpr) {
        items = items.filter(function (it) {
            return evalConditionOnItem(it, varName, whereExpr, loopVars);
        });
    }
    if (orderPath) {
        items.sort(function (a, b) {
            var ka = getOrderKey(a, varName, orderPath);
            var kb = getOrderKey(b, varName, orderPath);
            var cmp = 0;
            if (ka === null && kb === null) cmp = 0;
            else if (ka === null) cmp = 1;
            else if (kb === null) cmp = -1;
            else {
                var da = parseFloat(ka);
                var db = parseFloat(kb);
                if (!isNaN(da) && !isNaN(db) && String(ka).trim() === String(da) && String(kb).trim() === String(db)) {
                    cmp = da < db ? -1 : (da > db ? 1 : 0);
                } else {
                    var lowerA = (ka || "").toLowerCase();
                    var lowerB = (kb || "").toLowerCase();
                    if (lowerA < lowerB) cmp = -1;
                    else if (lowerA > lowerB) cmp = 1;
                    else cmp = 0;
                }
            }
            return orderDesc ? -cmp : cmp;
        });
    }
    return items;
}

function enumerateJsonArray(ctx, loopVars, path) {
    var list = [];
    if (!ctx) ctx = {};
    var baseObj = ctx;
    var innerPath = path;

    if (loopVars) {
        for (var v in loopVars) {
            if (v.indexOf("__LOOP__") === 0) continue;
            if (path === v) {
                baseObj = loopVars[v];
                innerPath = "$";
                break;
            }
            if (path.indexOf(v + ".") === 0) {
                baseObj = loopVars[v];
                innerPath = path.substring(v.length + 1);
                break;
            }
        }
    }
    var arr = resolvePathValue(baseObj, innerPath);
    if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; i++) {
            list.push(arr[i]);
        }
    }
    return list;
}

function getOrderKey(itemObj, varName, orderPath) {
    if (!orderPath) return null;
    var inner;
    if (orderPath.indexOf(varName + ".") === 0) inner = orderPath.substring(varName.length + 1);
    else if (orderPath === varName) inner = "";
    else inner = orderPath;
    var val = inner === "" ? stringify(itemObj) : resolvePathValue(itemObj, inner);
    if (val === null || val === undefined) return null;
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
}

function isArray(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
}

// A path reaches only what the JSON itself holds: the properties of an object and, by index, the
// elements of an array. The members every JavaScript value has (length, constructor, toString)
// are not data, and a host that reads the JSON with another tool, such as SQL Server's JSON
// functions, cannot see them. Reading them here would let a template work in one host only.
function memberOf(obj, name) {
    if (obj === null || typeof obj !== "object" || isArray(obj)) return undefined;
    return Object.prototype.hasOwnProperty.call(obj, name) ? obj[name] : undefined;
}

function elementOf(arr, index) {
    if (!isArray(arr) || index !== index || index < 0 || index >= arr.length) return undefined;
    return arr[index];
}

function resolvePathValue(obj, path) {
    if (obj === null || obj === undefined) return null;
    if (!path || path === "$") return obj;
    var segments = splitPath(path);
    var current = obj;
    for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        if (current === null || current === undefined) return null;
        if (typeof current !== "object") return null;
        current = memberOf(current, seg.name);
        if (seg.index !== null && current !== undefined && current !== null) {
            current = elementOf(current, seg.index);
        }
    }
    if (current === undefined) return null;
    return current;
}

function splitPath(path) {
    if (!path || path === "$") return [];
    var segments = [];
    var parts = path.split(".");
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (!part) continue;
        var bracketIdx = part.indexOf("[");
        if (bracketIdx >= 0) {
            var name = part.substring(0, bracketIdx);
            var idxStr = part.substring(bracketIdx + 1, part.indexOf("]", bracketIdx));
            var idx = parseInt(idxStr, 10);
            segments.push({ name: name, index: idx });
        } else {
            segments.push({ name: part, index: null });
        }
    }
    return segments;
}

function resolvePath(ctx, loopVars, path) {
    try {
        var metaValue = resolveLoopMetadataToken(loopVars, path);
        if (metaValue !== null) return metaValue;

        if (loopVars) {
            for (var v in loopVars) {
                var itemObj = loopVars[v] || {};
                if (v.indexOf("__LOOP__") === 0) {
                    var lname = v.substring(8);
                    var p = endsWith(path, "()") ? path.substring(0, path.length - 2) : path;
                    if (p === lname + ".index") return String(itemObj.index);
                    if (p === lname + ".count") return String(itemObj.count);
                    if (p === lname + ".first") return String(itemObj.first);
                    if (p === lname + ".last") return String(itemObj.last);
                    continue;
                }
                if (path === v) {
                    return stringifyScalar(itemObj);
                }
                if (path.indexOf(v + ".") === 0) {
                    var innerPath = path.substring(v.length + 1);
                    if (endsWith(innerPath, "()")) innerPath = innerPath.substring(0, innerPath.length - 2);
                    var val = resolvePathValue(itemObj, innerPath);
                    return stringifyScalar(val);
                }
            }
        }

        var val = resolvePathValue(ctx, path);
        return stringifyScalar(val);
    } catch (e) {
        return "";
    }
}

function stringifyScalar(val) {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    return JSON.stringify(val);
}

function stringify(val) {
    if (val === null || val === undefined) return null;
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    return JSON.stringify(val);
}

// Quote a value as a Snowflake string literal. Doubling the single quote is not enough:
// a backslash starts an escape sequence, a literal newline breaks the generated line, and
// an embedded pair of dollars would close the procedure body. Every escape used here was
// verified against Snowflake: \\ is a backslash, '' a quote, \n \r newlines, \x24 a dollar.
function sqlLiteral(val) {
    if (val === null || val === undefined) return "''";
    var s = String(val);
    // Backslashes first, so the escapes introduced below are not escaped again.
    s = s.replace(/\\/g, "\\\\");
    s = s.replace(/'/g, "''");
    s = s.replace(/\r/g, "\\r");
    s = s.replace(/\n/g, "\\n");
    s = s.replace(/\$/g, "\\x24");
    return "'" + s + "'";
}

// Flatten a value onto one line so it cannot escape a "--" comment, and separate adjacent
// dollars so the text cannot close a dollar-quoted procedure body.
function sqlComment(val) {
    if (val === null || val === undefined) return "";
    return String(val).replace(/[\r\n\t]+/g, " ").replace(/\$(?=\$)/g, "$ ");
}

function renderInline(text, ctx, loopVars) {
    if (!text) return "";
    TOKEN_PATTERN.lastIndex = 0;
    // One pass over all three forms. A second pass could reinterpret dollars that came
    // from a rendered value rather than from the template.
    // Test groups by truthiness: paths are never empty, and some ES5 hosts (Jint 2) pass ""
    // rather than undefined for a group that did not take part in the match.
    return text.replace(TOKEN_PATTERN, function (match, literalPath, commentPath, plainPath) {
        if (literalPath) return sqlLiteral(resolvePath(ctx, loopVars, literalPath));
        if (commentPath) return sqlComment(resolvePath(ctx, loopVars, commentPath));
        var result = resolvePath(ctx, loopVars, plainPath);
        return result !== null ? result : "";
    });
}

function expandInlineForeach(text, ctx, loopVars) {
    if (!text) return text;
    RE_FOREACH_INLINE_EMBEDDED.lastIndex = 0;
    return text.replace(RE_FOREACH_INLINE_EMBEDDED, function (match) {
        var m = new RegExp(RE_FOREACH_INLINE_EMBEDDED.source, "i").exec(match);
        if (!m) return match;
        return renderInlineForeachMatch(m, ctx, loopVars);
    });
}

function renderInlineForeachMatch(match, ctx, loopVars) {
    var varName = match[1];
    var spec = match[2].trim();
    var inlineBody = match[3];

    var parsed = parseForeachSpec(spec);
    var items = prepareForeachItems(ctx, loopVars, parsed.path, parsed.whereExpr, parsed.orderPath, parsed.orderDesc, varName);
    if (items.length === 0) return "";

    var sb = [];
    for (var idx = 0; idx < items.length; idx++) {
        var itemObj = items[idx];
        var childVars = loopVars ? cloneLoopVars(loopVars) : {};
        childVars[varName] = itemObj;
        childVars["__LOOP__" + varName] = {
            index: idx,
            count: items.length,
            first: idx === 0,
            last: idx === items.length - 1
        };

        var iterationContent = inlineBody;
        if (RE_IF_INLINE_EMBEDDED.test(iterationContent)) {
            iterationContent = expandInlineIfs(iterationContent, ctx, childVars);
        }
        iterationContent = expandInlineForeach(iterationContent, ctx, childVars);
        sb.push(renderInline(iterationContent, ctx, childVars));
    }
    return sb.join("");
}

function expandInlineIfs(text, ctx, loopVars) {
    if (!text) return text;
    RE_IF_INLINE_EMBEDDED.lastIndex = 0;
    return text.replace(RE_IF_INLINE_EMBEDDED, function (match) {
        var m = new RegExp(RE_IF_INLINE_EMBEDDED.source, "i").exec(match);
        if (!m) return match;
        var parts = splitInlineIfBody(m[1]);
        var condResult = evalConditionInContext(parts.condition, ctx, loopVars);
        var branch = condResult ? parts.whenTrue : parts.whenFalse;
        return branch || "";
    });
}

function evalConditionOnItem(itemObj, varName, expr, loopVars) {
    if (!expr || !expr.trim()) return true;
    expr = expr.trim();

    var orParts = splitByLogicalOperator(expr, "or");
    if (orParts.length > 1) {
        for (var i = 0; i < orParts.length; i++) {
            if (evalConditionOnItem(itemObj, varName, orParts[i].trim(), loopVars)) return true;
        }
        return false;
    }

    var andParts = splitByLogicalOperator(expr, "and");
    if (andParts.length > 1) {
        for (var i = 0; i < andParts.length; i++) {
            if (!evalConditionOnItem(itemObj, varName, andParts[i].trim(), loopVars)) return false;
        }
        return true;
    }

    var mNotItem = RE_NOT.exec(expr);
    if (mNotItem) return !evalConditionOnItem(itemObj, varName, mNotItem[1].trim(), loopVars);

    var mFunc = RE_FUNC_CALL.exec(expr);
    if (mFunc) {
        var fname = mFunc[1].toLowerCase();
        var argSpan = mFunc[2];
        var args = splitArgs(argSpan);
        if (args.length >= 2) {
            var left = resolveOperand(args[0], itemObj, varName, loopVars);
            var right = resolveOperand(args[1], itemObj, varName, loopVars);
            var ls = String(left != null ? left : "");
            var rs = String(right != null ? right : "");
            if (ls === "" || rs === "") return false;
            switch (fname) {
                case "contains": return ls.toLowerCase().indexOf(rs.toLowerCase()) >= 0;
                case "startswith": return ls.toLowerCase().indexOf(rs.toLowerCase()) === 0;
                case "endswith":
                    var idx = ls.toLowerCase().lastIndexOf(rs.toLowerCase());
                    return idx >= 0 && idx === ls.length - rs.length;
            }
        }
        return false;
    }

    for (var oi = 0; oi < COMPARISON_OPS.length; oi++) {
        var op = COMPARISON_OPS[oi];
        var idx = indexOfOp(expr, op);
        if (idx >= 0) {
            // Use original = as == equivalent
            var usedOp = op === "=" ? "==" : op;
            var left = expr.substring(0, idx).trim();
            var right = expr.substring(idx + op.length).trim();
            var lv = resolveOperand(left, itemObj, varName, loopVars);
            var rv = resolveOperand(right, itemObj, varName, loopVars);
            return compareOperands(lv, rv, usedOp);
        }
    }

    // Only a single path is left at this point. Anything with whitespace outside a literal is an
    // expression this engine does not understand; failing loudly beats silently evaluating false.
    if (/\s/.test(expr) && expr.indexOf('"') < 0) {
        throw new Error('Sisula: cannot parse condition: ' + expr);
    }

    var metaCheck = tryResolveLoopMetadata(loopVars, expr, varName);
    if (metaCheck !== null) return truthy(metaCheck);

    var val = resolveOperandPath(expr, itemObj, varName);
    return truthy(val);
}

function evalConditionInContext(expr, ctx, loopVars) {
    if (!expr || !expr.trim()) return true;
    expr = expr.trim();

    var orParts = splitByLogicalOperator(expr, "or");
    if (orParts.length > 1) {
        for (var i = 0; i < orParts.length; i++) {
            if (evalConditionInContext(orParts[i].trim(), ctx, loopVars)) return true;
        }
        return false;
    }

    var andParts = splitByLogicalOperator(expr, "and");
    if (andParts.length > 1) {
        for (var i = 0; i < andParts.length; i++) {
            if (!evalConditionInContext(andParts[i].trim(), ctx, loopVars)) return false;
        }
        return true;
    }

    var mNotCtx = RE_NOT.exec(expr);
    if (mNotCtx) return !evalConditionInContext(mNotCtx[1].trim(), ctx, loopVars);

    var mFuncCheck = RE_FUNC_CALL.exec(expr);
    if (mFuncCheck) {
        var argSpan = mFuncCheck[2];
        if (loopVars) {
            for (var v in loopVars) {
                if (v.indexOf("__LOOP__") === 0) continue;
                if (argSpan.indexOf(v + ".") >= 0 || argSpan.indexOf(v + ",") >= 0 ||
                    argSpan.indexOf(v + ")") >= 0 || argSpan.indexOf(v) === 0) {
                    return evalConditionOnItem(loopVars[v], v, expr, loopVars);
                }
            }
        }
        return evalConditionOnItem(ctx, "", expr, loopVars);
    }

    var mMethod = RE_METHOD_CALL.exec(expr);
    if (mMethod) {
        var varName2 = mMethod[1];
        var method = mMethod[2].toLowerCase();
        if (loopVars && loopVars["__LOOP__" + varName2]) {
            var meta = loopVars["__LOOP__" + varName2];
            switch (method) {
                case "first": return meta.first === true;
                case "last": return meta.last === true;
                case "index": return meta.index !== 0;
                case "count": return meta.count !== 0;
            }
        }
        return false;
    }

    var mPath = RE_PATH_PROP.exec(expr);
    if (mPath) {
        var varName3 = mPath[1];
        var rest = mPath[2];
        var isLoopVar = loopVars && (loopVars.hasOwnProperty(varName3) || loopVars.hasOwnProperty("__LOOP__" + varName3));
        if (isLoopVar) {
            return evalConditionOnItem(loopVars[varName3], varName3, rest, loopVars);
        }
    }
    return evalConditionOnItem(ctx, "", expr, loopVars);
}

function splitByLogicalOperator(expr, op) {
    if (!expr) return [expr || ""];
    var parts = [];
    var inStr = false;
    var inDbl = false;
    var lastIndex = 0;
    for (var i = 0; i < expr.length; i++) {
        var ch = expr[i];
        if (!inStr && !inDbl && (ch === "'" || ch === '"')) {
            if (ch === "'") inStr = true;
            else inDbl = true;
            continue;
        }
        if (inStr && ch === "'") {
            if (i + 1 < expr.length && expr[i + 1] === "'") {
                i++;
                continue;
            }
            inStr = false;
            continue;
        }
        if (inDbl && ch === '"') {
            if (i + 1 < expr.length && expr[i + 1] === '"') {
                i++;
                continue;
            }
            inDbl = false;
            continue;
        }
        if (!inStr && !inDbl) {
            var atWordBoundary = (i === 0 || !isLetterOrDigit(expr[i - 1]));
            if (atWordBoundary && i + op.length <= expr.length) {
                var candidate = expr.substring(i, i + op.length);
                if (candidate.toLowerCase() === op.toLowerCase()) {
                    var afterWordBoundary = (i + op.length >= expr.length || !isLetterOrDigit(expr[i + op.length]));
                    if (afterWordBoundary) {
                        parts.push(expr.substring(lastIndex, i));
                        lastIndex = i + op.length;
                        i = lastIndex - 1;
                        continue;
                    }
                }
            }
        }
    }
    parts.push(expr.substring(lastIndex));

    if (parts.length === 1 && parts[0] === expr) {
        return [expr];
    }
    return parts;
}

function splitArgs(argList) {
    var parts = [];
    var sb = "";
    var inStr = false;
    var inDbl = false;
    for (var i = 0; i < argList.length; i++) {
        var ch = argList[i];
        if (!inStr && !inDbl && ch === '"') {
            inDbl = true;
            sb += ch;
            continue;
        }
        if (!inStr && !inDbl && ch === "'") {
            inStr = true;
            sb += ch;
            continue;
        }
        if (inDbl && ch === '"') {
            sb += ch;
            if (i + 1 < argList.length && argList[i + 1] === '"') {
                sb += argList[i + 1];
                i++;
                continue;
            }
            inDbl = false;
            continue;
        }
        if (inStr && ch === "'") {
            sb += ch;
            if (i + 1 < argList.length && argList[i + 1] === "'") {
                sb += argList[i + 1];
                i++;
                continue;
            }
            inStr = false;
            continue;
        }
        if (!inStr && !inDbl && ch === ",") {
            parts.push(sb.trim());
            sb = "";
            continue;
        }
        sb += ch;
    }
    if (sb.length > 0 || parts.length > 0) parts.push(sb.trim());
    return parts;
}

function resolveOperand(token, itemObj, varName, loopVars) {
    if (!token || !token.trim()) return null;
    token = token.trim();
    if (token.length >= 2) {
        if (token[0] === "'" && token[token.length - 1] === "'") {
            throw new Error("Sisula string literals must use double quotes (\"value\").");
        }
        if (token[0] === '"' && token[token.length - 1] === '"') {
            return token.substring(1, token.length - 1).replace(/""/g, '"');
        }
    }
    if (token.toLowerCase() === "true") return true;
    if (token.toLowerCase() === "false") return false;
    if (token.toLowerCase() === "null") return null;
    var d = parseFloat(token);
    if (!isNaN(d) && String(d) === token) return d;

    var metaVal = tryResolveLoopMetadata(loopVars, token, varName);
    if (metaVal !== null) {
        return convertLoopMetadataValue(metaVal);
    }

    var s = resolveOperandPath(token, itemObj, varName);
    d = parseFloat(s);
    if (!isNaN(d) && String(d) === s) return d;
    if (s === "true") return true;
    if (s === "false") return false;
    if (s === "null") return null;
    return s;
}

function resolveOperandPath(token, itemObj, varName) {
    if (!token || !varName) {
        return stringifyScalar(resolvePathValue(itemObj, token));
    }
    var inner;
    if (token.indexOf(varName + ".") === 0) inner = token.substring(varName.length + 1);
    else if (token === varName) inner = "";
    else inner = token;
    if (endsWith(inner, "()")) inner = inner.substring(0, inner.length - 2);
    var val = inner === "" ? itemObj : resolvePathValue(itemObj, inner);
    if (val === null || val === undefined) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
}

function compareOperands(lv, rv, op) {
    if (lv === null || lv === undefined || rv === null || rv === undefined) {
        switch (op) {
            case "==": return (lv === null || lv === undefined) && (rv === null || rv === undefined);
            case "!=": return !((lv === null || lv === undefined) && (rv === null || rv === undefined));
            default: return false;
        }
    }

    if (typeof lv === "number" && typeof rv === "number") {
        switch (op) {
            case "==": return lv === rv;
            case "!=": return lv !== rv;
            case ">": return lv > rv;
            case ">=": return lv >= rv;
            case "<": return lv < rv;
            case "<=": return lv <= rv;
            default: return false;
        }
    }

    var ls = String(lv != null ? lv : "");
    var rs = String(rv != null ? rv : "");
    var lowerA = ls.toLowerCase();
    var lowerB = rs.toLowerCase();
    var cmp = lowerA < lowerB ? -1 : (lowerA > lowerB ? 1 : 0);
    switch (op) {
        case "==": return cmp === 0;
        case "!=": return cmp !== 0;
        case ">": return cmp > 0;
        case ">=": return cmp >= 0;
        case "<": return cmp < 0;
        case "<=": return cmp <= 0;
        default: return false;
    }
}

function splitInlineIfBody(body) {
    if (!body) return { condition: "", whenTrue: "", whenFalse: "" };

    var span = body;
    var len = span.length;
    var i = 0;
    while (i < len && isWhitespace(span[i])) i++;
    var start = i;
    var inString = false;
    var quote = "\0";
    var parenDepth = 0;

    while (i < len) {
        var ch = span[i];
        if (inString) {
            if (ch === quote) {
                if (i + 1 < len && span[i + 1] === quote) {
                    i++;
                } else {
                    inString = false;
                }
            }
        } else {
            if (ch === "'" || ch === '"') {
                inString = true;
                quote = ch;
            } else if (ch === "(") {
                parenDepth++;
            } else if (ch === ")") {
                if (parenDepth > 0) parenDepth--;
            } else if (isWhitespace(ch) && parenDepth === 0) {
                var j = i;
                while (j < len && isWhitespace(span[j])) j++;
                if (j >= len) break;

                var prev = i - 1;
                while (prev >= start && isWhitespace(span[prev])) prev--;
                if (prev >= start && isBinaryOperatorChar(span[prev])) {
                    i = j;
                    continue;
                }

                if (startsWithBinaryOperator(span, j) || startsWithLogicalOperator(span, j) || endsWithLogicalOperator(span, i)) {
                    i = j;
                    continue;
                }

                var condition = span.substring(start, i).trim();
                var contentStart = i;
                while (contentStart < len && isWhitespace(span[contentStart])) contentStart++;
                var remainder = span.substring(contentStart);
                var branches = splitInlineIfBranches(remainder);
                return { condition: condition, whenTrue: branches.whenTrue, whenFalse: branches.whenFalse };
            }
        }
        i++;
    }

    var conditionEnd = i;
    while (conditionEnd > start && isWhitespace(span[conditionEnd - 1])) conditionEnd--;
    var condition = span.substring(start, conditionEnd).trim();
    var tail = i < len ? span.substring(i) : "";
    var branches = splitInlineIfBranches(tail);
    return { condition: condition, whenTrue: branches.whenTrue, whenFalse: branches.whenFalse };
}

function splitInlineIfBranches(remainder) {
    if (!remainder) return { whenTrue: remainder || "", whenFalse: "" };
    var depth = 0;
    var index = 0;
    while (index < remainder.length) {
        var marker = remainder.indexOf("$/", index);
        if (marker < 0) break;
        var keywordStart = marker + 2;
        while (keywordStart < remainder.length && isWhitespace(remainder[keywordStart])) keywordStart++;
        var keywordEnd = keywordStart;
        while (keywordEnd < remainder.length && isLetter(remainder[keywordEnd])) keywordEnd++;
        if (keywordEnd <= keywordStart) {
            index = keywordEnd;
            continue;
        }
        var keyword = remainder.substring(keywordStart, keywordEnd).toLowerCase();
        switch (keyword) {
            case "if":
                depth++;
                break;
            case "endif":
                if (depth > 0) depth--;
                break;
            case "else":
                if (depth === 0) {
                    var whenTrue = remainder.substring(0, marker);
                    var contentStart = keywordEnd;
                    while (contentStart < remainder.length && isWhitespace(remainder[contentStart])) contentStart++;
                    return { whenTrue: whenTrue, whenFalse: remainder.substring(contentStart) };
                }
                break;
        }
        index = keywordEnd;
    }
    return { whenTrue: remainder, whenFalse: "" };
}

function indexOfOp(expr, op) {
    var inStr = false;
    var inDbl = false;
    for (var i = 0; i <= expr.length - op.length; i++) {
        var ch = expr[i];
        if (!inStr && !inDbl && (ch === "'" || ch === '"')) {
            if (ch === "'") inStr = true;
            else inDbl = true;
        } else if (inStr && ch === "'") {
            inStr = false;
        } else if (inDbl && ch === '"') {
            inDbl = false;
        }
        if (!inStr && !inDbl && expr.substring(i, i + op.length) === op) return i;
    }
    return -1;
}

function truthy(v) {
    var s = (v != null) ? String(v).trim() : "";
    if (s.length === 0) return false;
    if (s.toLowerCase() === "false") return false;
    var num = parseFloat(s);
    if (!isNaN(num) && num === 0 && String(num) === s) return false;
    if (s.toLowerCase() === "null") return false;
    if (s === "[]") return false; // an empty array, as stringified from the bindings
    return true;
}

function tryResolveLoopMetadata(loopVars, token, currentVar) {
    if (!loopVars || !token) return null;
    var meta = resolveLoopMetadataToken(loopVars, token);
    if (meta !== null) return meta;
    if (currentVar && token.indexOf(currentVar + ".") !== 0) {
        meta = resolveLoopMetadataToken(loopVars, currentVar + "." + token);
        if (meta !== null) return meta;
    }
    return null;
}

function resolveLoopMetadataToken(loopVars, path) {
    if (!loopVars || !path) return null;
    var dot = path.indexOf(".");
    if (dot <= 0) return null;
    var varName = path.substring(0, dot);
    var remainder = path.substring(dot + 1);
    if (!remainder) return null;
    if (endsWith(remainder, "()")) remainder = remainder.substring(0, remainder.length - 2);
    if (!isLoopMetadataProperty(remainder)) return null;
    var metaObj = loopVars["__LOOP__" + varName];
    if (metaObj === undefined) return null;
    return String(metaObj[remainder] != null ? metaObj[remainder] : "");
}

function isLoopMetadataProperty(name) {
    return name === "index" || name === "count" || name === "first" || name === "last";
}

function convertLoopMetadataValue(raw) {
    if (raw === null) return null;
    var d = parseFloat(raw);
    if (!isNaN(d) && String(d) === raw) return d;
    if (raw.toLowerCase() === "true") return true;
    if (raw.toLowerCase() === "false") return false;
    if (raw.toLowerCase() === "null") return null;
    return raw;
}

function cloneLoopVars(lv) {
    var result = {};
    for (var k in lv) {
        result[k] = lv[k];
    }
    return result;
}

function parseJSON(str) {
    if (!str || !str.trim()) return {};
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
}

function startsWith(s, prefix) {
    return s && s.indexOf(prefix) === 0;
}

function endsWith(s, suffix) {
    return s && s.indexOf(suffix, s.length - suffix.length) >= 0;
}

function isBinaryOperatorChar(ch) {
    return ch === "=" || ch === "!" || ch === ">" || ch === "<";
}

function isWhitespace(ch) {
    return ch === " " || ch === "\t" || ch === "\r" || ch === "\n";
}

function isLetter(ch) {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
}

function isLetterOrDigit(ch) {
    return isLetter(ch) || (ch >= "0" && ch <= "9");
}

function startsWithBinaryOperator(text, index) {
    if (index >= text.length) return false;
    switch (text[index]) {
        case "=": return true;
        case "!":
            return index + 1 < text.length && text[index + 1] === "=";
        case ">": return true;
        case "<": return true;
        default: return false;
    }
}

function startsWithLogicalOperator(text, index) {
    if (index >= text.length) return false;
    if (index + 3 <= text.length && text.substring(index, index + 3).toLowerCase() === "and") {
        var beforeOk = index === 0 || !isLetterOrDigit(text[index - 1]);
        var afterOk = index + 3 >= text.length || !isLetterOrDigit(text[index + 3]);
        if (beforeOk && afterOk) return true;
    }
    if (index + 2 <= text.length && text.substring(index, index + 2).toLowerCase() === "or") {
        var beforeOk = index === 0 || !isLetterOrDigit(text[index - 1]);
        var afterOk = index + 2 >= text.length || !isLetterOrDigit(text[index + 2]);
        if (beforeOk && afterOk) return true;
    }
    return false;
}

function endsWithLogicalOperator(text, idx) {
    if (idx <= 0 || idx > text.length) return false;
    var end = idx - 1;
    while (end >= 0 && isWhitespace(text[end])) end--;
    if (end < 0) return false;
    var start = end;
    while (start >= 0 && isLetterOrDigit(text[start])) start--;
    start++;
    if (start > end) return false;
    var word = text.substring(start, end + 1);
    var lower = word.toLowerCase();
    return lower === "and" || lower === "or" || lower === "not";
}

function rtrim(s) {
    var end = s.length;
    while (end > 0 && isWhitespace(s[end - 1])) end--;
    return s.substring(0, end);
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = sisulate;
}
if (typeof globalThis !== "undefined") {
    globalThis.sisulate = sisulate;
}
