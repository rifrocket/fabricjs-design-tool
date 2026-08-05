<div align="center">
  <img src="../../apps/docs/static/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-devtools

  **Five diagnostic panels for developing against [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-devtools/alpha.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-devtools)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A panel-slot wrapper plugin: five debugging panels, all built entirely from the engine's public API (no private/internal access), registered into `sidebar-right` in one shot by `install()`. Each panel is also individually exported, so you can mount just the ones you want in your own layout instead of taking all five.

## Features

- **`EventLogPanel`** — a live feed of `engine.events`
- **`CanvasStateViewer`** — zoom, pan, selected object ids, `propertyVersion`
- **`HistoryPanel`** — `engine.history.list()`, oldest first
- **`HierarchyPanel`** — the object tree
- **`PerformanceStats`** / **`usePerformanceStats`** — render-loop performance stats, as a component or a hook

Recommended dev-only, e.g. `plugins: { add: [...(import.meta.env.DEV ? [devtoolsPlugin] : [])] }`. Not bundled into either `<DesignEditor>` preset.

## Install

```bash
npm install @rifrocket/fdt-plugin-devtools
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fdt-core` and `@rifrocket/fdt-react`.

## Quick start

```ts
import { devtoolsPlugin } from "@rifrocket/fdt-plugin-devtools";

engine.use(devtoolsPlugin); // registers all five panels into "sidebar-right"
```

Or mount panels individually:

```tsx
import { CanvasStateViewer, HistoryPanel, PerformanceStats } from "@rifrocket/fdt-plugin-devtools";

<MyDevToolsShell>
  <CanvasStateViewer engine={engine} />
  <HistoryPanel engine={engine} />
  <PerformanceStats engine={engine} />
</MyDevToolsShell>;
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/devtools)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
