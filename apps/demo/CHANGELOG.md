# @rifrocket/fdt-demo

## 0.0.6

### Patch Changes

- 8822338: Remove 4 unused direct dependencies (`@rifrocket/fdt-plugin-export-pdf`, `-image`, `-effects`,
  `-shapes-basic`) — each reaches the demo transitively via `preset="default"`'s own bundling;
  nothing in `apps/demo/src` imported any of them directly.
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
- 8822338: Add `captureSnapshotExcludingBoundary(engine)` to `@rifrocket/fdt-plugin-pan-zoom` — captures a
  document snapshot the same way core's `captureSnapshot()` does, but excludes the page-boundary
  rect (`createPageBoundaryRect`/`usePannableDocument`) from the resulting JSON without affecting
  its real, visible PNG/SVG/PDF export appearance. Previously this required every consumer to
  reinvent the same `excludeFromExport`-toggle trick locally (as `apps/demo` did); the demo now
  consumes the package's own helper instead of its own copy, which has been deleted. The README's
  Quick Start also now leads with `usePannableDocument()`, the package's own most-bundled hook,
  which was previously undocumented.
- 8822338: release version 4
- 8822338: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
  - @rifrocket/fabricjs-design-tool@3.0.3
  - @rifrocket/fdt-plugin-pages@6.0.0
  - @rifrocket/fdt-plugin-effects-panel@3.3.0
  - @rifrocket/fdt-plugin-export-pdf@3.3.0
  - @rifrocket/fdt-plugin-svg-import@3.3.0
  - @rifrocket/fdt-plugin-alignment@3.0.4
  - @rifrocket/fdt-plugin-snapping@3.0.4
  - @rifrocket/fdt-plugin-devtools@3.0.4
  - @rifrocket/fdt-plugin-shapes-basic-panel@3.3.0
  - @rifrocket/fdt-plugin-clipboard@3.0.4
  - @rifrocket/fdt-react@3.3.0
  - @rifrocket/fdt-plugin-qrcode@3.0.4
  - @rifrocket/fdt-plugin-local-storage@3.0.3
  - @rifrocket/fdt-plugin-pan-zoom@3.3.0
  - @rifrocket/fdt-plugin-import-json@3.0.4
  - @rifrocket/fdt-theme@3.0.3

## 0.0.5

### Patch Changes

- 5d22168: Remove 4 unused direct dependencies (`@rifrocket/fdt-plugin-export-pdf`, `-image`, `-effects`,
  `-shapes-basic`) — each reaches the demo transitively via `preset="default"`'s own bundling;
  nothing in `apps/demo/src` imported any of them directly.
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

- 5d22168: Add `PagesManagerOptions.captureSnapshot` — overrides how `PagesManager`'s internal
  `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture a page's content,
  mirroring `@rifrocket/fdt-plugin-local-storage`'s own `captureSnapshot` option. `PagesManager`
  can't depend on `@rifrocket/fdt-plugin-pan-zoom`, so apps whose page engines draw a page-boundary
  rect via `usePannableDocument()` previously had every duplicate/save/thumbnail leak that rect into
  otherwise-real document JSON, the same bug `captureSnapshotExcludingBoundary()` already fixed for
  single-document apps. `apps/demo`'s `MultiPageExample.tsx` now passes it through, fixing the same
  leak live in multi-page mode.
- 5d22168: Add `captureSnapshotExcludingBoundary(engine)` to `@rifrocket/fdt-plugin-pan-zoom` — captures a
  document snapshot the same way core's `captureSnapshot()` does, but excludes the page-boundary
  rect (`createPageBoundaryRect`/`usePannableDocument`) from the resulting JSON without affecting
  its real, visible PNG/SVG/PDF export appearance. Previously this required every consumer to
  reinvent the same `excludeFromExport`-toggle trick locally (as `apps/demo` did); the demo now
  consumes the package's own helper instead of its own copy, which has been deleted. The README's
  Quick Start also now leads with `usePannableDocument()`, the package's own most-bundled hook,
  which was previously undocumented.
- 5d22168: release version 4
- 5d22168: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
  - @rifrocket/fdt-plugin-pages@5.0.0
  - @rifrocket/fdt-plugin-effects-panel@3.2.0
  - @rifrocket/fdt-plugin-svg-import@3.2.0
  - @rifrocket/fdt-plugin-alignment@3.0.3
  - @rifrocket/fdt-plugin-snapping@3.0.3
  - @rifrocket/fdt-plugin-devtools@3.0.3
  - @rifrocket/fdt-plugin-shapes-basic-panel@3.2.0
  - @rifrocket/fdt-plugin-clipboard@3.0.3
  - @rifrocket/fdt-react@3.2.0
  - @rifrocket/fdt-plugin-qrcode@3.0.3
  - @rifrocket/fdt-plugin-pan-zoom@3.2.0
  - @rifrocket/fdt-plugin-local-storage@3.0.2
  - @rifrocket/fdt-plugin-import-json@3.0.3
  - @rifrocket/fdt-theme@3.0.2
  - @rifrocket/fabricjs-design-tool@3.0.2

## 0.0.4

### Patch Changes

- a645689: Remove 4 unused direct dependencies (`@rifrocket/fdt-plugin-export-pdf`, `-image`, `-effects`,
  `-shapes-basic`) — each reaches the demo transitively via `preset="default"`'s own bundling;
  nothing in `apps/demo/src` imported any of them directly.
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

- a645689: Add `PagesManagerOptions.captureSnapshot` — overrides how `PagesManager`'s internal
  `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture a page's content,
  mirroring `@rifrocket/fdt-plugin-local-storage`'s own `captureSnapshot` option. `PagesManager`
  can't depend on `@rifrocket/fdt-plugin-pan-zoom`, so apps whose page engines draw a page-boundary
  rect via `usePannableDocument()` previously had every duplicate/save/thumbnail leak that rect into
  otherwise-real document JSON, the same bug `captureSnapshotExcludingBoundary()` already fixed for
  single-document apps. `apps/demo`'s `MultiPageExample.tsx` now passes it through, fixing the same
  leak live in multi-page mode.
- a645689: Add `captureSnapshotExcludingBoundary(engine)` to `@rifrocket/fdt-plugin-pan-zoom` — captures a
  document snapshot the same way core's `captureSnapshot()` does, but excludes the page-boundary
  rect (`createPageBoundaryRect`/`usePannableDocument`) from the resulting JSON without affecting
  its real, visible PNG/SVG/PDF export appearance. Previously this required every consumer to
  reinvent the same `excludeFromExport`-toggle trick locally (as `apps/demo` did); the demo now
  consumes the package's own helper instead of its own copy, which has been deleted. The README's
  Quick Start also now leads with `usePannableDocument()`, the package's own most-bundled hook,
  which was previously undocumented.
- a645689: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.
- Updated dependencies [a645689]
- Updated dependencies [a645689]
- Updated dependencies [a645689]
- Updated dependencies [a645689]
- Updated dependencies [a645689]
- Updated dependencies [a645689]
- Updated dependencies [a645689]
- Updated dependencies [a645689]
  - @rifrocket/fdt-plugin-pages@4.0.0
  - @rifrocket/fdt-plugin-effects-panel@3.1.0
  - @rifrocket/fdt-plugin-svg-import@3.1.0
  - @rifrocket/fdt-plugin-alignment@3.0.2
  - @rifrocket/fdt-plugin-snapping@3.0.2
  - @rifrocket/fdt-plugin-devtools@3.0.2
  - @rifrocket/fdt-plugin-shapes-basic-panel@3.1.0
  - @rifrocket/fdt-plugin-clipboard@3.0.2
  - @rifrocket/fdt-react@3.1.0
  - @rifrocket/fdt-plugin-qrcode@3.0.2
  - @rifrocket/fdt-plugin-pan-zoom@3.1.0
  - @rifrocket/fdt-plugin-import-json@3.0.2

## 0.0.3

### Patch Changes

- 6a408a4: update documentation
- Updated dependencies [6a408a4]
  - @rifrocket/fdt-plugin-local-storage@3.0.1
  - @rifrocket/fdt-plugin-shapes-basic@3.0.1
  - @rifrocket/fdt-plugin-import-json@3.0.1
  - @rifrocket/fdt-plugin-export-pdf@3.0.1
  - @rifrocket/fdt-plugin-svg-import@3.0.1
  - @rifrocket/fdt-plugin-clipboard@3.0.1
  - @rifrocket/fdt-plugin-devtools@3.0.1
  - @rifrocket/fdt-plugin-pan-zoom@3.0.1
  - @rifrocket/fdt-plugin-effects@3.0.1
  - @rifrocket/fdt-plugin-qrcode@3.0.1
  - @rifrocket/fdt-plugin-image@3.0.1
  - @rifrocket/fdt-react@3.0.1
  - @rifrocket/fdt-theme@3.0.1
  - @rifrocket/fabricjs-design-tool@3.0.1

## 0.0.2

### Patch Changes

- Updated dependencies
  - @rifrocket/fabricjs-design-tool@3.0.0
  - @rifrocket/fdt-react@3.0.0
  - @rifrocket/fdt-theme@3.0.0
  - @rifrocket/fdt-plugin-clipboard@3.0.0
  - @rifrocket/fdt-plugin-devtools@3.0.0
  - @rifrocket/fdt-plugin-effects@3.0.0
  - @rifrocket/fdt-plugin-export-pdf@3.0.0
  - @rifrocket/fdt-plugin-image@3.0.0
  - @rifrocket/fdt-plugin-import-json@3.0.0
  - @rifrocket/fdt-plugin-local-storage@3.0.0
  - @rifrocket/fdt-plugin-pan-zoom@3.0.0
  - @rifrocket/fdt-plugin-qrcode@3.0.0
  - @rifrocket/fdt-plugin-shapes-basic@3.0.0
  - @rifrocket/fdt-plugin-svg-import@3.0.0

## 0.0.1

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies
- Updated dependencies [ebe6ca3]
- Updated dependencies [f096f8f]
  - @rifrocket/fdt-plugin-effects@2.0.0
  - @rifrocket/fabricjs-design-tool@2.0.0
  - @rifrocket/fdt-react@2.0.0
  - @rifrocket/fdt-theme@2.0.0
  - @rifrocket/fdt-plugin-clipboard@2.0.0
  - @rifrocket/fdt-plugin-devtools@2.0.0
  - @rifrocket/fdt-plugin-export-pdf@2.0.0
  - @rifrocket/fdt-plugin-image@2.0.0
  - @rifrocket/fdt-plugin-import-json@2.0.0
  - @rifrocket/fdt-plugin-local-storage@2.0.0
  - @rifrocket/fdt-plugin-pan-zoom@2.0.0
  - @rifrocket/fdt-plugin-qrcode@2.0.0
  - @rifrocket/fdt-plugin-shapes-basic@2.0.0
  - @rifrocket/fdt-plugin-svg-import@2.0.0

## 0.0.1-beta.1

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies [f096f8f]
  - @rifrocket/fabricjs-design-tool@2.0.0-beta.1
  - @rifrocket/fdt-react@2.0.0-beta.1
  - @rifrocket/fdt-plugin-clipboard@2.0.0-beta.1
  - @rifrocket/fdt-plugin-devtools@2.0.0-beta.1
  - @rifrocket/fdt-plugin-effects@2.0.0-beta.1
  - @rifrocket/fdt-plugin-export-pdf@2.0.0-beta.1
  - @rifrocket/fdt-plugin-image@2.0.0-beta.1
  - @rifrocket/fdt-plugin-import-json@2.0.0-beta.1
  - @rifrocket/fdt-plugin-local-storage@2.0.0-beta.1
  - @rifrocket/fdt-plugin-pan-zoom@2.0.0-beta.1
  - @rifrocket/fdt-plugin-qrcode@2.0.0-beta.1
  - @rifrocket/fdt-plugin-shapes-basic@2.0.0-beta.1
  - @rifrocket/fdt-plugin-svg-import@2.0.0-beta.1

## 0.0.1-beta.0

### Patch Changes

- Updated dependencies [ebe6ca3]
  - @rifrocket/fdt-core@2.0.0-beta.0
  - @rifrocket/fdt-react@2.0.0-beta.0
  - @rifrocket/fdt-theme@2.0.0-beta.0
  - @rifrocket/fdt-plugin-clipboard@2.0.0-beta.0
  - @rifrocket/fdt-plugin-devtools@2.0.0-beta.0
  - @rifrocket/fdt-plugin-effects@2.0.0-beta.0
  - @rifrocket/fdt-plugin-export-pdf@2.0.0-beta.0
  - @rifrocket/fdt-plugin-image@2.0.0-beta.0
  - @rifrocket/fdt-plugin-import-json@2.0.0-beta.0
  - @rifrocket/fdt-plugin-local-storage@2.0.0-beta.0
  - @rifrocket/fdt-plugin-pan-zoom@2.0.0-beta.0
  - @rifrocket/fdt-plugin-qrcode@2.0.0-beta.0
  - @rifrocket/fdt-plugin-shapes-basic@2.0.0-beta.0
  - @rifrocket/fdt-plugin-svg-import@2.0.0-beta.0
