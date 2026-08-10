<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-shapes-basic-panel

  **A ready-made shape-creation UI for [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-shapes-basic-panel.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-shapes-basic-panel)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A panel-slot wrapper plugin: [`@rifrocket/fdt-plugin-shapes-basic`](../plugin-shapes-basic) registers 20 object types (text, rect, circle, line, ellipse, rounded-rectangle, and 14 polygon shapes), but ships no UI to actually create one — a consumer previously had to build their own picker calling `engine.addObjectOfType()` from scratch. This package is that missing UI: one button per registered type.

## Features

- **`ShapePicker`** — bare, unstyled buttons (one per shape type), each calling `engine.addObjectOfType(typeId, {})` — the same public API any consumer's own picker would call
- **`createShapesBasicPanelPlugin()`** — installs `ShapePicker` into the `"tool-rail"` panel slot via `registry.registerPanel()`; declares `dependsOn: ["shapes-basic"]`; `uninstall()` removes only its own engine's panel registration
- **`BASIC_SHAPE_TYPE_IDS`** — the exact list of type ids `ShapePicker` renders a button for, kept in sync with `plugin-shapes-basic`'s own `SHAPE_COORDINATES` export rather than hand-duplicated

## Install

```bash
npm install @rifrocket/fdt-plugin-shapes-basic-panel
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fabricjs-design-tool`, `@rifrocket/fdt-plugin-shapes-basic` (for its type-id list), and `@rifrocket/fdt-react`.

## Quick start

```ts
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";
import { createShapesBasicPanelPlugin } from "@rifrocket/fdt-plugin-shapes-basic-panel";

engine.use(shapesBasicPlugin);
engine.use(createShapesBasicPanelPlugin()); // renders ShapePicker into "tool-rail"
```

```tsx
<DesignEditor preset="default" plugins={{ add: [createShapesBasicPanelPlugin()] }} />
```

`<Editor>`/`<DesignEditor>`/`<MultiPageDesignEditor>` all render a `"tool-rail"` slot by default — install this plugin and a shape picker appears with zero further wiring. A host with its own styled shape gallery (e.g. `apps/demo`'s categorized/searchable `ShapeGallery`) can suppress the slot via `slots={{ "tool-rail": () => null }}` and render its own UI directly instead, importing `BASIC_SHAPE_TYPE_IDS` if it wants the same type-id list this package uses.

Not bundled into `<DesignEditor>`'s built-in presets — like `@rifrocket/fdt-plugin-alignment`/`-snapping`/`-devtools`/`-effects-panel`, it depends on `@rifrocket/fdt-react`, which would be a circular dependency if `plugin-shapes-basic` itself (bundled into every preset, and therefore required to stay React-free) depended on it back.

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/shapes-basic-panel)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
