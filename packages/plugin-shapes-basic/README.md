<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-shapes-basic

  **20 default shape object types for [Fabric Design Tool](../../README.md) — text, rects, ellipses, and 14 polygons.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-shapes-basic/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-shapes-basic)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin that registers the default shape set: `text`, `rect`, `circle`, `line`, `ellipse`, `rounded-rectangle`, plus 14 polygon shapes registered directly from a coordinate table (`triangle`, `pentagon`, `hexagon`, `star`, `diamond`, `heart`, `arrow`, `cloud`, `lightning`, `speechBubble`, `cross`, `parallelogram`, `trapezoid`, `octagon`).

## Features

- 20 object types registered via `registerBasicShapes`, all addressable through `engine.addObjectOfType(<type>, config)`
- `SHAPE_COORDINATES` — the raw coordinate table backing the 14 polygon shapes, exported if you want to build your own polygon type from the same data shape (`PolygonShapeType`)
- `SHAPE_COLORS` — the default fill/stroke palette used when a shape is created without explicit colors

```ts
interface ShapeConfig {
  left?: number;
  top?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  selectable?: boolean;
  evented?: boolean;
}
```

Included in both `<DesignEditor preset="default">` and `preset="minimal"`.

## Install

```bash
npm install @rifrocket/fdt-plugin-shapes-basic
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fabricjs-design-tool` and `@rifrocket/fdt-properties`.

## Quick start

```ts
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";

engine.use(shapesBasicPlugin);

await engine.addObjectOfType("rect", { left: 10, top: 10, fill: "#3b82f6" });
await engine.addObjectOfType("star", { fill: "#f59e0b", stroke: "#000" });
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/shapes-basic)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
