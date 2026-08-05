import type { EditorPlugin } from "@rifrocket/fdt-core";
import { exportPdf } from "./exportPdf";

export const exportPdfPlugin: EditorPlugin = {
  name: "export-pdf",
  install(engine) {
    engine.registry.registerExporter("pdf", exportPdf);
  },
};
