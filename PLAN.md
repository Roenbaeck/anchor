# Anchor Modeler: review and plan

Status: proposal, 2026-11-19, written against `master` at `abd2006` (version 0.101.18). Nothing here has been
implemented. Every number below was counted in the source, and every screenshot in `docs/images/ux-review/` was taken
from the real page in headless Edge (example model, roastery model, and three window sizes).

**Constraint kept throughout:** no third-party libraries. Everything proposed uses what the browser already has
(Pointer Events, CSS custom properties, `<dialog>`, native ES modules, `fetch`, `localStorage`, SVG). Where a
proposal would normally call for a library, it says what to do instead.

## 1. The short answers

| Question | Answer | Where |
|---|---|---|
| Is the design intuitive? | **For someone who has used it, mostly. For a newcomer, no.** The graph notation and the context-sensitive operations list are good. Almost everything else relies on hovering, on knowing keys, or on knowing where a setting hides. | 3.1 |
| Does it look modern? | **No.** It reads as a 2012 web app: a flat red strip of text buttons, a very large "TEST VERSION" watermark, hover menus, system-default form controls, a tangled physics layout. The dark theme is a better starting point than the light one. | 3.2 |
| Obvious features missing? | **Yes, several**: a free-standing new anchor, rename on the canvas, an outline/property side panel, a visible problems list, a good first layout, copy and download of the SQL, more than one model in the browser, PNG export. | 3.3 |
| Needless steps? | **Yes.** The worst: every new construct is created as `?7` / `!Unnamed!` and must then be named in a separate popup, with the mnemonic typed by hand. | 3.4 |
| More than one way to work with the model? | **Yes, it should.** Today: graph, a mass-edit table (`E`), and hand-editing XML in another tool. Add an outline with a property panel and a live XML view; they are cheap once the model has change events. | 3.5, 4.4 |
| Is the code well structured? | **No.** One inline script of about 7,600 lines inside `index.html`, global singletons, view and model fused in the component classes, 89 inline event attributes, about 500 lines of dead cloud code. The engine side (`modules/`, `SQL/`) is in much better shape. | 3.6 |
| Should it be modularized more? | **Yes, in a specific order** (hygiene, then files, then a model/view split with change events, then commands). Native ES modules are a fit for the app code; the shared engine stays ES5. | 4.1, 5 |
| Does it work on different devices? | **No. It is a desktop-with-mouse tool.** There are no touch or pointer events at all, and on a phone or tablet the touch stylesheet expands every menu at once and hides the model. | 3.7 |

## 2. How this was evaluated, and what it does not cover

- **Read:** `index.html` (8,067 lines), `application.css`, `svg.css`, `about.html`, `modules/`, and the entry points that
  matter for editing (`Actions`, `Operations`, `ContextMenu`, `EventHandler`, `Editables`, `Model`).
- **Ran:** the real page in headless Edge at 1440×900, 820×1180 and 390×844, with `example.xml` and
  `examples/roastery.xml`; opened an edit popup, the SQL popup and the dark theme through the page's own functions.
  Headless Edge does not emulate a coarse pointer, so the touch layout was produced by applying the page's own
  `(hover: none)` rules by hand. That is what a touch device would receive.
- **Not done:** no real touch device, no screen reader, no other browser than Edge, no users, no measurement of speed on
  large models. Findings about intuitiveness are a heuristic review by reading and driving the page, not a usability
  test. Section 6 proposes a small one.
- The screenshots show the layout **while the physics was still moving** (or after a fixed time), so exact node
  positions differ run to run. That non-determinism is itself a finding (3.2).

## 3. Findings

### 3.1 Is it intuitive?

**Works well**

- The notation (square, diamond, circle, double outline for history) is compact and consistent, and the model is the
  interface: you edit what you see.
- The context menu lists only the operations that make sense for the selection, each with a tooltip, and the
  keyboard letter is underlined (`<u>D</u>elete`). That is good, discoverable design.
- Single-letter shortcuts (`a`, `t`, `h`, `k`, `i`, `c`, `d`, `x`, `e`, `E`, `p`), undo/redo, a mini-map, search,
  a mass-edit table, a share link, an example model, and a dark theme are all there.

**Hurts**

1. **Hover is the main way in.** Menus open on hover, and the keyboard shortcuts act on *the node under the mouse*
   (`EventHandler.interactedComponents`), not on a selection or focus. There is no way to do these without a mouse.
2. **Where things are is not guessable.** One list of 30-odd text inputs is inside the *Defaults* dropdown (suffixes,
   types, reliability defaults). Physics tuning (damping, stiffness, partition size) is in *Settings* next to the
   theme toggle. Target database and temporalization are in *Generate*, together with the commands that generate.
   *Layout* mixes view toggles with layout commands. A user looking for "which database am I generating for"
   has four menus to try.
3. **Jargon without help.** The edit popup asks for *Capsule*, *Identity*, *Generator*, *Descriptor* and
   *Mnemonic*, with the explanation only in a tooltip. There is no first-run guidance and no empty state: after
   *New model* there is one anchor and nothing says what to do.
4. **Popups can be cut off.** In `docs/images/ux-review/edit-popup.png` the edit form is clipped at the bottom of
   the window, and the popup follows the node, so it changes place as the physics moves.
5. **Errors are mostly silent.** An incomplete construct gets a `*` in the search dropdown and a style, but there is
   no problems list. `modules/ModelCheck.js` exists and finds exactly these mistakes (missing settings, dangling
   knot or role, duplicate mnemonic, a tie with fewer than two ends) but is **not referenced by `index.html`**; only
   the generators use it. 39 lines with `alert`/`confirm`/`prompt` carry much of the rest.
6. **Keyboard focus is not designed.** Only 6 lines with `aria-`/`role` in the whole page; menus are `div`/`li`
   with `onclick`; the graph cannot be reached by Tab.

### 3.2 Does it look modern?

See `desktop-example.png`, `desktop-roastery-settled.png`, `dark-theme.png`.

- **Chrome:** a flat red strip with text buttons (`Pause Zoom+ Zoom- Redo Undo`; redo is drawn *before* undo), plain
  text menus, default `<select>` and `<input>` controls, no icons.
- **The "TEST VERSION 0.101.18" watermark** covers the top-left of every screen while `RELEASE = false`. It is
  decorative noise over the work area.
- **Graph readability is the biggest visual problem.** Even the 7-anchor roastery model, after the physics has
  settled, has long edges across the whole canvas, labels over lines, and parts of the model outside the window
  (the left and bottom edges are cut off). The same model gives a different picture each time, because models
  without stored positions get `Math.random()` starting positions (`index.html:3123`, `3492`, `3730`). The modeler does
  save positions, in a `<layout>` element on every node (`index.html:2798`), but `example.xml`, `roastery.xml` and
  models written by hand or by an agent have none.
- **Styling is hard-coded.** No CSS custom properties, no `prefers-color-scheme`; dark mode is a JavaScript
  `THEME` switch hidden in *Settings*. Two Google Fonts links load at start-up: a third-party runtime dependency
  that sends a request to Google for every visitor and fails offline.
- **Dark theme** is the more current-looking of the two and is a good base for the palette.

### 3.3 Missing features (observed, not wished for)

| Gap | Why it matters now |
|---|---|
| A **free-standing new anchor** | `new Anchor` is only reached by *New model*, loading, and by *Add tied anchor*/*nexus* from an existing node. I found no operation that places an unconnected anchor. Verify before building. |
| **Rename and edit on the canvas** (double-click, F2) | Today every rename is: hover, `e`, popup, type, close. No `dblclick` handler exists. |
| **Outline + property panel** | The model has no list view. Large models can only be navigated by the search dropdown and the mini-map. |
| **Problems panel** (using `ModelCheck`) | The same check that stops a bad generator call could warn while editing. |
| **A better first placement** | Models that arrive without `<layout>` (the two repo examples, hand- or agent-written XML) start from random positions, so the picture differs on every load. Positions that the modeler saves are already kept. |
| **Fit to screen on load** | Models open partly outside the window (3.2). |
| **Copy / download the SQL** | The SQL popup is a `contenteditable` div with a close button; `saveToDisk` is only wired to XML and SVG. There is also one script for the whole model, no split per object kind. |
| **PNG export** | The menu entry is commented out (`Actions.screenshot(...toPNGDataURL)`). |
| **More than one model in the browser** | One `localStorage` slot (`"model"`, `"modelId"`). No recent list, no named saves. |
| **Copy / paste / duplicate** of a selection | Common when building several similar attribute sets. |
| **Marquee (lasso) selection** | Only shift-click multi-select. |
| **Visible "undescribed" markers** | The skills and the generator turn descriptions into table comments; the modeler never nags about them. |
| **Open with an agent** | A way to copy the model as XML plus a short prompt, and to open an agent-written XML cleanly (see layout above). |
| **Compare two models** | Useful after an agent or a colleague changed one. |
| **Import** (DDL or `information_schema` rows to a first model) | The skills do this in chat; the modeler has no entry for it. |

### 3.4 Steps that could be fewer

| Task | Today | Better |
|---|---|---|
| Add a named attribute | hover anchor, `a`, hover the new `?12`, `e`, type descriptor, type mnemonic, close | `a` creates it with the name field **already focused**; mnemonic **suggested** from the descriptor, unique among its kind, editable. |
| Change the target database | open *Generate*, pick, and the data types are converted | a **Model settings** dialog with target, temporalization and naming together, and a preview of what changes. |
| Get the SQL out | *Generate* → *SQL code*, select all by hand, copy | *Export* with **Copy**, **Download .sql**, and a per-object split. |
| Rename a construct | popup route above | double-click the label on the canvas. |
| Switch theme | *Settings* → *Switch to dark mode* | follow the system, with a toggle in the toolbar. |
| Find "what is wrong" | scan for a `*` in the dropdown | a Problems list that jumps to the node. |
| Start a model | *New model* gives one empty anchor | a start dialog: blank / example / open file / paste XML. |

Defaults fix many of these: the mnemonic is the clearest case. The mnemonic conventions are regular (anchors and nexuses 2 letters, attributes and knots 3, unique within their kind), so the tool can propose one. The Anchor skills already encode a rule that works.

### 3.5 One way or several?

Three ways exist: the graph, the mass-edit table behind `E`, and XML in another editor. A fourth, agent-written XML,
is now the common start. Proposal: keep the graph as the primary view, and add (in this order of value for cost)
an **outline tree with a property panel**, a **live XML view** with validation, and an **agent hand-off** (copy XML and prompt;
open the result). All of them need the same prerequisite: the model must announce its changes (see 4.2).

### 3.6 Code structure

**Layout of `index.html` (8,067 lines).** One inline `<script>` from line 97 to 7723, then the markup.

| Block | Lines (approx.) | Notes |
|---|---|---|
| `Model` | 146 – 1214 (1,070) | data, XML in and out, undo snapshots, layout bookkeeping |
| `DrawingEngine` | 1215 – 1668 (450) | animation loop, redraw |
| `Editables` | 1691 – 2060 (370) | description of each editable field |
| `EventHandler` | 2061 – 2525 (465) | mouse, keyboard, selection, interaction state |
| `Symbol`, `Component`, `Attribute`, `Identifier`, `Anchor`, `Knot`, `Tie`, `Nexus`, `Role` | 2526 – 4929 (2,400) | **model, SVG drawing and XML in one class each** |
| Popovers (modal, URL, code, **cloud browser, cloud saver**) | 4930 – 5345 (415) | cloud part is dead (below) |
| `Operations`, `TabularEditor`, `ContextMenu` | 5346 – 5756 (410) | |
| `Actions` | 5757 – 6636 (880) | file, layout, generate, share, **cloud, gist** |
| `Features`, `Settings` | 6637 – 7404 (770) | one getter/setter per setting |
| `ControlButtons`, `Layer`, `init`, `save` | 7405 – 7722 | |

**What is right.** `modules/` is a sound start (`LayoutEngine`, `DataTypeConverter`, `ModelCheck`, `Resolver`, `XmlTree`).
The generator side (`SQL/`, `modules/`) is ES5 with no dependencies on purpose, because it runs in Snowflake and under
Jint. A real harness (`sisula/examples/anchor/tools/browser-check.ps1`) drives the real page in headless Edge for
generation, bindings and feature checks.

**What is not.**

1. **No separation of model and view.** `Component` subclasses hold the domain data, the layout node, the SVG symbol,
   the XML reading and writing, and the editing rules. A side panel, a text view or a test cannot use the model
   without the drawing.
2. **Global singletons and inline wiring.** 89 `onclick=`/`onchange=`/`onblur=` attributes in the markup call
   `Actions.x()` and `Settings.y()` by name; the page script `document.write`s the version. Nothing can be loaded or
   tested apart.
3. **Undo is a full XML snapshot per change, unbounded** (`Model.recordState`, with a `TODO` for a maximum). It also
   rebuilds the whole model on each undo, which resets selection and restarts the physics.
4. **Dead and legacy code.**
   - `pathseg.js` (61 KB) is not referenced by any page or script (only `LICENSE.md` mentions it).
   - Cloud storage: `CloudBrowserPopover`, `CloudSaverPopover` and the `Actions.*Cloud*` methods (about 500 lines) point
     at `anchormodeler.appspot.com`, which `about.html` describes as the former server. The menu entries are
     commented out but the code and the clickable `#cloud` element remain.
   - A tweet link, an `unicode_hack.js` comment, `X-UA-Compatible: chrome=1`, `HandheldFriendly`. (Loading a model
     from a gist still works and stays, see section 5.)
5. **`keypress` (deprecated) on `window`** in nine places, plus `keyCode`.
6. **Settings are copied by hand**: 53 setters in `Settings` (80 `set…` methods in the file), one per setting, and 38 `inputDefaults` fields written one by one in the HTML.
7. **No tests of the UI itself.** The browser harness covers generation, not editing, undo, layout or responsive
   behaviour.

### 3.7 Devices

- **Mouse events only** (`mousedown` 5, `mousemove` 8, `mouseup` 9, `click` 71) and **zero** `touch*`/`pointer*`
  handlers: a finger cannot drag, pinch, long-press or two-finger select.
- **Viewport is declared** (`width=device-width`), and there is one `(hover: none)` block in `application.css`. It makes
  the six top-level menus stack and **expand all at once**, which fills the whole screen (`phone-touch-menus.png`,
  `tablet-touch-menus.png`). The model is hidden under menus.
- **At phone width without that block** (390 px) the top bar overflows: *Generate*, *Defaults*, *Settings* and *Help* are
  pushed off-screen or under the control strip.
- The shortcut model (hover + letter) has no touch equivalent; the context menu opens from a small toggler.
- Verdict: **view-only at best on a tablet, not usable on a phone.** Desktop widths are fine.

### 3.8 Bug: bubbles and labels on edges come loose

Reported by you: the cardinality bubbles (and the role names beside them) can leave their edge during fast movement.

**Cause, found in `Role` (`index.html:4744` and on).** An edge is drawn as a quadratic Bézier curve,
`M start Q control end`, and the bubble is placed **at the control point**. A quadratic curve only passes through its
control point when the curve is straight; otherwise it passes through the point halfway between the control point and
the middle of the chord, so the bubble sits off the line by

    offset = |control point − chord midpoint| / 2

The control point is the edge's own node in the force layout, held by springs to both ends and pushed by the charge of
every other node. It is at the chord midpoint only when everything is calm. The role name is placed from the same point
(`nameControl`, `index.html:2851`), so it comes loose in the same way. This is not a timing problem between
frames: `Role.draw` sets the path and the bubble from the same position in the same call.

**Measured** (24 bubbles on `example.xml`, headless Edge; `offset` as defined above):

| State | Mean offset | Worst | Bubbles more than 6 px off (a bubble is 16 px wide) |
|---|---|---|---|
| Settled (two runs, different random layouts) | 3.3 and 3.5 px | 8.7 and 8.9 px | 5 and 6 of 24 |
| Three anchors moved 350 px right and 200 px down at once | 47.8 px | 104.8 px | 14 of 24 |

So it is visible even at rest on some edges, and grows with the speed of the movement. The screenshots with floating
`(1)` and `(i)` bubbles (`desktop-example.png` and `bubbles-detached.png`, the second one after the forced move) show it.

**Fix.** Draw the bubble and the label at the point that is actually on the curve:
`B(½) = (start + 2·control + end) / 4`. In `Role.draw`, compute that point and use it for `svg.control.setTranslate(...)`
and for the label offset, instead of `role.xPosition/yPosition`. It is a handful of lines, changes no stored data, and
keeps the physics as it is. An alternative, to make the curve pass through the edge node by moving the Bézier control
to `2·node − (start + end)/2`, bends every edge twice as much and changes the look of all models, so it is not
recommended.

**Test.** Add a check to the browser harness that, after a load and after a forced displacement, every bubble is within
2 px of the sampled curve, and keep a screenshot pair (before and after) for the review.

**Done in 0.101.19.** `Role.curvePoint()` returns that point; `Role.draw` and a `Role.drawName` override use it. Measured
as the real distance from each bubble to its drawn path (24 bubbles, same sudden move of three anchors, old code against
new):

| | Old code: mean / worst / more than 2 px off | New code |
|---|---|---|
| Settled | 4.9 / 18.2 / 17 of 24 | 0.4 / 1.6 / 0 of 24 |
| Right after the move | 22.9 / 76.0 / 21 of 24 | 0.4 / 1.1 / 0 of 24 |
| Three seconds later | 23.1 / 73.7 / 21 of 24 | 0.4 / 1.1 / 0 of 24 |

(The remaining 1 px or so is the sampling of the path in the measurement.) The browser-harness check above is still to
be added.

## 4. Proposals

Ordered so that each step leaves a working tool and unlocks the next. Effort is a rough guide:
S = a day or two, M = about a week, L = several weeks.

### 4.1 Phase 0: hygiene (S, low risk, do first)

- **Fix the edge bubbles** (3.8). *Done in 0.101.19.*
- Delete `pathseg.js` and its `LICENSE.md` entry, the cloud popovers and `Actions.*Cloud*`, the tweet code,
  `X-UA-Compatible`, `HandheldFriendly`, and the dead commented menu items. **Keep loading a model from a gist.**
- Replace the Google Fonts links with the **system font stack**, or self-host the one font in `woff2` (self-hosting is a
  file, not a library). Removes a third-party request and the offline failure.
- Replace the large **TEST VERSION** watermark with a small corner badge; keep `RELEASE` as the switch.
- Cap undo (for example 100 states) and mark the limit in the button label.
- Swap `keypress`/`keyCode` for `keydown` and `event.key`.

**Status: done on the `modernize` branch (not merged; the version is not bumped until the branch is merged).**

- **Deleted:** `pathseg.js` and its licence text; the cloud browser and saver popovers, the `Actions.*Cloud*` methods,
  `generateURL`, the tweet link, the `#cloud` element and about 150 lines of CSS; three images that only the cloud
  popovers used; the globals and helpers that only the cloud used (`LOGGED_IN`, `USER_ID`, the UTF-8 base64 helpers);
  `Model.scope` and `Model.keywords`; the commented-out cloud and URL menu items; `X-UA-Compatible` and `HandheldFriendly`.
  **Kept:** loading a model from a gist (`?gist=<id>`), with the status line now reading *Editing <name> (gist <id>)*.
  Net: 71 lines added, 1,655 removed (`index.html` 8,067 to 7,515 lines).
- **Fonts:** the two Google Fonts links are gone. `application.css` defines `--font-ui` and `--font-mono` as system stacks
  and every rule uses them; the inline loading overlay inherits. The page makes no font request.
- **Watermark:** the 48 pt "TEST VERSION" block is now a small badge (`TEST VERSION 0.101.19`) in the top-left corner,
  shown while `RELEASE` is false, with the version filled in by script instead of `document.write`. The start-up alert
  that said the same thing is removed.
- **Known, not caused by this branch:** `browser-check.ps1 -Variant sqlserver-handwritten` differs from its golden file
  (the modeler writes `[knots].[ETY_EventType]` where the golden has `[knots].[ETY_EventType_ID]`) on `master` too. That model
  is deliberately one the modeler would not save: knots flagged equivalent while equivalence is off. The modeler resets
  such flags when it loads the file; the generator reading the file directly does not, and the templates that write a foreign
  key to a knot test `knot.isEquivalent` without also testing `schema.EQUIVALENCE`, as `CreateKnots` does. It affects only
  hand- or agent-written XML with inconsistent flags, and is not related to the naming convention (the model uses `improved`).
  Worth a separate fix in the templates.
- **Undo:** the history is capped at 100 changes (`Model.maxUndoLevels`), and the button's tooltip says so. This also
  fixes a bug: after an undo, a new change left the abandoned redo states in the list, so a later redo could jump to a
  state from the discarded branch.
- **Keyboard:** `keypress`/`keyCode` are replaced by `keydown`/`event.key`. The handler only reacts to a single
  character key without Ctrl, Alt or Meta, so F5, Tab, arrows and the browser's own shortcuts are no longer swallowed
  while the pointer is over a node. **Escape now works**: it never produced a `keypress` event in Chromium, so the
  "Escape clears the selection and closes the context menu" code had never run. It is listed in the Help page.
- **README:** no longer promises a cloud connection.
- **Tools:** in the sisula repo, on a branch of the same name, `browser-check.ps1` accepts a page with or without the
  Google Fonts links.

### 4.2 Phase 1: structure (M to L, the enabling step)

1. **Move the inline script into files** under `app/` (one per block in the table in 3.6). First as classic scripts,
   same global names, so nothing changes for users and `browser-check.ps1` keeps working. This step alone makes
   diffs and reviews readable.
2. **Introduce native ES modules for the app** (`<script type="module">`). Decision in 5 (A): this costs no compatibility
   because Chromium's `fetch` cannot read `file:` URLs, which the existing harness already works around, so *Generate*
   already needs a web server. The **engine stays ES5 and classic** (`modules/`, `SQL/`): it is shared with Snowflake and Jint.
   Keep a clear boundary: app code may import engine code, never the reverse.
3. **Split model from view.** Plain model objects (`Anchor`, `Attribute`, `Knot`, `Tie`, `Nexus`, `Role` with their
   XML in and out and their rules); a separate `Presenter` per type that owns the SVG symbol and the editables.
4. **A tiny event emitter** (about 30 lines, no library) on the model: `changed(kind, node)`. The canvas, outline,
   problems panel, XML view and undo all subscribe. This is the prerequisite for 4.4.
5. **Commands for undo.** Operations become small command objects with `do`/`undo`, so undo no longer rebuilds the
   model and keeps selection and layout. Keep XML snapshots only for *Load* and *New*.
6. **Declarative menus and settings.** One registry (id, label, description, shortcut, enabled-when, handler) feeds the
   menu bar, the context menu, the keyboard shortcuts, the help table and, later, a command palette. One settings
   schema feeds both the dialog and the load/save code. This replaces the 89 inline attributes and the hand-written setters.
7. **Tests.** Extend `browser-check.ps1` with a UI mode: open, add an attribute, rename, undo, redo, export at three
   window sizes, and take the screenshots again. No dependency: it is the same Edge-headless approach.

**Status of Phase 1 on the `modernize` branch (not merged).**

- **Step 7, tests: done, and done first.** `examples/anchor/tools/ui-check.ps1` in the sisula repository runs `ui-tests.js`
  inside the modeler's own page in headless Edge: loading and saving, the operations of the context menu, the keyboard, undo and
  redo, the dialogs, search, view, theme, settings, SQL, XML and documentation, shared links, storage, and that bubbles sit on
  their edges. 31 checks, and 23 recorded values (fingerprints of the saved model after each step, counts of fields and
  operations) that are compared with `ui-golden.json`; the fingerprint ignores positions, the root element's date, time and
  version, and the order of elements. It was run several times on unchanged code before it was trusted, and it is the reason the
  steps below could be taken without guessing. It found a bug (next point).
- **A bug the tests found, fixed:** the layout that settles after an undo or a redo was recorded as a new state, which replaced
  the newest state and ended what could be redone, so undo could not be pressed several times in a row to walk back. Undo and
  redo now mark the layout that follows them as a restoration.
- **Step 1, files: done.** `index.html` is 394 lines of markup (it was 7,514). The script is 26 files in `app/`, loaded as ordinary
  scripts in the order the code stood in, with the same global names. A script made them and checked that together they hold
  exactly the code of the original script, apart from the indent; the user-interface tests, the SQL golden files, the feature table
  and all 17 targets give the same results. **The version is now in `app/config.js`**, not in `index.html`.
- **Step 4, events: done.** `Model.on`, `off` and `emit` with `changed`, `history` and `replaced`. The model no longer calls the
  undo and redo buttons; they listen. A listener that throws does not stop the others.
- **Step 2, ES modules: not done, and it cannot come next.** Measured on the 26 files: 134 file-to-file dependencies, and **21 of
  the 26 files are in one cycle** (Model, Component, EventHandler, Actions, Settings, every kind of construct, and so on). Six
  variables are assigned from other files (`SVG`, `SVGLayer`, `NAV`, `NAVLayer`, `ASKBEFOREUNLOAD`, `DEBUG`), which an import
  cannot do. And `extend(Attribute, Component)` copies `Component.prototype` when the file runs: in a module cycle that can run
  before `Component.prototype` is assigned, and the subclasses would silently lose their methods. Moving this to modules now
  would mean either that, or one registry object that holds every singleton, which is a global namespace under another name.
  It becomes possible after the cycle is broken, that is, after step 3.
- **Step 3, model and view: not done.** The first slice is the one just taken (the model talks through events). The next is to
  take the drawing out of `Anchor`, `Knot`, `Attribute`, `Tie`, `Nexus`, `Role` and `Identifier` (2,000 lines that now hold data,
  SVG and editing rules together) into one presenter for each, so that the model has no import of `DrawingEngine`, `EventHandler`
  or `Actions`. The tests above are the safety net for it.
- **Step 5, commands for undo: not done.** It needs step 3, since a command should change the model and let the views follow.
- **Step 6, one registry for menus and settings: not done.** 84 inline handlers remain in the markup. The tests count what each
  menu offers but do not click the items; click tests come before the change.

Also on its own branch, not part of `modernize`: a fix in the generators' helpers, so that a model with equivalence off ignores
the `equivalent` flags of its knots and attributes (branch `fix-equivalence-flags`).

### 4.3 Phase 2: look and feel (M)

- **Design tokens as CSS custom properties** (colour, spacing, radius, type scale), light and dark, following
  `prefers-color-scheme` with a manual override. Keep the brand red as the accent only, not as the toolbar fill.
- **Toolbar** with real icons (inline SVG, no icon font), grouped: File, Edit (undo/redo), View (zoom, fit, theme),
  Layout, Export. The generation options leave the *Generate* menu and move to **Model settings**.
- **One Model settings dialog** (`<dialog>`), grouped and searchable: Target (database, temporalization, naming),
  Names and types (the 30 defaults), Features (equivalence, metadata, triggers), and an **Advanced** section holding the
  physics tuning. Each field gets one sentence of help visible, not only in a tooltip.
- **Readable graph**: larger hit areas, label halos, consistent edge style, and the layout in 4.4.
- **Accessibility**: menus as a proper menubar (`role`, roving tabindex, Esc, arrow keys), focus rings, a logical Tab
  order into the graph, and `aria-live` for operations (there is already one live region for file loading).

### 4.4 Phase 3: editing (M to L, needs 4.2)

1. **Outline and properties side panel** (collapsible): a tree of anchors, nexuses, ties and knots with attributes under
   them; selecting in either place selects in both; the property form lives here, so the floating popup goes away.
2. **Rename on the canvas** (double-click, F2), and **new constructs open with the name focused and a suggested
   mnemonic** (3.4).
3. **Free-standing anchor** (toolbar button, and double-click on empty canvas) once verified to be missing.
4. **Problems panel** that runs `ModelCheck` on every change (debounced) plus "no description" hints, each line
   focusing the node.
5. **A better first placement, inside the force-directed layout.** For a model without `<layout>`, seed the positions from
   the structure instead of `Math.random()`: anchors and nexuses spread by connectivity, attributes and knots on a ring
   around their owner, ties between; then let the physics polish. Add **Fit to screen** after load and a *Tidy* command.
   A model that the modeler has saved keeps using its `<layout>`, as today. No hierarchical layout unless asked for.
6. **Copy, paste, duplicate, marquee select.**
7. **Live XML view** (read-write, validated with `ModelCheck`) for people and agents; changes in either direction update
   the other.
8. **Agent hand-off**: *Copy model for an agent* (XML plus a one-paragraph instruction pointing at the skills) and *Paste
   model from agent*. Models from agents arrive without positions, so this relies on item 5.
9. **Export**: copy and download for SQL, per-object split, PNG (draw the SVG to a canvas), and several named models in
   `localStorage` with a recent list.

### 4.5 Phase 4: touch and small screens (M to L, needs 4.2 and 4.3)

Aim first for **view and light edit on tablets**, and for a phone that can *view and rename*. Full structural editing on
a phone is a stretch goal.

- **Pointer Events** (`pointerdown/move/up`) in place of mouse events, so mouse, touch and pen share one code path;
  two active pointers give **pinch zoom and two-finger pan**; a long press opens the context menu; a tap selects.
- **Responsive shell:** the toolbar collapses to icons, the side panel becomes a bottom sheet, the mini-map hides
  below a width; menus open on tap and close when the model is touched. Remove the "expand everything" rule.
- **Hit targets** of at least 44 px, and shortcuts reachable as toolbar buttons or in the context menu.
- Test at 390, 820 and 1440 px in the harness; check the three together in each review.

### 4.6 Later, only if wanted

A command palette (`Ctrl+K`) from the registry, model comparison, import from DDL, a shareable read-only view, and
multi-user editing. Each depends on 4.2.

## 5. Decisions I need from you

| | Question | My recommendation |
|---|---|---|
| A | **ES modules for the app code?** | Yes (4.2). No loss, since *Generate* already needs a server; classic scripts remain for the engine. |
| B | **Delete the cloud, gist and tweet code?** | Yes. The server is gone. History keeps it. |
| C | **Ambition on small devices:** view only, view and rename, or full editing? | View and rename on phones, light editing on tablets (4.5). |
| D | **Keep the hover + keystroke model?** | Keep it as an expert mode on desktop, add click/tap and focus-based equivalents so every action has a visible way in. |
| E | **Visual direction:** keep the red brand strip, or neutral chrome with red as an accent? | Neutral chrome, red as accent; dark and light from tokens. |
| F | **Fonts:** system stack or self-hosted Open Sans? | System stack (smallest), unless the brand needs Open Sans. |
| G | **Layout:** make a deterministic layered layout the default, keep physics as an option? | Yes; store positions on save. |
| H | **File format:** may `<layout>` positions and a few UI-only fields be added to the model XML? | Yes, optional, ignored by the generators (check `anchor.xsd`). |
| I | **Version cadence:** one bump per phase, or per merge as now? | Per merge as now, with a phase noted in the release line. |

| | Answer |
|---|---|
| A | Yes. 
| B | The Google Cloud server is gone, so anything related to that should go. Taking a gist as input still works and shoud be kept. Tweet can go.
| C | I agree.
| D | Keep as expert mode.
| E | Let's try only red as accent.
| F | Let's use system stack.
| G | I thought <layout> was saved? The force-directed layout stays, but I am open to improvements within that automatic layout paradigm. 
| H | Like I said, I am quite sure <layout> is saved, and if not then that functionality has been lost along the way.
| I | Per merge as now. 

I also noticed a bug. Bubbles on edges (for cardinality for example) can disconnect from the edge during fast movement. It shows in some of the screenshots you made. We should fix that as well.

### What the answers change in this plan

- **A, C, D, E, F, I:** taken as written. E means red only as an accent (4.3); F means the system font stack (4.1).
- **B:** cloud code and the tweet link go; **loading a model from a gist stays** (4.1 and 3.6 are updated).
- **G and H: you are right, and I was wrong.** The modeler saves positions in a `<layout>` element on every node and reads
  them back (`index.html:2798`, and the `'layout'` branches in each `fromXML`). What lacks `<layout>` is `example.xml`,
  `roastery.xml` and XML written by hand or by an agent, which then start from `Math.random()` positions. So no file
  format change is needed (H is dropped), the force-directed layout stays, and the layout item in 4.4 is now only about
  a better first placement and fit-to-screen for models that arrive without positions (3.2, 3.3 and 4.4 are updated).
- **The bubble bug** has a cause, a measurement and a small fix: 3.8, and it is the first item in Phase 0 (4.1).

## 6. A small usability test, before and after Phase 3

Five people, 20 minutes each, no training. Tasks: (1) open the example model and say what it is about, (2) add an
anchor *Customer* with a historized *Name* and a knotted *Segment*, (3) tie it to an *Order*, (4) make the SQL for
PostgreSQL and save it, (5) on a tablet, find and rename *Customer*. Record time, wrong turns and where they looked
first. It tests the findings in 3.1 and 3.4 with real people instead of my reading of the code, and gives a baseline
for the redesign.

## 7. Evidence

Screenshots (headless Edge, `docs/images/ux-review/`):

- `desktop-example.png`: 1440×900, example model, physics still settling.
- `desktop-roastery-settled.png`: roastery model with no stored layout after the physics settled; parts outside the window.
- `edit-popup.png`: the edit form for an anchor, clipped at the window edge.
- `sql-popup.png`: the generated SQL in a `contenteditable` popup, with no copy or save action.
- `dark-theme.png`: the dark theme.
- `phone-touch-menus.png`, `tablet-touch-menus.png`: the page's own touch rules applied; all menus expanded over the model.
- `bubbles-detached.png`: the same model after three anchors were moved at once; the measurement box shows how far the bubbles are from their curves.

Counts, all from `index.html` unless stated (lines that match, so a line with two matches counts once): 8,067 lines; inline script lines 97 – 7723; 89 inline event attributes; 39
`alert`/`confirm`/`prompt`; 6 `aria-`/`role`; 0 `touch*`/`pointer*`/`dblclick`/`contextmenu` handlers; 9 `keypress`;
22 `localStorage` uses; 0 CSS custom properties and 0 `prefers-color-scheme` in `application.css` and `svg.css`;
`pathseg.js` 61 KB unreferenced; `modules/ModelCheck.js` not referenced from `index.html`.

How to repeat the screenshots: build a copy of `index.html` with a `<base>` to the checkout and the Google Fonts links
removed, as `sisula/examples/anchor/tools/browser-check.ps1` does, add a script that calls
`Actions._applyLoadedModel(...)`, and run `msedge --headless=new --screenshot=… --window-size=W,H --virtual-time-budget=…`.
