<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-alignment

  **A ready-made align/distribute panel for [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-alignment/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-alignment)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A panel-slot wrapper plugin: [`@rifrocket/fabricjs-design-tool`](../core) already ships `AlignmentManager` (`engine.alignment`) with no UI attached to it anywhere. This package is that missing UI — `install()` registers `AlignmentControls` into the `sidebar-right` panel slot, so align/distribute becomes a one-line addition instead of a component you'd have to build yourself.

## Features

- **`AlignmentControls`** — the align/distribute panel component (align left/center/right/top/middle/bottom, distribute horizontally/vertically), wired directly to `engine.alignment`
- **`alignmentPlugin`** — installs `AlignmentControls` into `sidebar-right` via `registry.registerPanel()`; no engine-level behavior added, `AlignmentManager` already lives in core
- Export `AlignmentControls` directly if you want to place it somewhere other than `sidebar-right` — it only needs `engine`, not the plugin's panel registration

## Install

```bash
npm install @rifrocket/fdt-plugin-alignment
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fabricjs-design-tool` and `@rifrocket/fdt-react`.

## Quick start

```ts
import { alignmentPlugin } from "@rifrocket/fdt-plugin-alignment";

engine.use(alignmentPlugin); // renders AlignmentControls into "sidebar-right"
```

```tsx
<Editor plugins={[shapesBasicPlugin, alignmentPlugin]} />
```

Not bundled into `<DesignEditor>`'s built-in presets — it peer-depends on `@rifrocket/fdt-react`, which would create a circular dependency if core's own preset list included it. Add it explicitly via `plugins={{ add: [alignmentPlugin] }}`.

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/alignment)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
