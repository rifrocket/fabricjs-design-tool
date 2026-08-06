import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { KeyboardShortcutManager } from "@rifrocket/fabricjs-design-tool";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  it("invokes the matching registered handler on a real keydown event", () => {
    const manager = new KeyboardShortcutManager();
    const handler = vi.fn();
    manager.register("ctrl+z", handler);

    renderHook(() => useKeyboardShortcuts(manager));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true }));

    expect(handler).toHaveBeenCalledOnce();
  });

  it("does nothing when the manager is null", () => {
    expect(() => renderHook(() => useKeyboardShortcuts(null))).not.toThrow();
  });

  it("ignores keys with no matching binding", () => {
    const manager = new KeyboardShortcutManager();
    const handler = vi.fn();
    manager.register("ctrl+z", handler);

    renderHook(() => useKeyboardShortcuts(manager));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

    expect(handler).not.toHaveBeenCalled();
  });

  it("stops listening once unmounted", () => {
    const manager = new KeyboardShortcutManager();
    const handler = vi.fn();
    manager.register("a", handler);

    const { unmount } = renderHook(() => useKeyboardShortcuts(manager));
    unmount();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not dispatch a keydown targeting a focused editable element", () => {
    const manager = new KeyboardShortcutManager();
    const handler = vi.fn();
    manager.register("s", handler);

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useKeyboardShortcuts(manager));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "s", bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("still dispatches a keydown that does not target an editable element", () => {
    const manager = new KeyboardShortcutManager();
    const handler = vi.fn();
    manager.register("s", handler);

    renderHook(() => useKeyboardShortcuts(manager));
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "s", bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
  });

  it("re-binds to a new manager when the manager prop changes", () => {
    const first = new KeyboardShortcutManager();
    const firstHandler = vi.fn();
    first.register("a", firstHandler);
    const second = new KeyboardShortcutManager();
    const secondHandler = vi.fn();
    second.register("a", secondHandler);

    const { rerender } = renderHook(({ manager }) => useKeyboardShortcuts(manager), {
      initialProps: { manager: first },
    });
    rerender({ manager: second });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledOnce();
  });
});
