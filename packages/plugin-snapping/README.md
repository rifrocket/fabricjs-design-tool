<div align="center">
  <img src="../../apps/docs/static/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-snapping

  **An on/off toggle panel for smart-guide snapping in [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-snapping/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-snapping)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A panel-slot wrapper plugin: [`@rifrocket/fdt-core`](../core) already ships `SnapEngine` (`engine.snapping`) with no UI attached. `install()` registers `SnappingToggle` — a bare on/off switch — into the `sidebar-right` panel slot.

## Features

- **`SnappingToggle`** — the toggle component, wired to `engine.snapping`
- **`snappingPlugin`** — installs `SnappingToggle` into `sidebar-right`
- **⚠️ This plugin only adds the UI toggle — it does not itself turn snapping on.** `SnapEngine` behavior is disabled by default at the engine level. If you want snapping on-by-default with the toggle just letting users turn it off, enable it separately: `createEngine(canvasEl, { snapping: { enabled: true } })`.

Not bundled into either `<DesignEditor>` preset — it peer-depends on `@rifrocket/fdt-react`. Add via `plugins.add`.

## Install

```bash
npm install @rifrocket/fdt-plugin-snapping
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fdt-core` and `@rifrocket/fdt-react`.

## Quick start

```ts
import { snappingPlugin } from "@rifrocket/fdt-plugin-snapping";

engine.use(snappingPlugin);
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/snapping)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
