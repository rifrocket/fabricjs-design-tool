<div align="center">
  <img src="../../apps/docs/static/img/logo-large.svg" alt="Fabric Design Tool" width="220"/>

  # @rifrocket/fdt-core

  **The framework-agnostic canvas engine at the center of [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-core/alpha.svg)](https://www.npmjs.com/package/@rifrocket/fdt-core)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

`@rifrocket/fdt-core` wraps [Fabric.js](http://fabricjs.com/) in a `CanvasEngine` with its own plugin system, undo/redo history, event bus, and a set of engine managers (selection, layers, alignment, snapping). It has **no dependency on React or any UI framework** — [`@rifrocket/fdt-react`](../react) is the optional adapter built on top of it, and everything in [`packages/plugin-*`](../README.md) is installed into it through the same public plugin API a consumer would use.

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

## Install

```bash
npm install @rifrocket/fdt-core fabric
```

`fabric` (`^6.6.7`) is a required peer dependency.

## Quick start

```ts
import { createEditor } from "@rifrocket/fdt-core";

const canvasEl = document.getElementById("canvas") as HTMLCanvasElement;
const { engine } = createEditor(canvasEl, { width: 800, height: 600 });

engine.selection.selectAll();
engine.history.undo();
```

`createEditor()` returns an empty canvas by itself — no shapes, text, or panels until you install plugins via `plugins: { add: [...] }`. Use `@rifrocket/fdt-react`'s `<DesignEditor preset="default">` instead for a batteries-included setup with the standard plugin set already wired in.

## Subpath exports

Everything below is also available from the root `@rifrocket/fdt-core` barrel — these subpaths exist purely to narrow what a bundler pulls in when you only need one slice:

| Import | Narrows to |
|---|---|
| `@rifrocket/fdt-core/history` | `Command`, `CompositeCommand`, `HistoryManager`, `SetPropertyCommand`, `AddObjectCommand`/`RemoveObjectCommand` |
| `@rifrocket/fdt-core/effects` | The effects-stack functions and `EffectStackCommand` |
| `@rifrocket/fdt-core/export` | `CanvasExporter` and its types |

## Documentation

- [The CanvasEngine](https://rifrocket.github.io/fabricjs-design-tool/docs/architecture/canvas-engine) — architecture deep-dive
- [Store & Events](https://rifrocket.github.io/fabricjs-design-tool/docs/architecture/store-and-events)
- [History & Commands](https://rifrocket.github.io/fabricjs-design-tool/docs/architecture/history-and-commands)
- [Extension points](https://rifrocket.github.io/fabricjs-design-tool/docs/extension-points/custom-object-types) — writing your own object types, tools, panels, and effects
- [Full documentation site](https://rifrocket.github.io/fabricjs-design-tool/docs/)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
