---
sidebar_position: 1
title: Writing a Plugin
---

# Writing a Plugin

This walkthrough builds a small but complete plugin — a `"sticky-note"` object type with property fields, a keyboard shortcut, and event logging — using nothing but the public registry API every shipped plugin (including `@rifrocket/fdt-plugin-qrcode`, whose real source is a great companion reference) is built on.

## 1. Start from the shape every plugin has

```ts
import type { EditorPlugin } from "@rifrocket/fdt-core";

export const stickyNotePlugin: EditorPlugin = {
  name: "sticky-note",
  install(engine) {
    // registrations go here
  },
};
```

`name` must be unique across everything installed on a given engine — `engine.use()` throws if you reuse one. `install(engine)` runs synchronously and receives the live `CanvasEngine`.

## 2. Register the object type

```ts
import { Rect } from "fabric";
import { ColorField, TextField } from "@rifrocket/fdt-properties";

interface StickyNoteConfig {
  left?: number;
  top?: number;
  text?: string;
  fill?: string;
}

export const stickyNotePlugin: EditorPlugin = {
  name: "sticky-note",
  install(engine) {
    engine.registry.registerObjectType<StickyNoteConfig>("sticky-note", {
      create: (config) => {
        const note = new Rect({
          left: config.left ?? 50,
          top: config.top ?? 50,
          width: 160,
          height: 160,
          fill: config.fill ?? "#fef08a",
        });
        note.set("shapeKind", "sticky-note");
        return note;
      },
      // Registered atomically with the type — see extension-points/custom-property-fields.
      propertyFields: [
        { key: "fill", label: "Color", component: ColorField },
      ],
    });
  },
};
```

Registering `propertyFields` in the same call that defines the type (rather than in a separate follow-up plugin) is the pattern every shipped object-type plugin follows — it keeps a type and its editable fields atomic, with no installation-order dependency to get right.

## 3. Add a keyboard shortcut

```ts
install(engine) {
  engine.registry.registerObjectType(/* ... as above ... */);

  engine.shortcuts.register(
    "ctrl+shift+n",
    () => { void engine.addObjectOfType("sticky-note", {}); },
    "Add sticky note",
  );
},
```

## 4. Log when one is added (event middleware)

```ts
install(engine) {
  // ...

  engine.events.on("objects:changed", (objectIds) => {
    // real code would diff against the previous id list; this is illustrative
    console.log("objects changed, now:", objectIds.length);
  });
},
```

## 5. Install it

```ts
import { stickyNotePlugin } from "./stickyNotePlugin";

engine.use(stickyNotePlugin);
// or, alongside other plugins with dependency ordering:
engine.useAll([shapesBasicPlugin, stickyNotePlugin]);
```

```tsx
<Editor plugins={[shapesBasicPlugin, stickyNotePlugin]} />
```

## 6. (Optional) Typed object-type ids

```ts
declare module "@rifrocket/fdt-core" {
  interface ObjectTypeMap {
    "sticky-note": StickyNoteConfig;
  }
}
```

This gets `engine.addObjectOfType("sticky-note", ...)` autocomplete/typo-checking on the type id anywhere it's used, without `core` (or any other plugin) needing to know about `sticky-note` ahead of time — the same module-augmentation pattern `plugin-shapes-basic`, `plugin-image`, and `plugin-qrcode` each use in their own `objectTypeMap.ts`.

## What you didn't need

No file inside `packages/core` or `packages/react` needed to change. Every extension point used above — `registerObjectType`, `registerPropertyFields` (implicitly, via the same call), `engine.shortcuts.register`, `engine.events.on` — is the exact public API a first-party plugin uses. See [Extension Points](/docs/extension-points/custom-object-types) for the full reference on each seam, and [Plugins Overview](/docs/plugins/overview) for how the 13 official plugins are organized.
