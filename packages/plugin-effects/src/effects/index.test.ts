import { describe, expect, it } from "vitest";
import { ALL_BUILTIN_EFFECTS } from "./index";

describe("ALL_BUILTIN_EFFECTS", () => {
  it("has 22 definitions", () => {
    expect(ALL_BUILTIN_EFFECTS).toHaveLength(22);
  });

  it("has unique ids", () => {
    const ids = ALL_BUILTIN_EFFECTS.map((effect) => effect.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every schema field key has a matching default", () => {
    for (const effect of ALL_BUILTIN_EFFECTS) {
      for (const field of effect.schema) {
        expect(effect.defaults, `${effect.id}.defaults.${field.key}`).toHaveProperty(field.key);
      }
    }
  });

  it("every default key is described by the schema", () => {
    for (const effect of ALL_BUILTIN_EFFECTS) {
      const schemaKeys = new Set(effect.schema.map((field) => field.key));
      for (const key of Object.keys(effect.defaults)) {
        expect(schemaKeys.has(key), `${effect.id}.schema is missing "${key}"`).toBe(true);
      }
    }
  });

  it("compositing-track effects declare at least one render hook", () => {
    for (const effect of ALL_BUILTIN_EFFECTS.filter((e) => e.track === "compositing")) {
      const hasHook = Boolean(effect.renderBehind || effect.renderFront || effect.wrapRender);
      expect(hasHook, `${effect.id} has no renderBehind/renderFront/wrapRender`).toBe(true);
    }
  });

  it("raster-track effects declare applyRaster", () => {
    for (const effect of ALL_BUILTIN_EFFECTS.filter((e) => e.track === "raster")) {
      expect(effect.applyRaster, `${effect.id} has no applyRaster`).toBeTypeOf("function");
    }
  });

  it("every category is one of the four supported categories", () => {
    for (const effect of ALL_BUILTIN_EFFECTS) {
      expect(["basic", "creative", "text", "image"]).toContain(effect.category);
    }
  });
});
