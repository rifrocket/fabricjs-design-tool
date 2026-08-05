<div align="center">
  <img src="../../apps/docs/static/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-qrcode

  **The `"qrcode"` object type for [Fabric Design Tool](../../README.md) — content generation, validation, and styling.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-qrcode/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-qrcode)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin that registers a `"qrcode"` object type on top of [`qr-code-styling`](https://www.npmjs.com/package/qr-code-styling). Generation is **asynchronous** — it renders an SVG and loads it as a Fabric image — which is why `ObjectTypeDefinition.create()` is async across the whole framework.

## Features

- `contentType` covers more than plain URLs: email, phone, SMS, vCard, and calendar-event, each with its own `contentData` shape typed by `QRCodeContentMap`
- `style: QRCodeStyleOptions` — dot/corner shapes, gradients, error-correction level
- `generateContentString` / `validateContent` — build and validate the raw QR content string independent of placing an object on the canvas
- `generateQRCodeSVG` — the raw SVG generator, if you need the image outside the object-type flow

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.

## Install

```bash
npm install @rifrocket/fdt-plugin-qrcode
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fdt-core` and `@rifrocket/fdt-properties`, plus `qr-code-styling`.

## Quick start

```ts
import { qrCodePlugin } from "@rifrocket/fdt-plugin-qrcode";

engine.use(qrCodePlugin);

await engine.addObjectOfType("qrcode", {
  contentType: "url",
  contentData: { url: "https://example.com" },
});
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/qrcode)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
