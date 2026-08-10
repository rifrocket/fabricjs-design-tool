---
"@rifrocket/fdt-plugin-pages": minor
---

Add `PagesManager.seedFromDocument(snapshot, init?)` and `<MultiPageDesignEditor
initialDocument={{ snapshot, meta? }}>` — the supported path for adopting an existing
single-document app's content as page 1 instead of starting blank. Reuses the same
`pendingSnapshots` lazy-apply mechanism `duplicatePage()` already relies on, so no new
mechanism was introduced. Documented in a new "Migrating from a single document" README
section.
