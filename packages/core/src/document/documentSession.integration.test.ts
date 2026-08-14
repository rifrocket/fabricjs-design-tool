import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { FabricObject } from "fabric";
import { createEngine } from "../engine/canvasEngine";
import { createDocumentSession } from "./documentSession";
import type { DesignDocument } from "./designDocument";

// Same double pattern as canvasEngine.integration.test.ts/createEditor.test.ts (a real
// fabric.Canvas can't run in this test environment — see that file's comment), trimmed to what
// constructing a working CanvasEngine plus add/remove/undo needs.
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

function createEmptyDocument(): DesignDocument {
  return { meta: null, pages: [] };
}

// FUTURE_IMPLEMENTATION.md Chunk 4.4: proves DocumentSession's ownership fix actually solves
// the multi-page problem end-to-end (not just "the same reference is passed"), without any
// plugin-pages change — engines are wired manually here, the same way plugin-pages'
// engineFactory would.
describe("DocumentSession + multiple CanvasEngines", () => {
  it("shares one AssetStore across engines: an asset registered via one engine resolves via another", async () => {
    const session = createDocumentSession({ document: createEmptyDocument() });
    const engineA = createEngine("page-a", { width: 400, height: 300, assets: session.assets });
    const engineB = createEngine("page-b", { width: 400, height: 300, assets: session.assets });

    const record = engineA.assets.register({ kind: "image", url: "https://example.com/a.png" });

    expect(engineB.assets.get(record.id)).toEqual(record);
    await expect(engineB.assets.resolveUrl(record.id)).resolves.toBe("https://example.com/a.png");
  });

  it("without a shared AssetStore, engines get independent stores (regression: default behavior unchanged)", () => {
    const engineA = createEngine("page-a", { width: 400, height: 300 });
    const engineB = createEngine("page-b", { width: 400, height: 300 });

    const record = engineA.assets.register({ kind: "image", url: "https://example.com/a.png" });

    expect(engineB.assets.get(record.id)).toBeUndefined();
  });

  it("history: { scope: 'document' } shares undo across engines: undo triggered on one engine reverses an action performed on another", () => {
    const session = createDocumentSession({ document: createEmptyDocument(), history: { scope: "document" } });
    const engineA = createEngine("page-a", { width: 400, height: 300, history: session.history });
    const engineB = createEngine("page-b", { width: 400, height: 300, history: session.history });
    const rect = new Rect({ left: 0, top: 0 });

    engineA.addObject(rect);
    expect(engineA.renderer.getNodes()).toContain(rect);
    expect(engineB.history.canUndo()).toBe(true);

    engineB.undo();

    expect(engineA.renderer.getNodes()).not.toContain(rect);
  });

  it("without history: { scope: 'document' }, engines keep independent per-page history (plugin-pages' existing default)", () => {
    const engineA = createEngine("page-a", { width: 400, height: 300 });
    const engineB = createEngine("page-b", { width: 400, height: 300 });
    const rect = new Rect({ left: 0, top: 0 });

    engineA.addObject(rect);

    expect(engineA.history.canUndo()).toBe(true);
    expect(engineB.history.canUndo()).toBe(false);
  });
});
