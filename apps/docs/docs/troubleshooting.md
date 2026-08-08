---
sidebar_position: 10
title: Troubleshooting
---

# Troubleshooting

## "Changing my `plugins`/`preset` prop didn't do anything"

This is expected, not a bug. `plugins` (on `<Editor>`), `preset`/`plugins` (on `<DesignEditor>`), and `plugins` passed to `useCanvasEngine()` are all read **once, at construction**. There's no safe general story for hot-swapping an installed plugin set. Remount with a different `key`:

```tsx
<Editor key={documentId} plugins={pluginsForDocument(documentId)} />
```

See [Installing Plugins](/docs/plugins/installing-plugins).

## "My `onReady` handler throws after an `await`, or touches a disposed canvas"

If your `onReady` handler does anything asynchronous before touching the engine again, check `engine.isDestroyed()` right after each `await` and bail out if it's true:

```tsx
onReady={async (engine) => {
  const saved = await loadSavedDocument();
  if (engine.isDestroyed()) return;
  await engine.importFile("json", saved);
}}
```

This is a real, not hypothetical, race — most commonly hit under React 19 StrictMode's dev-only double-invocation of effects (mount → teardown → remount, synchronously, specifically to surface bugs like this), or a fast real remount (e.g. switching documents via a changing `key` while a slow `onReady` is still in flight). See [The React Adapter](/docs/architecture/react-adapter).

## "`engine.unuse("some-plugin")` didn't clean everything up"

Only plugins that implement a real `uninstall()` clean up after themselves — of the shipped plugins, 8 do today (`local-storage`, `alignment`, `snapping`, `devtools`, `clipboard`, `effects`, `effects-panel`, `shapes-basic-panel`). Calling `unuse()` on one of the other 9 removes it from the installed-plugins list but leaves whatever it registered (object types, importers) in place. If you need a genuinely different plugin set, remount with a new `key` instead of relying on `unuse()` for cleanup. See [Installing Plugins](/docs/plugins/installing-plugins).

## "Registering the same object type / effect / exporter twice throws"

`ObjectTypeRegistry.register()`, `EffectRegistry.register()`, and the generic `Registry<T>` (backing exporters/importers) all throw `"X" is already registered"` on a duplicate id — there's no silent overwrite. If you need to swap out what a name points to, use `replace()` instead of `register()`:

```ts
engine.registry.objectTypes.replace("rect", newDefinition); // atomic unregister + register, no throw
engine.registry.effects.replace(newEffectDefinition);
```

If you're writing a plugin that might get installed more than once (e.g. it's used by more than one preset), guard with `.has()` first:

```ts
if (!engine.registry.effects.has(myEffect.id)) {
  engine.registry.registerEffect(myEffect);
}
```

## "A plugin failed to install, but I don't know which one"

If `install()` throws inside `engine.useAll([...])`, the error is wrapped to name the responsible plugin: `Plugin "X" failed to install: <original message>` (with the original error attached as `.cause`). Read the wrapped message rather than just the underlying registry error — `useAll()` installs several plugins in one call, so without this you'd otherwise have to bisect your plugin list by hand.

## "SVG/JSON import doesn't show up in my undo history"

Neither import path adds objects through the history-tracked `engine.addObject()`, so imported content isn't an undo step — undoing afterward undoes whatever you did *next*, not the import. See [Export/Import Pipelines](/docs/extension-points/export-import-pipelines).

## "Exported PNG/canvas is blank, or export throws a security error"

If you loaded a remote image via `@rifrocket/fdt-plugin-image` (or any custom object type that loads an external URL), the canvas becomes "tainted" unless that image was served with CORS headers permitting `crossOrigin: "anonymous"` reads — after that, `canvas.toDataURL()`-based export (which `CanvasExporter` uses for PNG/JPEG) throws a security error, or silently produces a blank result depending on the browser. Make sure remote images are served with permissive CORS headers if you intend to export the canvas afterward.

## "Snapping doesn't seem to be doing anything"

Smart-guide snapping is **disabled by default** in both `<DesignEditor>` built-in presets — an earlier version of this project shipped it default-on with unfiltered guide rendering, which made it actively disruptive rather than helpful. `SnapEngine`'s own default is actually **on**; it's only the two `<DesignEditor>` presets that override it to off, so this only bites `<DesignEditor preset="default" | "minimal">` consumers. If you're using `createEngine()`/`<Editor>` directly, snapping is already on unless you explicitly disabled it. Turn it on explicitly for a `<DesignEditor>` preset:

```ts
const engine = createEngine(canvasEl, { snapping: { enabled: true } });
// or, on an existing engine:
engine.snapping.setEnabled(true);
```

## "My zoom UI shows the wrong value" / "Zoom changed but nothing reactive noticed"

Make sure you're calling the `CanvasEngine` facade methods (`engine.setZoom()`, `engine.zoomBy()`, `engine.pan()`, `engine.reset()`), not the raw `ViewportManager` methods (`engine.viewport.setZoom()`, etc., marked `@internal`) — only the facade methods keep `engine.store`'s `zoom`/`panX`/`panY` in sync. See [The CanvasEngine](/docs/architecture/canvas-engine).

## "TypeScript doesn't autocomplete my custom object type id"

Object-type ids are plain strings by default (`ObjectTypeId = keyof ObjectTypeMap | (string & {})`). Augment `ObjectTypeMap` via TypeScript's module-augmentation pattern to get autocomplete/typo-checking on your own ids — see the end of [Writing a Plugin](/docs/guides/writing-a-plugin).

Still stuck? Check the [FAQ](/docs/faq), or open an issue on [GitHub](https://github.com/rifrocket/fabricjs-design-tool/issues).
