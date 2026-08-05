import type { FabricObject } from "fabric";

// FabricObject#toCanvasElement() (used by rasterize.ts) reparents the object onto a throwaway
// canvas and renders it through the same, real render() call this plugin has patched — without a
// guard, rasterizing an object that carries an effect stack would recurse back into the effects
// pipeline instead of getting the object's own plain appearance. installRenderPatch checks this
// guard before running the pipeline; rasterize.ts is the only caller that sets it.
const bypassed = new WeakSet<FabricObject>();

export function withOriginalRender<T>(object: FabricObject, fn: () => T): T {
  bypassed.add(object);
  try {
    return fn();
  } finally {
    bypassed.delete(object);
  }
}

export function isRenderBypassed(object: FabricObject): boolean {
  return bypassed.has(object);
}
