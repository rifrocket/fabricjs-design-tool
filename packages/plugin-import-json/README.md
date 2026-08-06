<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-import-json

  **JSON import for [Fabric Design Tool](../../README.md) — the counterpart to core's built-in JSON export.**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-import-json/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-import-json)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin (plus a bare React trigger button) that registers a `"json"` **importer**. JSON export is a core built-in format, but JSON import has no core-level equivalent — this plugin closes that gap.

## Features

- Registers `"json"` — go through `engine.importFile("json", ...)`, not the raw registered importer directly. `canvas.loadFromJSON()` fully replaces canvas contents without going through the add/remove command path, so `importFile()` performs the necessary resync afterward (clears history, re-syncs the object list, clears selection)
- **⚠️ Not undoable as a single step** — a JSON import replaces the entire canvas and clears history
- **`ImportJsonButton`** — a bare trigger component if you want a ready-made "Import JSON" button instead of wiring the file picker yourself

Not bundled into either `<DesignEditor>` preset — it peer-depends on `@rifrocket/fdt-react`. Add via `plugins.add`.

## Install

```bash
npm install @rifrocket/fdt-plugin-import-json
```

Peer dependencies: `fabric`, `react`, `react-dom`.
Depends on `@rifrocket/fabricjs-design-tool` and `@rifrocket/fdt-react`.

## Quick start

```ts
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";

engine.use(importJsonPlugin);
await engine.importFile("json", jsonString);
```

```tsx
import { ImportJsonButton } from "@rifrocket/fdt-plugin-import-json";

<ImportJsonButton engine={engine} />;
```

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/import-json)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
