---
sidebar_position: 11
title: FAQ
---

# FAQ

### Is this published to npm yet?

Not yet. Every `@rifrocket/fdt-*` package is currently `private: true` in the monorepo. See the [migration guide](/docs/migration/v1-to-v2) if you're looking for the previously-published v1 package (`@rifrocket/fabricjs-design-tool`), and the [GitHub repository](https://github.com/rifrocket/fabricjs-design-tool) for current release status.

### Does this work outside React?

Yes — `@rifrocket/fabricjs-design-tool` has zero React dependency, enforced by a CI `dependency-cruiser` rule, not just convention. Use `createEngine()` directly. See [Choosing Your Entry Point](/docs/getting-started/choosing-your-entry-point).

### Does this support Vue, Svelte, or other frameworks?

Not with a first-party adapter today — only `@rifrocket/fdt-react` exists. Because `@rifrocket/fabricjs-design-tool` is genuinely framework-agnostic, a Vue/Svelte adapter is architecturally possible (it would follow the same thin-wrapper pattern `@rifrocket/fdt-react`'s `<Editor>` does around `createEngine()`), but isn't built today.

### Can I use a custom Fabric.js object I've already built?

Yes — `ObjectTypeDefinition.create()` just needs to return a `FabricObject` (or a `Promise` of one). If you already have Fabric construction code, wrap it in `registerObjectType()`:

```ts
engine.registry.registerObjectType("my-shape", {
  create: (config) => myExistingFabricConstructionFunction(config),
});
```

See [Custom Object Types](/docs/extension-points/custom-object-types).

### How many plugins does the "default" preset actually install?

Seven: `shapes-basic`, `clipboard`, `svg-import`, `image`, `effects` (all built-in effects), `export-pdf`, `qrcode`. `"minimal"` drops `svg-import`/`export-pdf`/`qrcode` for four. See [Presets](/docs/guides/presets).

### Why aren't `alignment`, `snapping`, `devtools`, and `import-json` in either built-in preset?

They each peer-depend on `@rifrocket/fdt-react` itself (they render components via `useEditor()`) — bundling them into `<DesignEditor>`'s presets would create a circular package dependency (`fdt-react` → plugin → `fdt-react`). Add them explicitly via `plugins.add`. See [Plugins Overview](/docs/plugins/overview).

### Is `@rifrocket/fdt-plugin-pan-zoom` really not an `EditorPlugin`?

Correct — it's the one deliberate exception among the 13 official plugin packages. It exports plain hooks (`useCanvasPanZoom`, `useContainerSize`), not an `install()`-shaped object, because it's a side-effecting DOM-listener hook that needs a host-supplied container selector, not a renderable panel. See [its page](/docs/plugins/pan-zoom).

### Can I disable snapping, or turn it on by default?

Both — `engine.snapping.setEnabled(false | true)` at runtime, or `{ snapping: { enabled: true | false } }` at construction. `SnapEngine` itself defaults to **on** — it's only `<DesignEditor>`'s two built-in presets (`"default"` and `"minimal"`) that turn it off by default. If you're using `createEngine()`/`<Editor>` directly with no `snapping` option, snapping is already on. See [The CanvasEngine](/docs/architecture/canvas-engine).

### Does undo/redo cost more memory as my document grows?

No — history is command-pattern, not whole-canvas snapshots. Each undo step costs roughly proportional to what changed, not to total document size. See [History & Commands](/docs/architecture/history-and-commands).

### How do I persist a document (autosave / save-to-server)?

For `localStorage`, use `@rifrocket/fdt-plugin-local-storage` (or `<DesignEditor autosave={{...}}>` sugar). For a custom backend, `@rifrocket/fabricjs-design-tool`'s `captureSnapshot(engine)`/`restoreSnapshot(engine, data)` give you the same serialization primitives that plugin builds on — call them yourself on whatever cadence/transport you need. See [`local-storage`](/docs/plugins/local-storage).

### Where do I report a bug or request a feature?

[GitHub Issues](https://github.com/rifrocket/fabricjs-design-tool/issues).

Didn't find your question? Check [Troubleshooting](/docs/troubleshooting) for symptom-specific fixes.
