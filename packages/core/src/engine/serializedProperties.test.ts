import { describe, expect, it } from "vitest";
import { ID_PROPERTY } from "./objectId";
import { getSerializedProperties, registerSerializedProperty } from "./serializedProperties";

describe("serializedProperties", () => {
  it("always includes ID_PROPERTY", () => {
    expect(getSerializedProperties()).toContain(ID_PROPERTY);
  });

  it("includes a newly registered property in every subsequent read", () => {
    registerSerializedProperty("fdtTestProperty");
    expect(getSerializedProperties()).toContain("fdtTestProperty");
  });

  it("does not duplicate a property registered more than once", () => {
    registerSerializedProperty("fdtTestPropertyDup");
    registerSerializedProperty("fdtTestPropertyDup");
    const count = getSerializedProperties().filter((name) => name === "fdtTestPropertyDup").length;
    expect(count).toBe(1);
  });
});
