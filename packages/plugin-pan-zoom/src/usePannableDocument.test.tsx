import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { FabricObject } from "fabric";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { usePannableDocument } from "./usePannableDocument";

// jsdom has no real ResizeObserver (no layout engine to observe) — this fake lets tests trigger
// a "resize" deterministically instead of depending on real layout. Copied from
// useContainerSize.test.tsx's identical fake.
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  observed: Element[] = [];

  constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  unobserve(element: Element): void {
    this.observed = this.observed.filter((candidate) => candidate !== element);
  }

  disconnect(): void {
    this.observed = [];
  }

  trigger(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

function mountContainer(width: number, height: number): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-testid", "container");
  Object.defineProperty(el, "clientWidth", { value: width, configurable: true });
  Object.defineProperty(el, "clientHeight", { value: height, configurable: true });
  document.body.appendChild(el);
  return el;
}

// A narrow double for the surface this hook actually touches (setDimensions/boundary-rect
// creation/centering/pan-zoom listener registration), not a real fabric.Canvas — same
// rationale as useCanvasPanZoom.test.tsx's own fake.
function createFakeEngine() {
  const objects: FabricObject[] = [];
  const canvas = {
    add: vi.fn((object: FabricObject) => objects.push(object)),
    calcOffset: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
  const setDimensions = vi.fn();
  const sendToBack = vi.fn();
  const panTo = vi.fn();
  const engine = {
    getFabricCanvas: () => canvas,
    setDimensions,
    layers: { getObjects: () => objects, sendToBack },
    viewport: { getZoom: () => 1 },
    panTo,
  } as unknown as CanvasEngine;
  return { engine, canvas, setDimensions, sendToBack, panTo };
}

describe("usePannableDocument", () => {
  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("does nothing when engine is null", () => {
    mountContainer(800, 600);
    renderHook(() =>
      usePannableDocument(null, { containerSelector: "[data-testid=container]", contentWidth: 400, contentHeight: 300 }),
    );
    // no fake engine to assert against directly — absence of a thrown error plus the next test's
    // "contentWidth/contentHeight are zero" case together cover the early-return guard clauses.
  });

  it("does nothing when contentWidth/contentHeight are zero (no active document yet)", () => {
    mountContainer(800, 600);
    const { engine, setDimensions } = createFakeEngine();
    renderHook(() =>
      usePannableDocument(engine, { containerSelector: "[data-testid=container]", contentWidth: 0, contentHeight: 0 }),
    );
    expect(setDimensions).not.toHaveBeenCalled();
  });

  it("sizes the engine to the container once both engine and container size are known", () => {
    mountContainer(800, 600);
    const { engine, setDimensions } = createFakeEngine();
    renderHook(() =>
      usePannableDocument(engine, { containerSelector: "[data-testid=container]", contentWidth: 400, contentHeight: 300 }),
    );
    expect(setDimensions).toHaveBeenCalledWith(800, 600);
  });

  it("creates a page-boundary rect once and does not duplicate it on re-render", () => {
    mountContainer(800, 600);
    const { engine, canvas, sendToBack } = createFakeEngine();
    const { rerender } = renderHook(
      (props: { contentWidth: number; contentHeight: number }) =>
        usePannableDocument(engine, { containerSelector: "[data-testid=container]", ...props }),
      { initialProps: { contentWidth: 400, contentHeight: 300 } },
    );
    expect(canvas.add).toHaveBeenCalledTimes(1);
    expect(sendToBack).toHaveBeenCalledTimes(1);

    rerender({ contentWidth: 400, contentHeight: 300 });
    expect(canvas.add).toHaveBeenCalledTimes(1);
  });

  it("centers content within the container", () => {
    mountContainer(800, 600);
    const { engine, panTo } = createFakeEngine();
    renderHook(() =>
      usePannableDocument(engine, { containerSelector: "[data-testid=container]", contentWidth: 400, contentHeight: 300 }),
    );
    expect(panTo).toHaveBeenCalled();
  });

  it("returns the current container size", () => {
    mountContainer(800, 600);
    const { engine } = createFakeEngine();
    const { result } = renderHook(() =>
      usePannableDocument(engine, { containerSelector: "[data-testid=container]", contentWidth: 400, contentHeight: 300 }),
    );
    expect(result.current).toEqual({ width: 800, height: 600 });
  });
});
