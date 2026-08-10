import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { createShapesBasicPanelPlugin } from "./plugin";
import { ShapePicker } from "./ShapePicker";

function createFakeEngine() {
  const registry = new PluginRegistry();
  const engine = { registry } as unknown as CanvasEngine;
  return { engine, registry };
}

describe("createShapesBasicPanelPlugin", () => {
  it('registers ShapePicker into the "tool-rail" panel slot', () => {
    const { engine, registry } = createFakeEngine();

    createShapesBasicPanelPlugin().install(engine);

    expect(registry.panels.getSlot("tool-rail")).toEqual([{ component: ShapePicker }]);
  });

  it('declares dependsOn: ["shapes-basic"]', () => {
    expect(createShapesBasicPanelPlugin().dependsOn).toEqual(["shapes-basic"]);
  });

  it("returns a fresh plugin instance each call", () => {
    expect(createShapesBasicPanelPlugin()).not.toBe(createShapesBasicPanelPlugin());
  });

  it("uninstall() removes only its own engine's panel registration", () => {
    const a = createFakeEngine();
    const b = createFakeEngine();
    const plugin = createShapesBasicPanelPlugin();

    plugin.install(a.engine);
    plugin.install(b.engine);
    plugin.uninstall?.(a.engine);

    expect(a.registry.panels.getSlot("tool-rail")).toEqual([]);
    expect(b.registry.panels.getSlot("tool-rail")).toEqual([{ component: ShapePicker }]);
  });
});
