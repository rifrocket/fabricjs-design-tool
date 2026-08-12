import type { SetZoomOptions } from "../viewportManager";

export interface ViewportApi {
  getZoom(): number;
  setZoom(value: number, options?: SetZoomOptions): void;
  zoomBy(delta: number, options?: SetZoomOptions): void;
  pan(deltaX: number, deltaY: number): void;
  panTo(x: number, y: number): void;
  getPan(): { x: number; y: number };
  resetViewport(): void;
  setDimensions(width: number, height: number): void;
}
