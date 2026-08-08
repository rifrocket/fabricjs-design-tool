import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { createEffectsPanelPlugin } from "./plugin";
import { EffectsPanel } from "./EffectsPanel";

function createFakeEngine() {
  const registry = new PluginRegistry();
  const engine = { registry } as unknown as CanvasEngine;
  return { engine, registry };
}

describe("createEffectsPanelPlugin", () => {
  it('registers EffectsPanel into the "sidebar-right" panel slot', () => {
    const { engine, registry } = createFakeEngine();

    createEffectsPanelPlugin().install(engine);

    expect(registry.panels.getSlot("sidebar-right")).toEqual([{ component: EffectsPanel }]);
  });

  it('declares dependsOn: ["effects"]', () => {
    expect(createEffectsPanelPlugin().dependsOn).toEqual(["effects"]);
  });

  it("returns a fresh plugin instance each call", () => {
    expect(createEffectsPanelPlugin()).not.toBe(createEffectsPanelPlugin());
  });
});
