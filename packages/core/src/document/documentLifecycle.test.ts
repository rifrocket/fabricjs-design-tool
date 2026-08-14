import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { FabricObject } from "fabric";
import { createEngine } from "../engine/canvasEngine";
import { syncCanonicalPageToRenderer, syncRendererToCanonicalPage } from "./canonicalSceneSync";
import { loadCanonicalDocument, saveCanonicalDocument } from "./canonicalDocument";
import type { CanonicalDocument } from "./canonicalDocument";
import type { ObjectTypeRegistry } from "../plugin/objectTypeRegistry";

// Chunk 10.4 (FUTURE_IMPLEMENTATION.md Stage 10) — the strongest test in Stage 10: proves
// document state outlives and is independent of any particular renderer's lifecycle. Placed in
// packages/core (not packages/plugin-pages, despite the plan's file suggestion) because nothing
// this test exercises — createEngine/syncRendererToCanonicalPage/syncCanonicalPageToRenderer/
// loadCanonicalDocument/saveCanonicalDocument — actually depends on PagesManager; "3 pages" here
// means 3 independent CanvasEngines, exactly what PagesManager itself builds on internally, with
// zero plugin-pages-specific machinery needed to prove the claim. Reuses the same
// FakeCanvas + vi.mock("fabric") pattern as canonicalSceneSync.test.ts, for the same reason
// stated there: a real fabric.Canvas can't construct in this test environment (no working 2D
// context).
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

interface ShapeConfig {
  left?: number;
  top?: number;
  fill?: string;
}

function registerRoundTrippableRect(registry: ObjectTypeRegistry): void {
  registry.register<ShapeConfig>("round-trip-rect", {
    create: (config) => new Rect({ left: config.left, top: config.top, fill: config.fill }),
    serialize: (node) => ({ left: node.left, top: node.top, fill: node.fill as string }),
  });
}

describe("Document lifecycle: destroy every renderer, then reload + resync from a saved CanonicalDocument (Chunk 10.4)", () => {
  it("recreates a 3-page document byte-for-byte after every original CanvasEngine is destroyed", async () => {
    const pageSpecs = [
      { id: "page_1", left: 10, top: 20, fill: "#ff0000" },
      { id: "page_2", left: 30, top: 40, fill: "#00ff00" },
      { id: "page_3", left: 50, top: 60, fill: "#0000ff" },
    ];

    const sourceEngines = pageSpecs.map((spec) => {
      const engine = createEngine(`source-${spec.id}`, { width: 400, height: 300 });
      registerRoundTrippableRect(engine.registry.objectTypes);
      const rect = new Rect({ left: spec.left, top: spec.top, fill: spec.fill });
      rect.set("shapeKind", "round-trip-rect");
      engine.renderer.addNode(rect);
      return engine;
    });

    // 1. Read every live page into canonical form (strict: true — the default — since this is
    // exactly the "about to persist" case strict mode exists for).
    const canonicalPages = sourceEngines.map((engine, index) =>
      syncRendererToCanonicalPage(engine.renderer, engine.registry.objectTypes, pageSpecs[index].id).page,
    );

    // 2. Assemble + save. Pure data — no renderer touched by either call.
    const document: CanonicalDocument = { schemaVersion: 1, pages: canonicalPages, assets: [] };
    const saved = saveCanonicalDocument(document);

    // 3. Destroy every original engine. No live renderer exists anywhere after this point.
    sourceEngines.forEach((engine) => engine.destroy());
    sourceEngines.forEach((engine) => expect(engine.isDestroyed()).toBe(true));

    // 4. Load the saved data back — renderer-free, confirmed by construction (loadCanonicalDocument
    // takes/returns plain data, and no engine exists at this point in the test to touch anyway).
    const loaded = loadCanonicalDocument(saved);
    expect(loaded).toEqual(document);

    // 5. Construct fresh engines, one per page's rendererId, and sync each canonical page back in.
    const targetEngines = loaded.pages.map((page) => {
      const engine = createEngine(`target-${page.id}`, { width: 400, height: 300 });
      expect(page.rendererId).toBe("fabric");
      registerRoundTrippableRect(engine.registry.objectTypes);
      return engine;
    });

    await Promise.all(
      targetEngines.map((engine, index) =>
        syncCanonicalPageToRenderer(engine.renderer, engine.registry.objectTypes, loaded.pages[index]),
      ),
    );

    // 6. The recreated scenes match the originals exactly.
    targetEngines.forEach((engine, index) => {
      const recreated = engine.renderer.getNodes();
      expect(recreated).toHaveLength(1);
      expect(recreated[0].left).toBe(pageSpecs[index].left);
      expect(recreated[0].top).toBe(pageSpecs[index].top);
      expect(recreated[0].fill).toBe(pageSpecs[index].fill);
    });
  });
});
