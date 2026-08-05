import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import { drawSilhouettePass } from "./silhouettePass";

function createFakeCtx(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    filter: "none",
    shadowColor: "",
  } as unknown as CanvasRenderingContext2D;
}

describe("drawSilhouettePass", () => {
  it("saves, translates by the offset, and restores around the pass", () => {
    const rect = new Rect({ fill: "blue" });
    const ctx = createFakeCtx();
    const originalRender = vi.fn();

    drawSilhouettePass(rect, ctx, originalRender, { offsetX: 5, offsetY: 8 });

    expect(ctx.save).toHaveBeenCalledTimes(1);
    expect(ctx.translate).toHaveBeenCalledWith(5, 8);
    expect(originalRender).toHaveBeenCalledWith(ctx);
    expect(ctx.restore).toHaveBeenCalledTimes(1);
  });

  it("sets a CSS blur filter proportional to blurPx, and 'none' when omitted", () => {
    const rect = new Rect();
    const ctx = createFakeCtx();

    drawSilhouettePass(rect, ctx, vi.fn(), { blurPx: 12 });
    expect(ctx.filter).toBe("blur(12px)");

    drawSilhouettePass(rect, ctx, vi.fn(), {});
    expect(ctx.filter).toBe("none");
  });

  it("temporarily swaps fill (and stroke, if present) to the pass color, then restores them", () => {
    const rect = new Rect({ fill: "blue", stroke: "green" });
    const ctx = createFakeCtx();
    let fillDuringRender: unknown;
    let strokeDuringRender: unknown;

    drawSilhouettePass(rect, ctx, () => {
      fillDuringRender = rect.fill;
      strokeDuringRender = rect.stroke;
    }, { color: "red" });

    expect(fillDuringRender).toBe("red");
    expect(strokeDuringRender).toBe("red");
    expect(rect.fill).toBe("blue");
    expect(rect.stroke).toBe("green");
  });

  it("leaves stroke untouched when the object had no stroke to begin with", () => {
    const rect = new Rect({ fill: "blue" });
    const ctx = createFakeCtx();
    let strokeDuringRender: unknown;

    drawSilhouettePass(rect, ctx, () => {
      strokeDuringRender = rect.stroke;
    }, { color: "red" });

    expect(strokeDuringRender).toBeNull();
  });

  it("marks the object dirty when swapping in a pass color, so a cached object re-renders", () => {
    const rect = new Rect({ fill: "blue" });
    rect.dirty = false;
    const ctx = createFakeCtx();

    drawSilhouettePass(rect, ctx, vi.fn(), { color: "red" });

    expect(rect.dirty).toBe(true);
  });

  it("restores fill/stroke even if the render callback throws", () => {
    const rect = new Rect({ fill: "blue" });
    const ctx = createFakeCtx();

    expect(() =>
      drawSilhouettePass(rect, ctx, () => {
        throw new Error("boom");
      }, { color: "red" }),
    ).toThrow("boom");
    expect(rect.fill).toBe("blue");
  });
});
