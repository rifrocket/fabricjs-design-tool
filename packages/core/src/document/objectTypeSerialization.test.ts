import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import type { FabricObject } from "fabric";
import { applyDeserializeOverrides, serializeWithTypeOverrides } from "./objectTypeSerialization";
import { ObjectTypeRegistry } from "../plugin/objectTypeRegistry";
import { ID_PROPERTY } from "../engine/objectId";

function createFakeRenderer(nodes: FabricObject[], sceneJSON: Record<string, unknown>) {
  return {
    exportSceneJSON: vi.fn().mockReturnValue(sceneJSON),
    getNodes: vi.fn().mockReturnValue(nodes),
  };
}

describe("serializeWithTypeOverrides", () => {
  it("merges a registered type's serialize() output onto the raw entry, for the matching top-level node", () => {
    const rect = new Rect({ left: 1, top: 2 });
    rect.set("shapeKind", "custom-rect");
    const rawEntry = { type: "Rect", left: 1, top: 2, [ID_PROPERTY]: "obj_1" };
    const renderer = createFakeRenderer([rect], { objects: [rawEntry] });
    const registry = new ObjectTypeRegistry();
    registry.register("custom-rect", {
      create: () => new Rect(),
      serialize: (node) => ({ customField: (node.get("left") as number) * 10 }),
    });

    const result = serializeWithTypeOverrides(renderer, registry, [ID_PROPERTY]);

    expect(result.objects).toEqual([{ ...rawEntry, customField: 10 }]);
  });

  it("leaves the raw entry unchanged for a type with no serialize() hook (default, byte-identical behavior)", () => {
    const rect = new Rect({ left: 1, top: 2 });
    const rawEntry = { type: "Rect", left: 1, top: 2 };
    const renderer = createFakeRenderer([rect], { objects: [rawEntry] });
    const registry = new ObjectTypeRegistry();
    registry.register("rect", { create: () => new Rect() });

    const result = serializeWithTypeOverrides(renderer, registry, []);

    expect(result.objects).toEqual([rawEntry]);
  });

  it("passes through untouched when exportSceneJSON returns no objects array", () => {
    const renderer = createFakeRenderer([], { background: "#fff" });
    const registry = new ObjectTypeRegistry();

    expect(serializeWithTypeOverrides(renderer, registry)).toEqual({ background: "#fff" });
  });
});

describe("applyDeserializeOverrides", () => {
  it("calls a registered type's deserialize() with the matching raw entry and live node, for top-level nodes", async () => {
    const rect = new Rect();
    rect.set("shapeKind", "custom-rect");
    const rawEntry = { type: "Rect", customField: 10 };
    const renderer = createFakeRenderer([rect], {});
    const registry = new ObjectTypeRegistry();
    const deserialize = vi.fn((data: Record<string, unknown>, ctx: { object: FabricObject }) => {
      ctx.object.set("left", (data.customField as number) / 10);
    });
    registry.register("custom-rect", { create: () => new Rect(), deserialize });

    await applyDeserializeOverrides(renderer, registry, { objects: [rawEntry] });

    expect(deserialize).toHaveBeenCalledWith(rawEntry, { object: rect });
    expect(rect.left).toBe(1);
  });

  it("is a no-op for a type with no deserialize() hook", async () => {
    const rect = new Rect();
    const renderer = createFakeRenderer([rect], {});
    const registry = new ObjectTypeRegistry();
    registry.register("rect", { create: () => new Rect() });

    await expect(applyDeserializeOverrides(renderer, registry, { objects: [{ type: "Rect" }] })).resolves.toBeUndefined();
  });

  it("is a no-op when rawJson has no objects array", async () => {
    const renderer = createFakeRenderer([], {});
    const registry = new ObjectTypeRegistry();

    await expect(applyDeserializeOverrides(renderer, registry, {})).resolves.toBeUndefined();
    expect(renderer.getNodes).not.toHaveBeenCalled();
  });
});
