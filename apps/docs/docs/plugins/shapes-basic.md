---
sidebar_position: 3
title: shapes-basic
---

# `@rifrocket/fdt-plugin-shapes-basic`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`, `react`, `react-dom`

Registers 20 default shape object types: `text`, `rect`, `circle`, `line`, `ellipse`, `rounded-rectangle`, plus 14 polygon shapes registered directly from their coordinate-table keys (`triangle`, `pentagon`, `hexagon`, `star`, `diamond`, `heart`, `arrow`, `cloud`, `lightning`, `speechBubble`, `cross`, `parallelogram`, `trapezoid`, `octagon`).

```ts
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";

engine.use(shapesBasicPlugin);
```

## Adding a shape

```ts
await engine.addObjectOfType("rect", { left: 10, top: 10, fill: "#3b82f6" });
await engine.addObjectOfType("star", { fill: "#f59e0b", stroke: "#000" });
```

`ShapeConfig` (the config type every shape here accepts) is shared across all 20:

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

## Exports

- `shapesBasicPlugin` — the `EditorPlugin`
- `registerBasicShapes(registry)` — the underlying registration function, if you want to call it directly against a registry instead of installing the plugin object
- `SHAPE_COLORS`, `SHAPE_COORDINATES` — the raw coordinate data backing the 14 polygon shapes
- `ShapeConfig` type

Included in both `<DesignEditor preset="default">` and `preset="minimal"`.
