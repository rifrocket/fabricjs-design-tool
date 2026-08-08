import { Rect, Shadow } from "fabric";
import type { FabricObject } from "fabric";
import { captureSnapshot } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine, DocumentSnapshotData } from "@rifrocket/fabricjs-design-tool";

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

// This rect is a real canvas object, deliberately not excludeFromExport permanently — setting
// that would also drop it from PNG/SVG/PDF export, losing the page background there entirely,
// which is worse than the alternative. Its JSON-export leak (showing up as ordinary content in
// captureSnapshot()/exportFile("json")) is instead handled by captureSnapshotExcludingBoundary()
// below, which toggles excludeFromExport just around a single synchronous capture call.
export function findPageBoundary(engine: CanvasEngine): FabricObject | undefined {
  return engine.layers.getObjects().find((object) => (object as unknown as Record<string, unknown>)[PAGE_BOUNDARY_KEY] === true);
}

// Captures a document snapshot the same way core's captureSnapshot() does, but excludes the page
// boundary rect from the resulting JSON — without this, every JSON export/autosave/duplicate
// permanently bakes in one extra stale rect per capture (it round-trips back in as ordinary
// content, since isPageBoundary doesn't survive serialization on its own). The rect's real,
// visible PNG/SVG/PDF export behavior is untouched: excludeFromExport is only ever set for the
// duration of this synchronous call, then restored. Safe to call even if no boundary rect exists
// yet (e.g. before usePannableDocument's first render) — falls through to a plain
// captureSnapshot().
export function captureSnapshotExcludingBoundary(engine: CanvasEngine): DocumentSnapshotData {
  const boundary = findPageBoundary(engine);
  const previousExcludeFromExport = boundary?.excludeFromExport;
  if (boundary) boundary.excludeFromExport = true;
  try {
    return captureSnapshot(engine);
  } finally {
    if (boundary) boundary.excludeFromExport = previousExcludeFromExport ?? false;
  }
}
