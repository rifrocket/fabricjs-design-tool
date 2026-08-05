import { describe, expect, it } from "vitest";
import { applyViewportTransform } from "./viewportTransform";

describe("applyViewportTransform", () => {
  it("passes coordinates through unchanged when no transform is given", () => {
    expect(applyViewportTransform(10, 20, undefined)).toEqual({ x: 10, y: 20 });
  });

  it("applies an identity matrix as a no-op", () => {
    expect(applyViewportTransform(10, 20, [1, 0, 0, 1, 0, 0])).toEqual({ x: 10, y: 20 });
  });

  it("applies translation", () => {
    expect(applyViewportTransform(10, 20, [1, 0, 0, 1, 5, -5])).toEqual({ x: 15, y: 15 });
  });

  it("applies scale", () => {
    expect(applyViewportTransform(10, 20, [2, 0, 0, 2, 0, 0])).toEqual({ x: 20, y: 40 });
  });

  it("applies scale and translation together", () => {
    expect(applyViewportTransform(10, 20, [2, 0, 0, 2, 3, 4])).toEqual({ x: 23, y: 44 });
  });
});
