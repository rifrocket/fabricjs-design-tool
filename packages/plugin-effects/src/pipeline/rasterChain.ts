import type { FabricObject } from "fabric";
import type { EffectDefinition, EffectInstance } from "@rifrocket/fabricjs-design-tool";
import { rasterizeObjectLocal } from "./rasterize";
import { getCachedRasterBitmap, setCachedRasterBitmap } from "./rasterCache";

export type EffectLookup = (effectId: string) => EffectDefinition | undefined;

// Composes every raster-track instance in a stack into ONE rasterize pass + filter chain rather
// than rasterizing once per effect — rasterization plus pixel read/write is the expensive part,
// so stacking N raster effects costs roughly the same as one. Each instance's own
// EffectDefinition.applyRaster owns its filter/pixel-op specifics; this stays generic over which
// effects are present.
export function buildRasterChain(
  object: FabricObject,
  instances: EffectInstance[],
  lookup: EffectLookup,
): HTMLCanvasElement | undefined {
  if (instances.length === 0) return undefined;

  const signature = JSON.stringify(instances.map((instance) => [instance.instanceId, instance.props]));
  const forceRefresh = object.dirty === true;
  if (!forceRefresh) {
    const cached = getCachedRasterBitmap(object, signature);
    if (cached) return cached;
  }

  let bitmap = rasterizeObjectLocal(object);
  for (const instance of instances) {
    const definition = lookup(instance.effectId);
    if (!definition?.applyRaster) continue;
    const result = definition.applyRaster(bitmap, instance.props);
    if (result) bitmap = result;
  }

  object.dirty = false;
  setCachedRasterBitmap(object, signature, bitmap);
  return bitmap;
}
