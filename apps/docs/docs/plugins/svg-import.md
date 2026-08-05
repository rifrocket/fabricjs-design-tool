---
sidebar_position: 5
title: svg-import
---

# `@rifrocket/fdt-plugin-svg-import`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`

Registers an `"svg"` **importer** — not an object type. SVG import adds parsed content directly to the canvas rather than creating one object type instance, so it goes through `registerImporter`, not `registerObjectType`.

```ts
import { svgImportPlugin } from "@rifrocket/fdt-plugin-svg-import";

engine.use(svgImportPlugin);
await engine.registry.importers.get("svg")(engine.getFabricCanvas(), svgMarkupString);
```

Call the registered importer **directly**, as above, rather than through `engine.importFile("svg", ...)`. `importSVG` only ever calls `canvas.add()` — it already self-syncs `engine.store`'s object list via the canvas's own `object:added` event (see `CanvasEngine.bindCanvasEvents()`), so it doesn't need `importFile()`'s full-replace resync logic (history clear + selection reset), which is designed for importers that wholesale replace canvas contents, like [`import-json`](/docs/plugins/import-json).

:::caution Not undoable
`importSVG` adds objects straight to the canvas outside the history-tracked add/remove command path (`engine.addObject()`), so imported SVG content isn't an undo step. Undoing afterward undoes whatever you did *next*, not the import.
:::

## Exports

- `svgImportPlugin` — the `EditorPlugin`
- `importSVG(canvas, svgString)` — the underlying importer function, callable directly if you don't want to go through the importer registry

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.
