import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import type { CanvasEngine, EditorPlugin } from "@rifrocket/fdt-core";
import { DesignEditor } from "./DesignEditor";
import { defaultPreset, minimalPreset } from "./builtinPresets";
import type { DesignEditorPreset } from "./types";

// Same minimal double as core's canvasEngine.integration.test.ts — a real fabric.Canvas needs a
// working 2D rendering context jsdom doesn't provide.
const { FakeCanvas } = vi.hoisted(() => {
  class FakeCanvas {
    width: number;
    height: number;
    private listeners = new Map<string, Set<(...args: unknown[]) => void>>();
    private objects: unknown[] = [];

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

    add(object: unknown): void {
      this.objects.push(object);
    }

    getObjects(): unknown[] {
      return this.objects;
    }

    getActiveObjects(): unknown[] {
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

function renderDesignEditor(props: Omit<ComponentProps<typeof DesignEditor>, "onReady">) {
  let engine: CanvasEngine | null = null;
  render(<DesignEditor {...props} onReady={(e) => (engine = e)} />);
  return () => engine as CanvasEngine;
}

describe("DesignEditor", () => {
  it('installs the "default" preset\'s plugins by default', () => {
    const getEngine = renderDesignEditor({ preset: "default" });
    for (const plugin of (defaultPreset.plugins as () => EditorPlugin[])()) {
      expect(getEngine().hasPlugin(plugin.name)).toBe(true);
    }
  });

  it('"minimal" installs fewer plugins than "default" (drops qrcode/export-pdf/svg-import)', () => {
    const getEngine = renderDesignEditor({ preset: "minimal" });
    for (const plugin of (minimalPreset.plugins as () => EditorPlugin[])()) {
      expect(getEngine().hasPlugin(plugin.name)).toBe(true);
    }
    expect(getEngine().hasPlugin("qrcode")).toBe(false);
    expect(getEngine().hasPlugin("export-pdf")).toBe(false);
    expect(getEngine().hasPlugin("svg-import")).toBe(false);
  });

  it('"none" (and omitting preset) installs nothing', () => {
    const getEngine = renderDesignEditor({ preset: "none" });
    expect(getEngine().hasPlugin("shapes-basic")).toBe(false);
  });

  it("plugins.exclude drops a named plugin from the preset", () => {
    const getEngine = renderDesignEditor({ preset: "minimal", plugins: { exclude: ["clipboard"] } });
    expect(getEngine().hasPlugin("clipboard")).toBe(false);
    expect(getEngine().hasPlugin("shapes-basic")).toBe(true);
  });

  it("plugins.add installs an extra, non-preset plugin (e.g. a react-dependent plugin like plugin-alignment)", () => {
    const extra: EditorPlugin = { name: "extra", install: vi.fn() };
    const getEngine = renderDesignEditor({ preset: "minimal", plugins: { add: [extra] } });
    expect(getEngine().hasPlugin("extra")).toBe(true);
  });

  it("autosave sugar installs the local-storage plugin", () => {
    const getEngine = renderDesignEditor({ preset: "none", autosave: true });
    expect(getEngine().hasPlugin("local-storage")).toBe(true);
  });

  it("shortcuts.disable removes a default binding (e.g. ctrl+y)", () => {
    const getEngine = renderDesignEditor({ preset: "none", shortcuts: { disable: ["ctrl+y"] } });
    expect(getEngine().shortcuts.has("ctrl+y")).toBe(false);
    expect(getEngine().shortcuts.has("ctrl+z")).toBe(true);
  });

  it("shortcuts.add registers an extra binding alongside the defaults", () => {
    const handler = vi.fn();
    const getEngine = renderDesignEditor({ preset: "none", shortcuts: { add: { "ctrl+s": { handler, description: "Save" } } } });
    expect(getEngine().shortcuts.has("ctrl+s")).toBe(true);
    getEngine().shortcuts.handle("ctrl+s");
    expect(handler).toHaveBeenCalledWith(getEngine());
  });

  it("preset.shortcuts.disable and the shortcuts prop's disable are unioned", () => {
    const preset: DesignEditorPreset = { name: "custom", plugins: [], shortcuts: { disable: ["escape"] } };
    const getEngine = renderDesignEditor({ preset, shortcuts: { disable: ["ctrl+y"] } });
    expect(getEngine().shortcuts.has("escape")).toBe(false);
    expect(getEngine().shortcuts.has("ctrl+y")).toBe(false);
    expect(getEngine().shortcuts.has("ctrl+z")).toBe(true);
  });

  it("registers propertyFields overrides on the resulting engine", () => {
    const preset: DesignEditorPreset = {
      name: "custom",
      plugins: [{ name: "shapes", install: (e) => e.registry.registerObjectType("rect", { create: () => ({}) as never }) }],
    };
    const getEngine = renderDesignEditor({ preset, propertyFields: { rect: [{ key: "fill" }] } });
    expect(getEngine().registry.objectTypes.get("rect")?.propertyFields).toEqual([{ key: "fill" }]);
  });
});
