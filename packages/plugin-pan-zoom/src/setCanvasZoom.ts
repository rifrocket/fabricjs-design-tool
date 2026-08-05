import type { CanvasEngine } from "@rifrocket/fdt-core";

export interface ZoomCenter {
  x: number;
  y: number;
}

// Forces resizeElement:false since the canvas element here is a fixed-size viewport, not a
// document-sized element — content scales within it via viewportTransform instead. `center`
// (screen pixel space, e.g. a wheel event's viewportPoint) keeps that point fixed while
// zooming; callers omitting it anchor at the top-left and should follow up with
// centerContent() to avoid drifting content out of view.
export function setCanvasZoom(engine: CanvasEngine, zoom: number, center?: ZoomCenter): number {
  engine.setZoom(zoom, { resizeElement: false, center });
  return engine.viewport.getZoom();
}
