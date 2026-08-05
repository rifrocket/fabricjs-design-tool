import { describe, expect, it } from "vitest";
import { Rect, Circle } from "fabric";
import { getObjectId, ID_PROPERTY } from "./objectId";

describe("getObjectId", () => {
  it("returns the same id for the same object across calls", () => {
    const rect = new Rect();
    expect(getObjectId(rect)).toBe(getObjectId(rect));
  });

  it("returns different ids for different objects", () => {
    const rect = new Rect();
    const circle = new Circle();
    expect(getObjectId(rect)).not.toBe(getObjectId(circle));
  });

  it("stamps the id onto the object as a real property, so it survives serialization", () => {
    const rect = new Rect();
    const id = getObjectId(rect);
    expect((rect as unknown as Record<string, unknown>)[ID_PROPERTY]).toBe(id);
  });

  it("adopts a pre-existing id property instead of minting a new one", () => {
    const rect = new Rect();
    (rect as unknown as Record<string, unknown>)[ID_PROPERTY] = "obj_restored_42";
    expect(getObjectId(rect)).toBe("obj_restored_42");
  });

  it("caches the adopted id so a second call doesn't re-read the property", () => {
    const rect = new Rect();
    (rect as unknown as Record<string, unknown>)[ID_PROPERTY] = "obj_restored_1";
    const first = getObjectId(rect);
    (rect as unknown as Record<string, unknown>)[ID_PROPERTY] = "mutated-after-first-call";
    expect(getObjectId(rect)).toBe(first);
  });
});
