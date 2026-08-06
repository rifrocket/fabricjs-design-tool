import { describe, expect, it } from "vitest";
import { ObjectTypeRegistry } from "@rifrocket/fabricjs-design-tool";
import { Rect } from "fabric";
import { resolvePropertyFields } from "./resolvePropertyFields";

describe("resolvePropertyFields", () => {
  it("returns the property fields registered for a type", () => {
    const registry = new ObjectTypeRegistry();
    registry.register("rect", { create: () => new Rect(), propertyFields: [{ key: "fill" }, { key: "stroke" }] });

    expect(resolvePropertyFields(registry, "rect")).toEqual([{ key: "fill" }, { key: "stroke" }]);
  });

  it("returns an empty array for a type with no property fields registered", () => {
    const registry = new ObjectTypeRegistry();
    registry.register("rect", { create: () => new Rect() });

    expect(resolvePropertyFields(registry, "rect")).toEqual([]);
  });

  it("returns an empty array for an unregistered type", () => {
    const registry = new ObjectTypeRegistry();
    expect(resolvePropertyFields(registry, "missing")).toEqual([]);
  });
});
