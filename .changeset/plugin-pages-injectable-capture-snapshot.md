---
"@rifrocket/fdt-plugin-pages": minor
"@rifrocket/fdt-demo": patch
---

Add `PagesManagerOptions.captureSnapshot` — overrides how `PagesManager`'s internal
`duplicatePage()`/`getSnapshotForPersistence()`/`refreshThumbnail()` capture a page's content,
mirroring `@rifrocket/fdt-plugin-local-storage`'s own `captureSnapshot` option. `PagesManager`
can't depend on `@rifrocket/fdt-plugin-pan-zoom`, so apps whose page engines draw a page-boundary
rect via `usePannableDocument()` previously had every duplicate/save/thumbnail leak that rect into
otherwise-real document JSON, the same bug `captureSnapshotExcludingBoundary()` already fixed for
single-document apps. `apps/demo`'s `MultiPageExample.tsx` now passes it through, fixing the same
leak live in multi-page mode.
