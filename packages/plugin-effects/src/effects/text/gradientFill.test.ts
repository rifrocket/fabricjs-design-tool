import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import { gradientFillEffect } from "./gradientFill";

describe("gradientFillEffect.wrapRender", () => {
  const props = { colorStart: "#000000", colorEnd: "#ffffff", angle: 45 };

  it("swaps in a gradient fill for the render call, then restores the original fill", () => {
    const rect = new Rect({ fill: "blue" });
    let fillDuringRender: unknown;

    gradientFillEffect.wrapRender!(rect, {} as CanvasRenderingContext2D, props, () => {
      fillDuringRender = rect.fill;
    });

    expect(fillDuringRender).not.toBe("blue");
    expect(rect.fill).toBe("blue");
  });

  it("marks the object dirty, so an already-cached object still re-renders with the gradient", () => {
    const rect = new Rect({ fill: "blue" });
    rect.dirty = false;

    gradientFillEffect.wrapRender!(rect, {} as CanvasRenderingContext2D, props, vi.fn());

    expect(rect.dirty).toBe(true);
  });
});
