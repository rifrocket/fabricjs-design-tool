---
"@rifrocket/fdt-plugin-pages": minor
"@rifrocket/fdt-demo": patch
---

Add `PagesManager.exportPageAsDocument(pageId?)` — the reverse of the existing
`seedFromDocument()`, collapsing one page (the lowest-`order` page by default) back to a plain
single-document payload (`{ snapshot, page: { name, width, height, backgroundColor } }`). Together
these give a document a real, public, symmetric path between a single-`CanvasEngine` app and
`PagesManager`'s multi-page model in both directions. `savePagesToStorage`/`loadPagesFromStorage`'s
public `PagesStorageData` shape is unchanged, but what's written to storage internally is now a
`DesignDocument` (see `@rifrocket/fabricjs-design-tool`'s new shared type) — the same shape
`@rifrocket/fdt-plugin-local-storage`'s own storage format is now built on, so a multi-page save
and a single-document save are byte-compatible JSON. A pre-existing entry saved under the old
`{ pages, snapshots }` shape is treated as unusable rather than migrated.

`apps/demo` no longer ships multi-page as a separate screen — it's now an in-place toggle in the
same screen (`EngineHost.tsx`), built on these two APIs: enabling multi-page seeds page 1 from the
current single document via `seedFromDocument()`; disabling it (after confirming if 2+ pages
exist, since only the first page's content survives) collapses back via `exportPageAsDocument()`.
The single-document experience is unaffected when multi-page is never enabled. The previously
separate `pages-example` feature (its own templates, toolbar, and canvas host) is now part of
`engine/`, and the two independently-declared plugin lists (single-document and multi-page) were
deduplicated into one shared constant.
