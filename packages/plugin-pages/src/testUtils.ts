import { vi } from "vitest";
import type { FabricObject } from "fabric";
import { KeyboardShortcutManager, PluginRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine, EditorPlugin, OffscreenCanvasFactory } from "@rifrocket/fabricjs-design-tool";
import type { EngineFactory } from "./PagesManager";

// Shared fakes for exercising PagesManager (and anything built on it, like the React bindings)
// without a real Fabric Canvas — jsdom's canvas elements have no real 2D rendering context (the
// `canvas` npm package isn't installed here), so a real CanvasEngine can't be constructed in this
// test environment. Not exported from index.ts — test-only.

export interface FakeCanvas {
  set: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  toObject: ReturnType<typeof vi.fn>;
  calcOffset: ReturnType<typeof vi.fn>;
  // A real jsdom node (not a fake) so tests can assert real appendChild/remove/parentElement
  // behavior against it — jsdom only lacks a real 2D rendering *context*, which
  // usePageCanvasRef()'s DOM-relocation logic never touches.
  wrapperEl: HTMLDivElement;
  backgroundColor?: string;
}

export interface FakeEngineHandle {
  objects: FabricObject[];
  canvas: FakeCanvas;
  importFile: ReturnType<typeof vi.fn>;
  setBackgroundColor: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  useAll: ReturnType<typeof vi.fn>;
  addObjectOfType: ReturnType<typeof vi.fn>;
  setObjectProperty: ReturnType<typeof vi.fn>;
  historyClear: ReturnType<typeof vi.fn>;
}

export type FakeEngine = CanvasEngine & { __fake: FakeEngineHandle };

export function createFakeEngine(): FakeEngine {
  const objects: FabricObject[] = [];
  const canvas: FakeCanvas = {
    set: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    // Includes `background` when set, matching real fabric.Canvas#toObject()'s own shape —
    // captureSnapshot() reads backgroundColor from this field, not a live property, as of
    // FUTURE_IMPLEMENTATION.md Chunk 5.1.
    toObject: vi.fn(() => ({
      objects: objects.map((o) => o.toObject()),
      ...(canvas.backgroundColor ? { background: canvas.backgroundColor } : {}),
    })),
    calcOffset: vi.fn(),
    wrapperEl: document.createElement("div"),
    backgroundColor: undefined,
  };
  const importFile = vi.fn(async () => {});
  const setBackgroundColor = vi.fn((color: string) => {
    canvas.backgroundColor = color;
  });
  const destroy = vi.fn();
  // Actually installs each plugin (not just recording the call) — needed so tests that register
  // a real object type/panel/etc. through a plugin (e.g. MultiPageDesignEditor's propertyFields
  // prop, which checks registry.objectTypes.has(typeId)) see real effects, the same way a real
  // CanvasEngine.useAll() would. `engine` is referenced before its own declaration below, but
  // this closure only runs once useAll() is actually called later, by which point it exists.
  const useAll = vi.fn((plugins: EditorPlugin[]) => {
    plugins.forEach((plugin) => plugin.install(engine));
  });
  const historyClear = vi.fn();
  const addObjectOfType = vi.fn(async () => {
    // get() stubbed (returns undefined for any key, including resolveObjectTypeId's
    // "shapeKind" lookup) since captureSnapshot -> serializeWithTypeOverrides ->
    // resolveObjectTypeId now calls object.get() on every live node (Chunk 5.2).
    const object = { toObject: () => ({}), get: () => undefined, type: "rect" } as unknown as FabricObject;
    objects.push(object);
    return object;
  });
  const setObjectProperty = vi.fn();

  const engine = {
    getFabricCanvas: () => canvas,
    // captureSnapshot() (used by PagesManager.getSnapshotForPersistence/refreshThumbnail) reads
    // through engine.renderer, not getFabricCanvas(), as of @rifrocket/fabricjs-design-tool's
    // FUTURE_IMPLEMENTATION.md Chunk 5.1 — getFabricCanvas() itself stays mocked above since
    // other fake-canvas methods (set/on/off/calcOffset/wrapperEl) are still used directly.
    // getNodes() added alongside exportSceneJSON for Chunk 5.2's serializeWithTypeOverrides,
    // which matches json.objects[] to live nodes by index — reuses the same `objects` array
    // the fake canvas/engine already tracks.
    renderer: { exportSceneJSON: vi.fn(() => canvas.toObject()), getNodes: () => objects },
    setBackgroundColor,
    importFile,
    destroy,
    useAll,
    addObjectOfType,
    setObjectProperty,
    history: { clear: historyClear, canUndo: () => false, canRedo: () => false },
    store: { subscribe: vi.fn(() => () => {}), setState: vi.fn() },
    layers: { getObjects: () => objects },
    addObject: vi.fn((object: FabricObject) => objects.push(object)),
    removeObject: vi.fn((object: FabricObject) => {
      const index = objects.indexOf(object);
      if (index !== -1) objects.splice(index, 1);
    }),
    // Real KeyboardShortcutManager (not a mock) + no-op tools/selection stubs — enough for
    // setupDefaultShortcuts()/useKeyboardShortcuts() to run against this fake exactly like a
    // real engine, for tests exercising MultiPageDesignEditor's shortcut wiring.
    shortcuts: new KeyboardShortcutManager(),
    undo: vi.fn(),
    redo: vi.fn(),
    deleteSelection: vi.fn(),
    selection: { clear: vi.fn(), getActiveObjects: () => [] },
    // Real PluginRegistry (not a stub) — composes real objectTypes/tools/panels/effects/
    // exporters/importers registries, including facade methods like registerPropertyFields()
    // that only exist on PluginRegistry itself, not on ObjectTypeRegistry's own hand-picked
    // subset. Same rationale as KeyboardShortcutManager above: lets tests exercise real
    // registration calls (e.g. MultiPageDesignEditor's propertyFields prop) exactly like a real
    // engine, not just record that a call happened.
    registry: new PluginRegistry(),
  } as unknown as FakeEngine;

  engine.__fake = {
    objects,
    canvas,
    importFile,
    setBackgroundColor,
    destroy,
    useAll,
    addObjectOfType,
    setObjectProperty,
    historyClear,
  };
  return engine;
}

export function createEngineFactory(): EngineFactory {
  return () => createFakeEngine();
}

export const fakeCanvasElementFactory = () => ({}) as HTMLCanvasElement;

export const fakeOffscreenCanvasFactory: OffscreenCanvasFactory = () => ({
  loadFromJSON: vi.fn(async () => undefined),
  renderAll: vi.fn(),
  toDataURL: vi.fn(() => "data:image/png;base64,fake"),
  dispose: vi.fn(),
});
