import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@rifrocket/fdt-core";
import type { CanvasEngine } from "@rifrocket/fdt-core";
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
});
