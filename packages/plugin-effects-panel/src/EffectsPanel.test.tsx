import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rect } from "fabric";
import { EFFECTS_PROPERTY, HistoryManager, PluginRegistry, Store } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine, EffectDefinition, EngineState } from "@rifrocket/fabricjs-design-tool";
import { EditorContext } from "@rifrocket/fdt-react";
import { EffectsPanel } from "./EffectsPanel";

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

const shadowDefinition: EffectDefinition<{ blur: number }> = {
  id: "shadow",
  category: "basic",
  label: "Shadow",
  track: "compositing",
  schema: [{ kind: "slider", key: "blur", label: "Blur", min: 0, max: 50, step: 1 }],
  defaults: { blur: 10 },
};

function createFakeEngine(activeObject: Rect | undefined) {
  const store = new Store<EngineState>({ ...INITIAL_STATE });
  const history = new HistoryManager();
  const pluginRegistry = new PluginRegistry();
  pluginRegistry.effects.register(shadowDefinition);
  const requestRenderAll = vi.fn();
  const engine = {
    store,
    history,
    registry: pluginRegistry,
    selection: { getActiveObjects: () => (activeObject ? [activeObject] : []) },
    getFabricCanvas: () => ({ requestRenderAll }),
    // @rifrocket/fdt-react's useObjectEffects reads engine.renderer.requestRender(), not
    // getFabricCanvas(), as of @rifrocket/fabricjs-design-tool's FUTURE_IMPLEMENTATION.md
    // Chunk 8.2.
    renderer: { requestRender: requestRenderAll },
  } as unknown as CanvasEngine;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <EditorContext.Provider value={engine}>{children}</EditorContext.Provider>
  );
  return { engine, wrapper };
}

describe("EffectsPanel", () => {
  it("renders nothing when there is no active object", () => {
    const { wrapper } = createFakeEngine(undefined);
    const { container } = render(<EffectsPanel />, { wrapper });
    expect(container.innerHTML).toBe("");
  });

  it("renders the effect gallery for the active object", () => {
    const { wrapper } = createFakeEngine(new Rect());
    render(<EffectsPanel />, { wrapper });
    expect(screen.getByRole("button", { name: "Shadow" })).not.toBeNull();
  });

  it("adds an effect from the gallery to the object's stack", () => {
    const rect = new Rect();
    const { wrapper } = createFakeEngine(rect);
    render(<EffectsPanel />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: "Shadow" }));

    expect(rect.get(EFFECTS_PROPERTY)).toHaveLength(1);
    expect((rect.get(EFFECTS_PROPERTY) as { effectId: string }[])[0].effectId).toBe("shadow");
  });

  it("shows 'Reset all' once an effect is applied, and it clears the stack", () => {
    const rect = new Rect();
    const { wrapper } = createFakeEngine(rect);
    render(<EffectsPanel />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: "Shadow" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));

    expect(rect.get(EFFECTS_PROPERTY)).toEqual([]);
  });

  it("renders headingExtra next to the Effects heading", () => {
    const { wrapper } = createFakeEngine(new Rect());
    render(<EffectsPanel headingExtra={<span>extra</span>} />, { wrapper });
    expect(screen.getByText("extra")).not.toBeNull();
  });
});
