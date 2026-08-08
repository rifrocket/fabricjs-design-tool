import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { snappingPlugin } from "./plugin";
import { SnappingToggle } from "./SnappingToggle";

function createFakeEngine() {
  const registry = new PluginRegistry();
  const engine = { registry } as unknown as CanvasEngine;
  return { engine, registry };
}

describe("snappingPlugin", () => {
  it('registers SnappingToggle into the "sidebar-right" panel slot', () => {
    const { engine, registry } = createFakeEngine();

    snappingPlugin.install(engine);

    expect(registry.panels.getSlot("sidebar-right")).toEqual([{ component: SnappingToggle }]);
  });

  it("uninstall() removes only its own engine's panel registration", () => {
    const a = createFakeEngine();
    const b = createFakeEngine();
    snappingPlugin.install(a.engine);
    snappingPlugin.install(b.engine);

    snappingPlugin.uninstall?.(a.engine);

    expect(a.registry.panels.getSlot("sidebar-right")).toEqual([]);
    expect(b.registry.panels.getSlot("sidebar-right")).toEqual([{ component: SnappingToggle }]);
  });
});
