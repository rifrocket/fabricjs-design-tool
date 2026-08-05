import { describe, expect, it } from "vitest";
import { PanelRegistry } from "./panelRegistry";

describe("PanelRegistry", () => {
  it("returns an empty list for a slot nothing has registered into", () => {
    const registry = new PanelRegistry();
    expect(registry.getSlot("sidebar-right")).toEqual([]);
  });

  it("collects multiple panels registered into the same slot", () => {
    const registry = new PanelRegistry();
    registry.register("sidebar-right", { component: "A" });
    registry.register("sidebar-right", { component: "B" });

    expect(registry.getSlot("sidebar-right")).toEqual([{ component: "A" }, { component: "B" }]);
  });

  it("orders panels within a slot by their order field", () => {
    const registry = new PanelRegistry();
    registry.register("sidebar-right", { component: "second", order: 10 });
    registry.register("sidebar-right", { component: "first", order: 1 });

    expect(registry.getSlot("sidebar-right").map((p) => p.component)).toEqual(["first", "second"]);
  });

  it("removes a panel via the unsubscribe function returned by register", () => {
    const registry = new PanelRegistry();
    const definition = { component: "A" };
    const unregister = registry.register("sidebar-right", definition);

    unregister();

    expect(registry.getSlot("sidebar-right")).toEqual([]);
  });

  it("throws when the same component is registered into the same slot twice", () => {
    const registry = new PanelRegistry();
    const definition = { component: "A" };
    registry.register("sidebar-right", definition);

    expect(() => registry.register("sidebar-right", { component: "A" })).toThrow(/already registered/);
  });

  it("allows the same component in different slots (only same-slot duplicates throw)", () => {
    const registry = new PanelRegistry();
    registry.register("sidebar-right", { component: "A" });

    expect(() => registry.register("toolbar-start", { component: "A" })).not.toThrow();
  });

  it("replace() overwrites an existing same-component entry instead of throwing", () => {
    const registry = new PanelRegistry();
    registry.register("sidebar-right", { component: "A", order: 1 });

    registry.replace("sidebar-right", { component: "A", order: 5 });

    expect(registry.getSlot("sidebar-right")).toEqual([{ component: "A", order: 5 }]);
  });

  it("lists every slot that has at least one registration", () => {
    const registry = new PanelRegistry();
    registry.register("sidebar-right", { component: "A" });
    registry.register("toolbar-start", { component: "B" });

    expect(registry.listSlots()).toEqual(["sidebar-right", "toolbar-start"]);
  });
});
