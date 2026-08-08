<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-pan-zoom

  **Wheel-zoom and spacebar-drag-pan hooks for a fixed-size [Fabric Design Tool](../../README.md) canvas viewport.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-pan-zoom.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-pan-zoom)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

⚠️ **Not an `EditorPlugin`** — the one deliberate exception among `packages/plugin-*`. There's no `install()`; you use the hooks directly. `useCanvasPanZoom` needs a host-supplied `containerSelector` that isn't knowable from `engine` alone, and it's a side-effecting DOM-listener hook (binds `wheel`/`mousedown`/`mousemove`/`keydown`), not a renderable UI component — wrapping it as a null-rendering "panel" would misuse `PanelRegistry`.

## Features

- **Wheel-zoom**, anchored on cursor position
- **Spacebar-drag-pan** — hold `Space` for a grab cursor with selection disabled, then drag; `Space` is ignored while focus is in an input/textarea/select
- Assumes a **fixed-size viewport**: content moves via `viewportTransform`, the canvas element itself doesn't resize — a different model from `ViewportManager.setZoom()`'s default (`resizeElement: true`). Don't mix both on the same canvas.
- `usePannableDocument` — the one-call bundle of everything below (sizing, boundary rect, centering, pan/zoom) for a host with exactly one active document; start here unless you need more control
- `useContainerSize` / `centerContent` / `getContainerSize` — sizing helpers, also usable individually alongside the pan/zoom hook
- `setCanvasZoom` — imperative zoom control for toolbar buttons (zoom in/out/fit), independent of the wheel handler
- `createPageBoundaryRect` / `findPageBoundary` — the document-bounds/background rect a fixed-size viewport needs; `captureSnapshotExcludingBoundary` keeps it out of JSON export/autosave without affecting its real PNG/SVG/PDF export appearance

## Install

```bash
npm install @rifrocket/fdt-plugin-pan-zoom
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fabricjs-design-tool`.

## Quick start

The one-call bundle:

```tsx
import { usePannableDocument } from "@rifrocket/fdt-plugin-pan-zoom";

function MyEditorViewport({ engine }: { engine: CanvasEngine }) {
  usePannableDocument(engine, { containerSelector: ".canvas-viewport", contentWidth: 800, contentHeight: 600 });
  return <div className="canvas-viewport" />;
}
```

Or compose the individual hooks yourself for more control:

```tsx
import { useCanvasPanZoom, useContainerSize } from "@rifrocket/fdt-plugin-pan-zoom";

function MyEditorViewport({ engine }: { engine: CanvasEngine }) {
  const containerSize = useContainerSize(".canvas-viewport") ?? { width: 800, height: 600 };
  useCanvasPanZoom(engine, { containerSelector: ".canvas-viewport" });

  return (
    <div className="canvas-viewport">
      <Editor width={containerSize.width} height={containerSize.height} />
    </div>
  );
}
```

If you use `createPageBoundaryRect`/`usePannableDocument`'s own boundary rect, capture document snapshots (for JSON export or autosave) through `captureSnapshotExcludingBoundary(engine)` instead of core's plain `captureSnapshot(engine)` — otherwise the boundary rect round-trips back in as ordinary saved content on every reload:

```ts
import { captureSnapshotExcludingBoundary } from "@rifrocket/fdt-plugin-pan-zoom";
import { localStoragePlugin } from "@rifrocket/fdt-plugin-local-storage";

localStoragePlugin({ captureSnapshot: captureSnapshotExcludingBoundary });
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/pan-zoom)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
