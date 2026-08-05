import { useSyncExternalStore } from "react";
import type { EngineState } from "@rifrocket/fdt-core";
import { useEditor } from "./useEditor";

// Subscribes to a slice of engine state via useSyncExternalStore so components only
// re-render when their selected slice actually changes.
export function useEditorState<T>(selector: (state: EngineState) => T): T {
  const engine = useEditor();
  return useSyncExternalStore(
    (callback) => engine.store.subscribe(callback),
    () => selector(engine.store.getState()),
  );
}
