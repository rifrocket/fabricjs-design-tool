import { loadSVGFromString, util } from "fabric";
import type { Canvas, FabricObject } from "fabric";

// Requires a real browser: SVG parsing goes through the DOM (DOMParser), same constraint
// as fabric.Text and fabric.Canvas noted elsewhere in core.
export async function importSVG(canvas: Canvas, svgString: string): Promise<FabricObject> {
  const { objects, options } = await loadSVGFromString(svgString);
  const validObjects = objects.filter((object): object is FabricObject => object !== null);
  const result = util.groupSVGElements(validObjects, options);
  canvas.add(result);
  canvas.requestRenderAll();
  return result;
}
