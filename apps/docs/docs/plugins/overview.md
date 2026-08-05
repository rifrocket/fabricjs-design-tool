---
sidebar_position: 1
title: Overview
---

# Plugins Overview

There are 13 official `@rifrocket/fdt-plugin-*` packages. **12 of them are true `EditorPlugin`s** — installable via `engine.use()`/`engine.useAll()` — and **1 is a plain hooks/functions package** that is deliberately *not* installed that way. Knowing which is which before you reach for one saves a confusing "why doesn't `engine.use(panZoomPlugin)` work" moment.

## The table

| Package | Purpose | Shape |
|---|---|---|
| [`shapes-basic`](/docs/plugins/shapes-basic) | Default shape object types (text, rect, circle, line, ellipse, polygons) | Engine plugin |
| [`qrcode`](/docs/plugins/qrcode) | QR code object type (generation, validation, styling) | Engine plugin |
| [`svg-import`](/docs/plugins/svg-import) | SVG import | Engine plugin |
| [`image`](/docs/plugins/image) | Image object type | Engine plugin |
| [`clipboard`](/docs/plugins/clipboard) | Copy/paste/duplicate/group/select-all/nudge shortcuts | Engine plugin |
| [`export-pdf`](/docs/plugins/export-pdf) | PDF export (isolated so `jspdf` is only paid for by consumers who install this) | Engine plugin |
| [`import-json`](/docs/plugins/import-json) | JSON import (engine plugin + a bare trigger button) | Engine plugin |
| [`effects`](/docs/plugins/effects) | Object effects system (shadow, glow, blur, glitch, duotone, ...) | Engine plugin |
| [`local-storage`](/docs/plugins/local-storage) | Debounced `localStorage` autosave, built on core's document snapshot | Engine plugin |
| [`alignment`](/docs/plugins/alignment) | Align/distribute panel, wired to `AlignmentManager` | Engine plugin (panel-slot wrapper) |
| [`snapping`](/docs/plugins/snapping) | Smart-guide snapping on/off toggle panel | Engine plugin (panel-slot wrapper) |
| [`devtools`](/docs/plugins/devtools) | Dev-tools panels (event log, canvas state, history, hierarchy, perf stats) | Engine plugin (panel-slot wrapper) |
| [`pan-zoom`](/docs/plugins/pan-zoom) | Wheel-zoom + spacebar-drag-pan hooks for a fixed-size viewport | **Hooks only — not an `EditorPlugin`** |

## Two shapes, three flavors

**"Engine plugin"** means the package exports an object shaped like `{ name, dependsOn?, install(engine), uninstall?(engine) }` that you pass to `engine.use()` or `engine.useAll([...])`. Within that group there's a further, worth-knowing distinction:

- **Pure engine plugins** (`shapes-basic`, `qrcode`, `svg-import`, `image`, `clipboard`, `export-pdf`, `import-json`, `effects`, `local-storage`) register real engine-level behavior — object types, exporters, importers, keyboard shortcuts.
- **Panel-slot wrapper plugins** (`alignment`, `snapping`, `devtools`) do only one thing in `install()`: call `engine.registry.registerPanel(slot, { component })` to place an existing React component into a named UI slot. They exist as real `EditorPlugin`s so the `plugin-*` naming convention means one consistent thing across all 13 packages — but if you read their source, `install()` is genuinely just a few lines wrapping a component that's also exported directly, for consumers who'd rather place it manually.

```ts title="A panel-slot wrapper plugin, in full (packages/plugin-alignment/src/plugin.ts)"
export const alignmentPlugin: EditorPlugin = {
  name: "alignment",
  install(engine) {
    engine.registry.registerPanel("sidebar-right", { component: AlignmentControls });
  },
};
```

**"Hooks only"** — `plugin-pan-zoom` is the **one deliberate exception**. It exports plain hooks (`useCanvasPanZoom`, `useContainerSize`) and functions (`setCanvasZoom`, `centerContent`) with no `install()` at all, consumed directly by your own component code instead of `engine.use()`. This isn't an oversight — `useCanvasPanZoom` is a side-effecting DOM-listener hook that needs a host-supplied `containerSelector` unknowable from `engine` alone, and wrapping it as a null-rendering "panel" would misuse `PanelRegistry` (every other registered panel is real, visible UI). See [`pan-zoom`'s page](/docs/plugins/pan-zoom) for the usage pattern.

## Not bundled into `<DesignEditor>`'s built-in presets

`alignment`, `snapping`, `devtools`, and `import-json` all peer-depend on `@rifrocket/fdt-react` (they render components via `useEditor()`). Bundling them into `<DesignEditor>`'s own presets would create a circular package dependency (`fdt-react` → plugin → `fdt-react`), so they're always added explicitly via `plugins.add` instead — see [Installing Plugins](/docs/plugins/installing-plugins).

`local-storage` is core-only (safe to depend on) but is still excluded from the default plugin list, because its real value needs an app-specific `captureMeta`/document-id callback — it's surfaced instead as `<DesignEditor autosave={...}>` sugar rather than bundled unconditionally.

## Next steps

- **[Installing Plugins](/docs/plugins/installing-plugins)** — `engine.use()`/`useAll()`, dependency ordering, and the construction-time-only caveat in more depth.
- **[Writing a Plugin](/docs/guides/writing-a-plugin)** — build your own, end to end.
