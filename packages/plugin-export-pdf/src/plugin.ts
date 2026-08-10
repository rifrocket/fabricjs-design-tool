import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { exportPdf } from "./exportPdf";
import type { PdfExportOptions } from "./exportPdf";

// Options are closed over at registration time, not passed per-export-call — core's generic
// `Exporter` type is `(canvas) => unknown`, shared by every export format, so there's no
// per-call options channel to thread through `engine.export("pdf")` without changing that type
// for every other exporter too. A consumer needing different page sizes for different exports
// registers this under a different format id per configuration (or calls exportPdf(canvas,
// options) directly, bypassing the registry) instead.
export function createExportPdfPlugin(options?: PdfExportOptions): EditorPlugin {
  return {
    name: "export-pdf",
    install(engine) {
      engine.registry.registerExporter("pdf", (canvas) => exportPdf(canvas, options));
    },
  };
}

// The zero-config default — what every existing `exportPdfPlugin` import already used, and what
// stays bundled in <DesignEditor>'s built-in presets. Use createExportPdfPlugin(options) instead
// for a custom page size/orientation/margin.
export const exportPdfPlugin: EditorPlugin = createExportPdfPlugin();
