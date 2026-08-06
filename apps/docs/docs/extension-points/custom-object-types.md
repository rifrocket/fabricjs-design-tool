---
sidebar_position: 1
title: Custom Object Types
---

# Custom Object Types

`ObjectTypeRegistry` is how every shape, image, and QR code in this framework is defined — including the built-in ones. There's no closed, editable-only-by-editing-the-library factory class; registering a new type is a plugin `install()` call away.

```ts
interface ObjectTypeDefinition<TConfig = unknown> {
  create(config: TConfig): FabricObject | Promise<FabricObject>;
  propertyFields?: PropertyFieldDefinition[];
}
```

## Registering a type

```ts
import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { Rect } from "fabric";

interface StickyNoteConfig {
  left?: number;
  top?: number;
  text?: string;
}

const stickyNotePlugin: EditorPlugin = {
  name: "sticky-note",
  install(engine) {
    engine.registry.registerObjectType<StickyNoteConfig>("sticky-note", {
      create: (config) => {
        const rect = new Rect({ left: config.left ?? 0, top: config.top ?? 0, width: 160, height: 160, fill: "#fef08a" });
        return rect;
      },
    });
  },
};

engine.use(stickyNotePlugin);
const note = await engine.addObjectOfType("sticky-note", { left: 50, top: 50 });
```

`create()` is always `async`-compatible — the registry always awaits it, whether or not your implementation actually needs to (real types often do: QR codes generate asynchronously, images decode a URL, SVG import parses a document).

## Registering + adding, without history

```ts
// Adds through the history-tracked path (undoable):
await engine.addObjectOfType("sticky-note", { left: 50, top: 50 });

// Creates without adding to the canvas or history — useful if you need to inspect/modify
// the object before it becomes part of the document:
const note = await engine.createObject("sticky-note", { left: 50, top: 50 });
```

## Duplicate registration and replacement

```ts
engine.registry.objectTypes.register("rect", { create: ... }); // throws: "rect" is already registered
engine.registry.objectTypes.replace("rect", { create: ... });  // atomic unregister+register, no throw
engine.registry.objectTypes.has("rect");   // boolean
engine.registry.objectTypes.list();        // string[] of every registered type id
engine.registry.objectTypes.unregister("rect");
```

## Adding property fields to a type you don't own

If you're building a plugin that adds fields to a type *another* plugin registers (rather than defining the type yourself), use `registerPropertyFields` and declare `dependsOn` so `useAll()` installs your plugin after the type exists:

```ts
const brandFieldsPlugin: EditorPlugin = {
  name: "brand-fields",
  dependsOn: ["shapes-basic"],
  install(engine) {
    engine.registry.registerPropertyFields("rect", [{ key: "brandVoice", label: "Tone", component: SelectField }]);
  },
};
```

See [Custom Property Fields](/docs/extension-points/custom-property-fields) for the field-definition shape in full, and [Writing a Plugin](/docs/guides/writing-a-plugin) for an end-to-end walkthrough that registers both a type and its fields together (the preferred pattern for a type you own).

## Typed object-type ids

`ObjectTypeId` is `keyof ObjectTypeMap | (string & {})` — an open interface any plugin can augment via TypeScript's module-augmentation pattern to get autocomplete/typo-checking on its own type ids, without core or any other plugin needing to know about them ahead of time:

```ts
declare module "@rifrocket/fabricjs-design-tool" {
  interface ObjectTypeMap {
    "sticky-note": StickyNoteConfig;
  }
}
```

Several shipped plugins (`shapes-basic`, `image`, `qrcode`) do exactly this in their own `objectTypeMap.ts` file — check one of those for a complete example.
