import { afterEach, describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import { rasterizeObjectLocal, rasterMultiplier } from "./rasterize";
import { isRenderBypassed } from "./renderGuard";

describe("rasterizeObjectLocal", () => {
  it("calls toCanvasElement in the object's own untransformed local space", () => {
    const rect = new Rect();
    const fakeCanvas = {} as HTMLCanvasElement;
    const spy = vi.spyOn(rect, "toCanvasElement").mockReturnValue(fakeCanvas);

    const result = rasterizeObjectLocal(rect);

    // A bare object with no canvas has no zoom/retina to account for, so its own scale (1 here)
    // is the whole multiplier — see the rasterMultiplier tests below for the interesting cases.
    expect(spy).toHaveBeenCalledWith({ withoutTransform: true, enableRetinaScaling: false, multiplier: 1 });
    expect(result).toBe(fakeCanvas);
  });

  it("marks the object as render-bypassed only for the duration of the call", () => {
    const rect = new Rect();
    let bypassedDuringCall = false;
    vi.spyOn(rect, "toCanvasElement").mockImplementation(() => {
      bypassedDuringCall = isRenderBypassed(rect);
      return {} as HTMLCanvasElement;
    });

    rasterizeObjectLocal(rect);

    expect(bypassedDuringCall).toBe(true);
    expect(isRenderBypassed(rect)).toBe(false);
  });

  it("clears the bypass guard even if toCanvasElement throws", () => {
    const rect = new Rect();
    vi.spyOn(rect, "toCanvasElement").mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => rasterizeObjectLocal(rect)).toThrow("boom");
    expect(isRenderBypassed(rect)).toBe(false);
  });
});

describe("rasterMultiplier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is 1 for an object at its natural size with no canvas", () => {
    expect(rasterMultiplier(new Rect())).toBe(1);
  });

  it("tracks the object's own scale so an enlarged object rasterizes at higher density", () => {
    const rect = new Rect({ scaleX: 2, scaleY: 1.4 });
    expect(rasterMultiplier(rect)).toBe(2);
  });

  it("folds in the canvas zoom, the same figure Fabric's own object-cache sizing uses", () => {
    const rect = new Rect();
    rect.canvas = { getZoom: () => 3, getRetinaScaling: () => 1 } as unknown as Rect["canvas"];
    expect(rasterMultiplier(rect)).toBe(3);
  });

  it("folds in devicePixelRatio on top of scale and zoom", () => {
    vi.stubGlobal("window", { devicePixelRatio: 2 });
    const rect = new Rect({ scaleX: 1.5 });
    expect(rasterMultiplier(rect)).toBe(3);
  });

  it("clamps to a maximum so an extreme zoom-in can't demand an unbounded rasterize canvas", () => {
    const rect = new Rect();
    rect.canvas = { getZoom: () => 20, getRetinaScaling: () => 1 } as unknown as Rect["canvas"];
    expect(rasterMultiplier(rect)).toBe(4);
  });

  it("floors at 1 so a shrunk object doesn't rasterize below its own natural resolution", () => {
    const rect = new Rect({ scaleX: 0.2, scaleY: 0.2 });
    expect(rasterMultiplier(rect)).toBe(1);
  });

  it("rounds to the nearest step instead of tracking every fractional zoom change", () => {
    const rect = new Rect();
    rect.canvas = { getZoom: () => 1.2, getRetinaScaling: () => 1 } as unknown as Rect["canvas"];
    expect(rasterMultiplier(rect)).toBe(1);
  });
});
