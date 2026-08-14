import { useContext, useState } from "react";
import type { ReactElement } from "react";
import { Download, ChevronDown } from "lucide-react";
import { useEditor } from "@rifrocket/fdt-react";
import type { CanvasEngine, ExportFormat, ExportResult } from "@rifrocket/fabricjs-design-tool";
import { getContainerSize } from "@rifrocket/fdt-plugin-pan-zoom";
import { PagesContext } from "@rifrocket/fdt-plugin-pages/react";
import type { PageMeta, PagesManager } from "@rifrocket/fdt-plugin-pages";
import { exportPdfMultiPage } from "@rifrocket/fdt-plugin-export-pdf";
import { downloadExport } from "../../utils/downloadExport";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { logUiEvent } from "../../dev-tools/uiEventLog";

// "pdf" isn't part of core's ExportFormat union — PDF export moved to @rifrocket/fdt-plugin-export-pdf
// (installed in engine/EngineHost.tsx), which core has no static knowledge of.
type DemoExportFormat = ExportFormat | "pdf";

const FORMATS: Array<{ value: DemoExportFormat; label: string }> = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "svg", label: "SVG" },
  { value: "json", label: "JSON" },
  { value: "pdf", label: "PDF" },
];

interface ViewportSnapshot {
  zoom: number;
  pan: { x: number; y: number };
  width: number;
  height: number;
}

// The canvas element is a pannable/zoomable viewport, not the page — resize it to the page's
// exact bounds at zoom 1/pan 0 before capturing, same reason runExport()'s own single-canvas
// dance does this. Self-contained (reads/writes only the engine, no DOM query), so it works
// identically for a page that's currently mounted/visible and one that isn't — needed here since
// a pair's other side may not be the one currently on screen.
function resetToDocument(engine: CanvasEngine, size: { width: number; height: number }): ViewportSnapshot {
  // RendererApi's ViewportApi has setDimensions() but no getter for the current canvas
  // dimensions — no equivalent to read back from yet (FUTURE_IMPLEMENTATION.md Chunk 8.3), so
  // this stays on getFabricCanvas().
  const canvas = engine.getFabricCanvas();
  const snapshot: ViewportSnapshot = {
    zoom: engine.viewport.getZoom(),
    pan: engine.viewport.getPan(),
    width: canvas.getWidth(),
    height: canvas.getHeight(),
  };
  engine.setZoom(1, { resizeElement: false });
  engine.setDimensions(size.width, size.height);
  engine.panTo(0, 0);
  return snapshot;
}

function restoreViewport(engine: CanvasEngine, snapshot: ViewportSnapshot): void {
  engine.setDimensions(snapshot.width, snapshot.height);
  engine.setZoom(snapshot.zoom, { resizeElement: false });
  engine.panTo(-snapshot.pan.x, -snapshot.pan.y);
}

// A front/back pair (@rifrocket/fdt-plugin-pages) exports as one multi-page, print-ready PDF
// instead of just the currently active side — see exportPdfMultiPage's own doc comment. The
// other side's engine may not exist yet (lazy creation), so setActivePage() is used rather than
// getEngine() to guarantee both are created, then the original active page is restored.
async function exportPagePair(manager: PagesManager, activeMeta: PageMeta, siblingMeta: PageMeta): Promise<void> {
  const frontMeta = activeMeta.pairSide === "front" ? activeMeta : siblingMeta;
  const backMeta = activeMeta.pairSide === "front" ? siblingMeta : activeMeta;

  const frontEngine = await manager.setActivePage(frontMeta.id);
  const backEngine = await manager.setActivePage(backMeta.id);
  await manager.setActivePage(activeMeta.id);

  const frontPrev = resetToDocument(frontEngine, frontMeta);
  const backPrev = resetToDocument(backEngine, backMeta);
  // exportPdfMultiPage (plugin-export-pdf) is Fabric-specific PDF rendering built on jsPDF —
  // entirely outside RendererApi's scope, not just missing a member from it
  // (FUTURE_IMPLEMENTATION.md Chunk 8.3).
  const result = exportPdfMultiPage([frontEngine.getFabricCanvas(), backEngine.getFabricCanvas()], {
    pageSize: "match-canvas",
    marginMm: 0,
  });
  restoreViewport(frontEngine, frontPrev);
  restoreViewport(backEngine, backPrev);

  // PdfExportResult and core's ExportResult are structurally compatible ({ format, fileName,
  // mimeType, data }) but "pdf" isn't in core's own ExportFormat union, since core has no static
  // knowledge of a format that lives in this separate plugin — same reason the single-page path
  // below casts engine.export("pdf")'s result to ExportResult too.
  downloadExport(result as unknown as ExportResult);
}

// documentSize/containerSelector are threaded down from AppShell.tsx so this works against
// either mode (EngineHost's activeTemplate + CANVAS_CONTAINER_SELECTOR, or the active page from
// plugin-pages' PagesManager + PAGES_CANVAS_CONTAINER_SELECTOR) without this component reaching
// into a mode-specific context or constant itself.
export function ExportMenu({
  documentSize,
  containerSelector,
}: {
  documentSize: { width: number; height: number };
  containerSelector: string;
}): ReactElement {
  const engine = useEditor();
  const [open, setOpen] = useState(false);

  // null outside a <PagesProvider> (workspace mode) — see PagesContext's own default value.
  // Reading the context directly rather than usePagesContext() (which throws when missing) is
  // what lets this generic, mode-shared menu stay mode-agnostic instead of needing a separate
  // pages-only export menu.
  const pagesContext = useContext(PagesContext);
  const activePage = pagesContext?.pages.find((page) => page.id === pagesContext.activePageId);
  const pairSibling = activePage?.pairId ? (pagesContext?.manager.getPairSibling(activePage.id) ?? null) : null;

  // PNG/JPEG/SVG/PDF exporters render the canvas's current on-screen content, but the canvas
  // element is a pannable/zoomable viewport, not the page — so for the export instant only,
  // resize it to the page's exact bounds at zoom 1/pan 0, export, then restore the real
  // viewport synchronously (no visible flash). JSON serializes object properties instead and
  // skips this.
  const runExport = async (format: DemoExportFormat, label: string) => {
    if (format === "json") {
      downloadExport(engine.export(format) as ExportResult);
      logUiEvent(`Export ${label}`);
      setOpen(false);
      return;
    }

    if (format === "pdf" && pagesContext && activePage && pairSibling) {
      await exportPagePair(pagesContext.manager, activePage, pairSibling);
      logUiEvent(`Export ${label} (front + back)`);
      setOpen(false);
      return;
    }

    const previousZoom = engine.viewport.getZoom();
    const previousPan = engine.viewport.getPan();
    const previousViewportSize = getContainerSize(containerSelector);

    // Zoom must reset to 1 before setDimensions(): setDimensions scales width/height by whatever
    // zoom is active at that moment, so resetting first avoids sizing to width/height * previousZoom.
    engine.setZoom(1, { resizeElement: false });
    engine.setDimensions(documentSize.width, documentSize.height);
    engine.panTo(0, 0);

    const result = engine.export(format) as ExportResult;

    if (previousViewportSize) {
      engine.setDimensions(previousViewportSize.width, previousViewportSize.height);
    }
    engine.setZoom(previousZoom, { resizeElement: false });
    engine.panTo(-previousPan.x, -previousPan.y);

    downloadExport(result);
    logUiEvent(`Export ${label}`);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center gap-1" data-tour="export-menu">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex h-8 items-center gap-1.5 rounded-lg bg-fdt-accent px-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-fdt-accent-hover"
      >
        <Download size={15} strokeWidth={2} />
        Export
        <ChevronDown size={13} strokeWidth={2.5} />
      </button>
      <InfoTooltip featureKey="export" />
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fdt-animate-scale-in absolute right-0 top-full z-50 mt-1 w-32 rounded-lg border border-fdt-border bg-fdt-bg-elevated p-1 shadow-xl">
            {FORMATS.map((format) => (
              <button
                key={format.value}
                type="button"
                onClick={() => void runExport(format.value, format.label)}
                className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm text-fdt-fg hover:bg-fdt-bg"
              >
                {format.value === "pdf" && pairSibling ? `${format.label} (front + back)` : format.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
