import type { EffectDefinition } from "@rifrocket/fdt-core";
import * as basic from "./basic";
import * as creative from "./creative";
import * as text from "./text";
import * as image from "./image";

export * from "./basic";
export * from "./creative";
export * from "./text";
export * from "./image";

export const BASIC_EFFECTS: EffectDefinition[] = [
  basic.shadowEffect,
  basic.glowEffect,
  basic.innerShadowEffect,
  basic.outlineEffect,
  basic.blurEffect,
  basic.opacityEffect,
] as unknown as EffectDefinition[];

export const CREATIVE_EFFECTS: EffectDefinition[] = [
  creative.echoEffect,
  creative.glitchEffect,
  creative.neonEffect,
  creative.duotoneEffect,
  creative.pixelateEffect,
  creative.noiseEffect,
  creative.vintageEffect,
  creative.retroEffect,
] as unknown as EffectDefinition[];

// Text also applies Shadow/Outline/Neon from basic/creative (the silhouette technique is generic
// across any object's own render, including Text) — those are registered once via BASIC_EFFECTS/
// CREATIVE_EFFECTS above rather than redefined here under a "text" category.
export const TEXT_EFFECTS: EffectDefinition[] = [text.gradientFillEffect, text.multiLayerShadowEffect] as unknown as EffectDefinition[];

export const IMAGE_EFFECTS: EffectDefinition[] = [
  image.brightnessEffect,
  image.contrastEffect,
  image.saturationEffect,
  image.hueEffect,
  image.vignetteEffect,
  image.sepiaEffect,
] as unknown as EffectDefinition[];

export const ALL_BUILTIN_EFFECTS: EffectDefinition[] = [
  ...BASIC_EFFECTS,
  ...CREATIVE_EFFECTS,
  ...TEXT_EFFECTS,
  ...IMAGE_EFFECTS,
];
