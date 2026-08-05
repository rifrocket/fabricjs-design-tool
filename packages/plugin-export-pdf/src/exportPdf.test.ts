import { describe, expect, it } from "vitest";
import type { Canvas } from "fabric";
import { exportPdf } from "./exportPdf";

// A real (if trivial) 1x1 transparent PNG — jsPDF decodes the data URL to embed it, so an
// arbitrary/invalid base64 payload fails with "wrong PNG signature".
const ONE_PIXEL_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function createFakeCanvas(width: number, height: number): Canvas {
  return {
    getWidth: () => width,
    getHeight: () => height,
    toDataURL: () => ONE_PIXEL_PNG,
  } as unknown as Canvas;
}

describe("exportPdf", () => {
  it("returns a pdf ExportResult shape", () => {
    const result = exportPdf(createFakeCanvas(800, 600));

    expect(result.format).toBe("pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(result.fileName).toMatch(/^canvas-export-\d+\.pdf$/);
    expect(result.data).toBeInstanceOf(Blob);
  });

  it("picks landscape orientation for a wide canvas and portrait for a tall one", () => {
    const wide = exportPdf(createFakeCanvas(1200, 600));
    const tall = exportPdf(createFakeCanvas(600, 1200));

    expect(wide.data.size).toBeGreaterThan(0);
    expect(tall.data.size).toBeGreaterThan(0);
  });
});
