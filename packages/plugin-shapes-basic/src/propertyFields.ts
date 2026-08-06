import type { PropertyFieldDefinition } from "@rifrocket/fabricjs-design-tool";
import { ColorField, NumberField, SelectField, SliderField, TextField, ToggleField } from "@rifrocket/fdt-properties";

const field = (
  key: string,
  label: string,
  component: unknown,
  config?: PropertyFieldDefinition["config"],
  layout?: Pick<PropertyFieldDefinition, "section" | "span">,
): PropertyFieldDefinition => ({ key, label, component, config, ...layout });

const FONT_FAMILY_OPTIONS = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Courier New", "Verdana"].map(
  (value) => ({ label: value, value }),
);
const TEXT_ALIGN_OPTIONS = ["left", "center", "right", "justify"].map((value) => ({ label: value, value }));
const BOLD_OPTIONS = [
  { label: "Bold", value: "bold" },
  { label: "Normal", value: "normal" },
];
const ITALIC_OPTIONS = [
  { label: "Italic", value: "italic" },
  { label: "Normal", value: "normal" },
];

export const POSITION_FIELDS: PropertyFieldDefinition[] = [
  field("left", "X", NumberField, { step: 1 }, { section: "Position", span: "half" }),
  field("top", "Y", NumberField, { step: 1 }, { section: "Position", span: "half" }),
];

const FLIP_FIELDS: PropertyFieldDefinition[] = [
  field("flipX", "Flip horizontal", ToggleField, undefined, { section: "Transform", span: "half" }),
  field("flipY", "Flip vertical", ToggleField, undefined, { section: "Transform", span: "half" }),
];

export const OPACITY_ANGLE: PropertyFieldDefinition[] = [
  field("opacity", "Opacity", SliderField, { min: 0, max: 1, step: 0.01 }, { section: "Transform", span: "half" }),
  field("angle", "Rotation", SliderField, { min: 0, max: 360, step: 0.1 }, { section: "Transform", span: "half" }),
];

// Opacity/rotation, then flip — the "Transform" section shared by every shape that has a flip
// (everything filled and text; Line has neither fill nor flip and composes OPACITY_ANGLE alone).
export const TRANSFORM_FIELDS: PropertyFieldDefinition[] = [...OPACITY_ANGLE, ...FLIP_FIELDS];

// Fill/stroke/stroke-width — every *filled* shape (not Line, which has no fill).
export const APPEARANCE_FIELDS: PropertyFieldDefinition[] = [
  field("fill", "Fill", ColorField, undefined, { section: "Appearance", span: "half" }),
  field("stroke", "Stroke", ColorField, undefined, { section: "Appearance", span: "half" }),
  field("strokeWidth", "Stroke width", SliderField, { min: 0, max: 20, step: 0.1 }, { section: "Appearance" }),
];

// Fabric's Rect directly supports resizing via width/height (unlike Polygon, where those are
// read-only bounding-box values) — rx/ry on a Rect are corner radius, a separate section from
// its own Size since they're a distinct, optional refinement rather than the shape's dimensions.
export const RECT_SIZE_FIELDS: PropertyFieldDefinition[] = [
  field("width", "Width", NumberField, { step: 1 }, { section: "Size", span: "half" }),
  field("height", "Height", NumberField, { step: 1 }, { section: "Size", span: "half" }),
];

export const RECT_CORNER_FIELDS: PropertyFieldDefinition[] = [
  field("rx", "Corner radius X", SliderField, { min: 0, max: 300, step: 0.5 }, { section: "Corner radius", span: "half" }),
  field("ry", "Corner radius Y", SliderField, { min: 0, max: 300, step: 0.5 }, { section: "Corner radius", span: "half" }),
];

export const CIRCLE_FIELDS: PropertyFieldDefinition[] = [
  field("radius", "Radius", SliderField, { min: 0, max: 300, step: 0.5 }, { section: "Size" }),
];

// Ellipse's rx/ry are its own semi-axis radii — same property names as Rect's corner radius
// above, different meaning, but registered independently per type so there's no collision.
export const ELLIPSE_FIELDS: PropertyFieldDefinition[] = [
  field("rx", "Radius X", SliderField, { min: 0, max: 300, step: 0.5 }, { section: "Size", span: "half" }),
  field("ry", "Radius Y", SliderField, { min: 0, max: 300, step: 0.5 }, { section: "Size", span: "half" }),
];

// Polygon shapes (star, triangle, heart, ...) have no directly-settable width/height — resize
// only works through scaleX/scaleY.
export const POLYGON_SCALE_FIELDS: PropertyFieldDefinition[] = [
  field("scaleX", "Scale X", SliderField, { min: 0.1, max: 5, step: 0.05 }, { section: "Size", span: "half" }),
  field("scaleY", "Scale Y", SliderField, { min: 0.1, max: 5, step: 0.05 }, { section: "Size", span: "half" }),
];

export const LINE_FIELDS: PropertyFieldDefinition[] = [
  ...POSITION_FIELDS,
  field("stroke", "Stroke", ColorField, undefined, { section: "Appearance" }),
  field("strokeWidth", "Stroke width", SliderField, { min: 0, max: 20, step: 0.1 }, { section: "Appearance" }),
  ...OPACITY_ANGLE,
];

export const TEXT_FIELDS: PropertyFieldDefinition[] = [
  field("text", "Text", TextField, undefined, { section: "Content" }),
  ...POSITION_FIELDS,
  field("fill", "Color", ColorField, undefined, { section: "Appearance" }),
  field("fontSize", "Font size", SliderField, { min: 8, max: 160, step: 0.5 }, { section: "Typography" }),
  field("fontFamily", "Font family", SelectField, { options: FONT_FAMILY_OPTIONS }, { section: "Typography" }),
  field("textAlign", "Align", SelectField, { options: TEXT_ALIGN_OPTIONS }, { section: "Typography" }),
  field("fontWeight", "Bold", ToggleField, { options: BOLD_OPTIONS }, { section: "Typography", span: "half" }),
  field("fontStyle", "Italic", ToggleField, { options: ITALIC_OPTIONS }, { section: "Typography", span: "half" }),
  field("underline", "Underline", ToggleField, undefined, { section: "Typography" }),
  field("lineHeight", "Line height", SliderField, { min: 0.5, max: 3, step: 0.05 }, { section: "Typography", span: "half" }),
  field("charSpacing", "Letter spacing", SliderField, { min: -50, max: 800, step: 5 }, { section: "Typography", span: "half" }),
  ...TRANSFORM_FIELDS,
];
