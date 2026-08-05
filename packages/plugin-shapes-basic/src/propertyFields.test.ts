import { describe, expect, it } from "vitest";
import { TEXT_FIELDS } from "./propertyFields";

describe("TEXT_FIELDS", () => {
  it("translates fontWeight/fontStyle into 2-entry toggle config.options", () => {
    const fontWeight = TEXT_FIELDS.find((f) => f.key === "fontWeight");
    const fontStyle = TEXT_FIELDS.find((f) => f.key === "fontStyle");

    expect(fontWeight?.config?.options).toEqual([
      { label: "Bold", value: "bold" },
      { label: "Normal", value: "normal" },
    ]);
    expect(fontStyle?.config?.options).toEqual([
      { label: "Italic", value: "italic" },
      { label: "Normal", value: "normal" },
    ]);
  });

  it("translates fontFamily/textAlign into select config.options", () => {
    const fontFamily = TEXT_FIELDS.find((f) => f.key === "fontFamily");
    const textAlign = TEXT_FIELDS.find((f) => f.key === "textAlign");

    expect(fontFamily?.config?.options).toEqual(
      expect.arrayContaining([{ label: "Arial", value: "Arial" }]),
    );
    expect(textAlign?.config?.options).toEqual([
      { label: "left", value: "left" },
      { label: "center", value: "center" },
      { label: "right", value: "right" },
      { label: "justify", value: "justify" },
    ]);
  });

  it("leaves underline as a real-boolean toggle (no config.options)", () => {
    const underline = TEXT_FIELDS.find((f) => f.key === "underline");
    expect(underline?.config?.options).toBeUndefined();
  });
});
