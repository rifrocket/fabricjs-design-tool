import { describe, expect, it, vi } from "vitest";
import { PluginRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { importSvgToEngine, svgImportPlugin } from "./plugin";

function createFakeEngine() {
  const registry = new PluginRegistry();
  const fabricCanvas = {};
  const engine = { registry, getFabricCanvas: () => fabricCanvas } as unknown as CanvasEngine;
  return { engine, registry, fabricCanvas };
}

describe("svgImportPlugin", () => {
  it('registers an importer under the "svg" format', () => {
    const { engine, registry } = createFakeEngine();
    svgImportPlugin.install(engine);
    expect(registry.importers.get("svg")).toBeDefined();
  });
});

describe("importSvgToEngine", () => {
  it("calls the registered importer with the engine's canvas and the given string", async () => {
    const { engine, registry, fabricCanvas } = createFakeEngine();
    const importer = vi.fn(async () => {});
    registry.registerImporter("svg", importer);

    await importSvgToEngine(engine, "<svg></svg>");

    expect(importer).toHaveBeenCalledWith(fabricCanvas, "<svg></svg>");
  });

  it("honors a replaced importer instead of always calling the original", async () => {
    const { engine, registry, fabricCanvas } = createFakeEngine();
    registry.registerImporter("svg", vi.fn(async () => {}));
    const replacement = vi.fn(async () => {});
    registry.importers.replace("svg", replacement);

    await importSvgToEngine(engine, "<svg/>");

    expect(replacement).toHaveBeenCalledWith(fabricCanvas, "<svg/>");
  });

  it('throws a clear error when no "svg" importer is registered', async () => {
    const { engine } = createFakeEngine();
    await expect(importSvgToEngine(engine, "<svg/>")).rejects.toThrow(/No "svg" importer registered/);
  });
});
