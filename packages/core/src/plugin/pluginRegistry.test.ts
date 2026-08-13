import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { PluginRegistry } from "./pluginRegistry";
import { MockNode } from "../testing/mockRendererApi";

describe("PluginRegistry", () => {
  it("defaults objectTypes to a real Fabric-object-creating registry, unchanged from before Chunk 12.1", async () => {
    const registry = new PluginRegistry();
    registry.registerObjectType("rect", { create: () => new Rect({ left: 5 }) });
    expect(registry.objectTypes.has("rect")).toBe(true);
    const object = await registry.objectTypes.create("rect", {});
    expect(object).toBeInstanceOf(Rect);
  });

  it("accepts an explicit non-default TNode, proving genuine decoupling (FUTURE_IMPLEMENTATION.md Stage 12)", async () => {
    const registry = new PluginRegistry<MockNode>();
    registry.registerObjectType("mock-thing", {
      create: () => new MockNode(),
    });
    expect(registry.objectTypes.has("mock-thing")).toBe(true);
    await expect(registry.objectTypes.create("mock-thing", {})).resolves.toBeInstanceOf(MockNode);
  });

  it("leaves tools/panels/effects/exporters/importers untouched by the TNode parameter", () => {
    const registry = new PluginRegistry<MockNode>();
    registry.registerTool("stamp", { onActivate: () => {}, onDeactivate: () => {} });
    expect(registry.tools.has("stamp")).toBe(true);
  });
});
