import { vi } from "vitest";
import type { FabricObject } from "fabric";
import type { CanvasEngine, OffscreenCanvasFactory } from "@rifrocket/fabricjs-design-tool";
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
    toObject: vi.fn(() => ({ objects: objects.map((o) => o.toObject()) })),
    calcOffset: vi.fn(),
    wrapperEl: document.createElement("div"),
    backgroundColor: undefined,
  };
  const importFile = vi.fn(async () => {});
  const setBackgroundColor = vi.fn((color: string) => {
    canvas.backgroundColor = color;
  });
  const destroy = vi.fn();
  const useAll = vi.fn();
  const historyClear = vi.fn();
  const addObjectOfType = vi.fn(async () => {
    const object = { toObject: () => ({}) } as unknown as FabricObject;
    objects.push(object);
    return object;
  });
  const setObjectProperty = vi.fn();

  const engine = {
    getFabricCanvas: () => canvas,
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
