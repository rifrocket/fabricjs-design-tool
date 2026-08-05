import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import {
  addEffect,
  duplicateEffect,
  getEffectStack,
  removeEffect,
  reorderEffect,
  resetAllEffects,
  resetEffect,
  toggleEffect,
  updateEffectProps,
} from "./effectStack";
import { EFFECTS_PROPERTY } from "./types";
import type { EffectDefinition } from "./types";

const shadowDefinition: EffectDefinition<{ blur: number; color: string }> = {
  id: "shadow",
  category: "basic",
  label: "Shadow",
  track: "compositing",
  schema: [],
  defaults: { blur: 10, color: "#000000" },
};

describe("getEffectStack", () => {
  it("returns an empty array when the object has no effects", () => {
    expect(getEffectStack(new Rect())).toEqual([]);
  });

  it("returns the stored stack", () => {
    const rect = new Rect();
    rect.set(EFFECTS_PROPERTY, [{ instanceId: "a", effectId: "shadow", enabled: true, props: {} }]);
    expect(getEffectStack(rect)).toHaveLength(1);
  });
});

describe("addEffect", () => {
  it("appends a new enabled instance seeded with the definition's defaults", () => {
    const next = addEffect([], shadowDefinition);
    expect(next).toHaveLength(1);
    expect(next[0].effectId).toBe("shadow");
    expect(next[0].enabled).toBe(true);
    expect(next[0].props).toEqual({ blur: 10, color: "#000000" });
  });

  it("assigns distinct instanceIds when the same effect is added twice", () => {
    const once = addEffect([], shadowDefinition);
    const twice = addEffect(once, shadowDefinition);
    expect(twice[0].instanceId).not.toBe(twice[1].instanceId);
  });
});

describe("removeEffect", () => {
  it("removes only the matching instance", () => {
    const stack = addEffect(addEffect([], shadowDefinition), shadowDefinition);
    const next = removeEffect(stack, stack[0].instanceId);
    expect(next).toHaveLength(1);
    expect(next[0].instanceId).toBe(stack[1].instanceId);
  });
});

describe("toggleEffect", () => {
  it("flips enabled without touching other instances", () => {
    const stack = addEffect([], shadowDefinition);
    const next = toggleEffect(stack, stack[0].instanceId);
    expect(next[0].enabled).toBe(false);
    expect(toggleEffect(next, next[0].instanceId)[0].enabled).toBe(true);
  });
});

describe("duplicateEffect", () => {
  it("inserts a copy immediately after the source with a new instanceId", () => {
    const stack = addEffect([], shadowDefinition);
    const next = duplicateEffect(stack, stack[0].instanceId);
    expect(next).toHaveLength(2);
    expect(next[1].effectId).toBe("shadow");
    expect(next[1].instanceId).not.toBe(next[0].instanceId);
    expect(next[1].props).toEqual(next[0].props);
  });

  it("is a no-op for an unknown instanceId", () => {
    const stack = addEffect([], shadowDefinition);
    expect(duplicateEffect(stack, "missing")).toBe(stack);
  });
});

describe("reorderEffect", () => {
  it("moves an entry to the target index", () => {
    const stack = addEffect(addEffect(addEffect([], shadowDefinition), shadowDefinition), shadowDefinition);
    const [first, second, third] = stack;
    const next = reorderEffect(stack, 0, 2);
    expect(next.map((i) => i.instanceId)).toEqual([second.instanceId, third.instanceId, first.instanceId]);
  });

  it("clamps an out-of-range target index", () => {
    const stack = addEffect(addEffect([], shadowDefinition), shadowDefinition);
    const next = reorderEffect(stack, 0, 99);
    expect(next[1].instanceId).toBe(stack[0].instanceId);
  });
});

describe("updateEffectProps", () => {
  it("shallow-merges the patch into only the matching instance's props", () => {
    const stack = addEffect([], shadowDefinition);
    const next = updateEffectProps(stack, stack[0].instanceId, { blur: 25 });
    expect(next[0].props).toEqual({ blur: 25, color: "#000000" });
  });
});

describe("resetEffect", () => {
  it("restores the definition's defaults", () => {
    const stack = addEffect([], shadowDefinition);
    const edited = updateEffectProps(stack, stack[0].instanceId, { blur: 99, color: "#ff0000" });
    const reset = resetEffect(edited, edited[0].instanceId, shadowDefinition);
    expect(reset[0].props).toEqual(shadowDefinition.defaults);
  });
});

describe("resetAllEffects", () => {
  it("returns an empty stack", () => {
    expect(resetAllEffects()).toEqual([]);
  });
});
