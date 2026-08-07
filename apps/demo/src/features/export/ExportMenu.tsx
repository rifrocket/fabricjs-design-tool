import { useState } from "react";
import type { ReactElement } from "react";
import { Download, ChevronDown } from "lucide-react";
import { useEditor } from "@rifrocket/fdt-react";
import type { ExportFormat, ExportResult } from "@rifrocket/fabricjs-design-tool";
import { getContainerSize } from "@rifrocket/fdt-plugin-pan-zoom";
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

  // PNG/JPEG/SVG/PDF exporters render the canvas's current on-screen content, but the canvas
  // element is a pannable/zoomable viewport, not the page — so for the export instant only,
  // resize it to the page's exact bounds at zoom 1/pan 0, export, then restore the real
  // viewport synchronously (no visible flash). JSON serializes object properties instead and
  // skips this.
  const runExport = (format: DemoExportFormat, label: string) => {
    if (format === "json") {
      downloadExport(engine.export(format) as ExportResult);
      logUiEvent(`Export ${label}`);
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
    <div className="relative flex items-center gap-1">
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
                onClick={() => runExport(format.value, format.label)}
                className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm text-fdt-fg hover:bg-fdt-bg"
              >
                {format.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
