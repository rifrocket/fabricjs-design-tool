import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { getCachedRasterBitmap, setCachedRasterBitmap } from "./rasterCache";

describe("rasterCache", () => {
  it("returns undefined when nothing is cached for the object", () => {
    expect(getCachedRasterBitmap(new Rect(), "sig")).toBeUndefined();
  });

  it("returns the cached bitmap for a matching signature", () => {
    const rect = new Rect();
    const bitmap = {} as HTMLCanvasElement;
    setCachedRasterBitmap(rect, "sig-a", bitmap);
    expect(getCachedRasterBitmap(rect, "sig-a")).toBe(bitmap);
  });

  it("misses when the signature no longer matches (e.g. props changed)", () => {
    const rect = new Rect();
    setCachedRasterBitmap(rect, "sig-a", {} as HTMLCanvasElement);
    expect(getCachedRasterBitmap(rect, "sig-b")).toBeUndefined();
  });

  it("keeps caches independent per object", () => {
    const a = new Rect();
    const b = new Rect();
    const bitmapA = {} as HTMLCanvasElement;
    setCachedRasterBitmap(a, "sig", bitmapA);
    expect(getCachedRasterBitmap(b, "sig")).toBeUndefined();
    expect(getCachedRasterBitmap(a, "sig")).toBe(bitmapA);
  });
});
