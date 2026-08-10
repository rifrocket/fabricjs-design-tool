# @rifrocket/fdt-plugin-pages

## 6.0.0

### Minor Changes

- 8822338: `<MultiPageDesignEditor>` gains `propertyFields` and `autosave` props, for parity with
  `<DesignEditor propertyFields>`/`<DesignEditor autosave>`. `propertyFields` is applied once per
  page's engine (guarded so a revisit to an already-open page doesn't duplicate fields).
  `autosave` is a real new capability — `PagesManagerOptions` gains `onContentChange`, reusing the
  same per-page listener wiring that already drives thumbnail tracking, and restores a prior save
  on mount, taking priority over `initialDocument`.
- 8822338: Clears the P1 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #6, #7,
  #10–#15):

  - `@rifrocket/fdt-plugin-effects-panel`: new `effectsWithPanelPlugin(effects?)` installs both
    `plugin-effects` and its own panel in one call.
  - `@rifrocket/fdt-plugin-export-pdf`: new `createExportPdfPlugin({ pageSize, orientation,
marginMm })` for configuring PDF export; `exportPdfPlugin` stays the zero-config default.
  - `@rifrocket/fdt-plugin-pages`: `usePages()`/`<PagesProvider>` now wire the same default
    keyboard shortcuts `<Editor>` always has (previously only `<MultiPageDesignEditor>` did),
    configurable via a new `shortcuts` option.
  - `@rifrocket/fdt-plugin-svg-import`: new `importSvgToEngine(engine, svgString)` convenience,
    replacing the two-hop `engine.registry.importers.get("svg")(engine.getFabricCanvas(),
svgString)` lookup-then-call.
  - `@rifrocket/fdt-plugin-alignment`, `-snapping`, `-devtools`, `-shapes-basic-panel`,
    `-effects-panel`, `-clipboard`: all six now implement `uninstall()` (unregistering their own
    panel registration(s) or keyboard shortcuts), broadening real teardown support beyond the two
    plugins that already had it.
  - `@rifrocket/fdt-react`: `<DesignEditor autosave>`'s JSDoc now states its save-only,
    manual-restore contract inline instead of only in the underlying plugin's own docs.
  - `@rifrocket/fdt-demo`: `EngineHost.tsx` now uses `<DesignEditor autosave>` instead of hand-adding
    `localStoragePlugin` to `plugins.add` (functionally identical, now exercises the sugar prop for
    real); `DevToolsPanel` renders `plugin-alignment`/`plugin-snapping`'s own bare components
    unstyled, demonstrating their zero-effort install path live for the first time; `MultiPageExample`
    gains working keyboard shortcuts as a side effect of the `plugin-pages` fix above;
    `SvgImportButton` uses the new `importSvgToEngine` convenience.

- 8822338: Add `PagesManager.exportPageAsDocument(pageId?)` — the reverse of the existing
  `seedFromDocument()`, collapsing one page (the lowest-`order` page by default) back to a plain
  single-document payload (`{ snapshot, page: { name, width, height, backgroundColor } }`). Together
  these give a document a real, public, symmetric path between a single-`CanvasEngine` app and
  `PagesManager`'s multi-page model in both directions. `savePagesToStorage`/`loadPagesFromStorage`'s
  public `PagesStorageData` shape is unchanged, but what's written to storage internally is now a
  `DesignDocument` (see `@rifrocket/fabricjs-design-tool`'s new shared type) — the same shape
  `@rifrocket/fdt-plugin-local-storage`'s own storage format is now built on, so a multi-page save
  and a single-document save are byte-compatible JSON. A pre-existing entry saved under the old
  `{ pages, snapshots }` shape is treated as unusable rather than migrated.

  `apps/demo` no longer ships multi-page as a separate screen — it's now an in-place toggle in the
  same screen (`EngineHost.tsx`), built on these two APIs: enabling multi-page seeds page 1 from the
  current single document via `seedFromDocument()`; disabling it (after confirming if 2+ pages
  exist, since only the first page's content survives) collapses back via `exportPageAsDocument()`.
  The single-document experience is unaffected when multi-page is never enabled. The previously
  separate `pages-example` feature (its own templates, toolbar, and canvas host) is now part of
  `engine/`, and the two independently-declared plugin lists (single-document and multi-page) were
  deduplicated into one shared constant.

- 8822338: Add front/back page pairing to `@rifrocket/fdt-plugin-pages` — `PagesManager.addPagePair()` /
  `duplicatePagePair()` / `deletePagePair()` / `getPairSibling()` / `copyObjectsBetweenPages()`,
  `PageMeta.pairId`/`pairSide`, and a `<PairSideToggle>` React component — for two-sided documents
  (business cards, ID cards, invitations, certificates, flyers, brochures, packaging, product
  labels). Both sides of a pair start with identical width/height at creation time — there is still
  no API to resize a page after creation, for any page. `PageTabsBar`'s existing Duplicate/Delete
  buttons now act on the whole pair when a page is part of one, and it gains a new "Add page pair"
  button; reordering stays free-form and unconstrained, pairs are only adjacent at creation time.
  Deleting one side of a pair via the plain `deletePage()` auto-unpairs its sibling rather than
  leaving a dangling reference. `apps/demo`'s multi-page example now demonstrates a real "New
  business card" pair with distinct front/back templates, the front/back toggle, and copying an
  object to the other side. The existing shared `ExportMenu`'s "PDF" option now auto-detects a
  paired active page and exports both sides as a single print-ready PDF (via
  `@rifrocket/fdt-plugin-export-pdf`'s new `exportPdfMultiPage`) instead of just the active side —
  no separate export control needed.
- 8822338: Add `PagesManagerOptions.captureSnapshot` — overrides how `PagesManager`'s internal
  `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture a page's content,
  mirroring `@rifrocket/fdt-plugin-local-storage`'s own `captureSnapshot` option. `PagesManager`
  can't depend on `@rifrocket/fdt-plugin-pan-zoom`, so apps whose page engines draw a page-boundary
  rect via `usePannableDocument()` previously had every duplicate/save/thumbnail leak that rect into
  otherwise-real document JSON, the same bug `captureSnapshotExcludingBoundary()` already fixed for
  single-document apps. `apps/demo`'s `MultiPageExample.tsx` now passes it through, fixing the same
  leak live in multi-page mode.
- 8822338: Add `PagesManager.seedFromDocument(snapshot, init?)` and `<MultiPageDesignEditor
initialDocument={{ snapshot, meta? }}>` — the supported path for adopting an existing
  single-document app's content as page 1 instead of starting blank. Reuses the same
  `pendingSnapshots` lazy-apply mechanism `duplicatePage()` already relies on, so no new
  mechanism was introduced. Documented in a new "Migrating from a single document" README
  section.
- 8822338: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.

### Patch Changes

- 8822338: Clears the P2 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #16, #18,
  #19 — #17 verified as still not applicable, no code change):

  - New package `@rifrocket/fdt-plugin-media-fields`: the `MEDIA_FIELDS` property-field array
    (position, blend mode, opacity, rotation) previously duplicated byte-for-byte in
    `@rifrocket/fdt-plugin-image` and `@rifrocket/fdt-plugin-qrcode`, extracted to its own small
    data-only package (no `install()`) since neither existing package was a clean home for it. Both
    plugins now depend on it instead of carrying their own copy; no behavior change.
  - `@rifrocket/fdt-plugin-pages`: README's "Migrating from a single document" section now
    explicitly documents `<MultiPageDesignEditor onReady>`'s signature/firing-contract delta from
    `<DesignEditor onReady>` (`(engine, pageId)`, fires on every page switch, vs `(engine)` once).
  - `@rifrocket/fdt-demo`: README gained a note distinguishing this app's intentional kitchen-sink
    bundle size (every plugin statically imported at once) from real per-plugin consumer cost
    (`sideEffects: false` on every package means a real app installing 2–3 plugins doesn't inherit
    this).

- 8822338: Remove `PageMeta.pairId`/`side`/`linkedDimensions` — dead API surface with a misleading comment
  claiming "PagesManager's pairing helpers" existed to implement front/back page pairing; no such
  helpers were ever implemented, and no code (package, demo, or tests) read or wrote these fields.
  Front/back pairing may still be worth building, but as a real feature with actual pairing logic
  and UI, not three optional fields nobody could ever have populated.
- 8822338: release version 4
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
  - @rifrocket/fabricjs-design-tool@3.0.3
  - @rifrocket/fdt-react@3.3.0

## 5.0.0

### Minor Changes

- 5d22168: `<MultiPageDesignEditor>` gains `propertyFields` and `autosave` props, for parity with
  `<DesignEditor propertyFields>`/`<DesignEditor autosave>`. `propertyFields` is applied once per
  page's engine (guarded so a revisit to an already-open page doesn't duplicate fields).
  `autosave` is a real new capability — `PagesManagerOptions` gains `onContentChange`, reusing the
  same per-page listener wiring that already drives thumbnail tracking, and restores a prior save
  on mount, taking priority over `initialDocument`.
- 5d22168: Clears the P1 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #6, #7,
  #10–#15):

  - `@rifrocket/fdt-plugin-effects-panel`: new `effectsWithPanelPlugin(effects?)` installs both
    `plugin-effects` and its own panel in one call.
  - `@rifrocket/fdt-plugin-export-pdf`: new `createExportPdfPlugin({ pageSize, orientation,
marginMm })` for configuring PDF export; `exportPdfPlugin` stays the zero-config default.
  - `@rifrocket/fdt-plugin-pages`: `usePages()`/`<PagesProvider>` now wire the same default
    keyboard shortcuts `<Editor>` always has (previously only `<MultiPageDesignEditor>` did),
    configurable via a new `shortcuts` option.
  - `@rifrocket/fdt-plugin-svg-import`: new `importSvgToEngine(engine, svgString)` convenience,
    replacing the two-hop `engine.registry.importers.get("svg")(engine.getFabricCanvas(),
svgString)` lookup-then-call.
  - `@rifrocket/fdt-plugin-alignment`, `-snapping`, `-devtools`, `-shapes-basic-panel`,
    `-effects-panel`, `-clipboard`: all six now implement `uninstall()` (unregistering their own
    panel registration(s) or keyboard shortcuts), broadening real teardown support beyond the two
    plugins that already had it.
  - `@rifrocket/fdt-react`: `<DesignEditor autosave>`'s JSDoc now states its save-only,
    manual-restore contract inline instead of only in the underlying plugin's own docs.
  - `@rifrocket/fdt-demo`: `EngineHost.tsx` now uses `<DesignEditor autosave>` instead of hand-adding
    `localStoragePlugin` to `plugins.add` (functionally identical, now exercises the sugar prop for
    real); `DevToolsPanel` renders `plugin-alignment`/`plugin-snapping`'s own bare components
    unstyled, demonstrating their zero-effort install path live for the first time; `MultiPageExample`
    gains working keyboard shortcuts as a side effect of the `plugin-pages` fix above;
    `SvgImportButton` uses the new `importSvgToEngine` convenience.

- 5d22168: Add `PagesManagerOptions.captureSnapshot` — overrides how `PagesManager`'s internal
  `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture a page's content,
  mirroring `@rifrocket/fdt-plugin-local-storage`'s own `captureSnapshot` option. `PagesManager`
  can't depend on `@rifrocket/fdt-plugin-pan-zoom`, so apps whose page engines draw a page-boundary
  rect via `usePannableDocument()` previously had every duplicate/save/thumbnail leak that rect into
  otherwise-real document JSON, the same bug `captureSnapshotExcludingBoundary()` already fixed for
  single-document apps. `apps/demo`'s `MultiPageExample.tsx` now passes it through, fixing the same
  leak live in multi-page mode.
- 5d22168: Add `PagesManager.seedFromDocument(snapshot, init?)` and `<MultiPageDesignEditor
initialDocument={{ snapshot, meta? }}>` — the supported path for adopting an existing
  single-document app's content as page 1 instead of starting blank. Reuses the same
  `pendingSnapshots` lazy-apply mechanism `duplicatePage()` already relies on, so no new
  mechanism was introduced. Documented in a new "Migrating from a single document" README
  section.
- 5d22168: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.

### Patch Changes

- 5d22168: Clears the P2 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #16, #18,
  #19 — #17 verified as still not applicable, no code change):

  - New package `@rifrocket/fdt-plugin-media-fields`: the `MEDIA_FIELDS` property-field array
    (position, blend mode, opacity, rotation) previously duplicated byte-for-byte in
    `@rifrocket/fdt-plugin-image` and `@rifrocket/fdt-plugin-qrcode`, extracted to its own small
    data-only package (no `install()`) since neither existing package was a clean home for it. Both
    plugins now depend on it instead of carrying their own copy; no behavior change.
  - `@rifrocket/fdt-plugin-pages`: README's "Migrating from a single document" section now
    explicitly documents `<MultiPageDesignEditor onReady>`'s signature/firing-contract delta from
    `<DesignEditor onReady>` (`(engine, pageId)`, fires on every page switch, vs `(engine)` once).
  - `@rifrocket/fdt-demo`: README gained a note distinguishing this app's intentional kitchen-sink
    bundle size (every plugin statically imported at once) from real per-plugin consumer cost
    (`sideEffects: false` on every package means a real app installing 2–3 plugins doesn't inherit
    this).

- 5d22168: Remove `PageMeta.pairId`/`side`/`linkedDimensions` — dead API surface with a misleading comment
  claiming "PagesManager's pairing helpers" existed to implement front/back page pairing; no such
  helpers were ever implemented, and no code (package, demo, or tests) read or wrote these fields.
  Front/back pairing may still be worth building, but as a real feature with actual pairing logic
  and UI, not three optional fields nobody could ever have populated.
- 5d22168: release version 4
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
  - @rifrocket/fdt-react@3.2.0
  - @rifrocket/fabricjs-design-tool@3.0.2

## 4.0.0

### Minor Changes

- a645689: `<MultiPageDesignEditor>` gains `propertyFields` and `autosave` props, for parity with
  `<DesignEditor propertyFields>`/`<DesignEditor autosave>`. `propertyFields` is applied once per
  page's engine (guarded so a revisit to an already-open page doesn't duplicate fields).
  `autosave` is a real new capability — `PagesManagerOptions` gains `onContentChange`, reusing the
  same per-page listener wiring that already drives thumbnail tracking, and restores a prior save
  on mount, taking priority over `initialDocument`.
- a645689: Clears the P1 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #6, #7,
  #10–#15):

  - `@rifrocket/fdt-plugin-effects-panel`: new `effectsWithPanelPlugin(effects?)` installs both
    `plugin-effects` and its own panel in one call.
  - `@rifrocket/fdt-plugin-export-pdf`: new `createExportPdfPlugin({ pageSize, orientation,
marginMm })` for configuring PDF export; `exportPdfPlugin` stays the zero-config default.
  - `@rifrocket/fdt-plugin-pages`: `usePages()`/`<PagesProvider>` now wire the same default
    keyboard shortcuts `<Editor>` always has (previously only `<MultiPageDesignEditor>` did),
    configurable via a new `shortcuts` option.
  - `@rifrocket/fdt-plugin-svg-import`: new `importSvgToEngine(engine, svgString)` convenience,
    replacing the two-hop `engine.registry.importers.get("svg")(engine.getFabricCanvas(),
svgString)` lookup-then-call.
  - `@rifrocket/fdt-plugin-alignment`, `-snapping`, `-devtools`, `-shapes-basic-panel`,
    `-effects-panel`, `-clipboard`: all six now implement `uninstall()` (unregistering their own
    panel registration(s) or keyboard shortcuts), broadening real teardown support beyond the two
    plugins that already had it.
  - `@rifrocket/fdt-react`: `<DesignEditor autosave>`'s JSDoc now states its save-only,
    manual-restore contract inline instead of only in the underlying plugin's own docs.
  - `@rifrocket/fdt-demo`: `EngineHost.tsx` now uses `<DesignEditor autosave>` instead of hand-adding
    `localStoragePlugin` to `plugins.add` (functionally identical, now exercises the sugar prop for
    real); `DevToolsPanel` renders `plugin-alignment`/`plugin-snapping`'s own bare components
    unstyled, demonstrating their zero-effort install path live for the first time; `MultiPageExample`
    gains working keyboard shortcuts as a side effect of the `plugin-pages` fix above;
    `SvgImportButton` uses the new `importSvgToEngine` convenience.

- a645689: Add `PagesManagerOptions.captureSnapshot` — overrides how `PagesManager`'s internal
  `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture a page's content,
  mirroring `@rifrocket/fdt-plugin-local-storage`'s own `captureSnapshot` option. `PagesManager`
  can't depend on `@rifrocket/fdt-plugin-pan-zoom`, so apps whose page engines draw a page-boundary
  rect via `usePannableDocument()` previously had every duplicate/save/thumbnail leak that rect into
  otherwise-real document JSON, the same bug `captureSnapshotExcludingBoundary()` already fixed for
  single-document apps. `apps/demo`'s `MultiPageExample.tsx` now passes it through, fixing the same
  leak live in multi-page mode.
- a645689: Add `PagesManager.seedFromDocument(snapshot, init?)` and `<MultiPageDesignEditor
initialDocument={{ snapshot, meta? }}>` — the supported path for adopting an existing
  single-document app's content as page 1 instead of starting blank. Reuses the same
  `pendingSnapshots` lazy-apply mechanism `duplicatePage()` already relies on, so no new
  mechanism was introduced. Documented in a new "Migrating from a single document" README
  section.
- a645689: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.

### Patch Changes

- a645689: Clears the P2 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #16, #18,
  #19 — #17 verified as still not applicable, no code change):

  - New package `@rifrocket/fdt-plugin-media-fields`: the `MEDIA_FIELDS` property-field array
    (position, blend mode, opacity, rotation) previously duplicated byte-for-byte in
    `@rifrocket/fdt-plugin-image` and `@rifrocket/fdt-plugin-qrcode`, extracted to its own small
    data-only package (no `install()`) since neither existing package was a clean home for it. Both
    plugins now depend on it instead of carrying their own copy; no behavior change.
  - `@rifrocket/fdt-plugin-pages`: README's "Migrating from a single document" section now
    explicitly documents `<MultiPageDesignEditor onReady>`'s signature/firing-contract delta from
    `<DesignEditor onReady>` (`(engine, pageId)`, fires on every page switch, vs `(engine)` once).
  - `@rifrocket/fdt-demo`: README gained a note distinguishing this app's intentional kitchen-sink
    bundle size (every plugin statically imported at once) from real per-plugin consumer cost
    (`sideEffects: false` on every package means a real app installing 2–3 plugins doesn't inherit
    this).

- a645689: Remove `PageMeta.pairId`/`side`/`linkedDimensions` — dead API surface with a misleading comment
  claiming "PagesManager's pairing helpers" existed to implement front/back page pairing; no such
  helpers were ever implemented, and no code (package, demo, or tests) read or wrote these fields.
  Front/back pairing may still be worth building, but as a real feature with actual pairing logic
  and UI, not three optional fields nobody could ever have populated.
- Updated dependencies [a645689]
- Updated dependencies [a645689]
  - @rifrocket/fdt-react@3.1.0
