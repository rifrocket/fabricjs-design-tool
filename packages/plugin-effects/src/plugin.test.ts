import { afterEach, describe, expect, it } from "vitest";
import { FabricObject } from "fabric";
import { PluginRegistry, getSerializedProperties } from "@rifrocket/fdt-core";
import type { CanvasEngine } from "@rifrocket/fdt-core";
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
  return { registry: new PluginRegistry() } as unknown as CanvasEngine;
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
});
