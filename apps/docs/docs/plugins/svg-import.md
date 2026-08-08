---
sidebar_position: 5
title: svg-import
---

# `@rifrocket/fdt-plugin-svg-import`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`

Registers an `"svg"` **importer** — not an object type. SVG import adds parsed content directly to the canvas rather than creating one object type instance, so it goes through `registerImporter`, not `registerObjectType`.

```ts
import { svgImportPlugin, importSvgToEngine } from "@rifrocket/fdt-plugin-svg-import";

engine.use(svgImportPlugin);
await importSvgToEngine(engine, svgMarkupString);
// equivalent to: await engine.registry.importers.get("svg")(engine.getFabricCanvas(), svgMarkupString);
```

Call the registered importer, as above — `importSvgToEngine(engine, svgString)` is the one-hop convenience for a caller holding only `engine`, going through `engine.registry.importers.get("svg")` so it honors a `.replace()`'d importer, not just the raw `importSVG` function. Neither goes through `engine.importFile("svg", ...)`: that facade calls `history.clear()` after every import (correct for formats like `"json"` that wholesale-replace canvas contents, but would wipe every prior undo step here, not just leave the import itself non-undoable — see below). `importSVG` only ever calls `canvas.add()` — it already self-syncs `engine.store`'s object list via the canvas's own `object:added` event (see `CanvasEngine.bindCanvasEvents()`), so it doesn't need `importFile()`'s resync logic at all.

:::caution Not undoable
`importSVG` adds objects straight to the canvas outside the history-tracked add/remove command path (`engine.addObject()`), so imported SVG content isn't an undo step. Undoing afterward undoes whatever you did *next*, not the import.
:::

## Exports

- `svgImportPlugin` — the `EditorPlugin`
- `importSvgToEngine(engine, svgString)` — the one-hop, registry-respecting convenience
- `importSVG(canvas, svgString)` — the underlying importer function, callable directly if you don't want to go through the importer registry

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.
