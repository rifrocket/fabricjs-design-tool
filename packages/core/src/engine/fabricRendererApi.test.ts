import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { Canvas, FabricObject } from "fabric";
import { FabricRendererApi } from "./fabricRendererApi";
import type { ViewportManager } from "./viewportManager";
import type { SelectionManager } from "./selectionManager";
import { ID_PROPERTY } from "./objectId";

// A real backing array, not just spies, so addNode/getNodes prove the same canvas-state
// mutation `engine.addObject(rect)` (via AddObjectCommand -> canvas.add) relies on — without
// needing a full CanvasEngine, which FabricRendererApi isn't wired into until Chunk 2.3.
function createFakeCanvas(overrides: Partial<Canvas> = {}): Canvas {
  const objects: FabricObject[] = [];
  return {
    add: vi.fn((object: FabricObject) => objects.push(object)),
    remove: vi.fn((object: FabricObject) => {
      const index = objects.indexOf(object);
      if (index >= 0) objects.splice(index, 1);
    }),
    getObjects: vi.fn(() => objects),
    requestRenderAll: vi.fn(),
    toObject: vi.fn().mockReturnValue({ objects: [{ type: "rect", [ID_PROPERTY]: "obj_1" }] }),
    loadFromJSON: vi.fn().mockResolvedValue(undefined),
    set: vi.fn(),
    dispose: vi.fn(),
    ...overrides,
  } as unknown as Canvas;
}

function createFakeViewport(overrides: Partial<ViewportManager> = {}): ViewportManager {
  return {
    getZoom: vi.fn().mockReturnValue(1),
    setZoom: vi.fn(),
    zoomBy: vi.fn(),
    pan: vi.fn(),
    panTo: vi.fn(),
    getPan: vi.fn().mockReturnValue({ x: 0, y: 0 }),
    reset: vi.fn(),
    setBaseSize: vi.fn(),
    ...overrides,
  } as unknown as ViewportManager;
}

function createFakeSelection(overrides: Partial<SelectionManager> = {}): SelectionManager {
  return {
    select: vi.fn(),
    getActiveObjects: vi.fn().mockReturnValue([]),
    clear: vi.fn(),
    ...overrides,
  } as unknown as SelectionManager;
}

describe("FabricRendererApi", () => {
  it("reports kind as 'fabric'", () => {
    const renderer = new FabricRendererApi(createFakeCanvas(), createFakeViewport(), createFakeSelection());
    expect(renderer.kind).toBe("fabric");
  });

  it("addNode/removeNode/getNodes/requestRender delegate to the wrapped canvas, mutating real canvas state", () => {
    const canvas = createFakeCanvas();
    const renderer = new FabricRendererApi(canvas, createFakeViewport(), createFakeSelection());
    const rect = new Rect();

    renderer.addNode(rect);
    expect(canvas.add).toHaveBeenCalledWith(rect);
    expect(renderer.getNodes()).toEqual([rect]);

    renderer.removeNode(rect);
    expect(canvas.remove).toHaveBeenCalledWith(rect);
    expect(renderer.getNodes()).toEqual([]);

    renderer.requestRender();
    expect(canvas.requestRenderAll).toHaveBeenCalled();
  });

  it("selection methods delegate to the wrapped SelectionManager", () => {
    const selection = createFakeSelection();
    const renderer = new FabricRendererApi(createFakeCanvas(), createFakeViewport(), selection);
    const rect = new Rect();

    renderer.setActiveNode(rect);
    expect(selection.select).toHaveBeenCalledWith(rect);

    renderer.getActiveNodes();
    expect(selection.getActiveObjects).toHaveBeenCalled();

    renderer.clearSelection();
    expect(selection.clear).toHaveBeenCalled();
  });

  it("viewport methods delegate to the wrapped ViewportManager", () => {
    const viewport = createFakeViewport();
    const renderer = new FabricRendererApi(createFakeCanvas(), viewport, createFakeSelection());

    renderer.getZoom();
    expect(viewport.getZoom).toHaveBeenCalled();

    renderer.setZoom(2, { resizeElement: false });
    expect(viewport.setZoom).toHaveBeenCalledWith(2, { resizeElement: false });

    renderer.zoomBy(0.1);
    expect(viewport.zoomBy).toHaveBeenCalledWith(0.1, undefined);

    renderer.pan(1, 2);
    expect(viewport.pan).toHaveBeenCalledWith(1, 2);

    renderer.panTo(3, 4);
    expect(viewport.panTo).toHaveBeenCalledWith(3, 4);

    renderer.getPan();
    expect(viewport.getPan).toHaveBeenCalled();

    renderer.resetViewport();
    expect(viewport.reset).toHaveBeenCalled();

    renderer.setDimensions(100, 200);
    expect(viewport.setBaseSize).toHaveBeenCalledWith(100, 200);
  });

  it("exportSceneJSON matches canvas.toObject() byte-for-byte for a small scene", () => {
    const canvas = createFakeCanvas();
    const renderer = new FabricRendererApi(canvas, createFakeViewport(), createFakeSelection());

    const json = renderer.exportSceneJSON([ID_PROPERTY]);

    expect(canvas.toObject).toHaveBeenCalledWith([ID_PROPERTY]);
    expect(json).toEqual(canvas.toObject([ID_PROPERTY]));
  });

  it("importSceneJSON loads via canvas.loadFromJSON then requests a render", async () => {
    const canvas = createFakeCanvas();
    const renderer = new FabricRendererApi(canvas, createFakeViewport(), createFakeSelection());
    const data = { objects: [] };

    await renderer.importSceneJSON(data);

    expect(canvas.loadFromJSON).toHaveBeenCalledWith(data);
    expect(canvas.requestRenderAll).toHaveBeenCalled();
  });

  it("setBackgroundColor sets the property and re-renders", () => {
    const canvas = createFakeCanvas();
    const renderer = new FabricRendererApi(canvas, createFakeViewport(), createFakeSelection());

    renderer.setBackgroundColor("#123456");

    expect(canvas.set).toHaveBeenCalledWith("backgroundColor", "#123456");
    expect(canvas.requestRenderAll).toHaveBeenCalled();
  });

  it("destroy() disposes the canvas once and is idempotent", () => {
    const canvas = createFakeCanvas();
    const renderer = new FabricRendererApi(canvas, createFakeViewport(), createFakeSelection());

    expect(renderer.isDestroyed()).toBe(false);
    renderer.destroy();
    renderer.destroy();

    expect(canvas.dispose).toHaveBeenCalledTimes(1);
    expect(renderer.isDestroyed()).toBe(true);
  });
});
