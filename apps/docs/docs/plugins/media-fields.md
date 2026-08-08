---
sidebar_position: 6.5
title: media-fields
---

# `@rifrocket/fdt-plugin-media-fields`

**Kind:** ⚠️ Data only — **not** an `EditorPlugin` · **Peer dependencies:** `fabric`, `react`, `react-dom` (transitively, via `@rifrocket/fdt-properties`'s own field components)

The third deliberate exception to "every `plugin-*` package is `engine.use()`-able" — there's no `install(engine)` here at all. It exports one thing: `MEDIA_FIELDS`, a `PropertyFieldDefinition[]` (position, blend mode, opacity, rotation) shared by every media-like object type in the framework.

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

## Why this exists as its own package

[`image`](/docs/plugins/image) and [`qrcode`](/docs/plugins/qrcode) both need the identical field set on their respective object types — position, blend mode, opacity, rotation — and used to each carry a byte-for-byte-duplicated copy. Neither existing package was a clean home for a shared version: `@rifrocket/fabricjs-design-tool` is framework-agnostic core with no concept of "media" as a domain; `@rifrocket/fdt-properties` is scoped to bare, type-agnostic field *components* (`NumberField`, `SelectField`, `SliderField`, ...), not curated per-object-type field sets. This package fills that one narrow gap instead, the same way `@rifrocket/fdt-properties` itself is scoped to one narrow concern.

You're not expected to install this package directly unless you're building your own media-like object type plugin — `image`/`qrcode` already depend on it.

## Exports

- `MEDIA_FIELDS` — `[X, Y, Blend mode, Opacity, Rotation]`, each a `PropertyFieldDefinition` built on `@rifrocket/fdt-properties`'s `NumberField`/`SelectField`/`SliderField`

Not applicable to `engine.use()`/`useAll()` or any preset — pass `MEDIA_FIELDS` into your own `registerObjectType()` call's `propertyFields` option.
