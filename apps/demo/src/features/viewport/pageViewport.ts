import { Rect, Shadow } from "fabric";
import type { FabricObject } from "fabric";
import { captureSnapshot } from "@rifrocket/fdt-core";
import type { CanvasEngine, DocumentSnapshotData } from "@rifrocket/fdt-core";

// Marks the Fabric object that represents the page's own bounds/background at (0,0)-(width,height)
// in doc space, needed since the canvas element is now a fixed-size viewport rather than being
// resized to match the page. Stays demo-local since "a page is a rect with this marker property"
// is a provisional stand-in for a still-deferred page/document model, not a settled design.
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

// A plain captureSnapshot() would serialize the boundary rect as ordinary content, since
// isPageBoundary doesn't survive the round trip — left unhandled, that leaks one extra stale
// rect per reload. Toggling excludeFromExport just around this synchronous call keeps it out of
// the saved JSON without changing its real export behavior (see findPageBoundary's note above).
export function captureDesignSnapshot(engine: CanvasEngine): DocumentSnapshotData {
  const boundary = findPageBoundary(engine);
  const previous = boundary?.excludeFromExport;
  if (boundary) boundary.excludeFromExport = true;
  try {
    return captureSnapshot(engine);
  } finally {
    if (boundary) boundary.excludeFromExport = previous ?? false;
  }
}
