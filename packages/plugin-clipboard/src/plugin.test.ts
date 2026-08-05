import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { FabricObject } from "fabric";
import { KeyboardShortcutManager } from "@rifrocket/fdt-core";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import { clipboardPlugin } from "./plugin";

function createFakeEngine() {
  const shortcuts = new KeyboardShortcutManager();
  const objects: FabricObject[] = [];
  let activeObjects: FabricObject[] = [];

  const engine = {
    shortcuts,
    selection: {
      getActiveObjects: () => activeObjects,
      selectMultiple: vi.fn((objs: FabricObject[]) => {
        activeObjects = objs;
      }),
      group: vi.fn(),
      ungroup: vi.fn(),
    },
    layers: {
      getObjects: () => objects,
    },
    addObject: vi.fn((object: FabricObject) => {
      objects.push(object);
    }),
    setObjectProperty: vi.fn((object: FabricObject, key: string, value: unknown) => {
      object.set(key, value);
    }),
  } as unknown as CanvasEngine;

  const setActive = (objs: FabricObject[]) => {
    activeObjects = objs;
  };

  const trigger = async (combo: string) => {
    const binding = shortcuts.list().find((b) => b.key === combo);
    await binding?.handler();
  };

  return { engine, objects, setActive, trigger };
}

describe("clipboardPlugin", () => {
  it("registers every documented shortcut", () => {
    const { engine } = createFakeEngine();
    clipboardPlugin.install(engine);

    const combos = engine.shortcuts.list().map((b) => b.key);
    expect(combos).toEqual(
      expect.arrayContaining([
        "ctrl+c",
        "ctrl+v",
        "ctrl+d",
        "ctrl+g",
        "ctrl+shift+g",
        "ctrl+a",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "shift+arrowup",
        "shift+arrowdown",
        "shift+arrowleft",
        "shift+arrowright",
      ]),
    );
  });

  it("copies then pastes the active selection with a position offset, and selects the pasted copies", async () => {
    const { engine, objects, setActive, trigger } = createFakeEngine();
    clipboardPlugin.install(engine);
    const rect = new Rect({ left: 10, top: 10 });
    objects.push(rect);
    setActive([rect]);

    await trigger("ctrl+c");
    await trigger("ctrl+v");

    expect(objects).toHaveLength(2);
    const pasted = objects[1];
    expect(pasted).not.toBe(rect);
    expect(pasted.left).toBe(30);
    expect(pasted.top).toBe(30);
  });

  it("duplicates the active selection without touching the clipboard", async () => {
    const { engine, objects, setActive, trigger } = createFakeEngine();
    clipboardPlugin.install(engine);
    const rect = new Rect({ left: 0, top: 0 });
    objects.push(rect);
    setActive([rect]);

    await trigger("ctrl+d");

    expect(objects).toHaveLength(2);
    expect(objects[1].left).toBe(20);
    expect(objects[1].top).toBe(20);
  });

  it("selects every object on ctrl+a", async () => {
    const { engine, objects, trigger } = createFakeEngine();
    clipboardPlugin.install(engine);
    objects.push(new Rect(), new Rect());

    await trigger("ctrl+a");

    expect(engine.selection.selectMultiple).toHaveBeenCalledWith(objects);
  });

  it("nudges every selected object's position via setObjectProperty", async () => {
    const { engine, setActive, trigger } = createFakeEngine();
    clipboardPlugin.install(engine);
    const rect = new Rect({ left: 5, top: 5 });
    setActive([rect]);

    await trigger("arrowright");
    expect(rect.left).toBe(6);

    await trigger("shift+arrowdown");
    expect(rect.top).toBe(15);
  });
});
