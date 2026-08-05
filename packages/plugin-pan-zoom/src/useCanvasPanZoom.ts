import { useEffect } from "react";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import type { TPointerEventInfo, TPointerEvent } from "fabric";
import { setCanvasZoom } from "./setCanvasZoom";

const DEFAULT_WHEEL_ZOOM_SENSITIVITY = 0.001;

export interface UseCanvasPanZoomOptions {
  // CSS selector for the panning container (not just the canvas element) — typically the same
  // fixed-size viewport container useContainerSize() uses.
  containerSelector: string;
  wheelZoomSensitivity?: number;
}

// Wheel-zoom and spacebar-drag-pan have no equivalent in @rifrocket/fdt-core beyond raw
// viewport math (setZoom/zoomBy/pan); this hook is the interaction layer on top, built through
// the getFabricCanvas() escape hatch since neither wheel events nor "held key" state are
// exposed by any manager.
//
// Assumes the canvas element is a fixed-size viewport, not resized to match zoomed content —
// both gestures move content within that fixed element via viewportTransform instead of
// scrolling a container.
export function useCanvasPanZoom(engine: CanvasEngine | null, options: UseCanvasPanZoomOptions): void {
  const { containerSelector, wheelZoomSensitivity = DEFAULT_WHEEL_ZOOM_SENSITIVITY } = options;

  useEffect(() => {
    if (!engine) return;
    const canvas = engine.getFabricCanvas();
    const container = document.querySelector<HTMLElement>(containerSelector);

    const handleWheel = (event: TPointerEventInfo<TPointerEvent>) => {
      const wheelEvent = event.e as WheelEvent;
      wheelEvent.preventDefault();
      wheelEvent.stopPropagation();
      const factor = 1 - wheelEvent.deltaY * wheelZoomSensitivity;
      // Anchored on the cursor so the point under the mouse stays put while zooming; unlike
      // button zoom, there's no recentering afterward since that would fight the gesture.
      setCanvasZoom(engine, engine.viewport.getZoom() * factor, event.viewportPoint);
    };

    let spacePressed = false;
    let panning = false;
    let lastClientX = 0;
    let lastClientY = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || spacePressed) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      // Without this, the browser's default Space behavior still fires: it scrolls the page
      // and can re-trigger whatever control last had focus, mid-pan.
      event.preventDefault();
      spacePressed = true;
      canvas.defaultCursor = "grab";
      canvas.selection = false;
      canvas.skipTargetFind = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      spacePressed = false;
      panning = false;
      canvas.defaultCursor = "default";
      canvas.selection = true;
      canvas.skipTargetFind = false;
    };

    // Bound to the container, not canvas.on("mouse:down"), so the drag can start anywhere
    // inside it, not just on the canvas element itself.
    const handleMouseDown = (event: MouseEvent) => {
      if (!spacePressed || event.button !== 0) return;
      event.preventDefault();
      panning = true;
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      canvas.defaultCursor = "grabbing";
    };

    // Bound to window, not the canvas, so a fast drag that briefly leaves the canvas element
    // doesn't drop the gesture. engine.pan() takes a raw screen-pixel delta (Fabric's
    // relativePan), so dragging right moves the content right.
    const handleWindowMouseMove = (event: MouseEvent) => {
      if (!panning) return;
      engine.pan(event.clientX - lastClientX, event.clientY - lastClientY);
      lastClientX = event.clientX;
      lastClientY = event.clientY;
    };

    const handleWindowMouseUp = () => {
      if (!panning) return;
      panning = false;
      canvas.defaultCursor = spacePressed ? "grab" : "default";
    };

    canvas.on("mouse:wheel", handleWheel);
    // Capture phase: Fabric's own mousedown handler on the canvas element stops propagation,
    // so a bubble-phase listener on the container would never see a mousedown that starts
    // on the canvas.
    container?.addEventListener("mousedown", handleMouseDown, true);
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.off("mouse:wheel", handleWheel);
      container?.removeEventListener("mousedown", handleMouseDown, true);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [engine, containerSelector, wheelZoomSensitivity]);
}
