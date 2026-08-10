<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-svg-import

  **SVG import for [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-svg-import.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-svg-import)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin that registers an `"svg"` **importer** — not an object type. SVG import adds parsed content directly to the canvas rather than creating one object-type instance, so it goes through `registerImporter`, not `registerObjectType`.

## Features

- Call the registered importer **directly** — unlike JSON import, SVG import does not go through `engine.importFile()`. `importSVG` only calls `canvas.add()`, self-syncing `engine.store`'s object list via the canvas's own `object:added` event, so it doesn't need `importFile()`'s full-replace resync logic (that's for importers that wholesale-replace canvas contents, like `plugin-import-json`)
- **`importSvgToEngine(engine, svgString)`** — the one-hop convenience for that, instead of `engine.registry.importers.get("svg")(engine.getFabricCanvas(), svgString)` by hand. Goes through the *registered* importer (honoring a `.replace()`'d one), not the pure `importSVG` function directly
- **⚠️ Not undoable.** `importSVG` adds objects straight to the canvas outside the history-tracked add/remove command path (`engine.addObject()`), so imported SVG content isn't an undo step
- Net-new plugin (not ported from any prior version) — proof that the extension points work for import formats core doesn't special-case

Included in `<DesignEditor preset="default">`; dropped from `preset="minimal"`.

## Install

```bash
npm install @rifrocket/fdt-plugin-svg-import
```

Peer dependencies: `fabric`.
Depends on `@rifrocket/fabricjs-design-tool`.

## Quick start

```ts
import { svgImportPlugin, importSvgToEngine } from "@rifrocket/fdt-plugin-svg-import";

engine.use(svgImportPlugin);

await importSvgToEngine(engine, svgMarkupString);
// equivalent to: await engine.registry.importers.get("svg")(engine.getFabricCanvas(), svgMarkupString);
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/svg-import)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
