import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { createEffectsPanelPlugin, effectsWithPanelPlugin } from "./plugin";
import { EffectsPanel } from "./EffectsPanel";

function createFakeEngine() {
  const registry = new PluginRegistry();
  // getFabricCanvas() is only exercised by effectsWithPanelPlugin()'s tests below (it installs
  // createEffectsPlugin(), which needs it for installRenderPatch) — a distinct object per fake
  // engine, same rationale as plugin-effects' own test double.
  const engine = { registry, getFabricCanvas: () => ({}) } as unknown as CanvasEngine;
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

  it("uninstall() removes only its own engine's panel registration", () => {
    const a = createFakeEngine();
    const b = createFakeEngine();
    const plugin = createEffectsPanelPlugin();

    plugin.install(a.engine);
    plugin.install(b.engine);
    plugin.uninstall?.(a.engine);

    expect(a.registry.panels.getSlot("sidebar-right")).toEqual([]);
    expect(b.registry.panels.getSlot("sidebar-right")).toEqual([{ component: EffectsPanel }]);
  });
});

describe("effectsWithPanelPlugin", () => {
  it("returns both the effects plugin and the panel plugin, effects first", () => {
    const [effects, panel] = effectsWithPanelPlugin();
    expect(effects.name).toBe("effects");
    expect(panel.name).toBe("effects-panel");
    expect(panel.dependsOn).toEqual(["effects"]);
  });

  it("installing both via useAll() results in a working effects registry and panel", () => {
    const { engine, registry } = createFakeEngine();
    // useAll-equivalent: install in dependency order, same as CanvasEngine.useAll() would.
    for (const plugin of effectsWithPanelPlugin()) plugin.install(engine);

    expect(registry.effects.has("shadow")).toBe(true);
    expect(registry.panels.getSlot("sidebar-right")).toEqual([{ component: EffectsPanel }]);
  });
});
