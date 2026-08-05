import type { ReactElement } from "react";
import { useEditorState } from "@rifrocket/fdt-react";
import { applyViewportTransform } from "@rifrocket/fabricjs-design-tool";
import { useCanvasPanZoom } from "@rifrocket/fdt-plugin-pan-zoom";
import { useEngineOrNull } from "../engine/useEngineOrNull";
import { useTemplateContext } from "../templates/TemplateContext";
import { GuidesOverlay } from "../features/viewport/GuidesOverlay";
import { ZoomBadge } from "../features/viewport/ZoomBadge";
import { CANVAS_CONTAINER_SELECTOR } from "../features/viewport/canvasContainerSelector";
import type { TemplateDefinition } from "../templates/types";

// No ruler: <Ruler> isn't pinned to the viewport edge, so it scrolls out of view exactly when
// panning/zooming would make it useful — removed rather than made pan-aware sticky.
//
// The container is a fixed-size, non-scrolling viewport — panning/zooming moves content within
// it via Fabric's own viewportTransform (useCanvasPanZoom.ts) instead of scrolling.
export function CanvasWorkspace({ editor }: { editor: ReactElement }): ReactElement {
  const engine = useEngineOrNull();
  const { activeTemplate } = useTemplateContext();
  useCanvasPanZoom(engine, { containerSelector: CANVAS_CONTAINER_SELECTOR });

  return (
    <main
      data-fdt-canvas-container="true"
      className="fdt-canvas-dot-grid relative flex flex-1 overflow-hidden bg-fdt-bg"
    >
      <div className="relative h-full w-full">
        {editor}
        {engine && <ZoomAwareOverlay template={activeTemplate} />}
        {engine && <ZoomBadge />}
      </div>
    </main>
  );
}

// Only mounted once the engine is ready. Converts the page's doc-space bounds to screen-space
// via the current pan/zoom so the guides overlay tracks the page wherever it's been panned to.
function ZoomAwareOverlay({ template }: { template: TemplateDefinition }): ReactElement {
  const zoom = useEditorState((state) => state.zoom);
  const panX = useEditorState((state) => state.panX);
  const panY = useEditorState((state) => state.panY);
  const origin = applyViewportTransform(0, 0, [zoom, 0, 0, zoom, panX, panY]);

  return <GuidesOverlay left={origin.x} top={origin.y} width={template.width * zoom} height={template.height * zoom} />;
}
