---
sidebar_position: 3
title: Custom Panels
---

# Custom Panels

A **panel** is a named UI slot a plugin can render a React component into, without forking the host application's layout. `PanelRegistry` (`engine.registry.panels`) manages the slots; `@rifrocket/fdt-react`'s `<Editor>`/`<DesignEditor>` render three of them by default.

```ts
interface PanelDefinition {
  component: unknown; // a React component type
  order?: number;      // sort order within the slot, ascending
}
```

## The 3 slots `<Editor>` renders

| Slot | Typical use |
|---|---|
| `toolbar-start` | Selection quick-actions, a tool palette |
| `sidebar-right` | Properties panel, layers panel, plugin panels (alignment, snapping, devtools all register here) |
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

`registerPanel()` returns an unregister function — useful for a plugin's own `uninstall()`:

```ts
const brandKitPlugin: EditorPlugin = {
  name: "brand-kit",
  install(engine) {
    this._unregister = engine.registry.registerPanel("sidebar-right", { component: MyBrandKitPanel });
  },
  uninstall(engine) {
    this._unregister?.();
  },
};
```

Multiple plugins can register into the same slot — they render in `order` order (ascending, undefined treated as `0`), which is exactly how `plugin-devtools` places five separate panels into `sidebar-right` from one `install()` call.

## Overriding a slot at the component level

`<Editor slots={{ "sidebar-right": MyCustomSidebar }}>` **replaces** everything registered into that slot for this specific editor instance, rather than appending — it's a full-object override per slot, not a merge. Use plugin registration for "add a panel alongside whatever else is there"; use the `slots` prop for "replace this slot's contents entirely for this instance."

## Beyond 3 slots: a custom application shell

`<Editor>`/`<DesignEditor>` only render these 3 fixed slots inside their own wrapping `<div>` — not a real application shell with a header, multiple sidebars, or a status bar. For that, see [Building a Custom Shell with EditorContext](/docs/guides/custom-shell-with-editorcontext), which drops to `useCanvasEngine()` and places panel components (registered or manually imported) anywhere in your own layout.
