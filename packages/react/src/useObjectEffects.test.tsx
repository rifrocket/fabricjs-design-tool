import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { Rect } from "fabric";
import { EFFECTS_PROPERTY, HistoryManager, Store } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine, EngineState } from "@rifrocket/fabricjs-design-tool";
import { EditorContext } from "./context";
import { useObjectEffects } from "./useObjectEffects";

const INITIAL_STATE: EngineState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  objectIds: [],
  selectedObjectIds: [],
  canUndo: false,
  canRedo: false,
  propertyVersion: 0,
};

function createFakeEngine() {
  const store = new Store<EngineState>({ ...INITIAL_STATE });
  const history = new HistoryManager();
  const requestRenderAll = vi.fn();
  const engine = {
    store,
    history,
    getFabricCanvas: () => ({ requestRenderAll }),
    // useObjectEffects reads engine.renderer.requestRender(), not getFabricCanvas(), as of
    // @rifrocket/fabricjs-design-tool's FUTURE_IMPLEMENTATION.md Chunk 8.2.
    renderer: { requestRender: requestRenderAll },
  } as unknown as CanvasEngine;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <EditorContext.Provider value={engine}>{children}</EditorContext.Provider>
  );
  return { engine, wrapper, requestRenderAll };
}

describe("useObjectEffects", () => {
  it("returns an empty stack for an object with no effects", () => {
    const { wrapper } = createFakeEngine();
    const rect = new Rect();

    const { result } = renderHook(() => useObjectEffects(rect), { wrapper });

    expect(result.current.stack).toEqual([]);
  });

  it("returns an empty stack and a no-op apply when there is no object", () => {
    const { wrapper } = createFakeEngine();

    const { result } = renderHook(() => useObjectEffects(undefined), { wrapper });

    expect(result.current.stack).toEqual([]);
    expect(() => result.current.apply([])).not.toThrow();
  });

  it("reads the object's current effect stack", () => {
    const { wrapper } = createFakeEngine();
    const rect = new Rect();
    rect.set(EFFECTS_PROPERTY, [{ instanceId: "shadow_1", effectId: "shadow", enabled: true, props: {} }]);

    const { result } = renderHook(() => useObjectEffects(rect), { wrapper });

    expect(result.current.stack).toHaveLength(1);
  });

  it("apply sets the stack on the object and re-renders the canvas", () => {
    const { wrapper, requestRenderAll } = createFakeEngine();
    const rect = new Rect();
    const nextStack = [{ instanceId: "shadow_1", effectId: "shadow", enabled: true, props: {} }];

    const { result } = renderHook(() => useObjectEffects(rect), { wrapper });
    result.current.apply(nextStack);

    expect(rect.get(EFFECTS_PROPERTY)).toEqual(nextStack);
    expect(requestRenderAll).toHaveBeenCalled();
  });

  it("apply is undoable through engine.history", () => {
    const { wrapper, engine } = createFakeEngine();
    const rect = new Rect();
    const nextStack = [{ instanceId: "shadow_1", effectId: "shadow", enabled: true, props: {} }];

    const { result } = renderHook(() => useObjectEffects(rect), { wrapper });
    result.current.apply(nextStack);
    engine.history.undo();

    expect(rect.get(EFFECTS_PROPERTY)).toEqual([]);
  });

  it("apply bumps propertyVersion and syncs canUndo", () => {
    const { wrapper, engine } = createFakeEngine();
    const rect = new Rect();

    const { result } = renderHook(() => useObjectEffects(rect), { wrapper });
    result.current.apply([{ instanceId: "shadow_1", effectId: "shadow", enabled: true, props: {} }]);

    expect(engine.store.getState().propertyVersion).toBe(1);
    expect(engine.store.getState().canUndo).toBe(true);
  });
});
