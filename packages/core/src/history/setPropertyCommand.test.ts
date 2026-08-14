import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { SetPropertyCommand } from "./setPropertyCommand";
import type { NodeOps } from "./setPropertyCommand";

describe("SetPropertyCommand", () => {
  it("captures the current value and applies the next one on do()", () => {
    const rect = new Rect({ fill: "red" });
    const command = SetPropertyCommand.capture(rect, "fill", "blue");

    command.do();

    expect(rect.fill).toBe("blue");
  });

  it("restores the captured value on undo()", () => {
    const rect = new Rect({ fill: "red" });
    const command = SetPropertyCommand.capture(rect, "fill", "blue");

    command.do();
    command.undo();

    expect(rect.fill).toBe("red");
  });

  it("merges into a single command spanning the original previous value and the latest next value", () => {
    const rect = new Rect({ left: 0 });
    const first = SetPropertyCommand.capture(rect, "left", 10);
    first.do();
    const second = SetPropertyCommand.capture(rect, "left", 20);
    second.do();

    const merged = first.merge(second);

    expect(merged).not.toBeNull();
    merged?.undo();
    expect(rect.left).toBe(0);
  });

  it("refuses to merge commands targeting a different object or a different key", () => {
    const rectA = new Rect({ left: 0 });
    const rectB = new Rect({ left: 0 });
    const command = SetPropertyCommand.capture(rectA, "left", 10);

    expect(command.merge(SetPropertyCommand.capture(rectB, "left", 10))).toBeNull();
    expect(command.merge(SetPropertyCommand.capture(rectA, "top", 10))).toBeNull();
  });

  it("works against a non-default NodeOps, with no FabricObject involved", () => {
    const node = new Map<string, unknown>([["count", 1]]);
    const mapNodeOps: NodeOps<Map<string, unknown>> = {
      get: (target, key) => target.get(key),
      set: (target, key, value) => {
        target.set(key, value);
      },
    };

    const command = SetPropertyCommand.capture(node, "count", 5, mapNodeOps);
    command.do();
    expect(node.get("count")).toBe(5);

    command.undo();
    expect(node.get("count")).toBe(1);
  });
});
