import type { FabricObject } from "fabric";
import { withOriginalRender } from "./renderGuard";

// Rasterizes an object to a bitmap in its own untransformed local pixel space, using Fabric's
// own public toCanvasElement() primitive (the same one cloneAsImage() uses internally) — the
// caller draws the result back with ctx.drawImage while the surrounding context already carries
// the object's position/rotation/scale (set up by Fabric's own render()), so no manual matrix
// math is needed here. toCanvasElement() re-enters render() on a throwaway canvas internally,
// which is why this goes through the render-bypass guard — see renderGuard.ts.
export function rasterizeObjectLocal(object: FabricObject): HTMLCanvasElement {
  return withOriginalRender(object, () =>
    object.toCanvasElement({ withoutTransform: true, enableRetinaScaling: false }),
  );
}
