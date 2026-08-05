---
sidebar_position: 10
title: effects
---

# `@rifrocket/fdt-plugin-effects`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`

Registers an object-effects system — shadow, glow, inner-shadow, outline, blur, opacity, echo, glitch, neon, duotone, pixelate, noise, vintage, retro, gradient-fill, multi-layer-shadow, brightness, contrast, saturation, hue, vignette, sepia — each an independent registration, reorderable and stackable on any object type.

Unlike the other plugins on this page, this one exports a **factory function**, not a plain plugin object, because the effect list itself is configurable:

```ts
import { createEffectsPlugin, ALL_BUILTIN_EFFECTS, shadowEffect, glowEffect } from "@rifrocket/fdt-plugin-effects";

engine.use(createEffectsPlugin()); // every built-in effect (the default)
engine.use(createEffectsPlugin([shadowEffect, glowEffect])); // a curated subset, smaller bundle
```

Each built-in effect is an independent, side-effect-free export, so passing a curated subset genuinely excludes the rest from your bundle rather than just hiding them at runtime.

## Registering effects on an object

```ts
engine.registry.effects.register(myCustomEffect); // add your own effect definition
engine.registry.effects.has("shadow"); // check before registering, if you might install the plugin twice
```

`createEffectsPlugin()` is itself safe to call more than once across multiple engines — it skips re-registering an effect id that's already present rather than throwing, and its rendering-pipeline installation is idempotent.

## Exports

- `createEffectsPlugin(effects?)` — the plugin factory
- `ALL_BUILTIN_EFFECTS`, `BASIC_EFFECTS`, `CREATIVE_EFFECTS`, `TEXT_EFFECTS`, `IMAGE_EFFECTS` — curated groupings of the built-ins
- Every individual effect (`shadowEffect`, `glowEffect`, `innerShadowEffect`, `outlineEffect`, `blurEffect`, `opacityEffect`, `echoEffect`, `glitchEffect`, `neonEffect`, `duotoneEffect`, `pixelateEffect`, `noiseEffect`, `vintageEffect`, `retroEffect`, `gradientFillEffect`, `multiLayerShadowEffect`, `brightnessEffect`, `contrastEffect`, `saturationEffect`, `hueEffect`, `vignetteEffect`, `sepiaEffect`) plus its matching `*Props` type

Included in both `<DesignEditor preset="default">` and `preset="minimal"` (via `createEffectsPlugin()` with no arguments — every built-in effect).
