import { describe, expect, it } from "vitest";
import { Registry } from "@rifrocket/fabricjs-design-tool";
import type { Canvas } from "fabric";
import type { CanvasEngine, Exporter } from "@rifrocket/fabricjs-design-tool";
import { createExportPdfPlugin, exportPdfPlugin } from "./plugin";

const ONE_PIXEL_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function createFakeEngine() {
  const exporters = new Registry<Exporter>();
  const engine = {
    registry: { exporters, registerExporter: (format: string, exporter: Exporter) => exporters.register(format, exporter) },
  };
  return { engine: engine as unknown as CanvasEngine, exporters };
}

function createFakeCanvas(width: number, height: number): Canvas {
  return { getWidth: () => width, getHeight: () => height, toDataURL: () => ONE_PIXEL_PNG } as unknown as Canvas;
}

describe("exportPdfPlugin", () => {
  it("registers a 'pdf' exporter that produces a real PDF blob", () => {
    const { engine, exporters } = createFakeEngine();
    exportPdfPlugin.install(engine);

    const exporter = exporters.get("pdf");
    expect(exporter).toBeDefined();
    const result = exporter!(createFakeCanvas(800, 600)) as { format: string; data: Blob };
    expect(result.format).toBe("pdf");
    expect(result.data).toBeInstanceOf(Blob);
  });
});

describe("createExportPdfPlugin", () => {
  it("closes over the given options and applies them to every export", () => {
    const { engine, exporters } = createFakeEngine();
    createExportPdfPlugin({ pageSize: "letter", orientation: "landscape", marginMm: 5 }).install(engine);

    const result = exporters.get("pdf")!(createFakeCanvas(800, 600)) as { data: Blob };
    expect(result.data.size).toBeGreaterThan(0);
  });

  it("defaults to the same zero-config behavior as exportPdfPlugin", () => {
    const a = createFakeEngine();
    const b = createFakeEngine();
    exportPdfPlugin.install(a.engine);
    createExportPdfPlugin().install(b.engine);

    const resultA = a.exporters.get("pdf")!(createFakeCanvas(1200, 600)) as { data: Blob };
    const resultB = b.exporters.get("pdf")!(createFakeCanvas(1200, 600)) as { data: Blob };
    expect(resultA.data.size).toBe(resultB.data.size);
  });
});
