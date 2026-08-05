import { describe, expect, it, vi } from "vitest";
import { KeyboardShortcutManager, normalizeKeyEvent } from "./keyboardShortcuts";

describe("normalizeKeyEvent", () => {
  it("lowercases a plain key with no modifiers", () => {
    expect(normalizeKeyEvent({ key: "V" })).toBe("v");
  });

  it("treats ctrlKey and metaKey as the same modifier", () => {
    expect(normalizeKeyEvent({ key: "z", ctrlKey: true })).toBe("ctrl+z");
    expect(normalizeKeyEvent({ key: "z", metaKey: true })).toBe("ctrl+z");
  });

  it("orders modifiers consistently regardless of which were pressed", () => {
    expect(normalizeKeyEvent({ key: "z", ctrlKey: true, shiftKey: true })).toBe("ctrl+shift+z");
    expect(normalizeKeyEvent({ key: "z", shiftKey: true, altKey: true, ctrlKey: true })).toBe("ctrl+shift+alt+z");
  });
});

describe("KeyboardShortcutManager", () => {
  it("invokes the registered handler for a matching combo", () => {
    const manager = new KeyboardShortcutManager();
    const handler = vi.fn();
    manager.register("ctrl+z", handler);

    const handled = manager.handle("ctrl+z");

    expect(handled).toBe(true);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("matches combos case-insensitively", () => {
    const manager = new KeyboardShortcutManager();
    const handler = vi.fn();
    manager.register("Ctrl+Z", handler);

    expect(manager.handle("ctrl+z")).toBe(true);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("returns false and calls nothing for an unregistered combo", () => {
    const manager = new KeyboardShortcutManager();
    expect(manager.handle("ctrl+z")).toBe(false);
  });

  it("removes a binding via the unsubscribe function returned by register", () => {
    const manager = new KeyboardShortcutManager();
    const handler = vi.fn();
    const unregister = manager.register("delete", handler);

    unregister();

    expect(manager.handle("delete")).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it("throws when a combo is registered twice", () => {
    const manager = new KeyboardShortcutManager();
    manager.register("ctrl+z", () => {});

    expect(() => manager.register("ctrl+z", () => {})).toThrow(/already registered/);
  });

  it("throws on a duplicate combo regardless of casing", () => {
    const manager = new KeyboardShortcutManager();
    manager.register("Ctrl+Z", () => {});

    expect(() => manager.register("ctrl+z", () => {})).toThrow(/already registered/);
  });

  it("replace() overwrites an existing binding instead of throwing", () => {
    const manager = new KeyboardShortcutManager();
    const first = vi.fn();
    const second = vi.fn();
    manager.register("ctrl+z", first);

    manager.replace("ctrl+z", second);
    manager.handle("ctrl+z");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("lists every registered binding", () => {
    const manager = new KeyboardShortcutManager();
    manager.register("ctrl+z", () => {}, "Undo");
    manager.register("ctrl+shift+z", () => {}, "Redo");

    expect(manager.list().map((b) => ({ key: b.key, description: b.description }))).toEqual([
      { key: "ctrl+z", description: "Undo" },
      { key: "ctrl+shift+z", description: "Redo" },
    ]);
  });
});
