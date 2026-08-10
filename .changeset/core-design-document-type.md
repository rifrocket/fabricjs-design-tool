---
"@rifrocket/fabricjs-design-tool": patch
---

Add `DesignDocument`/`DesignDocumentPage` — a shared document/page vocabulary
(`{ meta, pages: [{ id, order, name?, width?, height?, backgroundColor?, snapshot? }] }`) that
`@rifrocket/fdt-plugin-local-storage` and `@rifrocket/fdt-plugin-pages` now both build their
on-disk storage format on, so a single-document save and a multi-page save are byte-compatible
JSON — a single document is just a `DesignDocument` with one page. Purely additive; no existing
export changes.
