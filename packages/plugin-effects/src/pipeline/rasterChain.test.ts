import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { EffectDefinition, EffectInstance } from "@rifrocket/fabricjs-design-tool";
import { buildRasterChain } from "./rasterChain";
import * as rasterizeModule from "./rasterize";

function blurLikeDefinition(applyRaster: EffectDefinition["applyRaster"]): EffectDefinition {
  return { id: "blur", category: "basic", label: "Blur", track: "raster", schema: [], defaults: {}, applyRaster };
}

function instance(effectId: string, props: Record<string, unknown> = {}): EffectInstance {
  return { instanceId: `${effectId}_1`, effectId, enabled: true, props };
}

describe("buildRasterChain", () => {
  it("returns undefined for an empty instance list", () => {
    const rect = new Rect();
    expect(buildRasterChain(rect, [], () => undefined)).toBeUndefined();
  });

  it("rasterizes once and threads the bitmap through each instance's applyRaster in order", () => {
    const rect = new Rect();
    const base = {} as HTMLCanvasElement;
    const afterFirst = {} as HTMLCanvasElement;
    const afterSecond = {} as HTMLCanvasElement;
    vi.spyOn(rasterizeModule, "rasterizeObjectLocal").mockReturnValue(base);

    const calls: HTMLCanvasElement[] = [];
    const first = blurLikeDefinition((bitmap) => {
      calls.push(bitmap);
      return afterFirst;
    });
    const second: EffectDefinition = {
      ...blurLikeDefinition((bitmap) => {
        calls.push(bitmap);
        return afterSecond;
      }),
      id: "noise",
    };

    const result = buildRasterChain(
      rect,
      [instance("blur"), instance("noise")],
      (id) => ({ blur: first, noise: second })[id],
    );

    expect(calls).toEqual([base, afterFirst]);
    expect(result).toBe(afterSecond);
  });

  it("skips instances whose definition has no applyRaster", () => {
    const rect = new Rect();
    const base = {} as HTMLCanvasElement;
    vi.spyOn(rasterizeModule, "rasterizeObjectLocal").mockReturnValue(base);
    const noOp: EffectDefinition = { id: "noop", category: "basic", label: "Noop", track: "raster", schema: [], defaults: {} };

    const result = buildRasterChain(rect, [instance("noop")], () => noOp);

    expect(result).toBe(base);
  });

  it("reuses a cached bitmap on a subsequent call with the same instance props", () => {
    const rect = new Rect();
    rect.dirty = false;
    const rasterizeSpy = vi.spyOn(rasterizeModule, "rasterizeObjectLocal").mockReturnValue({} as HTMLCanvasElement);
    const definition = blurLikeDefinition(undefined);

    buildRasterChain(rect, [instance("blur", { amount: 5 })], () => definition);
    rasterizeSpy.mockClear();
    buildRasterChain(rect, [instance("blur", { amount: 5 })], () => definition);

    expect(rasterizeSpy).not.toHaveBeenCalled();
  });

  it("re-rasterizes when the object is marked dirty even with unchanged props", () => {
    const rect = new Rect();
    rect.dirty = false;
    const rasterizeSpy = vi.spyOn(rasterizeModule, "rasterizeObjectLocal").mockReturnValue({} as HTMLCanvasElement);
    const definition = blurLikeDefinition(undefined);

    buildRasterChain(rect, [instance("blur", { amount: 5 })], () => definition);
    rasterizeSpy.mockClear();
    rect.dirty = true;
    buildRasterChain(rect, [instance("blur", { amount: 5 })], () => definition);

    expect(rasterizeSpy).toHaveBeenCalledTimes(1);
  });
});
