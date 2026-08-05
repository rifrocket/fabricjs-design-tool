import type { FabricObject } from "fabric";

// Property name a stack of effects is stored under on any FabricObject — see effectStack.ts.
export const EFFECTS_PROPERTY = "fdtEffects";

export type EffectCategory = "basic" | "creative" | "text" | "image";

// "compositing": additional canvas-2D draw passes around the object's own render (shadow, glow,
// outline, echo, glitch, gradient fill...). "raster": rasterizes the object once and runs pixel
// manipulation over the bitmap (blur, duotone, pixelate, color adjustments...) — see
// @rifrocket/fdt-plugin-effects/pipeline for the two render tracks this drives.
export type EffectRenderTrack = "compositing" | "raster";

export type EffectPropSchemaField =
  | { key: string; kind: "slider"; label: string; min: number; max: number; step?: number; unit?: string }
  | { key: string; kind: "color"; label: string }
  | { key: string; kind: "angle"; label: string }
  | { key: string; kind: "select"; label: string; options: { label: string; value: string }[] };

export interface EffectRenderContext {
  // The object's own un-patched render routine, bound so an effect can draw the object's normal
  // appearance as one of its passes without recursing into the effects pipeline.
  originalRender: (ctx: CanvasRenderingContext2D) => void;
}

// Constrained to `object` rather than `Record<string, unknown>` — a plain interface (as every
// built-in effect's own PropsXxx type is) doesn't structurally satisfy an index-signature
// constraint in TypeScript without redeclaring one, even though it's perfectly assignable in
// practice; `object` accepts any concrete props shape without that friction.
export interface EffectDefinition<TProps extends object = Record<string, unknown>> {
  id: string;
  category: EffectCategory;
  label: string;
  track: EffectRenderTrack;
  schema: EffectPropSchemaField[];
  defaults: TProps;
  // true => this effect has no SVG equivalent and is omitted from canvas.toSVG() output.
  svgLimited?: boolean;
  renderBehind?(object: FabricObject, ctx: CanvasRenderingContext2D, props: TProps, rc: EffectRenderContext): void;
  renderFront?(object: FabricObject, ctx: CanvasRenderingContext2D, props: TProps, rc: EffectRenderContext): void;
  wrapRender?(object: FabricObject, ctx: CanvasRenderingContext2D, props: TProps, next: () => void): void;
  // Mutates the rasterized bitmap in place, or returns a replacement canvas.
  applyRaster?(canvasEl: HTMLCanvasElement, props: TProps): void | HTMLCanvasElement;
}

export interface EffectInstance<TProps extends object = Record<string, unknown>> {
  // Unique within one object's stack — distinct from the object's own id and from effectId, so
  // the same effect type can be applied more than once (e.g. two stacked Shadows).
  instanceId: string;
  effectId: string;
  enabled: boolean;
  props: TProps;
}

// Stored on object.fdtEffects. Paint order follows array order: index 0 is farthest back among
// "behind" passes and farthest back among "front" passes; the last entry is topmost.
export type EffectStack = EffectInstance[];
