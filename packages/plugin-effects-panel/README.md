<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-effects-panel

  **A ready-made effects panel for [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-effects-panel/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-effects-panel)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A panel-slot wrapper plugin: [`@rifrocket/fdt-plugin-effects`](../plugin-effects) registers effect *data* and the canvas render pipeline, but ships no UI of its own. This package is that missing UI — browse effects by category, apply/remove/reorder/duplicate them on the selected object's stack, and edit each effect's own schema-driven properties (slider/color/angle/select controls).

## Features

- **`EffectsPanel`** — the full effects panel (gallery + stack + property controls), wired directly to `engine.registry.effects` and `useObjectEffects()`
- **`createEffectsPanelPlugin()`** — installs `EffectsPanel` into `sidebar-right` via `registry.registerPanel()`; declares `dependsOn: ["effects"]`
- Export `EffectGallery`, `EffectStackList`, `EffectPropertyControls`, and the individual controls directly if you want to compose your own layout

## Install

```bash
npm install @rifrocket/fdt-plugin-effects-panel
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fabricjs-design-tool` and `@rifrocket/fdt-react` — not on `@rifrocket/fdt-plugin-effects` itself (it only reads `engine.registry.effects`, generic to whatever effects got registered).

## Quick start

```ts
import { createEffectsPlugin } from "@rifrocket/fdt-plugin-effects";
import { createEffectsPanelPlugin } from "@rifrocket/fdt-plugin-effects-panel";

engine.use(createEffectsPlugin());
engine.use(createEffectsPanelPlugin()); // renders EffectsPanel into "sidebar-right"
```

```tsx
<DesignEditor preset="default" plugins={{ add: [createEffectsPanelPlugin()] }} />
```

Not bundled into `<DesignEditor>`'s built-in presets — it depends on `@rifrocket/fdt-react`, which would create a circular dependency if core's own preset list included it (the same reason `@rifrocket/fdt-plugin-alignment`/`-snapping`/`-devtools` aren't bundled either). `@rifrocket/fdt-plugin-effects` itself (data + rendering) *is* bundled in `default`/`minimal` — this package only adds the panel on top.

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/effects-panel)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
