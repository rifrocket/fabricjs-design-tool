---
sidebar_position: 7
title: clipboard
---

# `@rifrocket/fdt-plugin-clipboard`

**Kind:** Pure engine plugin · **Peer dependencies:** `fabric`

Registers copy/paste/duplicate/group/select-all/nudge as keyboard shortcuts, built entirely from public API — `engine.selection`, `engine.shortcuts`, `engine.addObject()`, `engine.setObjectProperty()`, and Fabric's own `object.clone()`. Nothing here has special internal access; a third-party plugin could build the same thing.

```ts
import { clipboardPlugin } from "@rifrocket/fdt-plugin-clipboard";

engine.use(clipboardPlugin);
```

## Shortcuts registered

| Combo | Action |
|---|---|
| `Ctrl+C` | Copy selection |
| `Ctrl+V` | Paste (each successive paste offsets by 20px so pasted copies don't stack exactly on top of each other) |
| `Ctrl+D` | Duplicate selection in place |
| `Ctrl+G` | Group selection |
| `Ctrl+Shift+G` | Ungroup |
| `Ctrl+A` | Select all objects |
| Arrow keys | Nudge selection by 1px |
| `Shift` + Arrow keys | Nudge selection by 10px |

Every registered combo goes through `engine.shortcuts.register()`, so it composes with any other plugin's shortcuts through the same `KeyboardShortcutManager` — see [Custom Property Fields](/docs/extension-points/custom-property-fields) and the [architecture overview](/docs/architecture/overview) for how the shortcut registry fits alongside the other registries.

## Exports

- `clipboardPlugin` — the `EditorPlugin`
- `cloneFabricObject(object, offset?)` — the clone helper used internally by paste/duplicate, exported in case you want the same offset-on-paste behavior in your own plugin

Included in both `<DesignEditor preset="default">` and `preset="minimal"`.
