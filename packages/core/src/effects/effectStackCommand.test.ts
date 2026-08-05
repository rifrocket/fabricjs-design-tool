import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { EffectStackCommand } from "./effectStackCommand";
import { EFFECTS_PROPERTY } from "./types";
import type { EffectStack } from "./types";

const shadow: EffectStack[number] = { instanceId: "shadow_1", effectId: "shadow", enabled: true, props: { blur: 10 } };
const glow: EffectStack[number] = { instanceId: "glow_1", effectId: "glow", enabled: true, props: { blur: 5 } };

describe("EffectStackCommand", () => {
  it("do() sets the stack and undo() restores the previous one", () => {
    const rect = new Rect();
    const command = EffectStackCommand.capture(rect, [shadow]);

    command.do();
    expect(rect.get(EFFECTS_PROPERTY)).toEqual([shadow]);

    command.undo();
    expect(rect.get(EFFECTS_PROPERTY)).toEqual([]);
  });

  it("captures whatever stack was already on the object as the undo target", () => {
    const rect = new Rect();
    rect.set(EFFECTS_PROPERTY, [shadow]);
    const command = EffectStackCommand.capture(rect, [shadow, glow]);

    command.do();
    command.undo();

    expect(rect.get(EFFECTS_PROPERTY)).toEqual([shadow]);
  });

  it("merges a pure single-instance props edit (a slider drag) into one entry", () => {
    const rect = new Rect();
    const first = EffectStackCommand.capture(rect, [shadow]);
    first.do();
    const dragged = { ...shadow, props: { blur: 25 } };
    const second = EffectStackCommand.capture(rect, [dragged]);

    const merged = first.merge(second);

    expect(merged).not.toBeNull();
    merged!.undo();
    expect(rect.get(EFFECTS_PROPERTY)).toEqual([]);
  });

  it("does not merge when an instance is added", () => {
    const rect = new Rect();
    const first = EffectStackCommand.capture(rect, [shadow]);
    first.do();
    const second = EffectStackCommand.capture(rect, [shadow, glow]);

    expect(first.merge(second)).toBeNull();
  });

  it("does not merge when an instance is removed", () => {
    const rect = new Rect();
    rect.set(EFFECTS_PROPERTY, [shadow, glow]);
    const first = EffectStackCommand.capture(rect, [shadow, glow]);
    first.do();
    const second = EffectStackCommand.capture(rect, [shadow]);

    expect(first.merge(second)).toBeNull();
  });

  it("does not merge a toggle (enabled flips, props unchanged)", () => {
    const rect = new Rect();
    const first = EffectStackCommand.capture(rect, [shadow]);
    first.do();
    const toggled = { ...shadow, enabled: false };
    const second = EffectStackCommand.capture(rect, [toggled]);

    expect(first.merge(second)).toBeNull();
  });

  it("does not merge a reorder (same instances, different order)", () => {
    const rect = new Rect();
    const first = EffectStackCommand.capture(rect, [shadow, glow]);
    first.do();
    const second = EffectStackCommand.capture(rect, [glow, shadow]);

    expect(first.merge(second)).toBeNull();
  });

  it("does not merge when more than one instance's props change at once", () => {
    const rect = new Rect();
    const first = EffectStackCommand.capture(rect, [shadow, glow]);
    first.do();
    const second = EffectStackCommand.capture(rect, [
      { ...shadow, props: { blur: 99 } },
      { ...glow, props: { blur: 99 } },
    ]);

    expect(first.merge(second)).toBeNull();
  });

  it("does not merge commands targeting different objects", () => {
    const a = new Rect();
    const b = new Rect();
    const first = EffectStackCommand.capture(a, [shadow]);
    first.do();
    const second = EffectStackCommand.capture(b, [shadow]);

    expect(first.merge(second)).toBeNull();
  });
});
