---
"@rifrocket/fdt-plugin-effects-panel": minor
"@rifrocket/fdt-plugin-export-pdf": minor
"@rifrocket/fdt-plugin-pages": minor
"@rifrocket/fdt-plugin-svg-import": minor
"@rifrocket/fdt-plugin-alignment": patch
"@rifrocket/fdt-plugin-snapping": patch
"@rifrocket/fdt-plugin-devtools": patch
"@rifrocket/fdt-plugin-shapes-basic-panel": patch
"@rifrocket/fdt-plugin-clipboard": patch
"@rifrocket/fdt-react": patch
"@rifrocket/fdt-demo": patch
---

Clears the P1 backlog from `design-docs/PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md` (items #6, #7,
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
