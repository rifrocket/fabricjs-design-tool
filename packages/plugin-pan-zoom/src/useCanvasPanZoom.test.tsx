import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import { useCanvasPanZoom } from "./useCanvasPanZoom";

// A narrow double for the surface this hook actually touches, faking just what's used rather
// than constructing a real fabric.Canvas, which needs a 2D rendering context this test
// environment doesn't provide.
function createFakeCanvas() {
  const listeners = new Map<string, (event: unknown) => void>();
  return {
    on: vi.fn((event: string, handler: (event: unknown) => void) => listeners.set(event, handler)),
    off: vi.fn((event: string) => listeners.delete(event)),
    defaultCursor: "default" as string,
    selection: true,
    skipTargetFind: false,
    getListener: (event: string) => listeners.get(event),
  };
}

function createFakeEngine(canvas: ReturnType<typeof createFakeCanvas>) {
  const pan = vi.fn();
  const setZoom = vi.fn();
  const engine = {
    getFabricCanvas: () => canvas,
    pan,
    setZoom,
    viewport: { getZoom: () => 1 },
  } as unknown as CanvasEngine;
  return { engine, pan, setZoom };
}

function mountContainer(): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-testid", "container");
  document.body.appendChild(el);
  return el;
}

describe("useCanvasPanZoom", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = mountContainer();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when engine is null", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useCanvasPanZoom(null, { containerSelector: "[data-testid=container]" }));
    expect(addEventListenerSpy).not.toHaveBeenCalledWith("keydown", expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it("registers a mouse:wheel handler on mount and removes it on unmount", () => {
    const canvas = createFakeCanvas();
    const { engine } = createFakeEngine(canvas);
    const { unmount } = renderHook(() => useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]" }));

    expect(canvas.on).toHaveBeenCalledWith("mouse:wheel", expect.any(Function));

    unmount();

    expect(canvas.off).toHaveBeenCalledWith("mouse:wheel", expect.any(Function));
  });

  it("holding Space shows a grab cursor and disables selection/target-find; releasing restores both", () => {
    const canvas = createFakeCanvas();
    const { engine } = createFakeEngine(canvas);
    renderHook(() => useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]" }));

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(canvas.defaultCursor).toBe("grab");
    expect(canvas.selection).toBe(false);
    expect(canvas.skipTargetFind).toBe(true);

    window.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));
    expect(canvas.defaultCursor).toBe("default");
    expect(canvas.selection).toBe(true);
    expect(canvas.skipTargetFind).toBe(false);
  });

  it("ignores Space while an editable element has focus", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    const canvas = createFakeCanvas();
    const { engine } = createFakeEngine(canvas);
    renderHook(() => useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]" }));

    input.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", bubbles: true }));

    expect(canvas.defaultCursor).toBe("default");
  });

  it("dragging with Space held pans the engine by the raw mouse delta", () => {
    const canvas = createFakeCanvas();
    const { engine, pan } = createFakeEngine(canvas);
    renderHook(() => useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]" }));

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    container.dispatchEvent(new MouseEvent("mousedown", { button: 0, clientX: 100, clientY: 100, bubbles: true }));
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 130, clientY: 80 }));

    expect(pan).toHaveBeenCalledWith(30, -20);
    expect(canvas.defaultCursor).toBe("grabbing");
  });

  it("dragging without Space held does not pan", () => {
    const canvas = createFakeCanvas();
    const { engine, pan } = createFakeEngine(canvas);
    renderHook(() => useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]" }));

    container.dispatchEvent(new MouseEvent("mousedown", { button: 0, clientX: 100, clientY: 100, bubbles: true }));
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 130, clientY: 80 }));

    expect(pan).not.toHaveBeenCalled();
  });

  it("dragging with a non-left mouse button does not pan", () => {
    const canvas = createFakeCanvas();
    const { engine, pan } = createFakeEngine(canvas);
    renderHook(() => useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]" }));

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    container.dispatchEvent(new MouseEvent("mousedown", { button: 2, clientX: 100, clientY: 100, bubbles: true }));
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 130, clientY: 80 }));

    expect(pan).not.toHaveBeenCalled();
  });

  it("releasing the mouse stops panning on subsequent moves", () => {
    const canvas = createFakeCanvas();
    const { engine, pan } = createFakeEngine(canvas);
    renderHook(() => useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]" }));

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    container.dispatchEvent(new MouseEvent("mousedown", { button: 0, clientX: 100, clientY: 100, bubbles: true }));
    window.dispatchEvent(new MouseEvent("mouseup"));
    pan.mockClear();

    window.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 200 }));

    expect(pan).not.toHaveBeenCalled();
    expect(canvas.defaultCursor).toBe("grab");
  });

  it("the wheel handler zooms anchored on the event's viewportPoint", () => {
    const canvas = createFakeCanvas();
    const { engine, setZoom } = createFakeEngine(canvas);
    renderHook(() => useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]" }));

    const wheelHandler = canvas.getListener("mouse:wheel")!;
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    wheelHandler({
      e: { deltaY: -100, preventDefault, stopPropagation },
      viewportPoint: { x: 50, y: 60 },
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    // factor = 1 - (-100 * 0.001) = 1.1; current zoom is 1 (fake) -> requested zoom 1.1.
    expect(setZoom).toHaveBeenCalledWith(1.1, { resizeElement: false, center: { x: 50, y: 60 } });
  });

  it("honors a custom wheelZoomSensitivity", () => {
    const canvas = createFakeCanvas();
    const { engine, setZoom } = createFakeEngine(canvas);
    renderHook(() =>
      useCanvasPanZoom(engine, { containerSelector: "[data-testid=container]", wheelZoomSensitivity: 0.01 }),
    );

    const wheelHandler = canvas.getListener("mouse:wheel")!;
    wheelHandler({
      e: { deltaY: -10, preventDefault: vi.fn(), stopPropagation: vi.fn() },
      viewportPoint: { x: 0, y: 0 },
    });

    // factor = 1 - (-10 * 0.01) = 1.1
    expect(setZoom).toHaveBeenCalledWith(1.1, { resizeElement: false, center: { x: 0, y: 0 } });
  });
});
