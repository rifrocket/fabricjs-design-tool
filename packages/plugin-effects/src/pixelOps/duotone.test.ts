import { describe, expect, it } from "vitest";
import { applyDuotone } from "./duotone";
import { createFakePixelCanvas } from "./testFakeCanvas";

describe("applyDuotone", () => {
  it("maps a black pixel to the shadow color", () => {
    const canvasEl = createFakePixelCanvas(1, 1, [0, 0, 0, 255]);
    applyDuotone(canvasEl, { shadowColor: "#ff0000", highlightColor: "#00ff00" });
    const data = canvasEl.getContext("2d")!.getImageData(0, 0, 1, 1).data;
    expect([data[0], data[1], data[2]]).toEqual([255, 0, 0]);
  });

  it("maps a white pixel to the highlight color", () => {
    const canvasEl = createFakePixelCanvas(1, 1, [255, 255, 255, 255]);
    applyDuotone(canvasEl, { shadowColor: "#ff0000", highlightColor: "#00ff00" });
    const data = canvasEl.getContext("2d")!.getImageData(0, 0, 1, 1).data;
    expect([data[0], data[1], data[2]]).toEqual([0, 255, 0]);
  });

  it("leaves fully transparent pixels untouched", () => {
    const canvasEl = createFakePixelCanvas(1, 1, [10, 20, 30, 0]);
    applyDuotone(canvasEl, { shadowColor: "#ff0000", highlightColor: "#00ff00" });
    const data = canvasEl.getContext("2d")!.getImageData(0, 0, 1, 1).data;
    expect([data[0], data[1], data[2]]).toEqual([10, 20, 30]);
  });

  it("scales the remap by intensity", () => {
    const canvasEl = createFakePixelCanvas(1, 1, [0, 0, 0, 255]);
    applyDuotone(canvasEl, { shadowColor: "#ff0000", highlightColor: "#00ff00", intensity: 40 });
    const data = canvasEl.getContext("2d")!.getImageData(0, 0, 1, 1).data;
    expect(data[0]).toBe(102);
  });
});
