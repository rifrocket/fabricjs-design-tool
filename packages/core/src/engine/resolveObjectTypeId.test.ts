import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { resolveObjectTypeId } from "./resolveObjectTypeId";

describe("resolveObjectTypeId", () => {
  it("falls back to Fabric's native type when shapeKind isn't set", () => {
    const rect = new Rect();
    expect(resolveObjectTypeId(rect)).toBe("rect");
  });

  it("prefers shapeKind over the native type when set", () => {
    const rect = new Rect();
    rect.set("shapeKind", "rounded-rectangle");
    expect(resolveObjectTypeId(rect)).toBe("rounded-rectangle");
  });
});
