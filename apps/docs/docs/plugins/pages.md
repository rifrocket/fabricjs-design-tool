---
sidebar_position: 16
title: pages
---

# `@rifrocket/fdt-plugin-pages`

**Kind:** ⚠️ Multi-engine orchestrator — **not** an `EditorPlugin` · **Peer dependencies:** `fabric` (core); `react`, `react-dom`, `@rifrocket/fdt-react` (optional, only for the `./react` subpath)

`PagesManager` owns one `CanvasEngine` per page instead of swapping content on a single shared canvas — undo/redo, selection, viewport, and snapping stay correctly page-scoped for free, since each is already a per-`CanvasEngine` concern, with zero changes to `CanvasEngine` itself. Each page's engine is created lazily, on first activation, up to a required `maxPages` cap.

This is the other deliberate exception (besides `pan-zoom`) to "every `plugin-*` package is `engine.use()`-able" — see [Plugins Overview](/docs/plugins/overview). It orchestrates a whole *collection* of engines rather than extending one; its own `plugins` option is itself a list of ordinary `EditorPlugin`s, installed on every page's engine via `engine.useAll()` — a plugin written for `createEditor()`/`<DesignEditor>` ports unmodified.

## Core (no React)

```ts
import { PagesManager } from "@rifrocket/fdt-plugin-pages";

const pages = new PagesManager({ maxPages: 20, plugins: sharedPlugins });
const cover = pages.addPage({ name: "Cover" });
const engine = await pages.setActivePage(cover.id); // CanvasEngine, ready to use
```

## React — building your own chrome

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

`<PagesProvider>` re-provides `@rifrocket/fdt-react`'s `EditorContext` with whichever page is active, so existing `EditorContext`-consuming UI follows page switches with no changes on their part. `usePages`/`<PagesProvider>` also wire the same default keyboard shortcuts (undo/redo/delete/deselect, plus every installed tool's own shortcut) `<Editor>` ships unconditionally — pass a `shortcuts` option (`{ disable?, add? }`, same shape as `<DesignEditor shortcuts>`) to customize them.

## React — the one-liner: `<MultiPageDesignEditor>`

The batteries-included counterpart to `<DesignEditor>`: same `preset`/`plugins`/`theme`/`shortcuts`/`slots`/`propertyFields` prop shape, auto-seeds page 1, and renders a `<PageTabsBar>` (add/duplicate/delete/reorder/rename/lock) below the canvas by default.

```tsx
import { MultiPageDesignEditor } from "@rifrocket/fdt-plugin-pages/react";

<MultiPageDesignEditor preset="default" maxPages={20} />;
```

Not a prop on `<DesignEditor>` itself — `@rifrocket/fdt-react` can't depend on this package without a circular package dependency. Deliberately has no pan/zoom or page-boundary-rect treatment, mirroring `<Editor>`'s own bare-canvas scope for the single-page case — build your own chrome on `usePagesContext()`/`<PagesCanvas>` directly if you need that.

With property fields and autosave — parity with `<DesignEditor propertyFields>`/`<DesignEditor autosave>`:

```tsx
<MultiPageDesignEditor
  preset="default"
  maxPages={20}
  propertyFields={{ rect: [{ key: "cornerRadius", label: "Corner radius" }] }}
  autosave={{ key: "my-app:pages", debounceMs: 1000 }}
/>;
```

`propertyFields` is applied once per page's engine (not re-applied on a revisit to an already-open page). `autosave` — sugar for this package's own `capturePagesSnapshot`/`savePagesToStorage`/`loadPagesFromStorage`, **not** `@rifrocket/fdt-plugin-local-storage` (which only ever handles one document) — restores a prior save on mount (taking priority over `initialDocument`, if both are given) and debounces a save on every tracked content change across every page.

`onReady`'s signature differs from `<DesignEditor onReady>`'s, and it's the one prop you can't port unmodified: `<DesignEditor onReady>` is `(engine) => void`, called once, at construction. `<MultiPageDesignEditor onReady>` is `(engine, pageId) => void`, and fires again on **every** page switch (including revisiting a page you've already been on) — code that assumed one-time setup needs a guard against re-running.

## Front/back page pairing

For two-sided documents — business cards, ID cards, invitations, certificates, flyers, brochures, packaging, product labels — `addPagePair()` creates a linked front+back pair in one call:

```ts
const { front, back } = pages.addPagePair({
  name: "Business Card",
  front: { templateId: "business-card-front" },
  back: { templateId: "business-card-back" },
});
await pages.setActivePage(front.id);
```

- **Linked dimensions**: both sides start with identical width/height at creation time — there's no API to resize a page after creation, for any page, so this isn't a live sync.
- **Independent object editing**: each side is still its own `CanvasEngine`, so editing, undo/redo, and history never cross between the two sides.
- **Front/Back toggle**: `<PairSideToggle>` (`./react` subpath) jumps to the active page's pair sibling; renders `null` when the active page isn't paired.
- **Shared assets**: `copyObjectsBetweenPages(objectIds, fromId, toId)` clones objects (e.g. a logo) to another page, keeping the source's own copy — unlike `moveObjectsBetweenPages`.
- **Whole-pair operations**: `duplicatePagePair(id)` / `deletePagePair(id)` act on both sides atomically; `getPairSibling(id)` looks up the partner. `<PageTabsBar>`'s Duplicate/Delete buttons already route to these automatically for a paired tab, and it gains an "Add page pair" button.
- **Export both sides together, print-ready**: see [`export-pdf`](/docs/plugins/export-pdf)'s `exportPdfMultiPage()` + `pageSize: "match-canvas"`.

A pair is only guaranteed adjacent at creation time — `reorderPages()`/drag stays free-form. Deleting one side via the plain `deletePage()` auto-unpairs the remaining sibling.

## Migrating from a single document

Adding multi-page support to an app already built on `createEditor`/`<DesignEditor>` needs two different things, and only one of them is automatic:

- **Your plugin list ports unmodified.** `PagesManager` resolves plugins through the exact same `resolvePluginList`/`resolvePreset` functions `createEditor()`/`<DesignEditor>` use, applied identically to every page's engine.
- **Your existing document's content does not carry over automatically** — `PagesManager` always starts blank. To adopt an existing single-document app's content as page 1 instead of starting fresh, capture a snapshot from the existing engine and hand it to `seedFromDocument()` (core API) or the `initialDocument` prop (`<MultiPageDesignEditor>`):

```tsx
import { captureSnapshot } from "@rifrocket/fabricjs-design-tool";

// Core / manual PagesProvider usage:
const snapshot = captureSnapshot(existingEngine);
const page = manager.seedFromDocument(snapshot, { name: "Page 1", width: 800, height: 600 });
await manager.setActivePage(page.id);

// <MultiPageDesignEditor> one-liner:
<MultiPageDesignEditor
  preset="default"
  maxPages={20}
  initialDocument={{ snapshot: captureSnapshot(existingEngine), meta: { name: "Page 1", width: 800, height: 600 } }}
/>;
```

`seedFromDocument()`/`initialDocument` are read once, at page-1-seed time — unlike `hydrate()`, they don't require the manager to have zero pages, so they compose with pages already added. History does not carry over (each page gets its own fresh, independent undo stack by construction), and export/import shifts from a single-document `engine.exportFile()`/`captureSnapshot()` call to the collection-level `capturePagesSnapshot()`/`PagesStorageData` API once you have more than one page.

### Migrating back to a single document

`exportPageAsDocument()` is the reverse of `seedFromDocument()` — for offering multi-page as an optional, toggleable capability rather than a one-way migration:

```ts
const doc = manager.exportPageAsDocument(); // defaults to the lowest-order page
await restoreSnapshot(existingEngine, doc.snapshot);
```

Only the one page's content survives — surfacing that (e.g. a confirm dialog when more than one page exists) is your app's call. See `apps/demo`'s `EngineHost.tsx` for a real in-place toggle built on both directions.

## Excluding page chrome from saved/duplicated/thumbnailed content

If your page engines draw their own non-content chrome (e.g. [`pan-zoom`](/docs/plugins/pan-zoom)'s page-boundary rect via `usePannableDocument()`), pass its `captureSnapshotExcludingBoundary` through `PagesManagerOptions.captureSnapshot` instead of letting `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture it as if it were real document content — `PagesManager` can't depend on `plugin-pan-zoom` directly, so this is the injectable escape hatch, mirroring `plugin-local-storage`'s own `captureSnapshot` option:

```ts
import { captureSnapshotExcludingBoundary } from "@rifrocket/fdt-plugin-pan-zoom";

const pages = new PagesManager({ maxPages: 20, plugins: sharedPlugins, captureSnapshot: captureSnapshotExcludingBoundary });
```

## Exports

From `@rifrocket/fdt-plugin-pages`:
- `PagesManager` — `addPage`/`duplicatePage`/`copyPage`/`deletePage`/`renamePage`/`reorderPages`, `setLocked`/`setVisible`, `moveObjectsBetweenPages`, `seedFromDocument`, `exportPageAsDocument`, `hydrate`, `refreshThumbnail`, `getSnapshotForPersistence`, `addPagePair`/`duplicatePagePair`/`deletePagePair`/`getPairSibling`/`copyObjectsBetweenPages`
- `capturePagesSnapshot`, `savePagesToStorage`, `loadPagesFromStorage`, `clearSavedPages` — persistence primitives
- `applyTemplateToEngine`, `TemplateDefinition` — starter-content templates per page

From `@rifrocket/fdt-plugin-pages/react`:
- `usePages`, `<PagesProvider>`, `usePagesContext` — the headless building blocks
- `<PagesCanvas>`, `usePageCanvasRef` — declarative canvas mounting/relocation
- `<MultiPageDesignEditor>`, `MultiPageAutosaveOptions` — the one-line batteries-included editor
- `<PageTabsBar>` — the page-strip UI, exported separately for custom chrome
- `<PairSideToggle>` — jumps between a pair's front and back

Not applicable to `engine.use()`/`useAll()` or any preset — construct a `PagesManager`/use `usePages` directly.
