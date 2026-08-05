---
sidebar_position: 9
title: import-json
---

# `@rifrocket/fdt-plugin-import-json`

**Kind:** Pure engine plugin (+ a bare trigger button) · **Peer dependencies:** `fabric`, `react`, `react-dom`

Registers a `"json"` **importer**. Despite JSON *export* being one of `core`'s built-in formats, JSON import has no core-level equivalent — this plugin closes that gap.

```ts
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";

engine.use(importJsonPlugin);
await engine.importFile("json", jsonString);
```

Unlike SVG import, JSON import **should** go through `engine.importFile()`, not the registered importer directly — `canvas.loadFromJSON()` fully replaces canvas contents without going through the add/remove command path, so nothing else notices the swap unless something resyncs `objectIds`/selection/history afterward. That resync is exactly what `importFile()` does (clears history, re-syncs object list, clears selection) after calling the registered importer.

:::caution Not undoable as a single step
A JSON import replaces the entire canvas and clears history — there's no "undo the import" afterward, by design (undoing a full-document replace has no well-defined prior state to return to beyond "reload the previous document").
:::

## Exports

- `importJsonPlugin` — the `EditorPlugin`
- `ImportJsonButton` — a bare React trigger component (file picker → reads the file → calls `engine.importFile("json", ...)`)

Not bundled into either `<DesignEditor>` built-in preset (it peer-depends on `@rifrocket/fdt-react`, and `<DesignEditor>`'s presets are React-agnostic at the `core` layer — see [Plugins Overview](/docs/plugins/overview)). Add via `plugins.add`.
