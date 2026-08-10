---
sidebar_position: 4
title: qrcode
---

# `@rifrocket/fdt-plugin-qrcode`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`, `react`, `react-dom`

Registers a `"qrcode"` object type — content generation, validation, and styling. Generation is asynchronous (it renders an SVG via `qr-code-styling` and loads it as a Fabric image), which is why `ObjectTypeDefinition.create()` is `async` across the whole framework.

```ts
import { qrCodePlugin } from "@rifrocket/fdt-plugin-qrcode";

engine.use(qrCodePlugin);

await engine.addObjectOfType("qrcode", {
  contentType: "url",
  contentData: { url: "https://example.com" },
});
```

`contentType` supports more than plain URLs — email, phone, SMS, vCard, and calendar-event content types, each with its own `contentData` shape typed by `QRCodeContentMap`. `style` accepts `QRCodeStyleOptions` (dot/corner shapes, gradients, error-correction level).

## Exports

- `qrCodePlugin` — the `EditorPlugin`
- `registerQRCodeType(registry)` — the underlying registration function
- `generateContentString`, `validateContent` — content-string generation/validation, useful for validating user input before calling `addObjectOfType` (`validateContent` returns a `ContentValidationResult`)
- `generateQRCodeSVG` — the raw SVG generator, if you want the markup without creating a Fabric object
- Types: `QRCodeObjectConfig`, `QRCodeContentMap`, `QRContentType`, `QRCodeStyleOptions`, `CornerDotType`, `CornerSquareType`, `DotType`, `ErrorCorrectionLevel`, `Gradient`, `GradientType`, `Mode`, `ShapeType`, `TypeNumber`

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.
