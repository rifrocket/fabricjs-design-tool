import { describe, expect, it, vi } from "vitest";
import type { FabricObject } from "fabric";
import {
  captureSnapshot,
  createDocumentSession,
  createEditor,
} from "@rifrocket/fabricjs-design-tool";
import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";
import { PagesManager } from "./PagesManager";
import { fakeOffscreenCanvasFactory } from "./testUtils";

// Chunk 10.5 (FUTURE_IMPLEMENTATION.md Stage 10) — the strongest test in this stage: the actual
// developer migration journey this whole roadmap is in service of. Uses the real, unmodified
// @rifrocket/fdt-plugin-shapes-basic package (added as a devDependency for this test) rather than
// a synthetic stand-in plugin — the whole point of this chunk is proving zero changes are needed
// to an ALREADY-SHIPPED plugin's own source, which a locally-written fake plugin can't prove
// (it was never "already shipped" anywhere to begin with).
//
// Reuses the same FakeCanvas + vi.mock("fabric") pattern as canonicalSceneSync.test.ts /
// documentLifecycle.test.ts (a real fabric.Canvas can't construct in this test environment).
// Deliberately does NOT pass a custom engineFactory to PagesManager — the default
// (`(canvasEl, options) => createEngine(canvasEl, options)`) constructs a REAL CanvasEngine
// backed by the mocked Canvas, which is required here: createFakeEngine() (testUtils.ts) is a
// synthetic stub that doesn't run a real ObjectTypeRegistry, so shapesBasicPlugin.install()
// wouldn't do anything meaningful against it.
const { FakeCanvas } = vi.hoisted(() => {
  class FakeCanvas {
    width: number;
    height: number;
    backgroundColor?: string;

    private objects: FabricObject[] = [];
    private activeObjects: FabricObject[] = [];
    private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

    constructor(_element: unknown, options: { width?: number; height?: number; backgroundColor?: string } = {}) {
      this.width = options.width ?? 300;
      this.height = options.height ?? 150;
      this.backgroundColor = options.backgroundColor;
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

    set(key: string, value: unknown): void {
      if (key === "backgroundColor") this.backgroundColor = value as string;
    }

    toObject(): Record<string, unknown> {
      return {
        objects: this.objects.map((o) => o.toObject()),
        ...(this.backgroundColor ? { background: this.backgroundColor } : {}),
      };
    }

    async loadFromJSON(json: { objects?: unknown[] }): Promise<void> {
      this.objects = [];
      // Not exercised by this test (seedFromDocument's pendingSnapshots path calls
      // restoreSnapshot -> engine.importFile("json", ...) -> the registered json importer, which
      // for a real CanvasEngine ends up here) — a minimal stand-in is enough since this test's
      // assertions are about object-type registration and addObjectOfType, not JSON import
      // fidelity (already covered by Chunk 5's own tests).
      void json;
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

describe("Single-page -> DocumentSession -> multi-page adoption, zero plugin code changes (Chunk 10.5)", () => {
  it("migrates a plain createEditor() app into a plugin-pages-managed multi-page document; the real shapesBasicPlugin works unmodified on both pages", async () => {
    // 1. A plain single-page app, exactly like a typical apps/demo-style setup: createEditor()
    // with a real, already-shipped plugin installed.
    const single = createEditor("single-canvas", {
      width: 400,
      height: 300,
      plugins: { add: [shapesBasicPlugin] },
    });
    expect(single.engine.registry.objectTypes.has("rect")).toBe(true);

    const rect = await single.engine.addObjectOfType("rect", { left: 10, top: 20, fill: "#ff0000" });
    expect(single.engine.renderer.getNodes()).toContain(rect);

    // 2. Capture its document.
    const snapshot = captureSnapshot(single.engine);

    // 3. Wrap it in a DocumentSession — the preferred long-term adoption path (Chunk 4.2).
    const session = createDocumentSession({
      document: { meta: null, pages: [{ id: "page_1", order: 0, snapshot }] },
    });

    single.engine.destroy();

    // 4. Adopt it as Page 1 of a new plugin-pages-managed multi-page setup, sharing the
    // session's AssetStore across every page (Chunk 10.2's mechanism) and installing the SAME,
    // unmodified plugin list every page will use.
    const manager = new PagesManager({
      maxPages: 5,
      engineOptions: { assets: session.assets },
      // importJsonPlugin is required for seedFromDocument()'s pendingSnapshots path
      // (restoreSnapshot() -> engine.importFile("json", ...)) to find a registered importer —
      // shapesBasicPlugin is the one under actual test here.
      plugins: [shapesBasicPlugin, importJsonPlugin],
      // getOrCreateEngine() always renders a thumbnail (refreshThumbnail -> renderSnapshotThumbnail),
      // which by default constructs a real fabric.StaticCanvas needing a real 2D context — jsdom
      // doesn't provide one. Same fake used by every other plugin-pages test (testUtils.ts).
      thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
    });

    const page1 = manager.seedFromDocument(snapshot, { name: "Page 1" });
    const page2 = manager.addPage({ name: "Page 2" });

    // 5. Both pages' engines get the real, unmodified plugin installed — confirm it actually
    // functions on each, not just that install() didn't throw.
    const page1Engine = await manager.setActivePage(page1.id);
    expect(page1Engine.registry.objectTypes.has("rect")).toBe(true);
    expect(page1Engine.assets).toBe(session.assets);
    const page1Rect = await page1Engine.addObjectOfType("rect", { left: 1, top: 1 });
    expect(page1Engine.renderer.getNodes()).toContain(page1Rect);

    const page2Engine = await manager.setActivePage(page2.id);
    expect(page2Engine.registry.objectTypes.has("rect")).toBe(true);
    expect(page2Engine.assets).toBe(session.assets);
    const page2Rect = await page2Engine.addObjectOfType("circle", { left: 2, top: 2 });
    expect(page2Engine.renderer.getNodes()).toContain(page2Rect);
  });
});
