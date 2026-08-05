import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useContainerSize } from "./useContainerSize";

// jsdom has no real ResizeObserver (no layout engine to observe) — this fake lets tests
// trigger a "resize" deterministically instead of depending on real layout.
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

describe("useContainerSize", () => {
  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("returns null when no element matches the selector", () => {
    const { result } = renderHook(() => useContainerSize("[data-testid=missing]"));
    expect(result.current).toBeNull();
  });

  it("returns the initial size synchronously on mount", () => {
    mountContainer(640, 480);
    const { result } = renderHook(() => useContainerSize("[data-testid=container]"));
    expect(result.current).toEqual({ width: 640, height: 480 });
  });

  it("updates when the observed element reports a resize", () => {
    const container = mountContainer(640, 480);
    const { result } = renderHook(() => useContainerSize("[data-testid=container]"));

    Object.defineProperty(container, "clientWidth", { value: 800, configurable: true });
    Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
    act(() => {
      FakeResizeObserver.instances[0].trigger();
    });

    expect(result.current).toEqual({ width: 800, height: 600 });
  });

  it("disconnects the observer on unmount", () => {
    mountContainer(640, 480);
    const { unmount } = renderHook(() => useContainerSize("[data-testid=container]"));
    const disconnectSpy = vi.spyOn(FakeResizeObserver.instances[0], "disconnect");

    unmount();

    expect(disconnectSpy).toHaveBeenCalledOnce();
  });
});
