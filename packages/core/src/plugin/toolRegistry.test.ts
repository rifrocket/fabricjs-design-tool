import { describe, expect, it, vi } from "vitest";
import { ToolRegistry } from "./toolRegistry";

describe("ToolRegistry", () => {
  it("has no active tool until one is activated", () => {
    const registry = new ToolRegistry();
    expect(registry.getActiveToolId()).toBeNull();
  });

  it("activates a registered tool and calls its onActivate hook", () => {
    const registry = new ToolRegistry();
    const onActivate = vi.fn();
    registry.register("select", { onActivate });

    registry.activate("select");

    expect(registry.getActiveToolId()).toBe("select");
    expect(onActivate).toHaveBeenCalledWith({ toolId: "select" });
  });

  it("deactivates the previous tool before activating the next one", () => {
    const onDeactivate = vi.fn();
    const registry = new ToolRegistry();
    registry.register("select", { onDeactivate });
    registry.register("pan", {});
    registry.activate("select");

    registry.activate("pan");

    expect(onDeactivate).toHaveBeenCalledWith({ toolId: "select" });
    expect(registry.getActiveToolId()).toBe("pan");
  });

  it("is a no-op when activating the already-active tool", () => {
    const onActivate = vi.fn();
    const registry = new ToolRegistry();
    registry.register("select", { onActivate });
    registry.activate("select");

    registry.activate("select");

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("throws when activating an unregistered tool", () => {
    const registry = new ToolRegistry();
    expect(() => registry.activate("missing")).toThrow('No tool registered for "missing"');
  });

  it("clears the active tool id when the active tool is unregistered", () => {
    const registry = new ToolRegistry();
    registry.register("select", {});
    registry.activate("select");

    registry.unregister("select");

    expect(registry.getActiveToolId()).toBeNull();
  });
});
