import type { FabricObject } from "fabric";
import { EffectStackCommand, getEffectStack } from "@rifrocket/fdt-core";
import type { EffectStack } from "@rifrocket/fdt-core";
import { useEditor } from "./useEditor";
import { useEditorState } from "./useEditorState";

export interface UseObjectEffectsResult {
  stack: EffectStack;
  apply: (next: EffectStack) => void;
}

// Reactive read/write access to one object's effect stack. Re-renders on every property
// mutation (not just selection changes) via propertyVersion — the same trigger PropertiesPanel
// relies on, since editing the stack mutates the object without changing selectedObjectIds.
//
// `apply` goes through engine.history directly with a dedicated EffectStackCommand rather than
// engine.setObjectProperty's generic SetPropertyCommand: every stack mutation (add, remove,
// toggle, reorder, duplicate, a props edit) writes to the same "fdtEffects" key, and
// SetPropertyCommand merges any two consecutive same-key writes unconditionally — that would
// collapse a whole editing session (add an effect, drag a slider, remove it) into one undo step.
// EffectStackCommand only merges a pure single-instance props edit (an actual slider drag), so
// every other mutation becomes its own undo step. requestRenderAll()/propertyVersion are bumped
// the same way setObjectProperty does internally, since this bypasses it entirely.
export function useObjectEffects(object: FabricObject | undefined): UseObjectEffectsResult {
  const engine = useEditor();
  useEditorState((state) => state.propertyVersion);
  const stack = object ? getEffectStack(object) : [];

  const apply = (next: EffectStack) => {
    if (!object) return;
    engine.history.execute(EffectStackCommand.capture(object, next));
    engine.getFabricCanvas().requestRenderAll();
    // canUndo/canRedo aren't notified by history.execute() alone (HistoryManager holds no store
    // reference) — resynced by hand via the same public Store API EngineHost.tsx already uses
    // for the same reason after engine.history.clear().
    engine.store.setState((state) => ({
      propertyVersion: state.propertyVersion + 1,
      canUndo: engine.history.canUndo(),
      canRedo: engine.history.canRedo(),
    }));
  };

  return { stack, apply };
}
