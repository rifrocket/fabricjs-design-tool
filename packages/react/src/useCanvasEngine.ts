import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { createEngine } from "@rifrocket/fdt-core";
import type { CanvasEngine, EditorPlugin, EngineOptions } from "@rifrocket/fdt-core";

export interface UseCanvasEngineOptions extends EngineOptions {
  plugins?: EditorPlugin[];
  // Fired once synchronously when the engine is constructed. If your handler awaits anything,
  // check `engine.isDestroyed()` afterward before touching the engine again — see the mount
  // effect below for the real race this guards against.
  onReady?: (engine: CanvasEngine) => void;
}

export interface UseCanvasEngineResult {
  engine: CanvasEngine | null;
}

// Headless escape hatch for consumers building a custom application shell (header, multiple
// sidebars, floating panels — anything beyond <Editor>'s 3 fixed slots): owns engine
// construction/teardown against a caller-supplied <canvas> ref, without rendering any slots or
// wrapping markup. Re-provide EditorContext with the returned engine to get useEditor()/
// useEditorState() working throughout your own shell — this is the same pattern <Editor> uses
// internally (see Editor.tsx) and that apps/demo previously had to reimplement by hand before
// this hook existed:
//
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const { engine } = useCanvasEngine(canvasRef, { plugins, width, height });
//   return (
//     <EditorContext.Provider value={engine}>
//       <YourAppShell><canvas ref={canvasRef} /></YourAppShell>
//     </EditorContext.Provider>
//   );
export function useCanvasEngine(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: UseCanvasEngineOptions = {},
): UseCanvasEngineResult {
  const { plugins = [], onReady, width, height, backgroundColor, snapping } = options;
  const [engine, setEngine] = useState<CanvasEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const instance = createEngine(canvasRef.current, { width, height, backgroundColor, snapping });
    instance.useAll(plugins);
    setEngine(instance);
    // onReady is fire-and-forget (this effect can't await it), so an async handler can resume
    // *after* this effect's cleanup has already fired — most reliably under React 19 StrictMode's
    // dev-only double-invoke, but also on a fast real remount (e.g. `key` changing mid-onReady).
    // CanvasEngine.isDestroyed() lets such a handler check before touching a disposed engine.
    onReady?.(instance);
    return () => instance.destroy();
    // The engine (and its plugin set) is constructed exactly once; width/height/backgroundColor
    // are re-applied reactively below instead of forcing a remount on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!engine || width === undefined || height === undefined) return;
    engine.setDimensions(width, height);
  }, [engine, width, height]);

  useEffect(() => {
    if (!engine || backgroundColor === undefined) return;
    engine.setBackgroundColor(backgroundColor);
  }, [engine, backgroundColor]);

  return { engine };
}
