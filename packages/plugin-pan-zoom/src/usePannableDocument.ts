import { useEffect } from "react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { useContainerSize } from "./useContainerSize";
import type { ContainerSize } from "./useContainerSize";
import { useCanvasPanZoom } from "./useCanvasPanZoom";
import { centerContent } from "./centerContent";
import { createPageBoundaryRect, findPageBoundary } from "./pageBoundary";

export interface UsePannableDocumentOptions {
  containerSelector: string;
  contentWidth: number;
  contentHeight: number;
  backgroundColor?: string;
  wheelZoomSensitivity?: number;
}

// Bundles the fixed-size-viewport + page-boundary-rect + pan/zoom + centering treatment a host
// with exactly one active document needs to size a canvas viewport against (a single document,
// or one page of a multi-page document) — one call instead of hand-wiring useContainerSize(),
// engine.setDimensions(), an idempotent boundary-rect creation, and centerContent() separately.
//
// Does nothing until engine, a real container size, AND positive contentWidth/contentHeight are
// all known — a document that hasn't resolved yet (e.g. no page activated) intentionally
// produces no boundary rect and no centering, rather than a degenerate 0x0 one.
export function usePannableDocument(
  engine: CanvasEngine | null,
  options: UsePannableDocumentOptions,
): ContainerSize | null {
  const { containerSelector, contentWidth, contentHeight, backgroundColor, wheelZoomSensitivity } = options;
  const containerSize = useContainerSize(containerSelector);
  useCanvasPanZoom(engine, { containerSelector, wheelZoomSensitivity });

  useEffect(() => {
    if (!engine || !containerSize || contentWidth <= 0 || contentHeight <= 0) return;
    engine.setDimensions(containerSize.width, containerSize.height);
    engine.getFabricCanvas().calcOffset();

    // Created once and left in place for any host that keeps this engine alive across
    // re-renders (e.g. @rifrocket/fdt-plugin-pages, which keeps one CanvasEngine per page) —
    // findPageBoundary makes this idempotent rather than re-creating on every effect run.
    if (!findPageBoundary(engine)) {
      const boundary = createPageBoundaryRect({ width: contentWidth, height: contentHeight, backgroundColor });
      engine.getFabricCanvas().add(boundary);
      engine.layers.sendToBack(boundary);
    }

    centerContent(engine, contentWidth, contentHeight, containerSelector);
  }, [engine, containerSize, contentWidth, contentHeight, backgroundColor, containerSelector]);

  return containerSize;
}
