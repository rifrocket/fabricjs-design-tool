<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-export-pdf

  **PDF export for [Fabric Design Tool](../../README.md), isolated so `jsPDF` is only paid for by consumers who install it.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-export-pdf/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-export-pdf)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin that registers a `"pdf"` exporter. `@rifrocket/fabricjs-design-tool` has zero PDF-related dependency by design — `jspdf` (and its transitive dependencies) only ends up in your bundle if you actually install this package.

## Features

- Registers `"pdf"` as an `engine.export()` format
- The canvas is fitted onto a standard A4 page (210mm × 297mm) with a 10mm margin, preserving aspect ratio
- `engine.export()` returns raw data — `{ format, fileName, mimeType, data: Blob }` — triggering the actual browser download is left to your app
- Also exports `exportPdf` directly if you want the conversion logic without going through the plugin/registry

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

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/export-pdf)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
