import { describe, expect, it } from "vitest";
import { Circle, Rect } from "fabric";
import type { Canvas, FabricObject } from "fabric";
import { AlignmentManager } from "./alignmentManager";
import { HistoryManager } from "../history/historyManager";

function fakeCanvas(width: number, height: number, activeObjects: FabricObject[]): Canvas {
  return {
    width,
    height,
    getActiveObjects: () => activeObjects,
    requestRenderAll: () => {},
  } as unknown as Canvas;
}

describe("AlignmentManager", () => {
  it("centers a single object on the canvas using its unscaled size", () => {
    const rect = new Rect({ left: 0, top: 0, width: 40, height: 40, strokeWidth: 0 });
    const canvas = fakeCanvas(200, 100, [rect]);
    const manager = new AlignmentManager(canvas, new HistoryManager());

    manager.align("center");
    manager.align("middle");

    expect(rect.left).toBe(80); // (200 - 40) / 2
    expect(rect.top).toBe(30); // (100 - 40) / 2
  });

  // A circle resized via its corner handle only changes scaleX/scaleY — Circle.setRadius() is
  // never called, so width/height stay stale at their creation-time (radius * 2) value. Using
  // the raw width/height here (as this code used to) centers on the stale size instead of the
  // circle's actual rendered diameter.
  it("centers a scaled circle using its rendered (scaled) size, not its stale width/height", () => {
    const circle = new Circle({ left: 0, top: 0, radius: 50, strokeWidth: 0 });
    circle.set({ scaleX: 2, scaleY: 2 }); // rendered diameter is now 200, but width/height stay 100
    const canvas = fakeCanvas(400, 400, [circle]);
    const manager = new AlignmentManager(canvas, new HistoryManager());

    manager.align("center");
    manager.align("middle");

    expect(circle.left).toBe(100); // (400 - 200) / 2, using the scaled diameter
    expect(circle.top).toBe(100);
  });

  it("centers a scaled object within a multi-object selection using scaled sizes", () => {
    const a = new Rect({ left: 0, top: 0, width: 10, height: 10, strokeWidth: 0 });
    const b = new Circle({ left: 100, top: 0, radius: 10, strokeWidth: 0 });
    b.set({ scaleX: 2, scaleY: 2 }); // scaled width/height: 40, selection right edge -> 140
    const canvas = fakeCanvas(0, 0, [a, b]);
    const manager = new AlignmentManager(canvas, new HistoryManager());

    manager.align("center");

    // selection bounds: left=0, right=max(0+10, 100+40)=140, using each object's scaled width
    expect(a.left).toBe(65); // 0 + (140 - 0 - 10) / 2
    expect(b.left).toBe(50); // 0 + (140 - 0 - 40) / 2, using b's scaled width (40), not raw (20)
  });
});
