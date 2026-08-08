import type { PropertyFieldDefinition } from "@rifrocket/fabricjs-design-tool";
import { BLEND_MODES } from "@rifrocket/fabricjs-design-tool";
import { NumberField, SelectField, SliderField } from "@rifrocket/fdt-properties";

const field = (
  key: string,
  label: string,
  component: unknown,
  config?: PropertyFieldDefinition["config"],
  layout?: Pick<PropertyFieldDefinition, "section" | "span">,
): PropertyFieldDefinition => ({ key, label, component, config, ...layout });

const BLEND_MODE_OPTIONS = BLEND_MODES.map((mode) => ({ label: mode, value: mode }));

// Shared by every media-like object type (image, qrcode) — previously duplicated byte-for-byte
// in each plugin's own package (neither packages/core, framework-agnostic, nor
// packages/properties, scoped to bare type-agnostic field components rather than curated
// per-object-type field sets, was the right home for either copy). Extracted here instead: a
// small, install()-less data package both plugins depend on, same shape as
// @rifrocket/fdt-properties itself but scoped to this one specific field set rather than
// individual bare components.
export const MEDIA_FIELDS: PropertyFieldDefinition[] = [
  field("left", "X", NumberField, { step: 1 }, { section: "Position", span: "half" }),
  field("top", "Y", NumberField, { step: 1 }, { section: "Position", span: "half" }),
  field("globalCompositeOperation", "Blend mode", SelectField, { options: BLEND_MODE_OPTIONS }, { section: "Appearance" }),
  field("opacity", "Opacity", SliderField, { min: 0, max: 1, step: 0.01 }, { section: "Transform", span: "half" }),
  field("angle", "Rotation", SliderField, { min: 0, max: 360, step: 0.1 }, { section: "Transform", span: "half" }),
];
