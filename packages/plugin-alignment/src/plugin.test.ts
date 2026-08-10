import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { alignmentPlugin } from "./plugin";
import { AlignmentControls } from "./AlignmentControls";

function createFakeEngine() {
  const registry = new PluginRegistry();
  const engine = { registry } as unknown as CanvasEngine;
  return { engine, registry };
}

describe("alignmentPlugin", () => {
  it('registers AlignmentControls into the "sidebar-right" panel slot', () => {
    const { engine, registry } = createFakeEngine();

    alignmentPlugin.install(engine);

    expect(registry.panels.getSlot("sidebar-right")).toEqual([{ component: AlignmentControls }]);
  });

  it("uninstall() removes only its own engine's panel registration", () => {
    const a = createFakeEngine();
    const b = createFakeEngine();
    alignmentPlugin.install(a.engine);
    alignmentPlugin.install(b.engine);

    alignmentPlugin.uninstall?.(a.engine);

    expect(a.registry.panels.getSlot("sidebar-right")).toEqual([]);
    expect(b.registry.panels.getSlot("sidebar-right")).toEqual([{ component: AlignmentControls }]);
  });
});
