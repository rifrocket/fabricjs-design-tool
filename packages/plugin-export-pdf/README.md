<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-export-pdf

  **PDF export for [Fabric Design Tool](../../README.md), isolated so `jsPDF` is only paid for by consumers who install it.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-export-pdf.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-export-pdf)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin that registers a `"pdf"` exporter. `@rifrocket/fabricjs-design-tool` has zero PDF-related dependency by design — `jspdf` (and its transitive dependencies) only ends up in your bundle if you actually install this package.

## Features

- Registers `"pdf"` as an `engine.export()` format
- The canvas is fitted onto the page (A4 by default, 10mm margin), preserving aspect ratio
- `createExportPdfPlugin({ pageSize, orientation, marginMm, dpi })` — configure the page size (`"a4"` / `"letter"` / `"legal"` / `"match-canvas"` / a literal `{ widthMm, heightMm }`), orientation (defaults to auto: landscape for a wider-than-tall canvas, portrait otherwise), and margin
- `pageSize: "match-canvas"` — derives the page size directly from the canvas' own pixel dimensions and `dpi` (default 96), so the PDF page *is* the design's physical size instead of the design being fitted with whitespace onto a fixed paper sheet. Combined with `marginMm: 0`, this is what makes output print-ready.
- `engine.export()` returns raw data — `{ format, fileName, mimeType, data: Blob }` — triggering the actual browser download is left to your app
- Also exports `exportPdf(canvas, options?)` directly if you want the conversion logic without going through the plugin/registry
- `exportPdfMultiPage(canvases, options?)` — one PDF, one page per canvas, for exporting a two-sided document (e.g. a [`plugin-pages`](../plugin-pages) front/back pair) as a single file. Page size/orientation is resolved from the first canvas and reused for every page.

## Install

```bash
npm install @rifrocket/fdt-plugin-export-pdf
```

Peer dependencies: `fabric`.
Depends on `@rifrocket/fabricjs-design-tool`, plus `jspdf`.

## Quick start

```ts
import { exportPdfPlugin } from "@rifrocket/fdt-plugin-export-pdf";

engine.use(exportPdfPlugin);

const result = await engine.export("pdf");
// { format: "pdf", fileName, mimeType, data: Blob }
```

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.

With a custom page size/orientation/margin:

```ts
import { createExportPdfPlugin } from "@rifrocket/fdt-plugin-export-pdf";

engine.use(createExportPdfPlugin({ pageSize: "letter", orientation: "portrait", marginMm: 20 }));
```

Options are fixed at registration time (core's `Exporter` type is `(canvas) => unknown`, shared by every export format, so there's no per-call options channel through `engine.export("pdf")`) — register under a different format id, or call `exportPdf(canvas, options)` directly, if you need more than one configuration in the same app.

Print-ready, exact-physical-size output:

```ts
import { exportPdf } from "@rifrocket/fdt-plugin-export-pdf";

exportPdf(canvas, { pageSize: "match-canvas", marginMm: 0, dpi: 300 });
```

Exporting both sides of a two-sided document (e.g. a [`plugin-pages`](../plugin-pages) front/back pair) as one file:

```ts
import { exportPdfMultiPage } from "@rifrocket/fdt-plugin-export-pdf";

const result = exportPdfMultiPage(
  [frontEngine.getFabricCanvas(), backEngine.getFabricCanvas()],
  { pageSize: "match-canvas", marginMm: 0 },
);
// { format: "pdf", fileName, mimeType, data: Blob } — same shape as exportPdf()'s result
```

Not an `EditorPlugin` — it operates across multiple canvases/engines rather than extending one, the same category of concern `@rifrocket/fdt-plugin-pages` is; this package stays free of any dependency on it, so the caller composes the two canvases itself.

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/export-pdf)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
