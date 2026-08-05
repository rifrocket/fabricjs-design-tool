import { Point } from "fabric";
import type { Canvas } from "fabric";

const MIN_ZOOM = 0.01;
const MAX_ZOOM = 20;

export interface SetZoomOptions {
  center?: { x: number; y: number };
  // Fabric's zoom APIs only scale content within the canvas element's existing fixed pixel
  // size, clipping zoomed-in content and leaving zoomed-out content in a mostly-empty box.
  // Resizing the element in lock-step with zoom (via the public setDimensions() API) is the
  // fix consumers otherwise have to discover and wire up themselves — default it on.
  resizeElement?: boolean;
}

// Zoom/pan for a live canvas. Replaces the two conflicting v1 pan implementations.
export class ViewportManager {
  private baseWidth: number;
  private baseHeight: number;

  constructor(private readonly canvas: Canvas) {
    this.baseWidth = canvas.getWidth();
    this.baseHeight = canvas.getHeight();
  }

  getZoom(): number {
    return this.canvas.getZoom();
  }

  /**
   * @internal Prefer `CanvasEngine.setZoom()` — this raw method mutates the canvas but does not
   * sync `EngineState.zoom`, so anything subscribed to the store (React re-renders, `<Editor>`'s
   * zoom UI) won't see the change. Kept public only because `CanvasEngine` itself calls it.
   */
  setZoom(value: number, options: SetZoomOptions = {}): void {
    const { center, resizeElement = true } = options;
    const clamped = Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM);
    if (center) {
      this.canvas.zoomToPoint(new Point(center.x, center.y), clamped);
    } else {
      this.canvas.setZoom(clamped);
    }
    if (resizeElement) {
      this.canvas.setDimensions({ width: this.baseWidth * clamped, height: this.baseHeight * clamped });
    }
    this.canvas.requestRenderAll();
  }

  /** @internal Prefer `CanvasEngine.zoomBy()` — see `setZoom()`'s doc comment above. */
  zoomBy(delta: number, options?: SetZoomOptions): void {
    this.setZoom(this.getZoom() + delta, options);
  }

  /** @internal Prefer `CanvasEngine.pan()` — see `setZoom()`'s doc comment above. */
  pan(deltaX: number, deltaY: number): void {
    this.canvas.relativePan(new Point(deltaX, deltaY));
    this.canvas.requestRenderAll();
  }

  /** @internal Prefer `CanvasEngine.panTo()` — see `setZoom()`'s doc comment above. */
  panTo(x: number, y: number): void {
    this.canvas.absolutePan(new Point(x, y));
    this.canvas.requestRenderAll();
  }

  getPan(): { x: number; y: number } {
    const vpt = this.canvas.viewportTransform;
    return { x: vpt[4], y: vpt[5] };
  }

  /** @internal Prefer `CanvasEngine.reset()` — see `setZoom()`'s doc comment above. */
  reset(): void {
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.canvas.setDimensions({ width: this.baseWidth, height: this.baseHeight });
    this.canvas.requestRenderAll();
  }

  // Updates the 100%-zoom size (e.g. when a consumer resizes <Editor>) and immediately
  // re-applies the current zoom level against the new base so the element stays in sync.
  setBaseSize(width: number, height: number): void {
    this.baseWidth = width;
    this.baseHeight = height;
    this.canvas.setDimensions({ width: width * this.getZoom(), height: height * this.getZoom() });
    this.canvas.requestRenderAll();
  }
}
