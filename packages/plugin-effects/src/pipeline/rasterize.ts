import type { FabricObject } from "fabric";
import { withOriginalRender } from "./renderGuard";

const MIN_RASTER_MULTIPLIER = 1;
const MAX_RASTER_MULTIPLIER = 4;
const RASTER_MULTIPLIER_STEP = 0.5;

// How much sharper than the object's own local pixel grid the raster bitmap needs to be so it
// doesn't look soft/blocky once drawn back. withoutTransform (below) rasterizes at 1 bitmap px
// per local unit regardless of how much bigger the object ends up on screen — getTotalObjectScaling
// (object scale * canvas zoom * canvas retina scaling) is exactly that "how much bigger" figure;
// it's the same one Fabric's own object-cache canvas sizing (_getCacheCanvasDimensions) uses to
// avoid the identical problem for its cached vector renders. Screen devicePixelRatio is folded in
// on top since it isn't part of a canvas's own zoom. Stepped and clamped so ordinary interactions
// (a slow zoom drag, a corner-handle nudge) don't thrash the raster cache (rasterCache.ts) on
// every frame, and so an extreme zoom-in can't demand an absurdly large rasterize canvas.
export function rasterMultiplier(object: FabricObject): number {
  const { x, y } = object.getTotalObjectScaling();
  const devicePixelRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const raw = Math.max(x, y) * devicePixelRatio;
  const stepped = Math.round(raw / RASTER_MULTIPLIER_STEP) * RASTER_MULTIPLIER_STEP;
  return Math.min(MAX_RASTER_MULTIPLIER, Math.max(MIN_RASTER_MULTIPLIER, stepped));
}

// Rasterizes an object to a bitmap in its own untransformed local pixel space, using Fabric's
// own public toCanvasElement() primitive (the same one cloneAsImage() uses internally) — the
// caller draws the result back with ctx.drawImage while the surrounding context already carries
// the object's position/rotation/scale (set up by Fabric's own render()), so no manual matrix
// math is needed here. toCanvasElement() re-enters render() on a throwaway canvas internally,
// which is why this goes through the render-bypass guard — see renderGuard.ts. multiplier
// supersamples that bitmap (see rasterMultiplier above) so it stays crisp instead of blocky once
// drawn back at the object's actual on-screen size; effectPipeline.ts divides back out by the
// same multiplier when compositing.
export function rasterizeObjectLocal(object: FabricObject): HTMLCanvasElement {
  return withOriginalRender(object, () =>
    object.toCanvasElement({ withoutTransform: true, enableRetinaScaling: false, multiplier: rasterMultiplier(object) }),
  );
}
