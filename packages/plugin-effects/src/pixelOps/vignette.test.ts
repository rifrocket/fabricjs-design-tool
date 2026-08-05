import { describe, expect, it } from "vitest";
import { applyVignette } from "./vignette";
import { createFakePixelCanvas } from "./testFakeCanvas";

function readPixel(canvasEl: HTMLCanvasElement, x: number, y: number): [number, number, number] {
  const { width } = canvasEl;
  const data = canvasEl.getContext("2d")!.getImageData(0, 0, width, canvasEl.height).data;
  const index = (y * width + x) * 4;
  return [data[index], data[index + 1], data[index + 2]];
}

describe("applyVignette", () => {
  it("darkens corners more than the center", () => {
    const canvasEl = createFakePixelCanvas(9, 9, [200, 200, 200, 255]);
    applyVignette(canvasEl, { strength: 80, spread: 0 });

    const center = readPixel(canvasEl, 4, 4);
    const corner = readPixel(canvasEl, 0, 0);

    expect(corner[0]).toBeLessThan(center[0]);
  });

  it("leaves fully transparent pixels untouched", () => {
    const canvasEl = createFakePixelCanvas(3, 3, [50, 60, 70, 0]);
    applyVignette(canvasEl, { strength: 100, spread: 0 });
    expect(readPixel(canvasEl, 0, 0)).toEqual([50, 60, 70]);
  });

  it("a higher spread shrinks the darkened region", () => {
    const wideSpread = createFakePixelCanvas(9, 9, [200, 200, 200, 255]);
    applyVignette(wideSpread, { strength: 80, spread: 90 });
    const narrowSpread = createFakePixelCanvas(9, 9, [200, 200, 200, 255]);
    applyVignette(narrowSpread, { strength: 80, spread: 0 });

    const edgeWide = readPixel(wideSpread, 1, 4);
    const edgeNarrow = readPixel(narrowSpread, 1, 4);

    expect(edgeWide[0]).toBeGreaterThan(edgeNarrow[0]);
  });
});
