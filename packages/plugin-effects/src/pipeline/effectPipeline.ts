import type { FabricObject } from "fabric";
import type { EffectInstance, EffectRegistry, EffectRenderContext } from "@rifrocket/fabricjs-design-tool";
import { buildRasterChain } from "./rasterChain";
import { rasterMultiplier } from "./rasterize";

// Runs one already-enabled effect stack for a single render pass: wrapRender hooks compose
// outermost-first (first entry in the stack wraps everything after it), then behind passes in
// stack order, then either the composed raster bitmap or the object's own plain render, then
// front passes in stack order. Called only from the patched render() (installRenderPatch.ts).
export function runEffectPipeline(
  object: FabricObject,
  ctx: CanvasRenderingContext2D,
  stack: EffectInstance[],
  registry: EffectRegistry,
  originalRender: (ctx: CanvasRenderingContext2D) => void,
): void {
  const rc: EffectRenderContext = { originalRender };

  const base = () => runBasePasses(object, ctx, stack, registry, rc, originalRender);
  const wrapped = stack.reduceRight<() => void>((next, instance) => {
    const definition = registry.get(instance.effectId);
    const wrapRender = definition?.wrapRender;
    if (!wrapRender) return next;
    return () => wrapRender(object, ctx, instance.props, next);
  }, base);

  wrapped();
}

function runBasePasses(
  object: FabricObject,
  ctx: CanvasRenderingContext2D,
  stack: EffectInstance[],
  registry: EffectRegistry,
  rc: EffectRenderContext,
  originalRender: (ctx: CanvasRenderingContext2D) => void,
): void {
  let ranRenderBehind = false;
  for (const instance of stack) {
    const definition = registry.get(instance.effectId);
    if (definition?.track === "compositing" && definition.renderBehind) {
      definition.renderBehind(object, ctx, instance.props, rc);
      ranRenderBehind = true;
    }
  }

  const rasterInstances = stack.filter((instance) => registry.get(instance.effectId)?.track === "raster");
  if (rasterInstances.length > 0) {
    if (ranRenderBehind) {
      // rasterizeObjectLocal (via buildRasterChain -> toCanvasElement) re-enters the object's own
      // *real* render() on a throwaway canvas — which, like the base pass above, will happily
      // reuse Fabric's own object-level cache if dirty is false. A renderBehind pass just above
      // (e.g. Shadow's silhouette) force-dirtied + redrew that same cache with its swapped-color
      // appearance, per silhouettePass.ts, and left it marked clean — so without re-dirtying here
      // first, this raster effect would rasterize that leftover silhouette instead of the
      // object's real appearance. Only needed when a renderBehind pass actually ran, so the
      // common case (a raster effect on its own) keeps the raster bitmap cache's memoization.
      object.dirty = true;
    }
    const bitmap = buildRasterChain(object, rasterInstances, (id) => registry.get(id));
    if (bitmap) {
      // drawImage() replaces the object's own _render() call here, so it needs the same
      // position/rotation/scale/opacity/shadow setup that FabricObject.prototype.render() would
      // otherwise apply before _render() — without it the bitmap draws at the ctx's ambient
      // (untransformed) origin instead of the object's actual place on the canvas.
      ctx.save();
      object._setupCompositeOperation(ctx);
      object.transform(ctx);
      object._setOpacity(ctx);
      object._setShadow(ctx);
      // bitmap was rasterized at rasterMultiplier(object) extra density (rasterize.ts) so it
      // doesn't look blocky once stretched to the object's actual on-screen size — ctx's own
      // transform above already accounts for that size (object scale + canvas zoom), so drawing
      // at the bitmap's raw pixel dimensions here would draw it that much too big. Dividing back
      // out by the same multiplier restores the object's real local width/height, letting the
      // canvas downsample the supersampled bitmap into it instead.
      const scale = rasterMultiplier(object);
      const width = bitmap.width / scale;
      const height = bitmap.height / scale;
      ctx.drawImage(bitmap, -width / 2, -height / 2, width, height);
      ctx.restore();
    } else {
      // A renderBehind pass above (e.g. Shadow/Glow's silhouette) may have swapped the object's
      // fill/stroke and, per silhouettePass.ts, force-dirtied + redrawn it — which leaves
      // Fabric's own object cache holding that swapped-color appearance, marked clean. Force a
      // fresh draw here so this, the object's *real* appearance, doesn't just reuse that cache.
      object.dirty = true;
      originalRender(ctx);
    }
  } else {
    object.dirty = true;
    originalRender(ctx);
  }

  for (const instance of stack) {
    const definition = registry.get(instance.effectId);
    if (definition?.track === "compositing" && definition.renderFront) {
      definition.renderFront(object, ctx, instance.props, rc);
    }
  }
}
