import { useEffect, useRef } from "react";
import type { ComponentType, ReactElement } from "react";
import type { CanvasEngine, EditorPlugin, PresetShortcutsConfig, SnapEngineOptions } from "@rifrocket/fabricjs-design-tool";
import { EditorContext } from "./context";
import { PanelSlot } from "./PanelSlot";
import { setupDefaultShortcuts } from "./setupDefaultShortcuts";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useCanvasEngine } from "./useCanvasEngine";

export type EditorTheme = "light" | "dark" | "system";

// tokens.css only defines "light"/"dark" token sets — "system" is a resolved-at-render-time
// convenience, never a literal attribute value; setting it verbatim (the previous behavior)
// meant it never matched either token set and no --fdt-* variable ever applied for the default
// theme value.
// Exported for consumers building their own chrome around a non-<Editor> engine (e.g.
// @rifrocket/fdt-plugin-pages' <MultiPageDesignEditor>) who still want <Editor>'s exact
// "system" resolution and data-fdt-theme convention, instead of reimplementing it.
export function resolveTheme(theme: EditorTheme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export interface EditorProps {
  // Read once, at construction: installing a different set of plugins on a live engine has no
  // safe general story (uninstall ordering, plugin-held state), so this is a construction-time
  // option, not a reactive prop. To swap plugins, remount with a new `key` (e.g. `key={docId}`)
  // rather than changing this array in place.
  plugins?: EditorPlugin[];
  theme?: EditorTheme;
  width?: number;
  height?: number;
  backgroundColor?: string;
  // Also read once, at construction, same as `plugins` — see that prop's comment.
  snapping?: SnapEngineOptions;
  // Also read once, at construction, same as `plugins`. `disable` removes a combo from the
  // built-in default bindings (undo/redo/delete/deselect/tool activation) before it's
  // registered; `add` registers extra combos alongside them. Without this, the only way to
  // remove a default binding was reaching into `engine.shortcuts` manually post-`onReady`.
  shortcuts?: PresetShortcutsConfig;
  slots?: Record<string, ComponentType>;
  // Fired once synchronously when the engine is constructed. If your handler does anything async
  // before touching the engine again, check `engine.isDestroyed()` after each await and bail if
  // true — <Editor> can tear the engine down mid-flight (unmount, remount via a new `key`, or
  // React 19 StrictMode's double-invoked effects), and calling methods on a disposed engine throws.
  onReady?: (engine: CanvasEngine) => void;
  className?: string;
  ariaLabel?: string;
}

// The v2 public entry point: replaces hand-wiring ~6 hooks and ~9 components (v1's App.tsx)
// with one composable component backed by useCanvasEngine()/createEngine() from
// @rifrocket/fabricjs-design-tool. For a custom application shell beyond the 3 slots below, use
// useCanvasEngine() directly and re-provide EditorContext around your own layout instead.
export function Editor(props: EditorProps): ReactElement {
  const {
    plugins = [],
    theme = "system",
    width,
    height,
    backgroundColor,
    snapping,
    shortcuts,
    slots = {},
    onReady,
    className,
    ariaLabel = "Design canvas",
  } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { engine } = useCanvasEngine(canvasRef, { plugins, width, height, backgroundColor, snapping, onReady });

  useEffect(() => {
    if (!engine) return;
    const unregisterDefaults = setupDefaultShortcuts(engine, shortcuts?.disable);
    const unregisterAdded = Object.entries(shortcuts?.add ?? {}).map(([combo, { handler, description }]) =>
      engine.shortcuts.register(combo, () => handler(engine), description),
    );
    return () => {
      unregisterDefaults();
      unregisterAdded.forEach((unregister) => unregister());
    };
  }, [engine, shortcuts]);

  useKeyboardShortcuts(engine?.shortcuts ?? null);

  return (
    <div className={className} data-fdt-theme={resolveTheme(theme)} role="application" aria-label={ariaLabel}>
      <canvas ref={canvasRef} aria-label={ariaLabel} />
      {engine && (
        <EditorContext.Provider value={engine}>
          <PanelSlot name="toolbar-start" override={slots["toolbar-start"]} />
          <PanelSlot name="sidebar-right" override={slots["sidebar-right"]} />
          <PanelSlot name="properties-footer" override={slots["properties-footer"]} />
        </EditorContext.Provider>
      )}
    </div>
  );
}
