<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="220"/>

  # @rifrocket/fabricjs-design-tool

  **The framework-agnostic canvas engine at the center of [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffabricjs-design-tool/beta.svg)](https://www.npmjs.com/package/@rifrocket/fabricjs-design-tool)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

`@rifrocket/fabricjs-design-tool` wraps [Fabric.js](http://fabricjs.com/) in a `CanvasEngine` with its own plugin system, undo/redo history, event bus, and a set of engine managers (selection, layers, alignment, snapping). It has **no dependency on React or any UI framework** — [`@rifrocket/fdt-react`](../react) is the optional adapter built on top of it, and everything in [`packages/plugin-*`](../README.md) is installed into it through the same public plugin API a consumer would use.

## Features

- **Plugin system** — `Registry`, `ObjectTypeRegistry`, `ToolRegistry`, `PanelRegistry`, `EffectRegistry`, `PluginRegistry` — object types, tools, panels, and effects are all installed via `EditorPlugin`s, nothing is hardcoded into the engine
- **Undo/redo** — `HistoryManager` built on composable `Command`s (`SetPropertyCommand`, `AddObjectCommand`/`RemoveObjectCommand`, `CompositeCommand`)
- **Selection, layers, alignment & snapping** — `SelectionManager`, `LayerManager`, `AlignmentManager` (+ `computeDistribution`), `SnapEngine`
- **Effects stack** — `getEffectStack`/`addEffect`/`removeEffect`/`reorderEffect`/... with its own `EffectStackCommand` for undo integration
- **Export** — `CanvasExporter` for PNG/JPEG/SVG/JSON output
- **Document snapshots** — `captureSnapshot`/`restoreSnapshot`/`renderSnapshotThumbnail`, storage-agnostic (used by [`plugin-local-storage`](../plugin-local-storage))
- **Image & color utilities** — `cropImage`/`resetCrop`, `replaceImage`, `createLinearGradient`/`createRadialGradient`, `BLEND_MODES`
- **Keyboard shortcuts** — `KeyboardShortcutManager` with cross-platform key-combo normalization
- **Presets** — `createEditor()` + `definePreset()` for bundling a reusable plugin set (see `@rifrocket/fdt-react`'s `preset="default"`/`"minimal"` for the named presets built on top of this)

## Available Plugins

`@rifrocket/fdt-core` ships with no shapes, tools, or panels built in — everything below is installed via `plugins: { add: [...] }` (see [Quick start](#quick-start)):

| Plugin | Purpose |
|---|---|
| [`plugin-shapes-basic`](../plugin-shapes-basic) | Default shape object types (text, rect, circle, line, ellipse, polygons) |
| [`plugin-qrcode`](../plugin-qrcode) | QR code object type (generation, validation, styling) |
| [`plugin-svg-import`](../plugin-svg-import) | SVG import |
| [`plugin-image`](../plugin-image) | Image object type |
| [`plugin-clipboard`](../plugin-clipboard) | Copy/paste/duplicate/group/select-all/nudge shortcuts |
| [`plugin-export-pdf`](../plugin-export-pdf) | PDF export (isolated so `jspdf` is only paid for by consumers who install this) |
| [`plugin-import-json`](../plugin-import-json) | JSON import (engine plugin + a bare trigger button) |
| [`plugin-effects`](../plugin-effects) | Object effects system (shadow, glow, blur, glitch, duotone, ...) |
| [`plugin-local-storage`](../plugin-local-storage) | Debounced `localStorage` autosave, built on this package's document snapshot |
| [`plugin-alignment`](../plugin-alignment) | Align/distribute panel, wired to `AlignmentManager` |
| [`plugin-snapping`](../plugin-snapping) | Smart-guide snapping on/off toggle panel |
| [`plugin-devtools`](../plugin-devtools) | Dev-tools panels (event log, canvas state, history, hierarchy, perf stats) |
| [`plugin-pan-zoom`](../plugin-pan-zoom) | Wheel-zoom + spacebar-drag-pan hooks for a fixed-size viewport |

See [`packages/README.md`](../README.md#plugins) for the full table including which plugins are `engine.use()`-able vs. panel-slot wrappers.

## Install

```bash
npm install @rifrocket/fabricjs-design-tool fabric
```

`fabric` (`^6.6.7`) is a required peer dependency.

## Quick start

```ts
import { createEditor } from "@rifrocket/fabricjs-design-tool";

const canvasEl = document.getElementById("canvas") as HTMLCanvasElement;
const { engine } = createEditor(canvasEl, { width: 800, height: 600 });

engine.selection.selectAll();
engine.history.undo();
```

`createEditor()` returns an empty canvas by itself — no shapes, text, or panels until you install plugins via `plugins: { add: [...] }`. Use `@rifrocket/fdt-react`'s `<DesignEditor preset="default">` instead for a batteries-included setup with the standard plugin set already wired in.

## Subpath exports

Everything below is also available from the root `@rifrocket/fabricjs-design-tool` barrel — these subpaths exist purely to narrow what a bundler pulls in when you only need one slice:

| Import | Narrows to |
|---|---|
| `@rifrocket/fabricjs-design-tool/history` | `Command`, `CompositeCommand`, `HistoryManager`, `SetPropertyCommand`, `AddObjectCommand`/`RemoveObjectCommand` |
| `@rifrocket/fabricjs-design-tool/effects` | The effects-stack functions and `EffectStackCommand` |
| `@rifrocket/fabricjs-design-tool/export` | `CanvasExporter` and its types |

## Documentation

- [The CanvasEngine](https://rifrocket.github.io/fabricjs-design-tool/docs/architecture/canvas-engine) — architecture deep-dive
- [Store & Events](https://rifrocket.github.io/fabricjs-design-tool/docs/architecture/store-and-events)
- [History & Commands](https://rifrocket.github.io/fabricjs-design-tool/docs/architecture/history-and-commands)
- [Extension points](https://rifrocket.github.io/fabricjs-design-tool/docs/extension-points/custom-object-types) — writing your own object types, tools, panels, and effects
- [Full documentation site](https://rifrocket.github.io/fabricjs-design-tool/docs/)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors

## Links

- [Report Issues](https://github.com/rifrocket/fabricjs-design-tool/issues)
- [Repository](https://github.com/rifrocket/fabricjs-design-tool)
- [Live Demo](https://rifrocket.github.io/fabricjs-design-tool/demo/)