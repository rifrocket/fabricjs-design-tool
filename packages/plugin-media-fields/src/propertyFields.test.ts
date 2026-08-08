import { describe, expect, it } from "vitest";
import { MEDIA_FIELDS } from "./propertyFields";

describe("MEDIA_FIELDS", () => {
  it("includes a globalCompositeOperation select with every blend mode as an option", () => {
    const blendMode = MEDIA_FIELDS.find((f) => f.key === "globalCompositeOperation");
    expect(blendMode?.config?.options?.length).toBeGreaterThan(0);
    expect(blendMode?.config?.options).toEqual(
      expect.arrayContaining([{ label: "multiply", value: "multiply" }]),
    );
  });

  it("includes position and opacity/angle fields", () => {
    expect(MEDIA_FIELDS.map((f) => f.key)).toEqual(
      expect.arrayContaining(["left", "top", "opacity", "angle"]),
    );
  });
});
