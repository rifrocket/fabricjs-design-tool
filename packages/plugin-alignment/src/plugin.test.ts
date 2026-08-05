import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@rifrocket/fdt-core";
import type { CanvasEngine } from "@rifrocket/fdt-core";
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
});
