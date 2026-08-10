---
sidebar_position: 8
title: export-pdf
---

# `@rifrocket/fdt-plugin-export-pdf`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`

Registers a `"pdf"` exporter. Isolated into its own package so `jspdf` (and its transitive dependencies) is only paid for by consumers who actually install this plugin — `@rifrocket/fabricjs-design-tool` itself has no PDF-related dependency at all.

```ts
import { exportPdfPlugin } from "@rifrocket/fdt-plugin-export-pdf";

engine.use(exportPdfPlugin);
const result = engine.export("pdf"); // { format: "pdf", fileName, mimeType, data: Blob }
```

The canvas is fitted onto the page (A4 by default, 10mm margin), preserving aspect ratio. `engine.export()` returns raw data — triggering a browser download (e.g. via an `<a download>` link built from `URL.createObjectURL(result.data)`) is left to your app.

## Configuring page size, orientation, and margin

`exportPdfPlugin` is the zero-config default. For a custom page size, orientation, or margin, use `createExportPdfPlugin(options)` instead:

```ts
import { createExportPdfPlugin } from "@rifrocket/fdt-plugin-export-pdf";

engine.use(createExportPdfPlugin({ pageSize: "letter", orientation: "portrait", marginMm: 20 }));
```

- `pageSize?: "a4" | "letter" | "legal" | "match-canvas" | { widthMm: number; heightMm: number }` — defaults to `"a4"`. `"match-canvas"` derives the page size directly from the canvas' own pixel dimensions and `dpi` — the PDF page *is* the design's physical size instead of the design being fitted with whitespace onto a fixed paper sheet.
- `dpi?: number` — only used by `pageSize: "match-canvas"`; defaults to `96` (web px), pass e.g. `300` for print-grade output
- `orientation?: "portrait" | "landscape" | "auto"` — defaults to `"auto"`: landscape for a wider-than-tall canvas, portrait otherwise. With `pageSize: "match-canvas"`, forcing an explicit orientation that conflicts with the canvas's own aspect ratio makes jsPDF swap the resolved width/height to honor it — defeating the exact-physical-size guarantee. Leave this at `"auto"` when using `"match-canvas"`.
- `marginMm?: number` — defaults to `10`

Options are fixed at registration time, not per export call — core's `Exporter` type (`(canvas) => unknown`) is shared by every export format, so there's no per-call options channel through `engine.export("pdf")`. Register under a different format id, or call `exportPdf(canvas, options)` directly, if you need more than one configuration in the same app.

Print-ready, exact-physical-size output: `exportPdf(canvas, { pageSize: "match-canvas", marginMm: 0, dpi: 300 })`.

## Exporting a two-sided document

`exportPdfMultiPage(canvases, options?)` produces one PDF with one page per input canvas — for exporting both sides of a two-sided document (e.g. a [`plugin-pages`](/docs/plugins/pages) front/back pair) as a single file:

```ts
import { exportPdfMultiPage } from "@rifrocket/fdt-plugin-export-pdf";

const result = exportPdfMultiPage(
  [frontEngine.getFabricCanvas(), backEngine.getFabricCanvas()],
  { pageSize: "match-canvas", marginMm: 0 },
);
```

Page format/orientation is resolved once, from the first canvas, and reused for every page — correct for a `plugin-pages` pair, whose two sides share identical dimensions by construction. Not an `EditorPlugin` (it operates across multiple canvases/engines rather than extending one) — this package still has no dependency on `plugin-pages`; the caller composes the two canvases itself.

## Exports

- `exportPdfPlugin` — the zero-config `EditorPlugin`
- `createExportPdfPlugin(options?)` — the configurable factory
- `exportPdf(canvas, options?)` — the underlying single-page exporter function
- `exportPdfMultiPage(canvases, options?)` — the multi-page (two-sided document) exporter function
- `PdfExportOptions`, `PdfExportResult` types

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.
