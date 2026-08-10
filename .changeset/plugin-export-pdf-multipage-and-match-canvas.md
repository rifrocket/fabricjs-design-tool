---
"@rifrocket/fdt-plugin-export-pdf": minor
---

Widen `PdfExportOptions.pageSize` with `"match-canvas"` (derives the PDF page size directly from
the canvas' own pixel dimensions and a new `dpi` option, default 96) and a literal
`{ widthMm, heightMm }`, so output can be genuinely print-ready — the page *is* the design's
physical size instead of the design being fitted with whitespace onto a fixed paper sheet. Add
`exportPdfMultiPage(canvases, options?)`, producing one PDF with one page per input canvas, for
exporting a two-sided document (e.g. a `@rifrocket/fdt-plugin-pages` front/back pair) as a single
file — page format/orientation is resolved from the first canvas and reused for every page. Stays
free of any dependency on `plugin-pages`; the caller composes the two canvases itself.
