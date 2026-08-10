<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-pages

  **Multi-page document orchestration for [Fabric Design Tool](../../README.md) — one lazily-created `CanvasEngine` per page.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-pages.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-pages)
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
- `PagesManager.seedFromDocument()` / `<MultiPageDesignEditor initialDocument>` — adopts an existing (e.g. single-document) snapshot as a page, the supported path for migrating an app from `createEditor`/`<DesignEditor>` onto this package (see "Migrating from a single document" below)
- `PagesManagerOptions.captureSnapshot` — overrides how `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture a page's content, for apps whose page engines render their own non-content chrome (e.g. `@rifrocket/fdt-plugin-pan-zoom`'s page-boundary rect) that shouldn't leak into saved/duplicated/thumbnailed output — same option shape as `@rifrocket/fdt-plugin-local-storage`'s own `captureSnapshot`
- Optional React binding at the `./react` subpath (`usePages`, `<PagesProvider>`, `usePagesContext`, `<PagesCanvas>`, `usePageCanvasRef`) — `<PagesProvider>` re-provides `@rifrocket/fdt-react`'s `EditorContext` with whichever page is active, so existing `EditorContext`-consuming UI (PropertiesPanel, LayersPanel, toolbar) follows page switches with no changes on their part; `<PagesCanvas>` mounts and relocates the active page's canvas declaratively, no manual DOM code required. `usePages`/`<PagesProvider>` also wire the same default keyboard shortcuts (undo/redo/delete/deselect, plus every installed tool's own shortcut) `<Editor>` ships unconditionally — pass a `shortcuts` option (`{ disable?, add? }`, same shape as `<DesignEditor shortcuts>`) to customize them; omit it for the defaults
- `<MultiPageDesignEditor>` (`./react` subpath) — the batteries-included, one-line multi-page counterpart to `@rifrocket/fdt-react`'s `<DesignEditor>`: same `preset`/`plugins`/`theme`/`shortcuts`/`slots`/`propertyFields` prop shape, auto-seeds page 1, and renders a `<PageTabsBar>` (add/duplicate/delete/reorder/rename/lock) below the canvas by default. Also has an `autosave` prop — sugar for this package's own `capturePagesSnapshot`/`savePagesToStorage`/`loadPagesFromStorage`, not `@rifrocket/fdt-plugin-local-storage` (which only ever handles one document)
- `<PageTabsBar>` (`./react` subpath) — the page-strip UI `<MultiPageDesignEditor>` uses by default, exported separately for consumers building their own chrome on `usePagesContext()` directly (see `apps/demo`'s `EngineHost.tsx`)
- Front/back page pairing (`addPagePair` / `duplicatePagePair` / `deletePagePair` / `getPairSibling` / `copyObjectsBetweenPages`, plus a `<PairSideToggle>` React component) — for two-sided documents like business cards, ID cards, invitations, certificates, flyers, brochures, packaging, and product labels. See "Front/back page pairing" below.

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

Or the one-line version of the same thing:

```tsx
import { MultiPageDesignEditor } from "@rifrocket/fdt-plugin-pages/react";

<MultiPageDesignEditor preset="default" maxPages={20} />;
```

Not a prop on `<DesignEditor>` itself — `@rifrocket/fdt-react` can't depend on this package without a circular package dependency (this package's `./react` subpath already depends on `fdt-react`), the same constraint documented in `packages/react/src/preset/builtinPresets.ts` for the panel-slot-wrapper plugins. Deliberately has no pan/zoom or page-boundary-rect treatment, mirroring `<Editor>`'s own bare-canvas scope for the single-page case — build your own chrome on `usePagesContext()`/`<PagesCanvas>` directly if you need that (see `apps/demo`'s `EngineHost.tsx`).

With property fields and autosave — parity with `<DesignEditor propertyFields>`/`<DesignEditor autosave>`:

```tsx
<MultiPageDesignEditor
  preset="default"
  maxPages={20}
  propertyFields={{ rect: [{ key: "cornerRadius", label: "Corner radius" }] }}
  autosave={{ key: "my-app:pages", debounceMs: 1000 }}
/>;
```

`propertyFields` is applied once per page's engine (not re-applied on a revisit to an already-open page) — same `null`-suppresses-a-type semantics as `<DesignEditor propertyFields>`. `autosave` restores a prior save on mount (taking priority over `initialDocument`, if both are given) and debounces a save on every tracked content change across every page — built on `PagesManagerOptions.onContentChange`, the same event `PagesManager`'s own thumbnail tracking already listens to, so no separate event wiring was needed to add it.

## Front/back page pairing

For two-sided documents — business cards, ID cards, invitations, certificates, flyers, brochures, packaging, product labels — `addPagePair()` creates a linked front+back pair in one call instead of two independent pages:

```ts
const { front, back } = pages.addPagePair({
  name: "Business Card",
  front: { templateId: "business-card-front" },
  back: { templateId: "business-card-back" },
});
await pages.setActivePage(front.id);
```

**Linked dimensions**: both sides start with identical width/height, resolved from whichever side's template/explicit size was given — there is no API to resize a page after creation, for any page today, so this linking only happens at creation time, not as a live sync.

**Independent object editing**: each side is still its own `CanvasEngine` under the hood (`PagesManager`'s foundational design), so editing one side's objects, undo/redo, and history never touches the other side.

**Front/Back toggle**: `<PairSideToggle>` (`./react` subpath) renders a compact switch that jumps to the active page's pair sibling — `null` when the active page isn't paired. Place it canvas-adjacent, since that's where you're looking while editing (see `apps/demo`'s `EngineHost.tsx`).

**Shared assets**: `copyObjectsBetweenPages(objectIds, fromId, toId)` clones objects (e.g. a logo) from one page to another — the source keeps its own copy, unlike `moveObjectsBetweenPages`. Works between any two pages, but its main use is sharing an asset between the front and back of a pair without re-uploading it.

**Whole-pair operations**: `duplicatePagePair(id)` duplicates both sides together with a fresh shared `pairId`; `deletePagePair(id)` removes both sides atomically (and, like `deletePage()`, refuses to leave zero pages). `getPairSibling(id)` looks up a page's pair partner. `<PageTabsBar>`'s built-in Duplicate/Delete buttons already call these pair-level methods automatically when a tab is part of a pair, and it gains its own "Add page pair" button next to "Add page".

**Export both sides together, print-ready**: see `@rifrocket/fdt-plugin-export-pdf`'s `exportPdfMultiPage()` and `pageSize: "match-canvas"` — composes with a pair's two `CanvasEngine`s to produce a single, exact-physical-size PDF with one page per side.

A pair's two pages are only guaranteed adjacent at creation time — reordering (`reorderPages`, drag) stays free-form and unconstrained, so a pair can end up non-adjacent; this doesn't affect the `pairId` link itself. Deleting one side via the plain `deletePage()` (not `deletePagePair()`) auto-unpairs the remaining sibling rather than leaving it pointing at a page that no longer exists.

## Migrating from a single document

Adding multi-page support to an app already built on `createEditor`/`<DesignEditor>` needs two different things, and only one of them is automatic:

- **Your plugin list ports unmodified.** `PagesManager` resolves plugins through the exact same `resolvePluginList`/`resolvePreset` functions `createEditor()`/`<DesignEditor>` use, applied identically to every page's engine — a plugin written once works in both without any changes.
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

`seedFromDocument()`/`initialDocument` are read once, at page-1-seed time — unlike `hydrate()`, they don't require the manager to have zero pages, so they compose with pages already added. History does not carry over (each page gets its own fresh, independent undo stack by construction — this is correct, not a limitation), and export/import shifts from a single-document `engine.exportFile()`/`captureSnapshot()` call to the collection-level `capturePagesSnapshot()`/`PagesStorageData` API once you have more than one page.

- **`onReady`'s signature and firing contract differ from `<DesignEditor onReady>`'s**, and this is the one prop you can't port unmodified. `<DesignEditor onReady>` is `(engine: CanvasEngine) => void`, called exactly once, at construction. `<MultiPageDesignEditor onReady>` is `(engine: CanvasEngine, pageId: string) => void`, and fires again on **every** page switch (including revisiting a page you've already been on) — necessary since "the current engine" itself changes as pages switch, unlike the single-engine case. Code that assumed one-time setup (subscribing to something, kicking off a one-shot async task) needs a guard against re-running on every switch; code that just reads `engine` for immediate use each time needs no changes beyond accepting the second `pageId` argument.

### Migrating back to a single document

The reverse direction — an app that wants to offer multi-page as an optional, toggleable capability rather than a one-way migration — is `exportPageAsDocument()`, the direct counterpart to `seedFromDocument()`:

```ts
const doc = manager.exportPageAsDocument(); // defaults to the lowest-order page
// doc: { snapshot: DocumentSnapshotData, page: { name?, width?, height?, backgroundColor? } }
await restoreSnapshot(existingEngine, doc.snapshot);
```

Same caveats as the forward direction: only the one page's content survives (a real product decision for your app to surface, e.g. a confirm dialog if more than one page exists — see `apps/demo`'s `EngineHost.tsx` for a worked example of a real in-place single-page/multi-page toggle built on both directions), and history does not carry over.

## Excluding page chrome from saved/duplicated/thumbnailed content

`PagesManager` can't depend on `@rifrocket/fdt-plugin-pan-zoom` (that would be a cross-plugin dependency of the kind this repo deliberately avoids — see `packages/react/src/preset/builtinPresets.ts`'s comment for the same constraint one layer up), so if your page engines draw a page-boundary rect via `usePannableDocument()`, pass its `captureSnapshotExcludingBoundary` here instead of letting `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture that rect as if it were real document content:

```ts
import { captureSnapshotExcludingBoundary } from "@rifrocket/fdt-plugin-pan-zoom";

const pages = new PagesManager({
  maxPages: 20,
  plugins: sharedPlugins,
  captureSnapshot: captureSnapshotExcludingBoundary,
});
```

Real PNG/SVG/PDF export is unaffected either way — this only changes what `duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` (i.e. JSON-shaped output) capture. See `apps/demo`'s `EngineHost.tsx` for a live example.

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
