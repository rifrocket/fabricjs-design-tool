import type { FabricObject } from "fabric";

interface CacheEntry {
  signature: string;
  bitmap: HTMLCanvasElement;
}

const caches = new WeakMap<FabricObject, CacheEntry>();

// Best-effort memoization for the raster track: re-rasterizing + re-filtering on every frame
// would make panning/selecting an effect-bearing object visibly slower than an unaffected one.
// rasterChain.ts is the only writer; it keys the signature on the raster instances' own props
// (so a slider drag always produces a fresh bitmap, which is the point of live preview) plus a
// one-off bypass whenever the object's own content changed since the last pass.
export function getCachedRasterBitmap(object: FabricObject, signature: string): HTMLCanvasElement | undefined {
  const entry = caches.get(object);
  return entry?.signature === signature ? entry.bitmap : undefined;
}

export function setCachedRasterBitmap(object: FabricObject, signature: string, bitmap: HTMLCanvasElement): void {
  caches.set(object, { signature, bitmap });
}
