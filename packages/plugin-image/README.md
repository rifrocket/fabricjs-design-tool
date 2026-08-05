<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-image

  **The `"image"` object type for [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-image/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-image)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin that registers an `"image"` object type — no built-in image object type ships anywhere else in the framework, so this is the only way to add images to the canvas.

## Features

- Registers `"image"` via `registerImageType` — addressable through `engine.addObjectOfType("image", ...)`
- Images larger than 400px on their longest side are automatically scaled down to fit, unless you pass explicit `scaleX`/`scaleY`
- Loaded with `crossOrigin: "anonymous"` — remote images need CORS headers permitting that if you intend to export the canvas afterward (a tainted canvas can't be read for export)

```ts
interface ImageObjectConfig {
  src: string;
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
}
```

Included in both `<DesignEditor preset="default">` and `preset="minimal"`.

## Install

```bash
npm install @rifrocket/fdt-plugin-image
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fabricjs-design-tool` and `@rifrocket/fdt-properties`.

## Quick start

```ts
import { imagePlugin } from "@rifrocket/fdt-plugin-image";

engine.use(imagePlugin);

await engine.addObjectOfType("image", { src: imageDataUrlOrRemoteUrl });
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/image)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
