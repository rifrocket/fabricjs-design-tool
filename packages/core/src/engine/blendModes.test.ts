import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { BLEND_MODES, isBlendMode } from "./blendModes";

describe("isBlendMode", () => {
  it("accepts every value in BLEND_MODES", () => {
    for (const mode of BLEND_MODES) {
      expect(isBlendMode(mode)).toBe(true);
    }
  });

  it("rejects values that aren't valid blend modes", () => {
    expect(isBlendMode("not-a-blend-mode")).toBe(false);
    expect(isBlendMode(42)).toBe(false);
  });
});

describe("globalCompositeOperation on a real Fabric object", () => {
  it("applies directly via the object's native property", () => {
    const rect = new Rect();
    rect.set("globalCompositeOperation", "multiply");
    expect(rect.globalCompositeOperation).toBe("multiply");
  });
});
