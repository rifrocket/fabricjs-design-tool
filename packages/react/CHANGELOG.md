# @rifrocket/fdt-react

## 3.3.0

### Minor Changes

- 8822338: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.

### Patch Changes

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

- 8822338: release version 4
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
- Updated dependencies [8822338]
  - @rifrocket/fabricjs-design-tool@3.0.3
  - @rifrocket/fdt-plugin-export-pdf@3.3.0
  - @rifrocket/fdt-plugin-svg-import@3.3.0
  - @rifrocket/fdt-plugin-clipboard@3.0.4
  - @rifrocket/fdt-plugin-image@3.0.4
  - @rifrocket/fdt-plugin-qrcode@3.0.4
  - @rifrocket/fdt-plugin-effects@3.3.0
  - @rifrocket/fdt-plugin-local-storage@3.0.3
  - @rifrocket/fdt-plugin-shapes-basic@3.0.3

## 3.2.0

### Minor Changes

- 5d22168: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.

### Patch Changes

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

- 5d22168: release version 4
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
- Updated dependencies [5d22168]
  - @rifrocket/fdt-plugin-export-pdf@3.2.0
  - @rifrocket/fdt-plugin-svg-import@3.2.0
  - @rifrocket/fdt-plugin-clipboard@3.0.3
  - @rifrocket/fdt-plugin-image@3.0.3
  - @rifrocket/fdt-plugin-qrcode@3.0.3
  - @rifrocket/fdt-plugin-effects@3.2.0
  - @rifrocket/fdt-plugin-local-storage@3.0.2
  - @rifrocket/fdt-plugin-shapes-basic@3.0.2
  - @rifrocket/fabricjs-design-tool@3.0.2

## 3.1.0

### Minor Changes

- a645689: Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
  (`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
  `<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
  `ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
  `createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
  `dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
  sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
  real in both single- and multi-page modes.

### Patch Changes

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

- Updated dependencies [a645689]
- Updated dependencies [a645689]
- Updated dependencies [a645689]
  - @rifrocket/fdt-plugin-export-pdf@3.1.0
  - @rifrocket/fdt-plugin-svg-import@3.1.0
  - @rifrocket/fdt-plugin-clipboard@3.0.2
  - @rifrocket/fdt-plugin-image@3.0.2
  - @rifrocket/fdt-plugin-qrcode@3.0.2
  - @rifrocket/fdt-plugin-effects@3.1.0

## 3.0.1

### Patch Changes

- 6a408a4: update documentation
- Updated dependencies [6a408a4]
  - @rifrocket/fdt-plugin-local-storage@3.0.1
  - @rifrocket/fdt-plugin-shapes-basic@3.0.1
  - @rifrocket/fdt-plugin-export-pdf@3.0.1
  - @rifrocket/fdt-plugin-svg-import@3.0.1
  - @rifrocket/fdt-plugin-clipboard@3.0.1
  - @rifrocket/fdt-plugin-effects@3.0.1
  - @rifrocket/fdt-plugin-qrcode@3.0.1
  - @rifrocket/fdt-plugin-image@3.0.1
  - @rifrocket/fabricjs-design-tool@3.0.1

## 3.0.0

### Major Changes

- First stable release. Beta testing (2.0.0-beta.0/beta.1) is complete — this is the first release published under npm's `latest` tag with no prerelease suffix, published directly as 3.0.0 rather than 2.0.0 so the version number isn't tied to the beta cycle. No breaking API changes beyond what already shipped in the betas.

### Patch Changes

- Updated dependencies
  - @rifrocket/fabricjs-design-tool@3.0.0
  - @rifrocket/fdt-plugin-clipboard@3.0.0
  - @rifrocket/fdt-plugin-effects@3.0.0
  - @rifrocket/fdt-plugin-export-pdf@3.0.0
  - @rifrocket/fdt-plugin-image@3.0.0
  - @rifrocket/fdt-plugin-local-storage@3.0.0
  - @rifrocket/fdt-plugin-qrcode@3.0.0
  - @rifrocket/fdt-plugin-shapes-basic@3.0.0
  - @rifrocket/fdt-plugin-svg-import@3.0.0

## 2.0.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies
- Updated dependencies [ebe6ca3]
- Updated dependencies [f096f8f]
  - @rifrocket/fdt-plugin-effects@2.0.0
  - @rifrocket/fabricjs-design-tool@2.0.0
  - @rifrocket/fdt-plugin-clipboard@2.0.0
  - @rifrocket/fdt-plugin-export-pdf@2.0.0
  - @rifrocket/fdt-plugin-image@2.0.0
  - @rifrocket/fdt-plugin-local-storage@2.0.0
  - @rifrocket/fdt-plugin-qrcode@2.0.0
  - @rifrocket/fdt-plugin-shapes-basic@2.0.0
  - @rifrocket/fdt-plugin-svg-import@2.0.0

## 2.0.0-beta.1

### Patch Changes

- f096f8f: Rename the core engine package from `@rifrocket/fdt-core` to `@rifrocket/fabricjs-design-tool` — the well-known, higher-traffic package name. No API changes; `import { createEditor } from "@rifrocket/fabricjs-design-tool"` replaces `@rifrocket/fdt-core`, including its `/history`, `/effects`, and `/export` subpaths. All dependent packages update their internal dependency to match.
- Updated dependencies [f096f8f]
  - @rifrocket/fabricjs-design-tool@2.0.0-beta.1
  - @rifrocket/fdt-plugin-clipboard@2.0.0-beta.1
  - @rifrocket/fdt-plugin-effects@2.0.0-beta.1
  - @rifrocket/fdt-plugin-export-pdf@2.0.0-beta.1
  - @rifrocket/fdt-plugin-image@2.0.0-beta.1
  - @rifrocket/fdt-plugin-local-storage@2.0.0-beta.1
  - @rifrocket/fdt-plugin-qrcode@2.0.0-beta.1
  - @rifrocket/fdt-plugin-shapes-basic@2.0.0-beta.1
  - @rifrocket/fdt-plugin-svg-import@2.0.0-beta.1

## 2.0.0-beta.0

### Major Changes

- ebe6ca3: Initial public beta release of the v2 monorepo packages.

### Patch Changes

- Updated dependencies [ebe6ca3]
  - @rifrocket/fdt-core@2.0.0-beta.0
  - @rifrocket/fdt-plugin-clipboard@2.0.0-beta.0
  - @rifrocket/fdt-plugin-effects@2.0.0-beta.0
  - @rifrocket/fdt-plugin-export-pdf@2.0.0-beta.0
  - @rifrocket/fdt-plugin-image@2.0.0-beta.0
  - @rifrocket/fdt-plugin-local-storage@2.0.0-beta.0
  - @rifrocket/fdt-plugin-qrcode@2.0.0-beta.0
  - @rifrocket/fdt-plugin-shapes-basic@2.0.0-beta.0
  - @rifrocket/fdt-plugin-svg-import@2.0.0-beta.0
