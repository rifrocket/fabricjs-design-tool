import type { ReactElement } from "react";
import { usePageCanvasRef, usePagesContext } from "@rifrocket/fdt-plugin-pages/react";
import { usePannableDocument } from "@rifrocket/fdt-plugin-pan-zoom";
import { ZoomBadge } from "../features/viewport/ZoomBadge";
import { PAGES_CANVAS_CONTAINER_SELECTOR } from "./pagesCanvasContainerSelector";

// Pan/zoom parity with the single-page workspace (see shell/CanvasWorkspace.tsx + EngineHost.tsx's
// handleReady): usePannableDocument bundles the same fixed-viewport-plus-page-boundary-rect
// treatment into one call, re-applied on every page *activation* here instead of once at
// construction, since PagesManager keeps one CanvasEngine alive per page rather than remounting
// on document change. Uses usePageCanvasRef() (the headless primitive), not <PagesCanvas>,
// specifically because this needs a container with its own data-attribute and sizing rather than
// the batteries-included component's own div.
export function PageCanvasHost(): ReactElement {
  const { activeEngine, pages, activePageId } = usePagesContext();
  const { containerRef } = usePageCanvasRef();
  const activePage = pages.find((page) => page.id === activePageId) ?? null;

  usePannableDocument(activeEngine, {
    containerSelector: PAGES_CANVAS_CONTAINER_SELECTOR,
    contentWidth: activePage?.width ?? 0,
    contentHeight: activePage?.height ?? 0,
    backgroundColor: activePage?.backgroundColor,
  });

  return (
    <main
      data-fdt-pages-canvas-container="true"
      className="fdt-canvas-dot-grid relative flex h-full w-full items-center justify-center overflow-hidden bg-fdt-bg"
    >
      <div ref={containerRef} className="absolute inset-0" />
      {activeEngine ? (
        <ZoomBadge />
      ) : (
        <p className="pointer-events-none text-sm text-fdt-fg-muted">Add a page to get started.</p>
      )}
    </main>
  );
}
