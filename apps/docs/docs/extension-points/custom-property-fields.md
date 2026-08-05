---
sidebar_position: 4
title: Custom Property Fields
---

# Custom Property Fields

`PropertiesPanel` (from `@rifrocket/fdt-react`) renders nothing for an object type until that type has `propertyFields` — a list of field definitions describing what's editable and which component renders each one.

```ts
interface PropertyFieldDefinition {
  key: string;
  label?: string;
  component?: unknown; // a React component type
  config?: { min?: number; max?: number; step?: number; options?: { label: string; value: unknown }[] };
  section?: string;     // groups consecutive fields under one heading
  span?: "half" | "full";
}
```

Every field component receives the same three props:

```ts
interface PropertyFieldProps {
  object: FabricObject;
  field: PropertyFieldDefinition;
  onChange: (value: unknown) => void;
}
```

## The preferred pattern: register fields with the type

The highest-leverage way to add fields is in the **same `registerObjectType()` call** that defines the type, using `@rifrocket/fdt-properties`'s shared field components:

```ts
import { SliderField, ColorField, ToggleField } from "@rifrocket/fdt-properties";

engine.registry.registerObjectType("sticky-note", {
  create: (config) => new Rect({ ...config, fill: config.fill ?? "#fef08a" }),
  propertyFields: [
    { key: "fill", label: "Color", component: ColorField },
    { key: "opacity", label: "Opacity", component: SliderField, config: { min: 0, max: 1, step: 0.01 } },
    { key: "locked", label: "Locked", component: ToggleField },
  ],
});
```

This keeps a type and its editable fields atomic — there's no "must install a separate fields plugin after this one" ordering to get right, and every shipped object-type plugin (`shapes-basic`, `image`, `qrcode`) follows this same pattern.

## The escape hatch: fields for a type you don't own

If you're adding fields to a type registered by a *different* plugin, use `registerPropertyFields` — this is the residual, genuinely cross-plugin case:

```ts
const brandFieldsPlugin: EditorPlugin = {
  name: "brand-fields",
  dependsOn: ["shapes-basic"], // must install after the type it's adding fields to
  install(engine) {
    engine.registry.registerPropertyFields("rect", [{ key: "brandVoice", label: "Tone", component: SelectField }]);
  },
};
```

`registerPropertyFields()` **appends** to a type's existing fields (or throws if the type isn't registered yet) — it's additive sugar over the same `propertyFields` array `registerObjectType()` accepts directly, not a separate mechanism.

## Shared field components (`@rifrocket/fdt-properties`)

`SliderField`, `NumberField`, `ColorField`, `ToggleField`, `SelectField`, `TextField` — bare, unstyled-beyond-tokens components that every shipped plugin's `propertyFields` reuse, so you don't need to hand-roll a "read `object.get(key)`, call `onChange` on edit" component for common field kinds.

```ts
import { SliderField, NumberField, ColorField, ToggleField, SelectField, TextField } from "@rifrocket/fdt-properties";
```

## Layout: sections and half-width fields

```ts
propertyFields: [
  { key: "left", label: "X", component: NumberField, section: "Position", span: "half" },
  { key: "top", label: "Y", component: NumberField, section: "Position", span: "half" },
  { key: "fill", label: "Fill", component: ColorField, section: "Appearance" },
]
```

`section` groups consecutive fields under one heading (rendered once, before the first field of a new section). `span: "half"` lets two consecutive fields *in the same section* pair up into a 2-column row instead of each taking a full-width row — a field with neither `section` nor `span` renders exactly as a standalone full-width row.
