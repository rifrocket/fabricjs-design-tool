import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import { rasterizeObjectLocal } from "./rasterize";
import { isRenderBypassed } from "./renderGuard";

describe("rasterizeObjectLocal", () => {
  it("calls toCanvasElement in the object's own untransformed local space", () => {
    const rect = new Rect();
    const fakeCanvas = {} as HTMLCanvasElement;
    const spy = vi.spyOn(rect, "toCanvasElement").mockReturnValue(fakeCanvas);

    const result = rasterizeObjectLocal(rect);

    expect(spy).toHaveBeenCalledWith({ withoutTransform: true, enableRetinaScaling: false });
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
