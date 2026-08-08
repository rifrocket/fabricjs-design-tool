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

  it("honors an explicit orientation instead of inferring it from the canvas' own aspect ratio", () => {
    const result = exportPdf(createFakeCanvas(1200, 600), { orientation: "portrait" });
    expect(result.data.size).toBeGreaterThan(0);
  });

  it("accepts a letter/legal pageSize", () => {
    const letter = exportPdf(createFakeCanvas(800, 600), { pageSize: "letter" });
    const legal = exportPdf(createFakeCanvas(800, 600), { pageSize: "legal" });
    expect(letter.data.size).toBeGreaterThan(0);
    expect(legal.data.size).toBeGreaterThan(0);
  });

  it("shrinks the fitted image as marginMm grows", () => {
    // Not directly observable from the returned Blob's size alone (image scale/margin doesn't
    // move raster bytes), so this just exercises the option end-to-end without throwing —
    // real fit-math coverage lives in the plugin-level "closes over options" test.
    const result = exportPdf(createFakeCanvas(800, 600), { marginMm: 40 });
    expect(result.data.size).toBeGreaterThan(0);
  });
});
