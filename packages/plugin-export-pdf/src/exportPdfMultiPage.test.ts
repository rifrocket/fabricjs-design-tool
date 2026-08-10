import { describe, expect, it } from "vitest";
import type { Canvas } from "fabric";
import { exportPdfMultiPage } from "./exportPdf";

const ONE_PIXEL_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function createFakeCanvas(width: number, height: number): Canvas {
  return {
    getWidth: () => width,
    getHeight: () => height,
    toDataURL: () => ONE_PIXEL_PNG,
  } as unknown as Canvas;
}

async function countPages(blob: Blob): Promise<number> {
  const text = await blob.text();
  return (text.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}

describe("exportPdfMultiPage", () => {
  it("throws when given no canvases", () => {
    expect(() => exportPdfMultiPage([])).toThrow(/at least one canvas/);
  });

  it("produces one PDF page per input canvas", async () => {
    const result = exportPdfMultiPage([createFakeCanvas(800, 600), createFakeCanvas(800, 600)]);
    expect(result.format).toBe("pdf");
    expect(await countPages(result.data)).toBe(2);
  });

  it("sizes every page from the first canvas — correct for a pair, whose sides share dimensions", async () => {
    const front = createFakeCanvas(1050, 600);
    const back = createFakeCanvas(1050, 600);
    const result = exportPdfMultiPage([front, back], { pageSize: "match-canvas" });

    const text = await result.data.text();
    const mediaBoxes = text.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g) ?? [];
    expect(mediaBoxes).toHaveLength(2);
    expect(mediaBoxes[0]).toBe(mediaBoxes[1]);
  });
});
