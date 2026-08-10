---
sidebar_position: 3
title: Custom Panels
---

# Custom Panels

A **panel** is a named UI slot a plugin can render a React component into, without forking the host application's layout. `PanelRegistry` (`engine.registry.panels`) manages the slots — slot names are arbitrary strings, so a plugin can register into a new one you invent; `@rifrocket/fdt-react`'s `<Editor>`/`<DesignEditor>` render four of them by default.

```ts
interface PanelDefinition {
  component: unknown; // a React component type
  order?: number;      // sort order within the slot, ascending
}
```

## The 4 slots `<Editor>` renders

| Slot | Typical use |
|---|---|
| `toolbar-start` | Selection quick-actions, a tool palette |
| `tool-rail` | Content-creation UI — e.g. `plugin-shapes-basic-panel`'s `ShapePicker` |
| `sidebar-right` | Properties panel, layers panel, plugin panels (alignment, snapping, devtools, effects all register here) |
| `properties-footer` | A status bar under the properties panel |

## Registering into a slot

```ts
import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { MyBrandKitPanel } from "./MyBrandKitPanel";

const brandKitPlugin: EditorPlugin = {
  name: "brand-kit",
  install(engine) {
    engine.registry.registerPanel("sidebar-right", { component: MyBrandKitPanel, order: 10 });
  },
};
```

`registerPanel()` returns an unregister function — useful for a plugin's own `uninstall()`. Store it **keyed by engine**, not on the plugin object itself: the same `EditorPlugin` object can be installed on more than one `CanvasEngine` (e.g. under `plugin-pages`' one-engine-per-page model), so a plain `this._unregister` would get silently overwritten by the second `install()` call, leaving the first engine's `uninstall()` a no-op. A `WeakMap<CanvasEngine, () => void>` avoids that — the pattern every official panel-slot-wrapper plugin (`alignment`, `snapping`, `devtools`, `effects-panel`, `shapes-basic-panel`) uses today:

```ts
const unregisterByEngine = new WeakMap<CanvasEngine, () => void>();

const brandKitPlugin: EditorPlugin = {
  name: "brand-kit",
  install(engine) {
    const unregister = engine.registry.registerPanel("sidebar-right", { component: MyBrandKitPanel });
    unregisterByEngine.set(engine, unregister);
  },
  uninstall(engine) {
    unregisterByEngine.get(engine)?.();
    unregisterByEngine.delete(engine);
  },
};
```

Multiple plugins can register into the same slot — they render in `order` order (ascending, undefined treated as `0`), which is exactly how `plugin-devtools` places five separate panels into `sidebar-right` from one `install()` call.

## Overriding a slot at the component level

`<Editor slots={{ "sidebar-right": MyCustomSidebar }}>` **replaces** everything registered into that slot for this specific editor instance, rather than appending — it's a full-object override per slot, not a merge. Use plugin registration for "add a panel alongside whatever else is there"; use the `slots` prop for "replace this slot's contents entirely for this instance."

## Beyond 4 slots: a custom application shell

`<Editor>`/`<DesignEditor>` only render these 4 fixed slots inside their own wrapping `<div>` — not a real application shell with a header, multiple sidebars, or a status bar. For that, see [Building a Custom Shell with EditorContext](/docs/guides/custom-shell-with-editorcontext), which drops to `useCanvasEngine()` and places panel components (registered or manually imported) anywhere in your own layout.
