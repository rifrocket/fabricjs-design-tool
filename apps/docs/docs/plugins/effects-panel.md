---
sidebar_position: 10.5
title: effects-panel
---

# `@rifrocket/fdt-plugin-effects-panel`

**Kind:** Engine plugin (panel-slot wrapper) · **Peer dependencies:** `fabric`, `react`, `react-dom`

[`effects`](/docs/plugins/effects) registers effect *data* and the canvas render pipeline, but ships no UI of its own — this package is that missing UI: browse effects by category, apply/remove/reorder/duplicate them on the selected object's stack, and edit each effect's own schema-driven properties (slider/color/angle/select controls).

```ts
import { createEffectsPlugin } from "@rifrocket/fdt-plugin-effects";
import { createEffectsPanelPlugin } from "@rifrocket/fdt-plugin-effects-panel";

engine.use(createEffectsPlugin());
engine.use(createEffectsPanelPlugin()); // renders EffectsPanel into "sidebar-right"
```

Or one call for both — the discoverability gap the two-install version above leaves (a consumer who only reaches for `effects-panel` has no obvious signal that `effects` itself is a second, required install):

```ts
import { effectsWithPanelPlugin } from "@rifrocket/fdt-plugin-effects-panel";

engine.useAll(effectsWithPanelPlugin()); // pass a curated EffectDefinition[] to skip the rest of the built-ins
```

Not bundled into either `<DesignEditor>` built-in preset — it peer-depends on `@rifrocket/fdt-react`, which would create a circular dependency if `effects` (already bundled in `default`/`minimal`) grew a panel directly. `createEffectsPanelPlugin()`/`EffectsPanel` themselves still only read `engine.registry.effects` (generic to whatever effects got registered, independent of which package registered them) — this package depends on `plugin-effects` itself only for the `effectsWithPanelPlugin()` convenience, which is safe: neither package depends on the other in the cycle-creating direction.

```tsx
<DesignEditor preset="default" plugins={{ add: [createEffectsPanelPlugin()] }} />
```

`createEffectsPanelPlugin().uninstall(engine)` removes only its own engine's panel registration — safe under `plugin-pages`' multi-engine model.

## Exports

- `EffectsPanel` — the full effects panel (gallery + stack + property controls), wired directly to `engine.registry.effects` and `useObjectEffects()`
- `createEffectsPanelPlugin()` — installs `EffectsPanel` into `sidebar-right`
- `effectsWithPanelPlugin(effects?)` — installs both `createEffectsPlugin(effects)` and the panel in one call
- `EffectGallery`, `EffectStackList`, `EffectPropertyControls` — the individual sub-components, if you want to compose your own layout
- `getEffectIcon(effectId)`
