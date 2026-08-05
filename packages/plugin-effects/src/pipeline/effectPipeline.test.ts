import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import { EffectRegistry } from "@rifrocket/fabricjs-design-tool";
import type { EffectDefinition, EffectInstance } from "@rifrocket/fabricjs-design-tool";
import { runEffectPipeline } from "./effectPipeline";

function instance(effectId: string, props: Record<string, unknown> = {}): EffectInstance {
  return { instanceId: `${effectId}_1`, effectId, enabled: true, props };
}

function fakeCtx(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    drawImage: vi.fn(),
    transform: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe("runEffectPipeline", () => {
  it("calls the original render directly when the stack has no raster instances", () => {
    const rect = new Rect();
    const registry = new EffectRegistry();
    const originalRender = vi.fn();

    runEffectPipeline(rect, fakeCtx(), [], registry, originalRender);

    expect(originalRender).toHaveBeenCalled();
  });

  it("runs renderBehind passes before, and renderFront passes after, the base render", () => {
    const rect = new Rect();
    const registry = new EffectRegistry();
    const order: string[] = [];
    const shadow: EffectDefinition = {
      id: "shadow",
      category: "basic",
      label: "Shadow",
      track: "compositing",
      schema: [],
      defaults: {},
      renderBehind: () => order.push("behind"),
    };
    const outline: EffectDefinition = {
      id: "outline",
      category: "basic",
      label: "Outline",
      track: "compositing",
      schema: [],
      defaults: {},
      renderFront: () => order.push("front"),
    };
    registry.register(shadow);
    registry.register(outline);
    const originalRender = () => order.push("base");

    runEffectPipeline(rect, fakeCtx(), [instance("shadow"), instance("outline")], registry, originalRender);

    expect(order).toEqual(["behind", "base", "front"]);
  });

  it("marks the object dirty before the base render, so it can't reuse a cache a renderBehind pass left clean", () => {
    // silhouettePass.ts force-dirties + redraws the object with a swapped fill/stroke for passes
    // like Shadow's, which leaves Fabric's own object cache holding that swapped-color
    // appearance marked clean (dirty: false) once the draw finishes. Without re-dirtying here,
    // the base pass right after it would reuse that cache instead of the object's real fill.
    const rect = new Rect();
    const registry = new EffectRegistry();
    const shadow: EffectDefinition = {
      id: "shadow",
      category: "basic",
      label: "Shadow",
      track: "compositing",
      schema: [],
      defaults: {},
      renderBehind: () => {
        rect.dirty = false;
      },
    };
    registry.register(shadow);

    runEffectPipeline(rect, fakeCtx(), [instance("shadow")], registry, vi.fn());

    expect(rect.dirty).toBe(true);
  });

  it("draws the raster chain's bitmap instead of calling the original render", () => {
    const rect = new Rect();
    const registry = new EffectRegistry();
    const bitmap = { width: 10, height: 20 } as HTMLCanvasElement;
    const blur: EffectDefinition = {
      id: "blur",
      category: "basic",
      label: "Blur",
      track: "raster",
      schema: [],
      defaults: {},
      applyRaster: () => bitmap,
    };
    registry.register(blur);
    const ctx = fakeCtx();
    const originalRender = vi.fn();
    vi.spyOn(rect, "toCanvasElement").mockReturnValue({} as HTMLCanvasElement);

    runEffectPipeline(rect, ctx, [instance("blur")], registry, originalRender);

    expect(ctx.drawImage).toHaveBeenCalledWith(bitmap, -5, -10);
    expect(originalRender).not.toHaveBeenCalled();
    // The bitmap replaces the object's own _render() call, so it must still receive the
    // object's position/rotation/scale — otherwise it draws at the ctx's ambient origin
    // instead of wherever the object actually sits on the canvas.
    expect(ctx.transform).toHaveBeenCalled();
  });

  it("re-dirties the object before rasterizing when a renderBehind pass ran first, so the raster pass doesn't rasterize a leftover swapped-color cache", () => {
    // Reproduces the Shadow+Blur combo: rasterizeObjectLocal (buildRasterChain -> toCanvasElement)
    // re-enters the object's real render() on a throwaway canvas, which reuses Fabric's own
    // object-level cache when dirty is false — exactly like the base-render case above, just one
    // call further down the pipeline. A renderBehind pass just above (Shadow's silhouette) already
    // force-dirtied + redrew that same cache with its swapped color and left it marked clean, so
    // without re-dirtying here too, Blur would rasterize the shadow's silhouette, not the object.
    const rect = new Rect();
    const registry = new EffectRegistry();
    const shadow: EffectDefinition = {
      id: "shadow",
      category: "basic",
      label: "Shadow",
      track: "compositing",
      schema: [],
      defaults: {},
      renderBehind: () => {
        rect.dirty = false;
      },
    };
    const blur: EffectDefinition = {
      id: "blur",
      category: "basic",
      label: "Blur",
      track: "raster",
      schema: [],
      defaults: {},
      applyRaster: () => ({}) as HTMLCanvasElement,
    };
    registry.register(shadow);
    registry.register(blur);
    let dirtyDuringRasterize: boolean | undefined;
    vi.spyOn(rect, "toCanvasElement").mockImplementation(() => {
      dirtyDuringRasterize = rect.dirty;
      return {} as HTMLCanvasElement;
    });

    runEffectPipeline(rect, fakeCtx(), [instance("shadow"), instance("blur")], registry, vi.fn());

    expect(dirtyDuringRasterize).toBe(true);
  });

  it("leaves the raster bitmap cache's memoization alone when no renderBehind pass ran", () => {
    // The re-dirty above has a real perf cost (skips the raster bitmap cache) — it should only
    // fire when something could actually have poisoned Fabric's object cache first.
    const rect = new Rect();
    rect.dirty = false;
    const registry = new EffectRegistry();
    const blur: EffectDefinition = {
      id: "blur",
      category: "basic",
      label: "Blur",
      track: "raster",
      schema: [],
      defaults: {},
      applyRaster: () => ({}) as HTMLCanvasElement,
    };
    registry.register(blur);
    let dirtyDuringRasterize: boolean | undefined;
    vi.spyOn(rect, "toCanvasElement").mockImplementation(() => {
      dirtyDuringRasterize = rect.dirty;
      return {} as HTMLCanvasElement;
    });

    runEffectPipeline(rect, fakeCtx(), [instance("blur")], registry, vi.fn());

    expect(dirtyDuringRasterize).toBe(false);
  });

  it("composes wrapRender hooks outermost-first around the whole base render", () => {
    const rect = new Rect();
    const registry = new EffectRegistry();
    const order: string[] = [];
    const outer: EffectDefinition = {
      id: "outer",
      category: "basic",
      label: "Outer",
      track: "compositing",
      schema: [],
      defaults: {},
      wrapRender: (_object, _ctx, _props, next) => {
        order.push("outer-before");
        next();
        order.push("outer-after");
      },
    };
    const inner: EffectDefinition = {
      id: "inner",
      category: "basic",
      label: "Inner",
      track: "compositing",
      schema: [],
      defaults: {},
      wrapRender: (_object, _ctx, _props, next) => {
        order.push("inner-before");
        next();
        order.push("inner-after");
      },
    };
    registry.register(outer);
    registry.register(inner);

    runEffectPipeline(rect, fakeCtx(), [instance("outer"), instance("inner")], registry, () => order.push("base"));

    expect(order).toEqual(["outer-before", "inner-before", "base", "inner-after", "outer-after"]);
  });
});
