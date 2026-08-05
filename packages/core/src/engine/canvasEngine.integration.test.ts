import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { FabricObject } from "fabric";
import type { EditorPlugin } from "../plugin/plugin";
import { getObjectId } from "./objectId";
import { createEngine } from "./canvasEngine";

// Real fabric.Canvas needs a working 2D rendering context (HTMLCanvasElement#getContext), which
// this workspace's node/jsdom test setup doesn't provide (node-canvas was tried as a
// devDependency, but its native build isn't viable in every environment this repo is developed
// in). This double implements just enough of Canvas's surface for every manager CanvasEngine
// constructs (ViewportManager, SelectionManager, LayerManager, AlignmentManager, SnapEngine,
// CanvasExporter) to construct and run, so CanvasEngine itself runs completely unmodified —
// these tests exercise the real engine/store composition, not a mock of it.
const { FakeCanvas } = vi.hoisted(() => {
  class FakeCanvas {
    width: number;
    height: number;
    contextTopDirty = false;
    viewportTransform: number[] = [1, 0, 0, 1, 0, 0];

    private objects: FabricObject[] = [];
    private activeObjects: FabricObject[] = [];
    private zoom = 1;
    private pan = { x: 0, y: 0 };
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

    bringObjectToFront(object: FabricObject): void {
      this.objects = [...this.objects.filter((candidate) => candidate !== object), object];
    }

    sendObjectToBack(object: FabricObject): void {
      this.objects = [object, ...this.objects.filter((candidate) => candidate !== object)];
    }

    bringObjectForward(object: FabricObject): void {
      const index = this.objects.indexOf(object);
      if (index < 0 || index === this.objects.length - 1) return;
      const next = [...this.objects];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      this.objects = next;
    }

    sendObjectBackwards(object: FabricObject): void {
      const index = this.objects.indexOf(object);
      if (index <= 0) return;
      const next = [...this.objects];
      [next[index], next[index - 1]] = [next[index - 1], next[index]];
      this.objects = next;
    }

    moveObjectTo(object: FabricObject, index: number): boolean {
      if (!this.objects.includes(object)) return false;
      const next = this.objects.filter((candidate) => candidate !== object);
      next.splice(index, 0, object);
      this.objects = next;
      return true;
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
      return this.zoom;
    }

    setZoom(value: number): void {
      this.zoom = value;
    }

    zoomToPoint(_point: unknown, value: number): void {
      this.zoom = value;
    }

    relativePan(point: { x: number; y: number }): void {
      this.pan = { x: this.pan.x + point.x, y: this.pan.y + point.y };
      this.viewportTransform = [this.zoom, 0, 0, this.zoom, this.pan.x, this.pan.y];
    }

    absolutePan(point: { x: number; y: number }): void {
      this.pan = { x: point.x, y: point.y };
      this.viewportTransform = [this.zoom, 0, 0, this.zoom, this.pan.x, this.pan.y];
    }

    setViewportTransform(vpt: number[]): void {
      this.viewportTransform = vpt;
      this.zoom = vpt[0];
      this.pan = { x: vpt[4], y: vpt[5] };
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

describe("CanvasEngine + Store integration", () => {
  it("bumps propertyVersion and records history entries as objects are added and edited", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const rect = new Rect({ left: 0, top: 0, fill: "red" });

    engine.addObject(rect);
    expect(engine.store.getState().objectIds).toEqual([getObjectId(rect)]);

    engine.setObjectProperty(rect, "opacity", 0.5);
    expect(engine.store.getState().propertyVersion).toBe(1);

    engine.setObjectProperty(rect, "fill", "blue");
    expect(engine.store.getState().propertyVersion).toBe(2);

    expect(engine.history.list().map((entry) => entry.label)).toEqual(["Add object", "Set opacity", "Set fill"]);
  });

  it("bumps propertyVersion on undo/redo, not just on the original edit", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const rect = new Rect({ left: 0, top: 0, fill: "red" });
    engine.addObject(rect);
    engine.setObjectProperty(rect, "fill", "blue");
    const afterEdit = engine.store.getState().propertyVersion;

    engine.undo();
    expect(rect.fill).toBe("red");
    expect(engine.store.getState().propertyVersion).toBeGreaterThan(afterEdit);
    const afterUndo = engine.store.getState().propertyVersion;

    engine.redo();
    expect(rect.fill).toBe("blue");
    expect(engine.store.getState().propertyVersion).toBeGreaterThan(afterUndo);
  });

  it("syncs store.objectIds after every LayerManager z-order/visibility/lock mutation", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const a = new Rect({ fill: "red" });
    const b = new Rect({ fill: "green" });
    const c = new Rect({ fill: "blue" });
    [a, b, c].forEach((object) => engine.addObject(object));
    const [idA, idB, idC] = [a, b, c].map(getObjectId);

    expect(engine.store.getState().objectIds).toEqual([idA, idB, idC]);

    engine.layers.bringToFront(a);
    expect(engine.store.getState().objectIds).toEqual([idB, idC, idA]);

    const listener = vi.fn();
    engine.store.subscribe(listener);

    engine.layers.setVisible(b, false);
    expect(engine.layers.isVisible(b)).toBe(false);
    expect(listener).toHaveBeenCalled();

    listener.mockClear();
    engine.layers.setLocked(c, true);
    expect(engine.layers.isLocked(c)).toBe(true);
    expect(listener).toHaveBeenCalled();
  });

  it("importFile() resyncs objectIds/selection/history after a registered importer runs", async () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const existing = new Rect({ fill: "red" });
    engine.addObject(existing);
    expect(engine.store.getState().canUndo).toBe(true);

    const imported = new Rect({ fill: "blue" });
    engine.registry.registerImporter("test-format", (canvas, input) => {
      canvas.add(input as FabricObject);
    });

    await engine.importFile("test-format", imported);

    expect(engine.store.getState().objectIds).toEqual([getObjectId(existing), getObjectId(imported)]);
    expect(engine.store.getState().selectedObjectIds).toEqual([]);
    expect(engine.store.getState().canUndo).toBe(false);
  });

  it("importFile() serializes overlapping calls instead of letting them interleave", async () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const order: string[] = [];
    let releaseFirst!: () => void;
    const firstBlocked = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    engine.registry.registerImporter("slow-format", async (canvas, input) => {
      order.push(`start:${input}`);
      if (input === "first") await firstBlocked;
      canvas.add(new Rect());
      order.push(`end:${input}`);
    });

    const firstCall = engine.importFile("slow-format", "first");
    const secondCall = engine.importFile("slow-format", "second");

    // second call must not have started yet — the first is still awaiting its gate.
    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual(["start:first"]);

    releaseFirst();
    await firstCall;
    await secondCall;

    expect(order).toEqual(["start:first", "end:first", "start:second", "end:second"]);
  });

  it("importFile() throws a named error for an unregistered format", async () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    await expect(engine.importFile("missing-format", {})).rejects.toThrow(
      'No importer registered for "missing-format"',
    );
  });

  it("keeps store.zoom in sync through the setZoom/zoomBy/reset facades", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });

    engine.setZoom(2);
    expect(engine.store.getState().zoom).toBe(2);

    engine.zoomBy(0.5);
    expect(engine.store.getState().zoom).toBe(2.5);

    engine.pan(10, 20);
    engine.reset();
    expect(engine.store.getState()).toMatchObject({ zoom: 1, panX: 0, panY: 0 });
  });

  it("resizes the canvas element in lock-step with zoom, and setDimensions() updates the base size", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });

    engine.setZoom(2);
    expect(engine.getFabricCanvas().getWidth()).toBe(800);
    expect(engine.getFabricCanvas().getHeight()).toBe(600);

    engine.setZoom(1);
    expect(engine.getFabricCanvas().getWidth()).toBe(400);
    expect(engine.getFabricCanvas().getHeight()).toBe(300);

    engine.setDimensions(200, 150);
    expect(engine.getFabricCanvas().getWidth()).toBe(200);
    expect(engine.getFabricCanvas().getHeight()).toBe(150);
  });

  it("useAll() installs plugins in dependency order regardless of array order", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const order: string[] = [];
    const pluginA: EditorPlugin = { name: "a", install: () => order.push("a") };
    const pluginB: EditorPlugin = { name: "b", dependsOn: ["a"], install: () => order.push("b") };

    engine.useAll([pluginB, pluginA]);

    expect(order).toEqual(["a", "b"]);
    expect(engine.hasPlugin("a")).toBe(true);
    expect(engine.hasPlugin("b")).toBe(true);
  });

  it("useAll() throws a named error for a missing dependency instead of installing silently", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const plugin: EditorPlugin = { name: "c", dependsOn: ["missing"], install: () => {} };

    expect(() => engine.useAll([plugin])).toThrow('Plugin "c" depends on "missing", which is not installed');
  });

  it("useAll() throws on a circular dependency", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const pluginX: EditorPlugin = { name: "x", dependsOn: ["y"], install: () => {} };
    const pluginY: EditorPlugin = { name: "y", dependsOn: ["x"], install: () => {} };

    expect(() => engine.useAll([pluginX, pluginY])).toThrow(/circular dependency/);
  });

  it("isDestroyed() flips only after destroy(), and destroy() is safe to call more than once", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const disposeSpy = vi.spyOn(engine.getFabricCanvas(), "dispose");

    expect(engine.isDestroyed()).toBe(false);

    engine.destroy();
    expect(engine.isDestroyed()).toBe(true);
    expect(disposeSpy).toHaveBeenCalledTimes(1);

    // A second call (e.g. an unmount racing a caller that already checked isDestroyed() and
    // called destroy() itself) must not re-run teardown — see destroy()'s own comment for the
    // React StrictMode double-invoke scenario this guards against.
    engine.destroy();
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it("unuse() runs a plugin's uninstall() end-to-end and forgets it was installed", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const uninstall = vi.fn((e: typeof engine) => e.registry.objectTypes.unregister("stamp"));
    const plugin: EditorPlugin = {
      name: "stamp",
      install: (e) => e.registry.registerObjectType("stamp", { create: () => new Rect() }),
      uninstall,
    };

    engine.use(plugin);
    expect(engine.hasPlugin("stamp")).toBe(true);
    expect(engine.registry.objectTypes.has("stamp")).toBe(true);

    engine.unuse("stamp");

    expect(uninstall).toHaveBeenCalledTimes(1);
    expect(uninstall).toHaveBeenCalledWith(engine);
    expect(engine.hasPlugin("stamp")).toBe(false);
    expect(engine.registry.objectTypes.has("stamp")).toBe(false);

    // A plugin can be reinstalled cleanly once unuse() has run.
    engine.use(plugin);
    expect(engine.hasPlugin("stamp")).toBe(true);
  });

  it("unuse() on a plugin that was never installed is a safe no-op", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    expect(() => engine.unuse("never-installed")).not.toThrow();
  });

  it("use() names the failing plugin when its install() throws (e.g. a registry duplicate-id error)", () => {
    const engine = createEngine("test-canvas", { width: 400, height: 300 });
    const plugin: EditorPlugin = {
      name: "broken",
      install: (e) => {
        e.registry.registerObjectType("rect", { create: () => new Rect() });
        e.registry.registerObjectType("rect", { create: () => new Rect() });
      },
    };

    expect(() => engine.use(plugin)).toThrow('Plugin "broken" failed to install: Object type "rect" is already registered');
  });
});
