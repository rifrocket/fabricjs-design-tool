<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-pan-zoom

  **Wheel-zoom and spacebar-drag-pan hooks for a fixed-size [Fabric Design Tool](../../README.md) canvas viewport.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-pan-zoom/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-pan-zoom)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

⚠️ **Not an `EditorPlugin`** — the one deliberate exception among `packages/plugin-*`. There's no `install()`; you use the hooks directly. `useCanvasPanZoom` needs a host-supplied `containerSelector` that isn't knowable from `engine` alone, and it's a side-effecting DOM-listener hook (binds `wheel`/`mousedown`/`mousemove`/`keydown`), not a renderable UI component — wrapping it as a null-rendering "panel" would misuse `PanelRegistry`.

## Features

- **Wheel-zoom**, anchored on cursor position
- **Spacebar-drag-pan** — hold `Space` for a grab cursor with selection disabled, then drag; `Space` is ignored while focus is in an input/textarea/select
- Assumes a **fixed-size viewport**: content moves via `viewportTransform`, the canvas element itself doesn't resize — a different model from `ViewportManager.setZoom()`'s default (`resizeElement: true`). Don't mix both on the same canvas.
- `useContainerSize` / `centerContent` / `getContainerSize` — sizing helpers used alongside the pan/zoom hook
- `setCanvasZoom` — imperative zoom control for toolbar buttons (zoom in/out/fit), independent of the wheel handler

## Install

```bash
npm install @rifrocket/fdt-plugin-pan-zoom
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fabricjs-design-tool`.

## Quick start

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

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/pan-zoom)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
