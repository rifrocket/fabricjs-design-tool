import type { ReactElement } from "react";
import { Minus, Plus, Maximize } from "lucide-react";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";
import { setCanvasZoom, centerContent, getContainerSize } from "@rifrocket/fdt-plugin-pan-zoom";
import { InfoTooltip } from "../../docs/InfoTooltip";

const ZOOM_STEP = 0.1;
const MIN_ZOOM_UI = 0.1;
const MAX_ZOOM_UI = 5;
const RULER_AND_PADDING_ALLOWANCE = 100;

const BUTTON_CLASS =
  "flex h-6 w-6 items-center justify-center rounded text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg";

// documentSize/containerSelector are threaded down from AppShell.tsx so this works against
// either mode (the workspace's activeTemplate size + CANVAS_CONTAINER_SELECTOR, or the active
// page's own size + PAGES_CANVAS_CONTAINER_SELECTOR in the multi-page example) without this
// component needing to know which one it's in.
//
// applyZoom() always follows setCanvasZoom() with centerContent(): a plain setZoom() with no
// anchor zooms from the viewport's top-left corner, drifting the page out of view over repeated
// clicks otherwise. Continuous wheel-zoom anchors on the cursor instead and skips this.
export function ZoomControls({
  documentSize,
  containerSelector,
}: {
  documentSize: { width: number; height: number };
  containerSelector: string;
}): ReactElement {
  const engine = useEditor();
  const zoom = useEditorState((state) => state.zoom);

  const applyZoom = (value: number) => {
    setCanvasZoom(engine, value);
    centerContent(engine, documentSize.width, documentSize.height, containerSelector);
  };

  const fitToScreen = () => {
    const container = getContainerSize(containerSelector);
    if (!container) return;
    const scale = Math.min(
      (container.width - RULER_AND_PADDING_ALLOWANCE) / documentSize.width,
      (container.height - RULER_AND_PADDING_ALLOWANCE) / documentSize.height,
      MAX_ZOOM_UI,
    );
    applyZoom(Math.max(scale, MIN_ZOOM_UI));
  };

  return (
    <div className="flex items-center gap-1 text-xs text-fdt-fg-muted">
      <InfoTooltip featureKey="zoomPan" />
      <button
        type="button"
        title="Zoom out"
        className={BUTTON_CLASS}
        onClick={() => applyZoom(engine.viewport.getZoom() - ZOOM_STEP)}
      >
        <Minus size={13} strokeWidth={2.5} />
      </button>
      <input
        type="range"
        min={MIN_ZOOM_UI}
        max={MAX_ZOOM_UI}
        step={0.01}
        value={zoom}
        onChange={(event) => applyZoom(Number(event.target.value))}
        className="w-20 accent-fdt-accent"
      />
      <button
        type="button"
        title="Zoom in"
        className={BUTTON_CLASS}
        onClick={() => applyZoom(engine.viewport.getZoom() + ZOOM_STEP)}
      >
        <Plus size={13} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => applyZoom(1)}
        className="min-w-[3.5rem] rounded px-1 text-center hover:bg-fdt-bg-elevated hover:text-fdt-fg"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={fitToScreen}
        className="rounded p-1 hover:bg-fdt-bg-elevated hover:text-fdt-fg"
        title="Fit to screen"
      >
        <Maximize size={13} strokeWidth={2} />
      </button>
    </div>
  );
}
