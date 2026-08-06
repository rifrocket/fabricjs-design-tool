import { describe, expect, it, vi } from "vitest";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { setCanvasZoom } from "./setCanvasZoom";

function createFakeEngine(resultingZoom: number): { engine: CanvasEngine; setZoom: ReturnType<typeof vi.fn> } {
  const setZoom = vi.fn();
  const engine = {
    setZoom,
    viewport: { getZoom: () => resultingZoom },
  } as unknown as CanvasEngine;
  return { engine, setZoom };
}

describe("setCanvasZoom", () => {
  it("always passes resizeElement:false", () => {
    const { engine, setZoom } = createFakeEngine(1.5);
    setCanvasZoom(engine, 1.5);
    expect(setZoom).toHaveBeenCalledWith(1.5, { resizeElement: false, center: undefined });
  });

  it("forwards an explicit center point", () => {
    const { engine, setZoom } = createFakeEngine(2);
    setCanvasZoom(engine, 2, { x: 10, y: 20 });
    expect(setZoom).toHaveBeenCalledWith(2, { resizeElement: false, center: { x: 10, y: 20 } });
  });

  it("returns the engine's post-zoom value, not the requested one", () => {
    const { engine } = createFakeEngine(3); // e.g. clamped by MIN/MAX_ZOOM inside ViewportManager
    expect(setCanvasZoom(engine, 999)).toBe(3);
  });
});
