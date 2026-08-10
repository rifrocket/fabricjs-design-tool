---
sidebar_position: 2
title: Installing Plugins
---

# Installing Plugins

## `engine.use()` — one plugin at a time

```ts
import { createEngine } from "@rifrocket/fabricjs-design-tool";
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";

const engine = createEngine(canvasElement);
engine.use(shapesBasicPlugin);
```

`use()` calls `plugin.install(engine)` immediately and throws if a plugin with the same `name` is already installed. It does **not** consult `dependsOn` — installation order is exactly the order you call `use()`.

## `engine.useAll()` — many at once, dependency-ordered

```ts
engine.useAll([shapesBasicPlugin, qrCodePlugin, myPropertyFieldsPlugin]);
```

`useAll()` topologically sorts the given plugins by their `dependsOn` arrays before installing, so you don't have to get array order right by hand:

```ts
const myPropertyFieldsPlugin: EditorPlugin = {
  name: "my-property-fields",
  dependsOn: ["shapes-basic", "qrcode"], // installed first, regardless of array position
  install(engine) {
    engine.registry.registerPropertyFields("rect", [...]);
  },
};

engine.useAll([myPropertyFieldsPlugin, shapesBasicPlugin, qrCodePlugin]); // order doesn't matter
```

If a listed plugin depends on a name that's neither already installed nor present in the same `useAll()` call, it throws — a missing dependency fails loudly rather than silently installing in the wrong order. A circular `dependsOn` chain also throws.

`<Editor plugins={[...]}>` and `<DesignEditor preset="..." plugins={{ add: [...] }}>` both call `useAll()` internally, so the same ordering guarantee applies whether you're calling `core` directly or going through the React adapter.

## The construction-time-only contract

**`plugins` (on `<Editor>`) and `preset`/`plugins` (on `<DesignEditor>`) are read once, at construction.** Changing them on an already-mounted component does nothing — there's no safe general story for hot-swapping an installed plugin set, because uninstalling one correctly would require knowing everything it registered and whether any other plugin has since come to depend on it. To install a different plugin set, remount with a different `key`:

```tsx
// Switching key remounts the whole engine with the new plugin set:
<Editor key={workspaceId} plugins={pluginsForWorkspace(workspaceId)} />
```

This applies identically whether you're using `<Editor>`, `<DesignEditor>`, or `useCanvasEngine()` directly.

## Removing a plugin: `unuse()`

```ts
engine.unuse("local-storage"); // calls uninstall?.(engine) if the plugin defines one, then forgets it
```

Worth knowing before you rely on it: of the plugins that ship today, 8 implement a real `uninstall()` — `local-storage`, `alignment`, `snapping`, `devtools`, `clipboard`, `effects`, `effects-panel`, and `shapes-basic-panel` (all either unregister their panel(s) or their keyboard shortcuts). Calling `unuse()` on the other 9 removes it from the installed-plugins list but leaves whatever it registered (object types, importers) in place — there's no automatic "undo everything this plugin did," since what "uninstalling an object type with live objects of that type still on canvas" should even mean isn't a settled question. Treat `unuse()` as reliable for plugins you know implement `uninstall()`, and prefer the remount-with-a-new-`key` pattern above for a full plugin-set change.

## Overriding a preset's plugin list

`<DesignEditor preset="default">` and `createEditor({ preset })` both accept a `plugins` override object, applied per-field rather than all-or-nothing:

```tsx
<DesignEditor
  preset="default"
  plugins={{
    exclude: ["qrcode", "export-pdf"],
    add: [myBrandKitPlugin],
    replace: { effects: createEffectsPlugin([shadowEffect, glowEffect]) },
  }}
/>
```

`exclude` and `replace` **throw** if given a plugin name that isn't actually in the resolved preset — a typo in an exclude list fails loudly instead of silently doing nothing. See [Presets](/docs/guides/presets) for the full override model.

## Errors during install

If a plugin's `install()` throws while inside `useAll()`, the error is wrapped to name the responsible plugin (`Plugin "X" failed to install: <original message>`), with the original error attached as `.cause` — useful because `useAll()` installs several plugins in one call, so without this you'd otherwise have to bisect your plugin list by hand to find which one caused a registry conflict (e.g. two plugins registering the same object-type id).
