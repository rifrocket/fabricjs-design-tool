import { describe, expect, it, vi } from "vitest";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { centerContent, getContainerSize } from "./centerContent";

function createFakeEngine(zoom: number): { engine: CanvasEngine; panTo: ReturnType<typeof vi.fn> } {
  const panTo = vi.fn();
  const engine = {
    viewport: { getZoom: () => zoom },
    panTo,
  } as unknown as CanvasEngine;
  return { engine, panTo };
}

function mountContainer(width: number, height: number): () => void {
  const el = document.createElement("div");
  el.setAttribute("data-testid", "container");
  Object.defineProperty(el, "clientWidth", { value: width, configurable: true });
  Object.defineProperty(el, "clientHeight", { value: height, configurable: true });
  document.body.appendChild(el);
  return () => document.body.removeChild(el);
}

describe("getContainerSize", () => {
  it("returns null when no element matches the selector", () => {
    expect(getContainerSize("[data-testid=missing]")).toBeNull();
  });

  it("reads clientWidth/clientHeight from the matched element", () => {
    const cleanup = mountContainer(800, 600);
    expect(getContainerSize("[data-testid=container]")).toEqual({ width: 800, height: 600 });
    cleanup();
  });
});

describe("centerContent", () => {
  it("does nothing when the container isn't found", () => {
    const { engine, panTo } = createFakeEngine(1);
    centerContent(engine, 100, 100, "[data-testid=missing]");
    expect(panTo).not.toHaveBeenCalled();
  });

  // viewport 1000x800, content 400x200 at zoom 1 -> panX=panY=300; engine.panTo negates (Fabric's
  // absolutePan sets viewportTransform[4]=-x), so landing at +300/+300 means calling
  // panTo(-300,-300) — the sign convention most likely to silently flip if "simplified".
  it("centers content smaller than the viewport with a positive pan", () => {
    const cleanup = mountContainer(1000, 800);
    const { engine, panTo } = createFakeEngine(1);
    centerContent(engine, 400, 200, "[data-testid=container]");
    expect(panTo).toHaveBeenCalledWith(-300, -300);
    cleanup();
  });

  // Same viewport/content, zoom 2 -> zoomed content is 800x400, panX=(1000-800)/2=100, panY=(800-400)/2=200.
  it("scales content by the current zoom before centering", () => {
    const cleanup = mountContainer(1000, 800);
    const { engine, panTo } = createFakeEngine(2);
    centerContent(engine, 400, 200, "[data-testid=container]");
    expect(panTo).toHaveBeenCalledWith(-100, -200);
    cleanup();
  });

  // zoom 4 -> zoomed content is 1600x820, wider AND taller than the 1000x800 viewport:
  // panX=(1000-1600)/2=-300, panY=(800-820)/2=-10. The pan is still mathematically centered even
  // though the sign flips on both axes.
  it("still centers correctly when zoomed-in content exceeds the viewport", () => {
    const cleanup = mountContainer(1000, 800);
    const { engine, panTo } = createFakeEngine(4);
    centerContent(engine, 400, 205, "[data-testid=container]");
    expect(panTo).toHaveBeenCalledWith(300, 10);
    cleanup();
  });
});
