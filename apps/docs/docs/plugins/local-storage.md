---
sidebar_position: 11
title: local-storage
---

# `@rifrocket/fdt-plugin-local-storage`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`

Debounced `localStorage` autosave, built on `core`'s document-snapshot primitives. Not bundled into either `<DesignEditor>` built-in preset — its real value needs app-specific `captureMeta`/document-id logic, so it's an explicit opt-in rather than default-on behavior that could silently persist one app's canvas into another's storage key.

```ts
import { localStoragePlugin } from "@rifrocket/fdt-plugin-local-storage";

engine.use(
  localStoragePlugin({
    key: "my-app:design",
    debounceMs: 500, // default
    captureMeta: () => ({ templateId: currentTemplate.id }),
  }),
);
```

Using `<DesignEditor>`, the equivalent is sugar on the component itself:

```tsx
<DesignEditor preset="default" autosave={{ key: "my-app:design" }} />
```

## What triggers a save

Three independent listeners, debounced into one atomic write:

- `engine.store` changes — covers object add/remove, property-panel edits, undo/redo (anything that updates `EngineState`)
- Fabric's own `"object:modified"`/`"text:changed"` canvas events — covers interactive drag/resize/rotate, which Fabric commits directly to the object without going through the engine
- `REQUEST_SAVE_EVENT` — an escape hatch for changes neither of the above observes (e.g. `engine.setBackgroundColor()` touches neither the store nor emits a canvas event):

```ts
import { requestSave } from "@rifrocket/fdt-plugin-local-storage";

requestSave(engine); // manually trigger a debounced save
```

## Restoring — deliberately not automatic

This plugin is **autosave-only**. `install()` never restores anything, because restoring is an app-level decision (typically: "only on the very first mount of the session, and only if nothing more specific — like an explicitly chosen template — should win instead"), and `install()` runs synchronously during `engine.useAll()`, before your app has had any chance to add its own starter content. Auto-restoring here would race your app's own load sequence.

```ts
import { loadDesignFromStorage, clearSavedDesign } from "@rifrocket/fdt-plugin-local-storage";
import { restoreSnapshot } from "@rifrocket/fdt-core";

const saved = loadDesignFromStorage("my-app:design");
if (saved) {
  restoreSnapshot(engine, saved.snapshot);
}

clearSavedDesign("my-app:design"); // e.g. wired to a "clear autosave" button
```

## Exports

- `localStoragePlugin(options?)` — the plugin factory
- `requestSave(engine)`, `REQUEST_SAVE_EVENT`
- `saveDesignToStorage`, `loadDesignFromStorage`, `clearSavedDesign`, `DEFAULT_STORAGE_KEY`
- Types: `LocalStoragePluginOptions`, `StorageLike`, `StoredDesign`

Not bundled into either built-in preset — add explicitly via `plugins.add`, or use `<DesignEditor autosave={...}>`.
