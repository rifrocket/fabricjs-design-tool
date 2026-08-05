---
sidebar_position: 6
title: image
---

# `@rifrocket/fdt-plugin-image`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`, `react`, `react-dom`

Registers an `"image"` object type — no built-in image object type ships anywhere else in the framework.

```ts
import { imagePlugin } from "@rifrocket/fdt-plugin-image";

engine.use(imagePlugin);
await engine.addObjectOfType("image", { src: imageDataUrlOrRemoteUrl });
```

```ts
interface ImageObjectConfig {
  src: string;
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
}
```

Images larger than 400px on their longest side are automatically scaled down to fit (unless you supply an explicit `scaleX`/`scaleY`), so a full-resolution photo upload doesn't dwarf the canvas by default. Loaded with `crossOrigin: "anonymous"`, so remote images need CORS headers permitting that if you intend to export the canvas afterward (tainted canvases can't be read back for export).

## Exports

- `imagePlugin` — the `EditorPlugin`
- `registerImageType(registry)` — the underlying registration function
- `ImageObjectConfig` type

Included in both `<DesignEditor preset="default">` and `preset="minimal"`.
