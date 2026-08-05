import { describe, expect, it } from "vitest";
import { PanelRegistry } from "@rifrocket/fdt-core";
import { resolvePanelComponents } from "./resolvePanels";

function ToolbarButton(): null {
  return null;
}

function OverridePanel(): null {
  return null;
}

describe("resolvePanelComponents", () => {
  it("returns every component registered for a slot, in order", () => {
    const registry = new PanelRegistry();
    registry.register("toolbar-start", { component: ToolbarButton, order: 1 });

    expect(resolvePanelComponents(registry, "toolbar-start")).toEqual([ToolbarButton]);
  });

  it("returns an empty array for a slot nothing registered into", () => {
    const registry = new PanelRegistry();
    expect(resolvePanelComponents(registry, "sidebar-right")).toEqual([]);
  });

  it("prefers a host-provided override over any registered panels", () => {
    const registry = new PanelRegistry();
    registry.register("sidebar-right", { component: ToolbarButton });

    expect(resolvePanelComponents(registry, "sidebar-right", OverridePanel)).toEqual([OverridePanel]);
  });
});
