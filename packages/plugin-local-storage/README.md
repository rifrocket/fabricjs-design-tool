<div align="center">
  <img src="../../apps/docs/static/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-local-storage

  **Debounced `localStorage` autosave for [Fabric Design Tool](../../README.md), built on core's document snapshot.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-local-storage/alpha.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-local-storage)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin that debounces three independent change sources into one atomic `localStorage` write: (1) `engine.store` changes (object add/remove, property edits, undo/redo), (2) Fabric's own `"object:modified"`/`"text:changed"` canvas events (covers interactive drag/resize/rotate that Fabric commits directly, bypassing the engine), and (3) `REQUEST_SAVE_EVENT` — an escape hatch for changes neither observes (e.g. `engine.setBackgroundColor()`).

## Features

- Not bundled into either `<DesignEditor>` preset — it needs app-specific `captureMeta`/document-id logic, so it's opt-in rather than default-on (avoids silently persisting one app's canvas into another's storage key)
- **Restoring is deliberately not automatic.** `install()` never restores on its own: it runs synchronously during `engine.useAll()`, before your app code gets a chance to add starter content, so auto-restoring would race your own load sequence. Call `loadDesignFromStorage()` yourself once, on mount.
- `saveDesignToStorage` / `loadDesignFromStorage` / `clearSavedDesign` — the underlying primitives, usable standalone if you don't want the debounced-listener plugin at all
- `requestSave()` / `REQUEST_SAVE_EVENT` — trigger an out-of-band save for changes the plugin's own listeners don't cover

## Install

```bash
npm install @rifrocket/fdt-plugin-local-storage
```

Peer dependencies: `fabric`.
Depends on `@rifrocket/fdt-core`.

## Quick start

```ts
import { localStoragePlugin, loadDesignFromStorage } from "@rifrocket/fdt-plugin-local-storage";

engine.use(
  localStoragePlugin({
    captureSnapshot: captureDesignSnapshot,
    captureMeta: () => ({ documentId: currentDocumentId }),
  }),
);

// On mount, once — install() never does this for you:
const saved = loadDesignFromStorage();
if (saved) restoreSnapshot(engine, saved.snapshot);
```

Or use `<DesignEditor>`'s sugar form instead of wiring the plugin directly:

```tsx
<DesignEditor preset="default" autosave={{ key: "my-app:design" }} />
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/local-storage)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
