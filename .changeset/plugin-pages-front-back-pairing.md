---
"@rifrocket/fdt-plugin-pages": minor
"@rifrocket/fdt-demo": patch
---

Add front/back page pairing to `@rifrocket/fdt-plugin-pages` — `PagesManager.addPagePair()` /
`duplicatePagePair()` / `deletePagePair()` / `getPairSibling()` / `copyObjectsBetweenPages()`,
`PageMeta.pairId`/`pairSide`, and a `<PairSideToggle>` React component — for two-sided documents
(business cards, ID cards, invitations, certificates, flyers, brochures, packaging, product
labels). Both sides of a pair start with identical width/height at creation time — there is still
no API to resize a page after creation, for any page. `PageTabsBar`'s existing Duplicate/Delete
buttons now act on the whole pair when a page is part of one, and it gains a new "Add page pair"
button; reordering stays free-form and unconstrained, pairs are only adjacent at creation time.
Deleting one side of a pair via the plain `deletePage()` auto-unpairs its sibling rather than
leaving a dangling reference. `apps/demo`'s multi-page example now demonstrates a real "New
business card" pair with distinct front/back templates, the front/back toggle, and copying an
object to the other side. The existing shared `ExportMenu`'s "PDF" option now auto-detects a
paired active page and exports both sides as a single print-ready PDF (via
`@rifrocket/fdt-plugin-export-pdf`'s new `exportPdfMultiPage`) instead of just the active side —
no separate export control needed.
