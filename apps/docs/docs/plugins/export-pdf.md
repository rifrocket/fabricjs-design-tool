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

The canvas is fitted onto a standard A4 page (210mm × 297mm) with a 10mm margin, preserving aspect ratio. `engine.export()` returns raw data — triggering a browser download (e.g. via an `<a download>` link built from `URL.createObjectURL(result.data)`) is left to your app.

## Exports

- `exportPdfPlugin` — the `EditorPlugin`
- `exportPdf(canvas)` — the underlying exporter function
- `PdfExportResult` type

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.
