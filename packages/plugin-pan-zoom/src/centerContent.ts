import type { CanvasEngine } from "@rifrocket/fdt-core";

export function getContainerSize(selector: string): { width: number; height: number } | null {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return null;
  return { width: container.clientWidth, height: container.clientHeight };
}

// Centers a contentWidth x contentHeight document (at the engine's current zoom) within the
// viewport found at containerSelector, by panning so the content's midpoint lands on the
// viewport's midpoint. Needed because a fixed-size canvas viewport no longer auto-centers via
// CSS the way a content-sized element used to, so callers must re-center explicitly after
// zoom/resize. engine.panTo(x, y) sets viewportTransform[4]=-x (Fabric's absolutePan
// semantics), hence the negation below.
export function centerContent(
  engine: CanvasEngine,
  contentWidth: number,
  contentHeight: number,
  containerSelector: string,
): void {
  const container = getContainerSize(containerSelector);
  if (!container) return;
  const zoom = engine.viewport.getZoom();
  const panX = (container.width - contentWidth * zoom) / 2;
  const panY = (container.height - contentHeight * zoom) / 2;
  engine.panTo(-panX, -panY);
}
