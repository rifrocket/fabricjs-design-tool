import { useEffect, useMemo, useRef, useState } from "react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { defaultPreset, minimalPreset } from "@rifrocket/fdt-react";
import { PagesManager } from "../PagesManager";
import type { EngineFactory } from "../PagesManager";
import type { PagesManagerOptions, PagesState } from "../types";

// Widens PagesManagerOptions.preset with the two named presets @rifrocket/fdt-react's
// <DesignEditor> also accepts — this is the one layer up PagesManagerOptions.preset's own doc
// comment refers to. PagesManager itself only ever sees a literal EditorPreset object or "none",
// resolved below, mirroring core's createEditor()/<DesignEditor> split exactly (core can't
// depend on plugin packages; only this optional /react layer can).
export interface UsePagesOptions extends Omit<PagesManagerOptions, "preset"> {
  preset?: PagesManagerOptions["preset"] | "default" | "minimal";
}

export interface UsePagesResult {
  manager: PagesManager;
  pages: PagesState["pages"];
  activePageId: string | null;
  activeEngine: CanvasEngine | null;
}

function resolvePagesPresetOption(preset: UsePagesOptions["preset"]): PagesManagerOptions["preset"] {
  if (preset === "default") return defaultPreset;
  if (preset === "minimal") return minimalPreset;
  return preset;
}

export function usePages(options: UsePagesOptions, engineFactory?: EngineFactory): UsePagesResult {
  const manager = useMemo(
    () => new PagesManager({ ...options, preset: resolvePagesPresetOption(options.preset) }, engineFactory),
    // Constructed once for the component's lifetime, matching useCanvasEngine's own "engine
    // survives prop changes" contract — see that hook's identical eslint-disable for why.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [state, setState] = useState(() => manager.store.getState());

  useEffect(() => manager.store.subscribe(setState), [manager]);

  // Deferred, cancellable destroy. manager's construction (useMemo, above) and teardown (this
  // effect) aren't naturally symmetric the way useCanvasEngine's single-engine construct+destroy
  // pair is — useMemo only ever keeps one manager instance alive across React StrictMode's
  // dev-only mount->cleanup->mount simulation, but a plain `return () => manager.destroy()` would
  // still run destroy() on that one surviving instance during the phantom cleanup, tearing down
  // (or a page engine still mid-construction via getOrCreateEngine()) moments before the very next
  // synchronous remount keeps using it. Scheduling the real destroy() one microtask later, and
  // having the next mount cancel it via the shared ref, means it only actually runs on a genuine
  // final unmount — StrictMode's cleanup+remount both complete synchronously, well before any
  // microtask gets a chance to fire.
  const pendingDestroyRef = useRef<symbol | null>(null);
  useEffect(() => {
    pendingDestroyRef.current = null;
    return () => {
      const token = Symbol();
      pendingDestroyRef.current = token;
      queueMicrotask(() => {
        if (pendingDestroyRef.current === token) manager.destroy();
      });
    };
  }, [manager]);

  const activeEngine = state.activePageId ? (manager.getEngine(state.activePageId) ?? null) : null;

  return { manager, pages: state.pages, activePageId: state.activePageId, activeEngine };
}
