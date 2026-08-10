# @rifrocket/fdt-plugin-pages

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
