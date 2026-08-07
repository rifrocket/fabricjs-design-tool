import { useState } from "react";
import type { ReactElement } from "react";
import { useEditor } from "@rifrocket/fdt-react";
import { setCanvasZoom, centerContent, findPageBoundary } from "@rifrocket/fdt-plugin-pan-zoom";
import { useTemplateContext } from "../../templates/TemplateContext";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { logUiEvent } from "../../dev-tools/uiEventLog";
import { CANVAS_CONTAINER_SELECTOR } from "../viewport/canvasContainerSelector";

const MIN_DIMENSION = 20;
const MAX_DIMENSION = 4000;

const FIELD_CLASS =
  "w-20 rounded-md border border-fdt-border bg-fdt-bg px-2 py-1 text-sm text-fdt-fg outline-none focus:border-fdt-accent";

// The page's bounds live on a dedicated Fabric rect (createPageBoundaryRect), not the canvas
// element's own size, so resizing the page means resizing that rect directly, not calling
// engine.setDimensions() (which controls the viewport instead).
export function CanvasSizeFields(): ReactElement {
  const engine = useEditor();
  const { activeTemplate, setCustomSize } = useTemplateContext();
  const [width, setWidth] = useState(String(Math.round(activeTemplate.width)));
  const [height, setHeight] = useState(String(Math.round(activeTemplate.height)));

  const clampDimension = (raw: string, fallback: number): number => {
    const parsed = Math.round(Number(raw));
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(Math.max(parsed, MIN_DIMENSION), MAX_DIMENSION);
  };

  const apply = () => {
    const nextWidth = clampDimension(width, activeTemplate.width);
    const nextHeight = clampDimension(height, activeTemplate.height);
    setWidth(String(nextWidth));
    setHeight(String(nextHeight));

    const pageBoundary = findPageBoundary(engine);
    if (pageBoundary) {
      pageBoundary.set({ width: nextWidth, height: nextHeight });
      pageBoundary.setCoords();
      engine.getFabricCanvas().requestRenderAll();
    }
    setCanvasZoom(engine, 1);
    setCustomSize(nextWidth, nextHeight);
    centerContent(engine, nextWidth, nextHeight, CANVAS_CONTAINER_SELECTOR);
    logUiEvent("Resize canvas", { width: nextWidth, height: nextHeight });
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
        Canvas size
        <InfoTooltip featureKey="canvasSize" />
      </div>
      <div className="flex items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
          Width
          <input
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && apply()}
            className={FIELD_CLASS}
          />
        </label>
        <span className="pb-1.5 text-fdt-fg-muted">×</span>
        <label className="flex flex-col gap-1 text-xs text-fdt-fg-muted">
          Height
          <input
            type="number"
            min={MIN_DIMENSION}
            max={MAX_DIMENSION}
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && apply()}
            className={FIELD_CLASS}
          />
        </label>
        <button
          type="button"
          onClick={apply}
          className="h-[30px] rounded-md bg-fdt-accent px-3 text-xs font-medium text-white transition-colors duration-150 hover:bg-fdt-accent-hover"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
