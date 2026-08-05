<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-effects

  **22 stackable object effects for [Fabric Design Tool](../../README.md) — shadow, glow, glitch, duotone, and more.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-effects/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-effects)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin that registers an object-effects system — 22 named effects, each independently reorderable/stackable on any object type. Unlike other `plugin-*` packages, this one exports a **factory function**, `createEffectsPlugin()`, rather than a plain plugin object: the effect list is configurable, and since every effect is a side-effect-free independent export, passing a curated subset genuinely shrinks your bundle.

## Features

All 22 built-in effects, grouped by category (also exported as `BASIC_EFFECTS`, `CREATIVE_EFFECTS`, `TEXT_EFFECTS`, `IMAGE_EFFECTS`, or together as `ALL_BUILTIN_EFFECTS`):

`shadow` · `glow` · `inner-shadow` · `outline` · `blur` · `opacity` · `echo` · `glitch` · `neon` · `duotone` · `pixelate` · `noise` · `vintage` · `retro` · `gradient-fill` · `multi-layer-shadow` · `brightness` · `contrast` · `saturation` · `hue` · `vignette` · `sepia`

- `createEffectsPlugin()` is idempotent — safe to call more than once across engines
- Every effect ships a matching `*Props` type (e.g. `ShadowProps`, `GlitchProps`) for its configurable parameters
- Register your own effect alongside the built-ins via `engine.registry.effects.register(myCustomEffect)`
- Included in both `<DesignEditor preset="default">` and `preset="minimal"` (with no arguments — every built-in effect)

## Install

```bash
npm install @rifrocket/fdt-plugin-effects
```

Peer dependencies: `fabric`.
Depends on `@rifrocket/fabricjs-design-tool`.

## Quick start

```ts
import { createEffectsPlugin, shadowEffect, glowEffect } from "@rifrocket/fdt-plugin-effects";

engine.use(createEffectsPlugin());                    // every built-in effect (the default)
engine.use(createEffectsPlugin([shadowEffect, glowEffect])); // a curated subset, smaller bundle
```

```ts
engine.registry.effects.has("shadow"); // true
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/effects)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
