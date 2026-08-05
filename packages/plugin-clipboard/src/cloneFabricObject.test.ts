import { describe, expect, it } from "vitest";
import { Rect } from "fabric";
import { registerSerializedProperty } from "@rifrocket/fdt-core";
import { cloneFabricObject } from "./cloneFabricObject";

describe("cloneFabricObject", () => {
  it("offsets the clone's position from the source", async () => {
    const rect = new Rect({ left: 10, top: 10 });
    const clone = await cloneFabricObject(rect);
    expect(clone.left).toBe(30);
    expect(clone.top).toBe(30);
  });

  it("carries every registered serialized property onto the clone", async () => {
    registerSerializedProperty("fdtTestClipboardProperty");
    const rect = new Rect();
    rect.set("fdtTestClipboardProperty", { effectId: "shadow" });

    const clone = await cloneFabricObject(rect);

    expect(clone.get("fdtTestClipboardProperty")).toEqual({ effectId: "shadow" });
  });
});
