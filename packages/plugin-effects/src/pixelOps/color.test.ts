import { describe, expect, it } from "vitest";
import { hexToRgb } from "./color";

describe("hexToRgb", () => {
  it("parses a 6-digit hex color", () => {
    expect(hexToRgb("#ff8800")).toEqual([255, 136, 0]);
  });

  it("parses a 3-digit shorthand hex color", () => {
    expect(hexToRgb("#f80")).toEqual([255, 136, 0]);
  });

  it("works without a leading #", () => {
    expect(hexToRgb("000000")).toEqual([0, 0, 0]);
  });
});
