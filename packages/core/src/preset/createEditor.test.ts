import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { FabricObject } from "fabric";
import type { EditorPlugin } from "../plugin/plugin";
import type { EditorPreset } from "./types";
import { createEditor, definePreset, resolvePluginList, resolvePreset, resolvePropertyFields } from "./createEditor";

// Same double as canvasEngine.integration.test.ts — see that file's comment for why a real
// fabric.Canvas can't run in this test environment.
const { FakeCanvas } = vi.hoisted(() => {
  class FakeCanvas {
    width: number;
    height: number;

    private objects: FabricObject[] = [];
    private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

    constructor(_element: unknown, options: { width?: number; height?: number } = {}) {
      this.width = options.width ?? 300;
      this.height = options.height ?? 150;
    }

    on(event: string, handler: (...args: unknown[]) => void): void {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event)?.add(handler);
    }

    off(event: string, handler: (...args: unknown[]) => void): void {
      this.listeners.get(event)?.delete(handler);
    }

    add(object: FabricObject): void {
      this.objects.push(object);
    }

    getObjects(): FabricObject[] {
      return this.objects;
    }

    getActiveObjects(): FabricObject[] {
      return [];
    }

    getZoom(): number {
      return 1;
    }

    getWidth(): number {
      return this.width;
    }

    getHeight(): number {
      return this.height;
    }

    setDimensions(dimensions: { width: number; height: number }): void {
      this.width = dimensions.width;
      this.height = dimensions.height;
    }

    requestRenderAll(): void {}

    dispose(): void {}
  }

  return { FakeCanvas };
});

vi.mock("fabric", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fabric")>();
  return { ...actual, Canvas: FakeCanvas };
});

function plugin(name: string, extra: Partial<EditorPlugin> = {}): EditorPlugin {
  return { name, install: vi.fn(), ...extra };
}

describe("resolvePreset", () => {
  it("resolves 'none'/undefined to the empty preset", () => {
    expect(resolvePreset("none").plugins).toEqual([]);
    expect(resolvePreset(undefined).plugins).toEqual([]);
  });

  it("passes a literal preset object through unchanged", () => {
    const preset: EditorPreset = { name: "custom", plugins: [] };
    expect(resolvePreset(preset)).toBe(preset);
  });

  it("throws a redirecting error for named strings core can't resolve alone", () => {
    // @ts-expect-error — "default" isn't a valid CreateEditorOptions.preset value at the core layer
    expect(() => resolvePreset("default")).toThrow(/DesignEditor preset="default"/);
  });
});

describe("definePreset", () => {
  it("returns the preset unchanged when valid", () => {
    const preset: EditorPreset = { name: "x", plugins: [] };
    expect(definePreset(preset)).toBe(preset);
  });

  it("throws when name is missing", () => {
    expect(() => definePreset({ name: "", plugins: [] })).toThrow(/preset.name is required/);
  });
});

describe("resolvePluginList", () => {
  const a = plugin("a");
  const b = plugin("b");
  const preset: EditorPreset = { name: "test", plugins: [a, b] };

  it("returns the preset's plugins unmodified with no overrides", () => {
    expect(resolvePluginList(preset)).toEqual([a, b]);
  });

  it("drops excluded plugins", () => {
    expect(resolvePluginList(preset, { exclude: ["a"] })).toEqual([b]);
  });

  it("appends added plugins", () => {
    const c = plugin("c");
    expect(resolvePluginList(preset, { add: [c] })).toEqual([a, b, c]);
  });

  it("replaces a plugin by name in place", () => {
    const a2 = plugin("a");
    expect(resolvePluginList(preset, { replace: { a: a2 } })).toEqual([a2, b]);
  });

  it("supports a factory-form preset", () => {
    const factoryPreset: EditorPreset = { name: "factory", plugins: () => [a] };
    expect(resolvePluginList(factoryPreset)).toEqual([a]);
  });

  it("throws on an exclude typo instead of silently no-op'ing", () => {
    expect(() => resolvePluginList(preset, { exclude: ["nope"] })).toThrow(/plugins.exclude references "nope"/);
  });

  it("throws on a replace typo instead of silently no-op'ing", () => {
    expect(() => resolvePluginList(preset, { replace: { nope: plugin("nope") } })).toThrow(
      /plugins.replace references "nope"/,
    );
  });
});

describe("resolvePropertyFields", () => {
  const preset: EditorPreset = {
    name: "test",
    plugins: [],
    propertyFields: { rect: [{ key: "fill" }] },
  };

  it("returns the preset's fields unmodified with no overrides", () => {
    expect(resolvePropertyFields(preset)).toEqual({ rect: [{ key: "fill" }] });
  });

  it("appends fields for an existing type", () => {
    expect(resolvePropertyFields(preset, { rect: [{ key: "stroke" }] })).toEqual({
      rect: [{ key: "fill" }, { key: "stroke" }],
    });
  });

  it("adds fields for a new type", () => {
    expect(resolvePropertyFields(preset, { circle: [{ key: "radius" }] })).toEqual({
      rect: [{ key: "fill" }],
      circle: [{ key: "radius" }],
    });
  });

  it("suppresses a type's fields entirely when overridden with null", () => {
    expect(resolvePropertyFields(preset, { rect: null })).toEqual({});
  });
});

describe("createEditor()", () => {
  it("installs a preset's plugins and applies exclude/add/replace overrides", () => {
    const install = vi.fn();
    const shapesPlugin = plugin("shapes", { install });
    const preset: EditorPreset = { name: "default", plugins: [shapesPlugin, plugin("qrcode")] };

    const { engine, resolvedPreset } = createEditor("test-canvas", {
      width: 400,
      height: 300,
      preset,
      plugins: { exclude: ["qrcode"] },
    });

    expect(install).toHaveBeenCalledWith(engine);
    expect(engine.hasPlugin("shapes")).toBe(true);
    expect(engine.hasPlugin("qrcode")).toBe(false);
    expect(resolvedPreset.plugins).toEqual([shapesPlugin]);
  });

  it("registers a preset's property fields on the resulting engine", () => {
    const shapesPlugin: EditorPlugin = {
      name: "shapes",
      install: (e) => e.registry.registerObjectType("rect", { create: () => new Rect() }),
    };
    const preset: EditorPreset = {
      name: "default",
      plugins: [shapesPlugin],
      propertyFields: { rect: [{ key: "fill" }] },
    };

    const { engine } = createEditor("test-canvas", { width: 400, height: 300, preset });

    expect(engine.registry.objectTypes.get("rect")?.propertyFields).toEqual([{ key: "fill" }]);
  });

  it("defaults to the empty preset (equivalent to createEngine()) with no preset option", () => {
    const { engine, resolvedPreset } = createEditor("test-canvas", { width: 400, height: 300 });
    expect(resolvedPreset.name).toBe("none");
    expect(engine.isDestroyed()).toBe(false);
  });

  it("registers preset-level shortcut additions on the engine", () => {
    const handler = vi.fn();
    const preset: EditorPreset = {
      name: "with-shortcuts",
      plugins: [],
      shortcuts: { add: { "ctrl+d": { handler, description: "Duplicate" } } },
    };

    const { engine } = createEditor("test-canvas", { width: 400, height: 300, preset });

    expect(engine.shortcuts.has("ctrl+d")).toBe(true);
    engine.shortcuts.handle("ctrl+d");
    expect(handler).toHaveBeenCalledWith(engine);
  });
});
