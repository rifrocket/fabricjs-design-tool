<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-media-fields

  **Shared property-field definitions for media-like object types (image, qrcode) in [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-media-fields.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-media-fields)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

Not an `EditorPlugin` — no `install(engine)`, nothing to `engine.use()`. Pure data: one exported `PropertyFieldDefinition[]` (position, blend mode, opacity, rotation) that `@rifrocket/fdt-plugin-image` and `@rifrocket/fdt-plugin-qrcode` both register for their respective object types via `registerObjectType(..., { propertyFields: MEDIA_FIELDS })`.

Extracted out of both plugins after they carried the exact same array byte-for-byte — neither `@rifrocket/fabricjs-design-tool` (framework-agnostic core, no opinion on what "media" means) nor `@rifrocket/fdt-properties` (bare, type-agnostic field *components* — `NumberField`, `SelectField`, etc. — with no concept of a curated per-object-type field set) was the right home for it, so it gets its own small package instead, the same way `@rifrocket/fdt-properties` itself is scoped to one narrow concern.

## Features

- **`MEDIA_FIELDS`** — `[X, Y, Blend mode, Opacity, Rotation]`, each a `PropertyFieldDefinition` built on `@rifrocket/fdt-properties`'s `NumberField`/`SelectField`/`SliderField`

## Install

```bash
npm install @rifrocket/fdt-plugin-media-fields
```

Peer dependencies: `fabric`, `react`, `react-dom` (transitively, via `@rifrocket/fdt-properties`'s own field components).
Depends on `@rifrocket/fabricjs-design-tool` and `@rifrocket/fdt-properties`.

## Quick start

```ts
import { registerSerializedProperty } from "@rifrocket/fabricjs-design-tool";
import { MEDIA_FIELDS } from "@rifrocket/fdt-plugin-media-fields";

export const myMediaLikePlugin: EditorPlugin = {
  name: "my-media-type",
  install(engine) {
    engine.registry.registerObjectType("my-media-type", {
      // ...
      propertyFields: MEDIA_FIELDS,
    });
  },
};
```

You are not expected to install this package directly unless you're building your own media-like object type plugin — `plugin-image`/`plugin-qrcode` already depend on it and re-export nothing special, since `MEDIA_FIELDS` itself has no per-plugin variation.

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
