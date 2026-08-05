---
sidebar_position: 5
title: Export/Import Pipelines
---

# Export/Import Pipelines

Export and import are both registry-based, keyed by format string. `CanvasEngine` registers 4 built-in export formats (`png`, `jpeg`, `svg`, `json`) for itself at construction time; there are no built-in importers — every import format is plugin-provided. Neither is special-cased over a plugin-registered one — they're just the default registrations `CanvasEngine` makes for itself.

## Exporting

```ts
engine.export("png"); // { format, fileName, mimeType, data }
```

```ts
type Exporter = (canvas: Canvas) => unknown;

engine.registry.registerExporter("pdf", (canvas) => {
  // build and return your own result shape
});
```

`@rifrocket/fdt-plugin-export-pdf` is the reference example — its entire `install()` is one `registerExporter("pdf", exportPdf)` call. `CanvasExporter` (the class backing the 4 built-in formats) is also exported directly from `@rifrocket/fdt-core`, in case you want its PNG/JPEG/SVG/JSON logic without going through the registry.

## Importing

```ts
await engine.importFile("json", jsonString);
```

```ts
type Importer = (canvas: Canvas, input: unknown) => void | Promise<void>;

engine.registry.registerImporter("json", async (canvas, input) => {
  await canvas.loadFromJSON(input);
  canvas.requestRenderAll();
});
```

## Two different import shapes — pick the right call site

Not every importer wants `engine.importFile()`. There are two real patterns among the shipped plugins:

**Full-replace importers** (e.g. `plugin-import-json`) call `canvas.loadFromJSON()`, which fully replaces canvas contents *without* going through the add/remove command path — nothing else notices the swap unless something resyncs `objectIds`/selection/history afterward. Call these through `engine.importFile()`, which does exactly that resync (clears history, re-syncs object list, clears selection) after running the registered importer:

```ts
await engine.importFile("json", jsonString);
```

**Additive importers** (e.g. `plugin-svg-import`) only ever call `canvas.add()`, which already self-syncs `engine.store`'s object list via the canvas's own `object:added` event — they don't need `importFile()`'s full-replace resync. Call the registered importer **directly** instead:

```ts
await engine.registry.importers.get("svg")(engine.getFabricCanvas(), svgMarkupString);
```

Neither import path adds objects through `engine.addObject()`, so **imported content isn't an undo step** either way — undoing afterward undoes whatever you did next, not the import.

## Concurrent imports are queued, not rejected

`engine.importFile()` guards against a second import starting before the first finishes — two overlapping `loadFromJSON()`-style calls could otherwise interleave and leave the canvas in a mixed state. Calls are queued rather than rejected, so callers don't need to coordinate import calls themselves.
