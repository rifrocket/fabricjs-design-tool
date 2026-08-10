---
"@rifrocket/fdt-plugin-local-storage": patch
---

`saveDesignToStorage`/`loadDesignFromStorage`'s public API and `StoredDesign` type are unchanged,
but what's actually written to `localStorage` internally is now a one-page `DesignDocument` (see
`@rifrocket/fabricjs-design-tool`'s new shared type) instead of a flat `{ snapshot, meta }`
object — the same shape `@rifrocket/fdt-plugin-pages`' own storage format is built on, so a
single-document save and a multi-page save are byte-compatible JSON. A pre-existing entry saved
under the old flat shape is treated as unusable (returns `null` from `loadDesignFromStorage`,
same as any other unreadable data) rather than migrated.
