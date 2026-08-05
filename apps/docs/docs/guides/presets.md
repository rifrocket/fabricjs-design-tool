---
sidebar_position: 4
title: Presets
---

# Presets

A **preset** bundles plugins, property fields, snapping defaults, and shortcuts into one named, reusable configuration — the mechanism behind `<DesignEditor preset="default">`'s one-line editor initialization. This page covers the underlying model, whether you're using `<DesignEditor>`, `createEditor()` directly, or writing your own preset.

:::info Vocabulary note
An **editor preset** (this page) is a bundle of plugins/UI for the editor itself — unrelated to a **document template** (e.g. a business-card/flyer/poster starting point some apps build). A consuming app can have both at once; keep the two terms separate in your own code and docs.
:::

## The built-in presets

| Preset | Plugins |
|---|---|
| `"default"` | `shapes-basic`, `clipboard`, `svg-import`, `image`, `effects` (all built-in effects), `export-pdf`, `qrcode` |
| `"minimal"` | `shapes-basic`, `clipboard`, `image`, `effects` — drops `svg-import`/`export-pdf`/`qrcode` |
| `"none"` | No plugins |

Snapping starts `{ enabled: false }` in both named presets — an earlier version of this project shipped snapping default-on with unfiltered guide rendering, which made it actively disruptive rather than helpful.

```tsx
<DesignEditor preset="default" theme="system" width={800} height={600} />
```

## What a preset actually is

```ts
interface EditorPreset {
  name: string;
  plugins: EditorPlugin[] | (() => EditorPlugin[]); // factory form defers construction until createEditor() runs
  propertyFields?: Record<string, PropertyFieldDefinition[]>;
  snapping?: SnapEngineOptions;
  shortcuts?: PresetShortcutsConfig;
}
```

A preset is **inert declarative data**, not a live object — the same preset can be handed to `createEditor()` many times (once per document/tab) without carrying state between calls, matching `CanvasEngine`'s own one-engine-per-canvas model.

## Overriding per-field, not all-or-nothing

```tsx
<DesignEditor
  preset="default"
  plugins={{
    exclude: ["qrcode", "export-pdf"],
    add: [myBrandKitPlugin],
    replace: { effects: createEffectsPlugin([shadowEffect, glowEffect]) },
  }}
  propertyFields={{
    text: [...DEFAULT_TEXT_FIELDS, { key: "brandVoice", label: "Tone", component: SelectField }],
    qrcode: null, // suppress entirely (also implied by excluding the plugin above)
  }}
  shortcuts={{
    disable: ["ctrl+y"], // drop one of the two default redo bindings
    add: { "ctrl+s": { handler: (engine) => save(engine), description: "Save" } },
  }}
  autosave={{ key: "my-app:design" }}
/>
```

Resolution order: resolve the preset → compute plugin list (drop `exclude`, apply `replace` by name, append `add`) → merge `propertyFields` (append per type, or delete on `null`) → shallow-merge `snapping` → merge `shortcuts` (`disable` is the union of the preset's and this prop's; `add` overlays this prop's entries on the preset's) → (React layer only) resolve `theme`/`slots`, with explicit props always winning over the preset's own values.

**`exclude`/`replace` throw if given a plugin name that isn't actually in the resolved preset** — a typo in an exclude list fails loudly instead of silently doing nothing.

## Writing your own preset

```ts
import { definePreset } from "@rifrocket/fabricjs-design-tool";
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";

const myPreset = definePreset({
  name: "brochure-editor",
  plugins: [shapesBasicPlugin, myBrandKitPlugin],
  snapping: { enabled: true, threshold: 8 },
});
```

`definePreset()` is identity + validation (throws if `name` is missing) — a light typo/shape guard so a preset author gets a clear error at definition time instead of a confusing failure inside `createEditor()` later.

## `createEditor()` — the non-React counterpart

```ts
import { createEditor } from "@rifrocket/fabricjs-design-tool";

const { engine, resolvedPreset } = createEditor(canvasElement, {
  preset: myPreset, // a literal EditorPreset object — see below
  plugins: { exclude: ["qrcode"] },
});
```

`@rifrocket/fabricjs-design-tool` can only resolve a **literal preset object** (built with `definePreset()`) or `"none"` — it cannot resolve the named `"default"`/`"minimal"` strings, because every true plugin package depends on `core`, so `core` depending back on them to define those named presets would be a circular package dependency. Those convenience names exist one layer up, in `@rifrocket/fdt-react`'s `<DesignEditor preset="default">`, which is built from real plugin instances there. Passing a preset **name string** to `createEditor()` throws a clear error pointing you at `<DesignEditor>` instead.

`resolvedPreset` — returned alongside `engine` — is the fully-resolved preset actually used, post-override, useful for introspection/debugging (e.g. logging exactly which plugins ended up installed).

## Same construction-time-only rule applies

Like `plugins` on `<Editor>`, `preset`/`plugins` on `<DesignEditor>` are read once, at construction — changing `preset="default"` to `preset="minimal"` on a live, mounted `<DesignEditor>` does nothing until it remounts via a changed `key`. See [Installing Plugins](/docs/plugins/installing-plugins).
