import { Rect, Shadow } from "fabric";
import type { FabricObject } from "fabric";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";

// Marks the Fabric object that represents a document's own bounds/background at
// (0,0)-(width,height) in doc space — needed whenever the canvas element is a fixed-size
// viewport rather than being resized to match the document (see usePannableDocument.ts).
const PAGE_BOUNDARY_KEY = "isPageBoundary";

export function createPageBoundaryRect(options: { width: number; height: number; backgroundColor?: string }): FabricObject {
  const rect = new Rect({
    left: 0,
    top: 0,
    width: options.width,
    height: options.height,
    fill: options.backgroundColor ?? "#ffffff",
    selectable: false,
    evented: false,
    hasControls: false,
    hoverCursor: "default",
    shadow: new Shadow({ color: "rgba(15, 23, 42, 0.25)", blur: 16, offsetX: 0, offsetY: 4 }),
  });
  rect.set(PAGE_BOUNDARY_KEY, true);
  return rect;
}

// Known limitation: this rect is a real canvas object (not excludeFromExport), so it shows up in
// the Layers panel and JSON export — setting excludeFromExport would also drop it from PNG/SVG
// export, losing the page background there entirely, which is worse.
export function findPageBoundary(engine: CanvasEngine): FabricObject | undefined {
  return engine.layers.getObjects().find((object) => (object as unknown as Record<string, unknown>)[PAGE_BOUNDARY_KEY] === true);
}
