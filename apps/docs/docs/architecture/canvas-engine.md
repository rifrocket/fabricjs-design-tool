---
sidebar_position: 2
title: The CanvasEngine
---

# The CanvasEngine

`CanvasEngine` is the central object in `@rifrocket/fdt-core`. It owns one Fabric.js `Canvas` and composes narrow, independently-testable managers around it instead of exposing the raw canvas as the primary surface.

```ts
import { createEngine } from "@rifrocket/fdt-core";

const engine = createEngine(canvasElement, { width: 800, height: 600 });
```

`createEngine()` is a thin static factory — `CanvasEngine.create()` under the hood — that constructs the Fabric `Canvas` and every manager below it in one call.

## The managers

| Manager | Accessed via | Responsibility |
|---|---|---|
| `ViewportManager` | `engine.viewport` | Zoom/pan math |
| `SelectionManager` | `engine.selection` | Active object(s), group/ungroup |
| `LayerManager` | `engine.layers` | Z-order, visibility, lock state |
| `AlignmentManager` | `engine.alignment` | Align/distribute |
| `SnapEngine` | `engine.snapping` | Smart-guide snapping |
| `HistoryManager` | `engine.history` | Command-pattern undo/redo |
| `PluginRegistry` | `engine.registry` | Object types, tools, panels, effects, exporters, importers |
| `Store` | `engine.store` | Observable state (see [Store & Events](/docs/architecture/store-and-events)) |
| `EventBus` | `engine.events` | Pub-sub with middleware |
| `KeyboardShortcutManager` | `engine.shortcuts` | Keyboard shortcut registration |

Each manager only knows about the raw Fabric `Canvas` it was constructed with — none of them know about each other, and none of them know about `CanvasEngine` itself. `CanvasEngine`'s own methods are largely **facades** that call a manager and then keep the reactive `Store` in sync, which matters more than it sounds:

```ts
// Prefer this — keeps EngineState.zoom (and anything subscribed to it) in sync:
engine.setZoom(1.5);

// Not this — mutates the canvas correctly, but the store never finds out:
engine.viewport.setZoom(1.5); // marked @internal in JSDoc for exactly this reason
```

`ViewportManager`'s raw `setZoom`/`zoomBy`/`pan`/`panTo`/`reset` methods are marked `@internal` for this reason — always prefer the `CanvasEngine` facade method (`engine.setZoom()`, `engine.zoomBy()`, `engine.reset()`) unless you have a specific reason not to.

## Creating and adding objects

Object creation goes through the object-type registry rather than importing Fabric classes directly:

```ts
// Creates and adds through the history-tracked path (undoable):
const rect = await engine.addObjectOfType("rect", { left: 10, top: 10, width: 100, height: 60 });

// Creates without adding to the canvas or history:
const rect = await engine.createObject("rect", { left: 10, top: 10 });
```

`create()` on an object-type definition is always `async` and always awaited — real object types need it (QR codes generate asynchronously, image objects decode a URL, SVG import parses a document), so every type goes through the same async contract regardless of whether a given type actually needs it.

## Mutating properties, deleting, undo/redo

```ts
engine.setObjectProperty(rect, "fill", "#ff0000"); // undoable
engine.removeObject(rect); // undoable
engine.deleteSelection(); // removes every active object as one undo step
engine.undo();
engine.redo();
```

See [History & Commands](/docs/architecture/history-and-commands) for why these are safe to call in rapid succession (e.g. from a slider) without flooding the undo stack with one entry per pixel.

## Selection and grouping

```ts
engine.selection.getActive();       // FabricObject | undefined
engine.selection.getActiveObjects(); // FabricObject[]
engine.selection.select(object);
engine.selection.selectMultiple([a, b, c]);
engine.selection.group();   // returns the new Group, or null if < 2 objects selected
engine.selection.ungroup(); // returns the ungrouped objects, or null if the active object isn't a Group
```

## Layers

```ts
engine.layers.bringToFront(object);
engine.layers.sendToBack(object);
engine.layers.bringForward(object);
engine.layers.sendBackward(object);
engine.layers.moveToIndex(object, 2); // for drag-to-reorder UI
engine.layers.setVisible(object, false);
engine.layers.setLocked(object, true); // locks movement/rotation/scaling, clears selectable
```

## Alignment and distribution

```ts
engine.alignment.align("left"); // "left" | "center" | "right" | "top" | "middle" | "bottom"
engine.alignment.distribute("horizontal"); // "horizontal" | "vertical"
```

With a single object selected, `align()` aligns to the **canvas** bounds. With multiple objects selected, it aligns to the **selection's own** bounding box instead. `distribute()` equalizes the gap between adjacent object edges along an axis, anchoring on the first and last objects by position.

## Snapping

```ts
engine.snapping.setEnabled(true);
engine.snapping.isEnabled();
engine.snapping.setOptions({ threshold: 8, lineColor: "#32D10A" });
```

Snapping is **disabled by default** in `<DesignEditor>`'s built-in presets — an earlier version of this project shipped it default-on with unfiltered guide rendering, which made it actively disruptive rather than helpful. Turn it on explicitly once you want it.

## Import/export

```ts
const result = engine.export("png"); // { format, fileName, mimeType, data }
await engine.importFile("json", jsonString);
```

Both go through the same `exporters`/`importers` registries a plugin extends with a custom format — `engine.export()` isn't special-cased for the 5 built-in formats (`png`, `jpeg`, `svg`, `json`, and whatever `plugin-export-pdf` adds). See [Export/Import Pipelines](/docs/extension-points/export-import-pipelines).

## The escape hatch

`engine.getFabricCanvas()` returns the raw Fabric `Canvas` — an explicit, documented-as-unstable escape hatch for anything the manager API doesn't cover yet. Reach for it deliberately, not as a first instinct; mutations made directly on the raw canvas bypass history tracking and the reactive store, so UI that reads from `engine.store` won't notice the change.
