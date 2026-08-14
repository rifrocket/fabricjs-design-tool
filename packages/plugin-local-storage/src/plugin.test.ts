import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus, ObjectTypeRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { localStoragePlugin, requestSave } from "./plugin";
import { DEFAULT_STORAGE_KEY, loadDesignFromStorage } from "./storage";
import type { StorageLike } from "./storage";

function createFakeStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function createFakeEngine() {
  const storeListeners = new Set<() => void>();
  const canvasHandlers = new Map<string, Set<() => void>>([
    ["object:modified", new Set()],
    ["text:changed", new Set()],
  ]);
  const fabricCanvas = {
    toObject: vi.fn().mockReturnValue({ objects: [] }),
    backgroundColor: "#ffffff" as string | undefined,
    on: vi.fn((event: string, handler: () => void) => canvasHandlers.get(event)?.add(handler)),
    off: vi.fn((event: string, handler: () => void) => canvasHandlers.get(event)?.delete(handler)),
  };
  const events = new EventBus();
  const engine = {
    store: {
      subscribe: vi.fn((listener: () => void) => {
        storeListeners.add(listener);
        return () => storeListeners.delete(listener);
      }),
    },
    events,
    getFabricCanvas: vi.fn().mockReturnValue(fabricCanvas),
    // captureSnapshot() (called internally via this file's `capture`) reads through
    // engine.renderer/engine.registry, not getFabricCanvas(), as of
    // @rifrocket/fabricjs-design-tool's FUTURE_IMPLEMENTATION.md Chunks 5.1/5.2 —
    // getFabricCanvas() itself stays mocked above since this plugin still legitimately uses it
    // directly for object:modified/text:changed wiring.
    renderer: {
      exportSceneJSON: vi.fn().mockReturnValue({ objects: [] }),
      getNodes: vi.fn().mockReturnValue([]),
    },
    registry: { objectTypes: new ObjectTypeRegistry() },
  } as unknown as CanvasEngine;

  return {
    engine,
    triggerStoreChange: () => storeListeners.forEach((listener) => listener()),
    triggerCanvasEvent: (event: string) => canvasHandlers.get(event)?.forEach((handler) => handler()),
    storeListenerCount: () => storeListeners.size,
    canvasListenerCount: (event: string) => canvasHandlers.get(event)?.size ?? 0,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("localStoragePlugin", () => {
  it("does not save anything on install, before any change happens", () => {
    const storage = createFakeStorage();
    const { engine } = createFakeEngine();
    const plugin = localStoragePlugin({ storage });

    plugin.install(engine);
    vi.advanceTimersByTime(10_000);

    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();
  });

  it("saves a design (snapshot + null meta by default) debounceMs after a store change", () => {
    const storage = createFakeStorage();
    const { engine, triggerStoreChange } = createFakeEngine();
    const plugin = localStoragePlugin({ storage, debounceMs: 300 });
    plugin.install(engine);

    triggerStoreChange();
    vi.advanceTimersByTime(299);
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();

    vi.advanceTimersByTime(1);
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toEqual({
      snapshot: { json: { objects: [] }, backgroundColor: "#ffffff" },
      meta: null,
    });
  });

  it("collapses a burst of store changes into a single save", () => {
    const storage = createFakeStorage();
    const { engine, triggerStoreChange } = createFakeEngine();
    const setItemSpy = vi.spyOn(storage, "setItem");
    const plugin = localStoragePlugin({ storage, debounceMs: 300 });
    plugin.install(engine);

    for (let i = 0; i < 5; i += 1) {
      triggerStoreChange();
      vi.advanceTimersByTime(100);
    }
    vi.advanceTimersByTime(300);

    expect(setItemSpy).toHaveBeenCalledTimes(1);
  });

  it("saves on a raw canvas object:modified event (interactive drag/resize/rotate)", () => {
    const storage = createFakeStorage();
    const { engine, triggerCanvasEvent } = createFakeEngine();
    const plugin = localStoragePlugin({ storage, debounceMs: 300 });
    plugin.install(engine);

    triggerCanvasEvent("object:modified");
    vi.advanceTimersByTime(300);

    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).not.toBeNull();
  });

  it("saves on a raw canvas text:changed event (live text editing)", () => {
    const storage = createFakeStorage();
    const { engine, triggerCanvasEvent } = createFakeEngine();
    const plugin = localStoragePlugin({ storage, debounceMs: 300 });
    plugin.install(engine);

    triggerCanvasEvent("text:changed");
    vi.advanceTimersByTime(300);

    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).not.toBeNull();
  });

  it("saves when a consumer calls requestSave(), for changes it can't observe on its own (e.g. a background-color change)", () => {
    const storage = createFakeStorage();
    const { engine } = createFakeEngine();
    const plugin = localStoragePlugin({ storage, debounceMs: 300 });
    plugin.install(engine);

    requestSave(engine);
    vi.advanceTimersByTime(300);

    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).not.toBeNull();
  });

  it("writes under a caller-supplied key", () => {
    const storage = createFakeStorage();
    const { engine, triggerStoreChange } = createFakeEngine();
    const plugin = localStoragePlugin({ storage, key: "my-app:design", debounceMs: 300 });
    plugin.install(engine);

    triggerStoreChange();
    vi.advanceTimersByTime(300);

    expect(loadDesignFromStorage("my-app:design", storage)).not.toBeNull();
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();
  });

  it("uses a caller-supplied captureSnapshot instead of the core default", () => {
    const storage = createFakeStorage();
    const { engine, triggerStoreChange } = createFakeEngine();
    const customSnapshot = { json: { objects: ["custom"] }, backgroundColor: "#000000" };
    const captureSnapshot = vi.fn().mockReturnValue(customSnapshot);
    const plugin = localStoragePlugin({ storage, debounceMs: 300, captureSnapshot });
    plugin.install(engine);

    triggerStoreChange();
    vi.advanceTimersByTime(300);

    expect(captureSnapshot).toHaveBeenCalledWith(engine);
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)?.snapshot).toEqual(customSnapshot);
  });

  it("captures and saves app-defined meta alongside the snapshot in the same atomic write", () => {
    const storage = createFakeStorage();
    const { engine, triggerStoreChange } = createFakeEngine();
    const captureMeta = vi.fn().mockReturnValue({ templateId: "poster", width: 500, height: 750 });
    const plugin = localStoragePlugin<{ templateId: string; width: number; height: number }>({
      storage,
      debounceMs: 300,
      captureMeta,
    });
    plugin.install(engine);

    triggerStoreChange();
    vi.advanceTimersByTime(300);

    expect(captureMeta).toHaveBeenCalledWith(engine);
    const stored = loadDesignFromStorage<{ templateId: string; width: number; height: number }>(DEFAULT_STORAGE_KEY, storage);
    expect(stored?.meta).toEqual({ templateId: "poster", width: 500, height: 750 });
  });

  it("uninstall unsubscribes from the store/canvas/requestSave and cancels a pending save", () => {
    const storage = createFakeStorage();
    const { engine, triggerStoreChange, storeListenerCount, canvasListenerCount } = createFakeEngine();
    const plugin = localStoragePlugin({ storage, debounceMs: 300 });

    plugin.install(engine);
    triggerStoreChange();
    expect(storeListenerCount()).toBe(1);
    expect(canvasListenerCount("object:modified")).toBe(1);

    plugin.uninstall?.(engine);
    vi.advanceTimersByTime(1000);

    expect(storeListenerCount()).toBe(0);
    expect(canvasListenerCount("object:modified")).toBe(0);
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();

    // requestSave() after uninstall must not schedule a save either.
    requestSave(engine);
    vi.advanceTimersByTime(1000);
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).toBeNull();
  });

  it("keeps per-engine state independent when one plugin instance is installed on two engines (e.g. a shared plugin list reused across remounts)", () => {
    const storage = createFakeStorage();
    const fakeA = createFakeEngine();
    const fakeB = createFakeEngine();
    const plugin = localStoragePlugin({ storage, debounceMs: 300 });

    plugin.install(fakeA.engine);
    plugin.install(fakeB.engine);

    fakeA.triggerStoreChange();
    vi.advanceTimersByTime(300);
    expect(loadDesignFromStorage(DEFAULT_STORAGE_KEY, storage)).not.toBeNull();

    // Uninstalling on A must not touch B's listeners.
    plugin.uninstall?.(fakeA.engine);
    expect(fakeA.storeListenerCount()).toBe(0);
    expect(fakeB.storeListenerCount()).toBe(1);
  });
});
