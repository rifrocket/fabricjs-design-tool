---
sidebar_position: 15
title: pan-zoom
---

# `@rifrocket/fdt-plugin-pan-zoom`

**Kind:** ⚠️ Hooks only — **not** an `EditorPlugin` · **Peer dependencies:** `fabric`, `react`, `react-dom`

Wheel-zoom and spacebar-drag-pan for a fixed-size canvas viewport. This is the **one deliberate exception** to "every `plugin-*` package is `engine.use()`-able" — see [Plugins Overview](/docs/plugins/overview) for why. There's no `install()` here to call; you use the hooks directly in your own component.

```tsx
import { useCanvasPanZoom, useContainerSize } from "@rifrocket/fdt-plugin-pan-zoom";

function MyEditorViewport() {
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

## Exports

- `useCanvasPanZoom(engine, options)` — wheel-zoom + spacebar-drag-pan
- `setCanvasZoom(engine, zoomLevel, center?)` — imperative zoom-to-a-point helper
- `useContainerSize(selector)` — tracks a container element's size (for sizing `<Editor width height>` to fill it)
- `centerContent(engine, containerSize)`, `getContainerSize(selector)`
- Types: `UseCanvasPanZoomOptions`, `ZoomCenter`, `ContainerSize`

Not applicable to `engine.use()`/`useAll()` or any preset — import and use the hooks directly.
