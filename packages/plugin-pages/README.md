<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-pages

  **Multi-page document orchestration for [Fabric Design Tool](../../README.md) — one lazily-created `CanvasEngine` per page.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-pages/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-pages)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

`PagesManager` owns one `CanvasEngine` per page instead of swapping content on a single shared canvas — undo/redo, selection, viewport, and snapping stay correctly page-scoped for free, since each is already a per-`CanvasEngine` concern, with zero changes to `CanvasEngine` itself. Each page's engine is created lazily, on first activation, up to a required `maxPages` cap.

Unlike every other `@rifrocket/fdt-plugin-*` package, this one is **not** an `EditorPlugin` you install via `engine.use()` — it orchestrates *multiple* engines rather than extending one. See `packages/README.md`'s plugin table for how it differs.

## Features

- `addPage` / `duplicatePage` / `copyPage` / `deletePage` / `renamePage` / `reorderPages`
- `setLocked` / `setVisible` per page
- `moveObjectsBetweenPages` — moves objects by reference (not clone), so the move is independently undoable on each side
- Automatic, debounced page thumbnails (`renderSnapshotThumbnail` under the hood), plus a manual `refreshThumbnail()`
- Templates: `TemplateDefinition` + `applyTemplateToEngine` seed a page's starter content on first activation; real content (duplicated or hydrated) always wins over a template
- Persistence primitives (`capturePagesSnapshot` / `savePagesToStorage` / `loadPagesFromStorage` / `clearSavedPages`) plus `PagesManager.hydrate()` — manual/on-demand, mirroring `plugin-local-storage`'s "restoring is a consumer decision" philosophy
- Optional React binding at the `./react` subpath (`usePages`, `<PagesProvider>`, `usePagesContext`, `<PagesCanvas>`, `usePageCanvasRef`) — `<PagesProvider>` re-provides `@rifrocket/fdt-react`'s `EditorContext` with whichever page is active, so existing `EditorContext`-consuming UI (PropertiesPanel, LayersPanel, toolbar) follows page switches with no changes on their part; `<PagesCanvas>` mounts and relocates the active page's canvas declaratively, no manual DOM code required

## Install

```bash
npm install @rifrocket/fdt-plugin-pages
```

Peer dependencies: `fabric`. Depends on `@rifrocket/fabricjs-design-tool`.
The `./react` subpath additionally needs `react`, `react-dom`, and `@rifrocket/fdt-react` (all optional peers — only required if you import from `@rifrocket/fdt-plugin-pages/react`).

## Quick start

```ts
import { PagesManager } from "@rifrocket/fdt-plugin-pages";

const pages = new PagesManager({ maxPages: 20, plugins: sharedPlugins });
const cover = pages.addPage({ name: "Cover" });
const engine = await pages.setActivePage(cover.id); // CanvasEngine, ready to use
```

Or with React:

```tsx
import { PagesProvider, usePagesContext, PagesCanvas } from "@rifrocket/fdt-plugin-pages/react";

function PagesPanel() {
  const { pages, manager, activePageId } = usePagesContext();
  return (
    <ul>
      {pages.map((page) => (
        <li key={page.id} onClick={() => manager.setActivePage(page.id)}>
          {page.name} {page.id === activePageId ? "•" : ""}
        </li>
      ))}
    </ul>
  );
}

function Canvas() {
  // Mounts the active page's canvas and relocates it on every page switch — no manual
  // appendChild/wrapperEl handling needed. Other EditorContext-consuming UI (PropertiesPanel,
  // LayersPanel, useEditor()) can live anywhere inside <PagesProvider> and needs none of this.
  return <PagesCanvas className="pages-canvas" fallback={<p>Add a page to get started.</p>} />;
}

<PagesProvider options={{ maxPages: 20 }}>
  <PagesPanel />
  <Canvas />
</PagesProvider>;
```

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
