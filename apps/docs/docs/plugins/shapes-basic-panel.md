---
sidebar_position: 3.5
title: shapes-basic-panel
---

# `@rifrocket/fdt-plugin-shapes-basic-panel`

**Kind:** Engine plugin (panel-slot wrapper) · **Peer dependencies:** `fabric`, `react`, `react-dom`

[`shapes-basic`](/docs/plugins/shapes-basic) registers 20 object types but ships no UI to actually create one — a consumer previously had to build their own picker calling `engine.addObjectOfType()` from scratch. This package is that missing UI: one button per registered type, registered into the `tool-rail` panel slot.

```ts
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";
import { createShapesBasicPanelPlugin } from "@rifrocket/fdt-plugin-shapes-basic-panel";

engine.use(shapesBasicPlugin);
engine.use(createShapesBasicPanelPlugin()); // renders ShapePicker into "tool-rail"
```

`createShapesBasicPanelPlugin()` declares `dependsOn: ["shapes-basic"]` — `ShapePicker`'s buttons call `engine.addObjectOfType()` against ids `shapes-basic` registers, so installing this panel without it would throw the moment a button is clicked, not at install time. `engine.useAll([...])` resolves `dependsOn` via a real topological sort, so as long as both are in the same `useAll()` call, order in the array doesn't matter.

`BASIC_SHAPE_TYPE_IDS` (the list `ShapePicker` renders a button for) is derived from `shapes-basic`'s own exported `SHAPE_COORDINATES`, not hand-duplicated — a shape added there automatically gets a picker button here.

Not bundled into either `<DesignEditor>` built-in preset — it peer-depends on `@rifrocket/fdt-react`, which would create a circular dependency if `shapes-basic` (already bundled in `default`/`minimal`) grew a panel directly:

```tsx
<DesignEditor preset="default" plugins={{ add: [createShapesBasicPanelPlugin()] }} />
```

`createShapesBasicPanelPlugin().uninstall(engine)` removes only its own engine's panel registration — safe under `plugin-pages`' multi-engine model.

## Exports

- `ShapePicker` — bare, unstyled buttons (one per shape type), each calling `engine.addObjectOfType(typeId, {})` — the same public API any consumer's own picker would call
- `createShapesBasicPanelPlugin()` — installs `ShapePicker` into `tool-rail`; declares `dependsOn: ["shapes-basic"]`
- `BASIC_SHAPE_TYPE_IDS` — the exact list of type ids `ShapePicker` renders a button for
