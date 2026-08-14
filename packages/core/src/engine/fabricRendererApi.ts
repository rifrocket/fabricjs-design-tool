import type { Canvas, FabricObject } from "fabric";
import type { RendererApi } from "./rendererApi";
import type { ViewportManager } from "./viewportManager";
import type { SetZoomOptions } from "./viewportManager";
import type { SelectionManager } from "./selectionManager";

// Thin adapter over the Canvas/ViewportManager/SelectionManager instances CanvasEngine already
// constructs — NOT a rewrite of those managers, which keep their current Canvas-typed
// constructors unchanged (FUTURE_IMPLEMENTATION.md Chunk 2.2). AlignmentManager/SnapEngine stay
// outside RendererApi entirely: editing-assist features, not core scene operations a second
// renderer needs to exist.
export class FabricRendererApi implements RendererApi<FabricObject> {
  readonly kind = "fabric";

  private destroyed = false;

  constructor(
    private readonly canvas: Canvas,
    private readonly viewport: ViewportManager,
    private readonly selection: SelectionManager,
  ) {}

  addNode(node: FabricObject): void {
    this.canvas.add(node);
  }

  removeNode(node: FabricObject): void {
    this.canvas.remove(node);
  }

  getNodes(): FabricObject[] {
    return this.canvas.getObjects();
  }

  requestRender(): void {
    this.canvas.requestRenderAll();
  }

  setActiveNode(node: FabricObject): void {
    this.selection.select(node);
  }

  getActiveNodes(): FabricObject[] {
    return this.selection.getActiveObjects();
  }

  clearSelection(): void {
    this.selection.clear();
  }

  getZoom(): number {
    return this.viewport.getZoom();
  }

  setZoom(value: number, options?: SetZoomOptions): void {
    this.viewport.setZoom(value, options);
  }

  zoomBy(delta: number, options?: SetZoomOptions): void {
    this.viewport.zoomBy(delta, options);
  }

  pan(deltaX: number, deltaY: number): void {
    this.viewport.pan(deltaX, deltaY);
  }

  panTo(x: number, y: number): void {
    this.viewport.panTo(x, y);
  }

  getPan(): { x: number; y: number } {
    return this.viewport.getPan();
  }

  resetViewport(): void {
    this.viewport.reset();
  }

  setDimensions(width: number, height: number): void {
    this.viewport.setBaseSize(width, height);
  }

  exportSceneJSON(extraProps?: string[]): Record<string, unknown> {
    return this.canvas.toObject(extraProps) as Record<string, unknown>;
  }

  // Raw scene replacement — same primitive @rifrocket/fdt-plugin-import-json's "json" importer
  // uses (loadFromJSON() + requestRenderAll()). Fully replaces canvas contents without going
  // through the add/remove command path; CanvasEngine.importFile() is the layer responsible for
  // resyncing objectIds/selection/history after a swap like this, not this method.
  async importSceneJSON(json: unknown): Promise<void> {
    await this.canvas.loadFromJSON(json as Record<string, unknown>);
    this.canvas.requestRenderAll();
  }

  setBackgroundColor(color: string): void {
    this.canvas.set("backgroundColor", color);
    this.canvas.requestRenderAll();
  }

  // Independent of CanvasEngine's own destroyed flag/destroy() (which also tears down
  // snapping and other engine-level concerns) — this tracks the renderer's own lifecycle only.
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.canvas.dispose();
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }
}
