import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { ObjectTypeRegistry } from "./objectTypeRegistry";
import type { SceneNode } from "../scene/sceneNode";

interface RectConfig {
  left: number;
  top: number;
}

// Deliberately not a FabricObject — proves ObjectTypeRegistry<TNode> genuinely decouples from
// fabric when a non-default TNode is supplied (FUTURE_IMPLEMENTATION.md Chunk 1.2). A fuller,
// shared version of this pattern lands as MockNode in Stage 9.
class FakeNode implements SceneNode {
  private data = new Map<string, unknown>();
  get(key: string): unknown {
    return this.data.get(key);
  }
  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}

describe("ObjectTypeRegistry", () => {
  it("creates a real Fabric object through a registered factory", async () => {
    const registry = new ObjectTypeRegistry();
    registry.register<RectConfig>("rect", {
      create: (config) => new Rect({ left: config.left, top: config.top, width: 10, height: 10 }),
    });

    const object = await registry.create("rect", { left: 5, top: 7 });

    expect(object).toBeInstanceOf(Rect);
    expect(object.left).toBe(5);
    expect(object.top).toBe(7);
  });

  it("awaits an async factory (e.g. a QR code or image object type)", async () => {
    const registry = new ObjectTypeRegistry();
    registry.register("async-rect", { create: async () => new Rect({ left: 9 }) });

    const object = await registry.create("async-rect", {});

    expect(object).toBeInstanceOf(Rect);
    expect(object.left).toBe(9);
  });

  it("throws when creating an unregistered type", async () => {
    const registry = new ObjectTypeRegistry();
    await expect(registry.create("missing", {})).rejects.toThrow('No object type registered for "missing"');
  });

  it("rejects registering the same type id twice", () => {
    const registry = new ObjectTypeRegistry();
    registry.register("rect", { create: () => new Rect() });

    expect(() => registry.register("rect", { create: () => new Rect() })).toThrow(
      'Object type "rect" is already registered',
    );
  });

  it("appends property fields to an already-registered type", () => {
    const registry = new ObjectTypeRegistry();
    registry.register("rect", { create: () => new Rect(), propertyFields: [{ key: "fill" }] });

    registry.registerPropertyFields("rect", [{ key: "stroke" }]);

    expect(registry.get("rect")?.propertyFields).toEqual([{ key: "fill" }, { key: "stroke" }]);
  });

  it("throws when appending property fields to an unregistered type", () => {
    const registry = new ObjectTypeRegistry();
    expect(() => registry.registerPropertyFields("missing", [{ key: "fill" }])).toThrow(
      'No object type registered for "missing"',
    );
  });

  it("replace() overwrites an already-registered type without throwing", () => {
    const registry = new ObjectTypeRegistry();
    registry.register("rect", { create: () => new Rect({ left: 1 }) });

    registry.replace("rect", { create: () => new Rect({ left: 2 }) });

    expect(registry.get("rect")?.create({})).toMatchObject({ left: 2 });
  });

  it("registers and creates against an explicit non-default TNode, with no FabricObject involved", async () => {
    const registry = new ObjectTypeRegistry<FakeNode>();
    registry.register<RectConfig>("fake-rect", {
      create: (config) => {
        const node = new FakeNode();
        node.set("left", config.left);
        node.set("top", config.top);
        return node;
      },
    });

    const node = await registry.create("fake-rect", { left: 5, top: 7 });

    expect(node).toBeInstanceOf(FakeNode);
    expect(node.get("left")).toBe(5);
    expect(node.get("top")).toBe(7);
  });
});
