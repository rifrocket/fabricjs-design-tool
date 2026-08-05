import { describe, expect, it } from "vitest";
import { Registry } from "@rifrocket/fdt-core";
import type { CanvasEngine, Exporter } from "@rifrocket/fdt-core";
import { exportPdfPlugin } from "./plugin";
import { exportPdf } from "./exportPdf";

describe("exportPdfPlugin", () => {
  it("registers the exportPdf function under the 'pdf' format", () => {
    const exporters = new Registry<Exporter>();
    const engine = { registry: { exporters, registerExporter: (format: string, exporter: Exporter) => exporters.register(format, exporter) } };

    exportPdfPlugin.install(engine as unknown as CanvasEngine);

    expect(exporters.get("pdf")).toBe(exportPdf);
  });
});
