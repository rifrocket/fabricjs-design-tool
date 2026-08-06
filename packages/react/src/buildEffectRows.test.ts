import { describe, expect, it } from "vitest";
import { EffectRegistry } from "@rifrocket/fabricjs-design-tool";
import type { EffectDefinition, EffectInstance } from "@rifrocket/fabricjs-design-tool";
import { buildEffectRows } from "./buildEffectRows";

function definition(id: string): EffectDefinition {
  return { id, category: "basic", label: id, track: "compositing", schema: [], defaults: {} };
}

function instance(effectId: string): EffectInstance {
  return { instanceId: `${effectId}_1`, effectId, enabled: true, props: {} };
}

describe("buildEffectRows", () => {
  it("pairs each stack instance with its resolved definition", () => {
    const registry = new EffectRegistry();
    registry.register(definition("shadow"));

    const rows = buildEffectRows([instance("shadow")], registry);

    expect(rows).toHaveLength(1);
    expect(rows[0].instance.effectId).toBe("shadow");
    expect(rows[0].definition.id).toBe("shadow");
  });

  it("preserves stack order", () => {
    const registry = new EffectRegistry();
    registry.register(definition("shadow"));
    registry.register(definition("glow"));

    const rows = buildEffectRows([instance("glow"), instance("shadow")], registry);

    expect(rows.map((row) => row.instance.effectId)).toEqual(["glow", "shadow"]);
  });

  it("drops instances whose definition is no longer registered", () => {
    const registry = new EffectRegistry();

    const rows = buildEffectRows([instance("missing")], registry);

    expect(rows).toEqual([]);
  });
});
