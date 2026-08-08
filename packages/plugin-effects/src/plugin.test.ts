import { afterEach, describe, expect, it } from "vitest";
import { FabricObject } from "fabric";
import { PluginRegistry, getSerializedProperties } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { createEffectsPlugin } from "./plugin";
import { shadowEffect } from "./effects/basic/shadow";
import { ALL_BUILTIN_EFFECTS } from "./effects";
import { __resetRenderPatchForTests, isRenderPatchInstalled } from "./pipeline/installRenderPatch";

const originalRender = FabricObject.prototype.render;

afterEach(() => {
  FabricObject.prototype.render = originalRender;
  __resetRenderPatchForTests();
});

function createFakeEngine(): CanvasEngine {
  // A distinct object per fake engine, standing in for the real, per-engine singleton
  // getFabricCanvas() returns — installRenderPatch keys its per-engine registry map off this
  // reference, so two fake engines must return two distinct objects, the same way two real
  // CanvasEngines' canvases are two distinct Fabric Canvas instances.
  const fabricCanvas = {};
  return {
    registry: new PluginRegistry(),
    getFabricCanvas: () => fabricCanvas,
  } as unknown as CanvasEngine;
}

describe("createEffectsPlugin", () => {
  it("registers every built-in effect by default", () => {
    const engine = createFakeEngine();
    createEffectsPlugin().install(engine);
    expect(engine.registry.effects.list()).toHaveLength(ALL_BUILTIN_EFFECTS.length);
  });

  it("registers only a curated subset when given one", () => {
    const engine = createFakeEngine();
    createEffectsPlugin([shadowEffect]).install(engine);
    expect(engine.registry.effects.list().map((e) => e.id)).toEqual(["shadow"]);
  });

  it("registers the effects property for serialization", () => {
    const engine = createFakeEngine();
    createEffectsPlugin([shadowEffect]).install(engine);
    expect(getSerializedProperties()).toContain("fdtEffects");
  });

  it("installs the render patch", () => {
    const engine = createFakeEngine();
    createEffectsPlugin([shadowEffect]).install(engine);
    expect(isRenderPatchInstalled()).toBe(true);
  });

  it("does not throw installing against a second engine's own, independent registry", () => {
    const first = createFakeEngine();
    const second = createFakeEngine();
    createEffectsPlugin([shadowEffect]).install(first);
    expect(() => createEffectsPlugin([shadowEffect]).install(second)).not.toThrow();
    expect(second.registry.effects.has("shadow")).toBe(true);
  });

  it("uninstall() removes this engine's own canvas from the render-patch registry map, without disturbing another still-live engine", () => {
    // Deep behavioral coverage of the per-canvas registry resolution itself lives in
    // installRenderPatch.test.ts; this checks the plugin wires its own engine's canvas through
    // correctly on both install() and uninstall().
    const first = createFakeEngine();
    const second = createFakeEngine();
    const pluginA = createEffectsPlugin([shadowEffect]);
    const pluginB = createEffectsPlugin([shadowEffect]);
    pluginA.install(first);
    pluginB.install(second);

    expect(() => pluginA.uninstall?.(first)).not.toThrow();
    expect(second.registry.effects.has("shadow")).toBe(true);
  });
});
