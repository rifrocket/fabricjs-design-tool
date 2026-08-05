import { describe, expect, it, vi } from "vitest";
import { Registry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine, Importer } from "@rifrocket/fabricjs-design-tool";
import type { Canvas } from "fabric";
import { importJsonPlugin } from "./plugin";

describe("importJsonPlugin", () => {
  it("registers a 'json' importer that loads the input into the canvas and re-renders", async () => {
    const importers = new Registry<Importer>();
    const engine = {
      registry: { importers, registerImporter: (format: string, importer: Importer) => importers.register(format, importer) },
    };

    importJsonPlugin.install(engine as unknown as CanvasEngine);

    const loadFromJSON = vi.fn().mockResolvedValue(undefined);
    const requestRenderAll = vi.fn();
    const canvas = { loadFromJSON, requestRenderAll } as unknown as Canvas;
    const importer = importers.get("json");
    expect(importer).toBeDefined();

    await importer?.(canvas, { objects: [] });

    expect(loadFromJSON).toHaveBeenCalledWith({ objects: [] });
    expect(requestRenderAll).toHaveBeenCalledOnce();
  });
});
