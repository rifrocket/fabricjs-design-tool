---
sidebar_position: 1
title: Overview
---

# Plugins Overview

There are 17 official `@rifrocket/fdt-plugin-*` packages, in five shapes. Most are `engine.use()`-able `EditorPlugin`s, but not all — knowing which shape a package is before you reach for it saves a confusing "why doesn't `engine.use(panZoomPlugin)` work" moment.

## The table

| Package | Purpose | Shape |
|---|---|---|
| [`shapes-basic`](/docs/plugins/shapes-basic) | Default shape object types (text, rect, circle, line, ellipse, polygons) | Pure engine plugin |
| [`shapes-basic-panel`](/docs/plugins/shapes-basic-panel) | Shape-creation UI (`ShapePicker`, one button per type) for `shapes-basic`'s registered types | Panel-slot wrapper |
| [`qrcode`](/docs/plugins/qrcode) | QR code object type (generation, validation, styling) | Pure engine plugin |
| [`svg-import`](/docs/plugins/svg-import) | SVG import | Pure engine plugin |
| [`image`](/docs/plugins/image) | Image object type | Pure engine plugin |
| [`media-fields`](/docs/plugins/media-fields) | Shared property-field definitions (position/blend mode/opacity/rotation) for media-like object types — used by `image` and `qrcode` | Data-only, no `install()` |
| [`clipboard`](/docs/plugins/clipboard) | Copy/paste/duplicate/group/select-all/nudge shortcuts | Pure engine plugin |
| [`export-pdf`](/docs/plugins/export-pdf) | PDF export (isolated so `jspdf` is only paid for by consumers who install this) | Pure engine plugin |
| [`import-json`](/docs/plugins/import-json) | JSON import (engine plugin + a bare trigger button) | Pure engine plugin |
| [`effects`](/docs/plugins/effects) | Object effects system (shadow, glow, blur, glitch, duotone, ...) | Pure engine plugin |
| [`effects-panel`](/docs/plugins/effects-panel) | The effects panel UI (browse/apply/stack/edit) for `effects`'s registry | Panel-slot wrapper |
| [`local-storage`](/docs/plugins/local-storage) | Debounced `localStorage` autosave, built on core's document snapshot | Pure engine plugin |
| [`alignment`](/docs/plugins/alignment) | Align/distribute panel, wired to `AlignmentManager` | Panel-slot wrapper |
| [`snapping`](/docs/plugins/snapping) | Smart-guide snapping on/off toggle panel | Panel-slot wrapper |
| [`devtools`](/docs/plugins/devtools) | Dev-tools panels (event log, canvas state, history, hierarchy, perf stats) | Panel-slot wrapper |
| [`pan-zoom`](/docs/plugins/pan-zoom) | Wheel-zoom + spacebar-drag-pan hooks for a fixed-size viewport | Hooks only — not an `EditorPlugin` |
| [`pages`](/docs/plugins/pages) | Multi-page document orchestration — one lazily-created `CanvasEngine` per page, plus a one-line `<MultiPageDesignEditor>` | Multi-engine orchestrator — not an `EditorPlugin` |

## Five shapes

**"Pure engine plugin"** (9 packages: `shapes-basic`, `qrcode`, `svg-import`, `image`, `clipboard`, `export-pdf`, `import-json`, `effects`, `local-storage`) means the package exports an object shaped like `{ name, dependsOn?, install(engine), uninstall?(engine) }` that you pass to `engine.use()`/`engine.useAll()`, registering real engine-level behavior — object types, exporters, importers, keyboard shortcuts.

**"Panel-slot wrapper"** (5 packages: `shapes-basic-panel`, `effects-panel`, `alignment`, `snapping`, `devtools`) are also real `EditorPlugin`s, but `install()` does only one thing: call `engine.registry.registerPanel(slot, { component })` to place an existing React component into a named UI slot. They're full `EditorPlugin`s (not a separate mechanism) so the `plugin-*` naming/registration convention means one consistent thing across every package — but if you read their source, `install()` is genuinely just a few lines wrapping a component that's also exported directly, for consumers who'd rather place it manually.

```ts title="A panel-slot wrapper plugin, in full (packages/plugin-alignment/src/plugin.ts)"
export const alignmentPlugin: EditorPlugin = {
  name: "alignment",
  install(engine) {
    engine.registry.registerPanel("sidebar-right", { component: AlignmentControls });
  },
};
```

**"Data-only, no `install()`"** — `media-fields` is the one package that isn't installable at all: it exports a plain `PropertyFieldDefinition[]` (`MEDIA_FIELDS`) that `image`/`qrcode` each pass into their own `registerObjectType(..., { propertyFields: MEDIA_FIELDS })` call. It exists to avoid a byte-for-byte-duplicated field array in two otherwise-unrelated plugins — see [its page](/docs/plugins/media-fields).

**"Hooks only"** — `pan-zoom` exports plain hooks (`useCanvasPanZoom`, `useContainerSize`, and — the recommended entry point — `usePannableDocument`) and functions (`setCanvasZoom`, `centerContent`, `createPageBoundaryRect`) with no `install()` at all, consumed directly by your own component code instead of `engine.use()`. This isn't an oversight — `useCanvasPanZoom` is a side-effecting DOM-listener hook that needs a host-supplied `containerSelector` unknowable from `engine` alone, and wrapping it as a null-rendering "panel" would misuse `PanelRegistry` (every other registered panel is real, visible UI). See [`pan-zoom`'s page](/docs/plugins/pan-zoom) for the usage pattern.

**"Multi-engine orchestrator"** — `pages` is the other non-`EditorPlugin`, for the opposite reason: it doesn't extend one `CanvasEngine`, it owns a whole *collection* of them (one per page, created lazily). Its own `plugins` option is itself a list of ordinary `EditorPlugin`s, installed on every page's engine via `engine.useAll()` — so everything above still applies one layer down. See [`pages`'s page](/docs/plugins/pages) and the [migration guide](/docs/plugins/pages#migrating-from-a-single-document) for adopting it into an existing single-document app.

## Not bundled into `<DesignEditor>`'s built-in presets

`alignment`, `snapping`, `devtools`, `import-json`, `effects-panel`, and `shapes-basic-panel` all peer-depend on `@rifrocket/fdt-react` (they render components via `useEditor()`). Bundling them into `<DesignEditor>`'s own presets would create a circular package dependency (`fdt-react` → plugin → `fdt-react`), so they're always added explicitly via `plugins.add` instead — see [Installing Plugins](/docs/plugins/installing-plugins). `effects-panel`/`shapes-basic-panel` are excluded for the mirror-image reason of the other four: it's `effects`/`shapes-basic` (already bundled in `default`/`minimal`) that would gain the circular dependency if their own packages grew a panel, so each panel lives in a separate sibling package instead.

`local-storage` is core-only (safe to depend on) but is still excluded from the default plugin list, because its real value needs an app-specific `captureMeta`/document-id callback — it's surfaced instead as `<DesignEditor autosave={...}>` sugar rather than bundled unconditionally.

## Next steps

- **[Installing Plugins](/docs/plugins/installing-plugins)** — `engine.use()`/`useAll()`, dependency ordering, and the construction-time-only caveat in more depth.
- **[Writing a Plugin](/docs/guides/writing-a-plugin)** — build your own, end to end.
