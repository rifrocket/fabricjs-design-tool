import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { FabricObject } from "fabric";
import { createEngine } from "../engine/canvasEngine";
import { syncCanonicalPageToRenderer, syncRendererToCanonicalPage } from "./canonicalSceneSync";
import type { ObjectTypeRegistry } from "../plugin/objectTypeRegistry";
import { getObjectId } from "../engine/objectId";

interface ShapeConfig {
  left?: number;
  top?: number;
  fill?: string;
}

// Same double pattern as canvasEngine.integration.test.ts (a real fabric.Canvas can't run in
// this test environment — see that file's comment), trimmed to what constructing a working
// CanvasEngine plus add/select needs.
const { FakeCanvas } = vi.hoisted(() => {
  class FakeCanvas {
    width: number;
    height: number;

    private objects: FabricObject[] = [];
    private activeObjects: FabricObject[] = [];
    private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

    constructor(_element: unknown, options: { width?: number; height?: number } = {}) {
      this.width = options.width ?? 300;
      this.height = options.height ?? 150;
    }

    on(event: string, handler: (...args: unknown[]) => void): void {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event)?.add(handler);
    }

    off(event: string, handler: (...args: unknown[]) => void): void {
      this.listeners.get(event)?.delete(handler);
    }

    private emit(event: string, payload?: unknown): void {
      this.listeners.get(event)?.forEach((handler) => handler(payload));
    }

    add(object: FabricObject): void {
      this.objects.push(object);
      this.emit("object:added");
    }

    remove(object: FabricObject): void {
      this.objects = this.objects.filter((candidate) => candidate !== object);
      this.emit("object:removed");
    }

    getObjects(): FabricObject[] {
      return this.objects;
    }

    getActiveObject(): FabricObject | undefined {
      return this.activeObjects[0];
    }

    getActiveObjects(): FabricObject[] {
      return this.activeObjects;
    }

    setActiveObject(object: FabricObject): void {
      this.activeObjects = [object];
      this.emit("selection:created", { selected: this.activeObjects });
    }

    discardActiveObject(): void {
      this.activeObjects = [];
      this.emit("selection:cleared");
    }

    getZoom(): number {
      return 1;
    }

    getWidth(): number {
      return this.width;
    }

    getHeight(): number {
      return this.height;
    }

    setDimensions(dimensions: { width: number; height: number }): void {
      this.width = dimensions.width;
      this.height = dimensions.height;
    }

    requestRenderAll(): void {}

    dispose(): void {}
  }

  return { FakeCanvas };
});

vi.mock("fabric", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fabric")>();
  return { ...actual, Canvas: FakeCanvas };
});

function registerRoundTrippableRect(registry: ObjectTypeRegistry): void {
  registry.register<ShapeConfig>("round-trip-rect", {
    create: (config) => new Rect({ left: config.left, top: config.top, fill: config.fill }),
    serialize: (node) => ({ left: node.left, top: node.top, fill: node.fill as string }),
  });
}

describe("syncRendererToCanonicalPage / syncCanonicalPageToRenderer", () => {
  it("round-trips a live object through a real CanvasEngine, via a registered type's serialize()/create()", async () => {
    const sourceEngine = createEngine("source-canvas", { width: 400, height: 300 });
    registerRoundTrippableRect(sourceEngine.registry.objectTypes);
    const rect = new Rect({ left: 5, top: 7, fill: "#ff0000" });
    rect.set("shapeKind", "round-trip-rect");
    sourceEngine.renderer.addNode(rect);

    const result = syncRendererToCanonicalPage(sourceEngine.renderer, sourceEngine.registry.objectTypes, "page_1");
    const { page } = result;

    expect(result.incomplete).toBe(false);
    expect(result.skippedNodeIds).toEqual([]);
    expect(page.id).toBe("page_1");
    expect(page.rendererId).toBe("fabric");
    expect(page.nodes).toHaveLength(1);
    expect(page.nodes[0].typeId).toBe("round-trip-rect");
    expect(page.nodes[0].properties).toEqual({ left: 5, top: 7, fill: "#ff0000" });

    const targetEngine = createEngine("target-canvas", { width: 400, height: 300 });
    registerRoundTrippableRect(targetEngine.registry.objectTypes);

    await syncCanonicalPageToRenderer(targetEngine.renderer, targetEngine.registry.objectTypes, page);

    const recreated = targetEngine.renderer.getNodes();
    expect(recreated).toHaveLength(1);
    expect(recreated[0].left).toBe(5);
    expect(recreated[0].top).toBe(7);
    expect(recreated[0].fill).toBe("#ff0000");
  });

  it("strict: true (default) throws for a live node whose type has no serialize() hook", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    engine.registry.objectTypes.register("plain-rect", { create: () => new Rect() });
    const rect = new Rect();
    rect.set("shapeKind", "plain-rect");
    engine.renderer.addNode(rect);

    expect(() => syncRendererToCanonicalPage(engine.renderer, engine.registry.objectTypes, "page_1")).toThrow(
      'Object type "plain-rect" has no serialize() hook',
    );
  });

  it("strict: false never throws — returns incomplete: true with the skipped node's id instead", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    engine.registry.objectTypes.register("plain-rect", { create: () => new Rect() });
    const rect = new Rect();
    rect.set("shapeKind", "plain-rect");
    engine.renderer.addNode(rect);

    const result = syncRendererToCanonicalPage(engine.renderer, engine.registry.objectTypes, "page_1", { strict: false });

    expect(result.incomplete).toBe(true);
    expect(result.skippedNodeIds).toEqual([getObjectId(rect)]);
    expect(result.page.nodes).toEqual([]);
  });

  it("strict: false still serializes nodes whose type DOES define serialize(), alongside skipping the rest", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    registerRoundTrippableRect(engine.registry.objectTypes);
    engine.registry.objectTypes.register("plain-rect", { create: () => new Rect() });
    const goodRect = new Rect({ left: 1, top: 2, fill: "#00ff00" });
    goodRect.set("shapeKind", "round-trip-rect");
    const badRect = new Rect();
    badRect.set("shapeKind", "plain-rect");
    engine.renderer.addNode(goodRect);
    engine.renderer.addNode(badRect);

    const result = syncRendererToCanonicalPage(engine.renderer, engine.registry.objectTypes, "page_1", { strict: false });

    expect(result.incomplete).toBe(true);
    expect(result.skippedNodeIds).toEqual([getObjectId(badRect)]);
    expect(result.page.nodes).toHaveLength(1);
    expect(result.page.nodes[0].typeId).toBe("round-trip-rect");
  });

  it("syncCanonicalPageToRenderer throws for a canonical node whose typeId isn't registered", async () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const page = { id: "page_1", rendererId: "fabric", nodes: [{ id: "n1", typeId: "missing-type", properties: {} }] };

    await expect(syncCanonicalPageToRenderer(engine.renderer, engine.registry.objectTypes, page)).rejects.toThrow(
      'No object type registered for "missing-type"',
    );
  });
});
