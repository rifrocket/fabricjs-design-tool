// Fabric objects already expose `globalCompositeOperation` natively, so setting a blend
// mode is just `engine.setObjectProperty(object, "globalCompositeOperation", mode)` — this
// module only supplies the valid values (e.g. for a property-field dropdown) and a guard.
export const BLEND_MODES = [
  "source-over",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

export type BlendMode = (typeof BLEND_MODES)[number];

export function isBlendMode(value: unknown): value is BlendMode {
  return typeof value === "string" && (BLEND_MODES as readonly string[]).includes(value);
}
