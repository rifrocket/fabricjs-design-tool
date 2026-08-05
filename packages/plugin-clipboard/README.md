<div align="center">
  <img src="https://rifrocket.github.io/fabricjs-design-tool/img/logo-large.svg" alt="Fabric Design Tool" width="180"/>

  # @rifrocket/fdt-plugin-clipboard

  **Copy/paste/duplicate/group and nudge keyboard shortcuts for [Fabric Design Tool](../../README.md).**

  [![npm](https://img.shields.io/npm/v/%40rifrocket%2Ffdt-plugin-clipboard/beta.svg)](https://www.npmjs.com/package/@rifrocket/fdt-plugin-clipboard)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
</div>

A pure engine plugin — `install()` registers a full set of clipboard/selection keyboard shortcuts, built entirely from the public engine API (`engine.selection`, `engine.shortcuts`, `engine.addObject()`, `engine.setObjectProperty()`, Fabric's own `object.clone()`). Nothing here needs special internal access, so it's also a reasonable reference for writing your own shortcut plugin.

## Features

| Shortcut | Action |
|---|---|
| `Ctrl+C` | Copy selection |
| `Ctrl+V` | Paste (offset +20px from the copy point) |
| `Ctrl+D` | Duplicate in place |
| `Ctrl+G` | Group selection |
| `Ctrl+Shift+G` | Ungroup |
| `Ctrl+A` | Select all |
| Arrow keys | Nudge 1px |
| `Shift` + arrow keys | Nudge 10px |

Every combo is registered through `engine.shortcuts.register()`. Included in both `<DesignEditor preset="default">` and `preset="minimal"`.

## Install

```bash
npm install @rifrocket/fdt-plugin-clipboard
```

Peer dependencies: `fabric`.
Depends on `@rifrocket/fabricjs-design-tool`.

## Quick start

```ts
import { clipboardPlugin, cloneFabricObject } from "@rifrocket/fdt-plugin-clipboard";

engine.use(clipboardPlugin);
```

`cloneFabricObject` is exported as a standalone entry point to the same clone-and-offset logic the plugin uses internally for `Ctrl+D`/paste — reach for it directly if you need to duplicate an object outside of a keyboard shortcut (e.g. from a toolbar button).

## Documentation

- [Full plugin reference](https://rifrocket.github.io/fabricjs-design-tool/docs/plugins/clipboard)

## License

[MIT](../../LICENSE) © Fabric Design Tool Contributors
