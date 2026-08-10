---
sidebar_position: 15
title: pan-zoom
---

# `@rifrocket/fdt-plugin-pan-zoom`

**Kind:** ⚠️ Hooks only — **not** an `EditorPlugin` · **Peer dependencies:** `fabric`, `react`, `react-dom`

Wheel-zoom and spacebar-drag-pan for a fixed-size canvas viewport. This is one of the deliberate exceptions to "every `plugin-*` package is `engine.use()`-able" — see [Plugins Overview](/docs/plugins/overview) for why. There's no `install()` here to call; you use the hooks directly in your own component.

```tsx
import { usePannableDocument } from "@rifrocket/fdt-plugin-pan-zoom";

function MyEditorViewport({ engine }: { engine: CanvasEngine }) {
  usePannableDocument(engine, { containerSelector: ".canvas-viewport", contentWidth: 800, contentHeight: 600 });
  return <div className="canvas-viewport" />;
}
```

`usePannableDocument` is the recommended entry point — one call bundling sizing, the page-boundary rect, centering, and pan/zoom, for a host with exactly one active document. Compose the individual hooks yourself only if you need more control over one piece:

```tsx
import { useCanvasPanZoom, useContainerSize } from "@rifrocket/fdt-plugin-pan-zoom";

function MyEditorViewport({ engine }: { engine: CanvasEngine }) {
  // useContainerSize returns null until its ResizeObserver first fires —
  // fall back to a default size for that first render.
  const containerSize = useContainerSize(".canvas-viewport") ?? { width: 800, height: 600 };
  useCanvasPanZoom(engine, { containerSelector: ".canvas-viewport" });

  return (
    <div className="canvas-viewport">
      <Editor width={containerSize.width} height={containerSize.height} />
    </div>
  );
}
```

## Why this isn't an `EditorPlugin`

`useCanvasPanZoom` needs a host-supplied `containerSelector` — the CSS selector of the fixed-size element mouse-drag panning should be catchable within, which isn't knowable from `engine` alone the way a panel-slot registration is. It's a side-effecting DOM-listener hook (binds `wheel`/`mousedown`/`mousemove`/`keydown` listeners), not a renderable UI component — wrapping it as a null-rendering "panel" would misuse `PanelRegistry`, where every other registered entry is real, visible UI.

## Behavior

- **Wheel zoom** is anchored on the cursor position, so the point under the mouse stays put while zooming.
- **Spacebar-drag-pan**: hold Space to enter pan mode (cursor becomes a grab hand, selection is disabled), then click-drag to pan. Space is ignored while focus is inside an `<input>`/`<textarea>`/`<select>`, so it doesn't hijack normal typing.
- Assumes a **fixed-size viewport** — the canvas element itself doesn't resize as you zoom; content moves within it via `viewportTransform` instead. This is a different model from `ViewportManager.setZoom()`'s own default (`resizeElement: true`), which grows the canvas element with zoom — pick whichever fits your layout, but don't mix them on the same canvas.

## Excluding the page-boundary rect from exports

If you use `createPageBoundaryRect`/`usePannableDocument`'s own boundary rect, capture document snapshots (for JSON export or autosave) through `captureSnapshotExcludingBoundary(engine)` instead of core's plain `captureSnapshot(engine)` — otherwise the boundary rect round-trips back in as ordinary saved content on every reload. Real PNG/SVG/PDF export is unaffected either way; this only changes what JSON-shaped capture sees.

```ts
import { captureSnapshotExcludingBoundary } from "@rifrocket/fdt-plugin-pan-zoom";
import { localStoragePlugin } from "@rifrocket/fdt-plugin-local-storage";

localStoragePlugin({ captureSnapshot: captureSnapshotExcludingBoundary });
```

`@rifrocket/fdt-plugin-pages`' `PagesManagerOptions.captureSnapshot` accepts the same function, for the identical leak in multi-page mode — see [`pages`'s page](/docs/plugins/pages).

## Exports

- `usePannableDocument(engine, options)` — the recommended one-call bundle (sizing + boundary rect + centering + pan/zoom)
- `useCanvasPanZoom(engine, options)` — wheel-zoom + spacebar-drag-pan only
- `useContainerSize(selector)` — tracks a container element's size (for sizing `<Editor width height>` to fill it)
- `setCanvasZoom(engine, zoomLevel, center?)` — imperative zoom-to-a-point helper, independent of the wheel handler
- `centerContent(engine, containerSize)`, `getContainerSize(selector)`
- `createPageBoundaryRect(options)` / `findPageBoundary(engine)` — the document-bounds/background rect a fixed-size viewport needs
- `captureSnapshotExcludingBoundary(engine)` — a `captureSnapshot()` drop-in that excludes the boundary rect from JSON output
- Types: `UsePannableDocumentOptions`, `UseCanvasPanZoomOptions`, `ZoomCenter`, `ContainerSize`

Not applicable to `engine.use()`/`useAll()` or any preset — import and use the hooks directly.
