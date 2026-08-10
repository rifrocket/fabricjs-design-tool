---
"@rifrocket/fdt-plugin-shapes-basic-panel": minor
"@rifrocket/fdt-react": minor
"@rifrocket/fdt-plugin-pages": minor
"@rifrocket/fdt-demo": patch
---

Add a `"tool-rail"` panel slot, rendered by default alongside the existing three
(`toolbar-start`, `sidebar-right`, `properties-footer`) in `<Editor>`/`<DesignEditor>`/
`<MultiPageDesignEditor>`. New package `@rifrocket/fdt-plugin-shapes-basic-panel` ships a bare
`ShapePicker` (one button per shape type registered by `@rifrocket/fdt-plugin-shapes-basic`) via
`createShapesBasicPanelPlugin()`, registering into `"tool-rail"` and declaring
`dependsOn: ["shapes-basic"]` — mirrors the existing `plugin-effects`/`plugin-effects-panel`
sibling-package split to avoid a circular dependency on `@rifrocket/fdt-react`. Demo wired for
real in both single- and multi-page modes.
