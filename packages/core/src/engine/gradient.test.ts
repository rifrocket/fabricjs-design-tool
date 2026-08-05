import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { createLinearGradient, createRadialGradient } from "./gradient";

describe("createLinearGradient", () => {
  it("defaults to a left-to-right line through the percentage-unit center", () => {
    const gradient = createLinearGradient([{ offset: 0, color: "red" }]);
    expect(gradient.gradientUnits).toBe("percentage");
    expect(gradient.coords.x1).toBeCloseTo(0);
    expect(gradient.coords.y1).toBeCloseTo(0.5);
    expect(gradient.coords.x2).toBeCloseTo(1);
    expect(gradient.coords.y2).toBeCloseTo(0.5);
  });

  it("rotates to a top-to-bottom line at 90 degrees", () => {
    const gradient = createLinearGradient([{ offset: 0, color: "red" }], 90);
    expect(gradient.coords.x1).toBeCloseTo(0.5);
    expect(gradient.coords.y1).toBeCloseTo(0);
    expect(gradient.coords.x2).toBeCloseTo(0.5);
    expect(gradient.coords.y2).toBeCloseTo(1);
  });

  it("carries the color stops through unchanged", () => {
    const stops = [
      { offset: 0, color: "#ff0000" },
      { offset: 1, color: "#0000ff" },
    ];
    const gradient = createLinearGradient(stops);
    expect(gradient.colorStops).toEqual(stops);
  });

  it("can be assigned directly to a real object's fill", () => {
    const rect = new Rect();
    const gradient = createLinearGradient([{ offset: 0, color: "red" }]);
    rect.set("fill", gradient);
    expect(rect.fill).toBe(gradient);
  });
});

describe("createRadialGradient", () => {
  it("centers the inner circle with a full-radius outer circle in percentage units", () => {
    const gradient = createRadialGradient([{ offset: 0, color: "white" }, { offset: 1, color: "black" }]);
    expect(gradient.type).toBe("radial");
    expect(gradient.gradientUnits).toBe("percentage");
    expect(gradient.coords).toEqual({ x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5, r1: 0, r2: 0.5 });
  });
});
