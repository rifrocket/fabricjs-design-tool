import { describe, expect, it } from "vitest";
import { EffectRegistry } from "./effectRegistry";
import type { EffectDefinition } from "../effects/types";

function definition(id: string, category: EffectDefinition["category"] = "basic"): EffectDefinition {
  return { id, category, label: id, track: "compositing", schema: [], defaults: {} };
}

describe("EffectRegistry", () => {
  it("registers and retrieves a definition", () => {
    const registry = new EffectRegistry();
    registry.register(definition("shadow"));
    expect(registry.get("shadow")?.id).toBe("shadow");
    expect(registry.has("shadow")).toBe(true);
  });

  it("rejects registering the same id twice", () => {
    const registry = new EffectRegistry();
    registry.register(definition("shadow"));
    expect(() => registry.register(definition("shadow"))).toThrow('Effect "shadow" is already registered');
  });

  it("lists every registered definition", () => {
    const registry = new EffectRegistry();
    registry.register(definition("shadow"));
    registry.register(definition("glow"));
    expect(registry.list().map((d) => d.id).sort()).toEqual(["glow", "shadow"]);
  });

  it("filters by category", () => {
    const registry = new EffectRegistry();
    registry.register(definition("shadow", "basic"));
    registry.register(definition("duotone", "creative"));
    expect(registry.listByCategory("creative").map((d) => d.id)).toEqual(["duotone"]);
  });

  it("unregisters a definition", () => {
    const registry = new EffectRegistry();
    registry.register(definition("shadow"));
    registry.unregister("shadow");
    expect(registry.has("shadow")).toBe(false);
  });

  it("replace() overwrites an already-registered id without throwing", () => {
    const registry = new EffectRegistry();
    registry.register(definition("shadow", "basic"));

    registry.replace(definition("shadow", "creative"));

    expect(registry.get("shadow")?.category).toBe("creative");
  });
});
