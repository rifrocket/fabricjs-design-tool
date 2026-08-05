import { describe, expect, it } from "vitest";
import { Registry } from "./registry";

describe("Registry", () => {
  it("stores and retrieves an entry by id", () => {
    const registry = new Registry<{ label: string }>();
    registry.register("a", { label: "A" });

    expect(registry.get("a")).toEqual({ label: "A" });
    expect(registry.has("a")).toBe(true);
  });

  it("rejects registering the same id twice", () => {
    const registry = new Registry<number>();
    registry.register("a", 1);

    expect(() => registry.register("a", 2)).toThrow('"a" is already registered');
  });

  it("removes an entry on unregister", () => {
    const registry = new Registry<number>();
    registry.register("a", 1);

    registry.unregister("a");

    expect(registry.has("a")).toBe(false);
    expect(registry.get("a")).toBeUndefined();
  });

  it("lists every registered id", () => {
    const registry = new Registry<number>();
    registry.register("a", 1);
    registry.register("b", 2);

    expect(registry.list()).toEqual(["a", "b"]);
  });

  it("replace() overwrites an existing id without throwing", () => {
    const registry = new Registry<number>();
    registry.register("a", 1);

    registry.replace("a", 2);

    expect(registry.get("a")).toBe(2);
    expect(registry.list()).toEqual(["a"]);
  });

  it("replace() registers a new id when it wasn't already present", () => {
    const registry = new Registry<number>();

    registry.replace("a", 1);

    expect(registry.get("a")).toBe(1);
  });
});
