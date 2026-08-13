import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { usePagesContext } from "./usePagesContext";

export interface UsePageCanvasRefResult {
  containerRef: RefObject<HTMLDivElement | null>;
}

// Headless escape hatch mirroring @rifrocket/fdt-react's useCanvasEngine(): owns relocating the
// active page's Fabric canvas into a caller-supplied container div, without rendering any
// wrapping markup of its own. Must be called from inside a <PagesProvider> (reads
// usePagesContext() internally).
//
// PagesManager intentionally keeps every activated page's CanvasEngine alive off-DOM (see its
// `runtimes` map) so switching back to a page is instant with content already intact — this
// hook's job is relocating that page's existing canvas wrapper into view on each activation,
// never (re)creating one.
export function usePageCanvasRef(): UsePageCanvasRefResult {
  const { activeEngine } = usePagesContext();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !activeEngine) return;

    // Fabric wraps the lower + upper (interaction) canvases in one wrapperEl div — moving that
    // single node (not the raw <canvas>) is what keeps selection and drawing working after a
    // relocation. Fabric-DOM-structure-specific, no RendererApi equivalent
    // (FUTURE_IMPLEMENTATION.md Chunk 8.3).
    const canvas = activeEngine.getFabricCanvas();
    const wrapperEl = canvas.wrapperEl;
    container.appendChild(wrapperEl); // always re-parents; safe even mid a rapid page switch
    canvas.calcOffset();

    return () => {
      // Guard against a stale cleanup removing a wrapperEl a newer effect run already
      // relocated elsewhere (fast A->B->A switch, or React StrictMode's double-invoke).
      if (wrapperEl.parentElement === container) wrapperEl.remove();
    };
  }, [activeEngine]);

  return { containerRef };
}
