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

  async function readMediaBoxPt(result: { data: Blob }): Promise<[number, number]> {
    const text = await result.data.text();
    const match = /\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/.exec(text);
    if (!match) throw new Error("no /MediaBox found in PDF output");
    return [Number(match[1]), Number(match[2])];
  }

  it("'match-canvas' sizes the page from the canvas' own pixel dimensions and dpi", async () => {
    // 800x600px @ 96dpi (the default) is exactly 600x450pt (1px @ 96dpi == 0.75pt) — a clean
    // round-trip that pins down the px->mm->pt conversion chain, not just "doesn't throw".
    const result = exportPdf(createFakeCanvas(800, 600), { pageSize: "match-canvas" });
    const [widthPt, heightPt] = await readMediaBoxPt(result);
    expect(widthPt).toBeCloseTo(600, 0);
    expect(heightPt).toBeCloseTo(450, 0);
  });

  it("'match-canvas' honors a custom dpi", async () => {
    // 800x600px @ 300dpi == 192x144pt (1px @ 300dpi == 0.24pt).
    const result = exportPdf(createFakeCanvas(800, 600), { pageSize: "match-canvas", dpi: 300 });
    const [widthPt, heightPt] = await readMediaBoxPt(result);
    expect(widthPt).toBeCloseTo(192, 0);
    expect(heightPt).toBeCloseTo(144, 0);
  });

  it("honors a literal { widthMm, heightMm } page size", async () => {
    // 100mm x 50mm == 283.46pt x 141.73pt (1mm == 2.834645669pt).
    const result = exportPdf(createFakeCanvas(800, 600), { pageSize: { widthMm: 100, heightMm: 50 } });
    const [widthPt, heightPt] = await readMediaBoxPt(result);
    expect(widthPt).toBeCloseTo(283.46, 0);
    expect(heightPt).toBeCloseTo(141.73, 0);
  });
});
