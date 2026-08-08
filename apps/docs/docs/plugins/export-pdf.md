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

- `pageSize?: "a4" | "letter" | "legal"` — defaults to `"a4"`
- `orientation?: "portrait" | "landscape" | "auto"` — defaults to `"auto"`: landscape for a wider-than-tall canvas, portrait otherwise
- `marginMm?: number` — defaults to `10`

Options are fixed at registration time, not per export call — core's `Exporter` type (`(canvas) => unknown`) is shared by every export format, so there's no per-call options channel through `engine.export("pdf")`. Register under a different format id, or call `exportPdf(canvas, options)` directly, if you need more than one configuration in the same app.

## Exports

- `exportPdfPlugin` — the zero-config `EditorPlugin`
- `createExportPdfPlugin(options?)` — the configurable factory
- `exportPdf(canvas, options?)` — the underlying exporter function
- `PdfExportOptions`, `PdfExportResult` types

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.
