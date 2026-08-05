import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSystemTheme } from "./useSystemTheme";

function mockMatchMedia(prefersDark: boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const mql = {
    matches: prefersDark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_event: string, handler: (event: { matches: boolean }) => void) => listeners.add(handler),
    removeEventListener: (_event: string, handler: (event: { matches: boolean }) => void) => listeners.delete(handler),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    emitChange: (matches: boolean) => {
      mql.matches = matches;
      listeners.forEach((handler) => handler({ matches }));
    },
  };
}

describe("useSystemTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-fdt-theme");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to 'system', resolved from matchMedia", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current.theme).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("honors an explicit defaultTheme over the OS preference", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useSystemTheme({ defaultTheme: "light" }));
    expect(result.current.theme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("reacts to an OS theme change while theme is 'system'", () => {
    const { emitChange } = mockMatchMedia(false);
    const { result } = renderHook(() => useSystemTheme());
    expect(result.current.resolvedTheme).toBe("light");

    act(() => emitChange(true));

    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("setTheme updates resolvedTheme and stops tracking OS changes once no longer 'system'", () => {
    const { emitChange } = mockMatchMedia(false);
    const { result } = renderHook(() => useSystemTheme());

    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");

    // No longer "system" — an OS change must not override the explicit choice.
    act(() => emitChange(true));
    expect(result.current.theme).toBe("dark");
  });

  it("persists to localStorage only when storageKey is given", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useSystemTheme({ storageKey: "my-app:theme" }));

    act(() => result.current.setTheme("dark"));

    expect(window.localStorage.getItem("my-app:theme")).toBe("dark");
  });

  it("reads a previously stored theme back on mount", () => {
    window.localStorage.setItem("my-app:theme", "dark");
    mockMatchMedia(false);

    const { result } = renderHook(() => useSystemTheme({ storageKey: "my-app:theme" }));

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("does not touch document.documentElement unless syncDocumentElement is set", () => {
    mockMatchMedia(true);
    renderHook(() => useSystemTheme());
    expect(document.documentElement.hasAttribute("data-fdt-theme")).toBe(false);
  });

  it("mirrors the resolved theme onto document.documentElement when syncDocumentElement is true", () => {
    mockMatchMedia(true);
    renderHook(() => useSystemTheme({ syncDocumentElement: true }));
    expect(document.documentElement.getAttribute("data-fdt-theme")).toBe("dark");
  });
});
