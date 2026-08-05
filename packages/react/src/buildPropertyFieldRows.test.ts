import { describe, expect, it } from "vitest";
import type { PropertyFieldDefinition } from "@rifrocket/fdt-core";
import { buildPropertyFieldRows } from "./buildPropertyFieldRows";

const f = (key: string, extra: Partial<PropertyFieldDefinition> = {}): PropertyFieldDefinition => ({
  key,
  ...extra,
});

describe("buildPropertyFieldRows", () => {
  it("gives a field with no section/span its own full-width row, no header", () => {
    const rows = buildPropertyFieldRows([f("text")]);

    expect(rows).toEqual([{ key: "text", sectionHeader: undefined, fields: [f("text")] }]);
  });

  it("pairs two consecutive half-span fields in the same section into one row", () => {
    const left = f("left", { section: "Position", span: "half" });
    const top = f("top", { section: "Position", span: "half" });

    const rows = buildPropertyFieldRows([left, top]);

    expect(rows).toEqual([
      { key: "left+top", sectionHeader: { text: "Position", isFirstSection: true }, fields: [left, top] },
    ]);
  });

  it("does not pair a half-span field across a section boundary", () => {
    const left = f("left", { section: "Position", span: "half" });
    const fill = f("fill", { section: "Appearance", span: "half" });

    const rows = buildPropertyFieldRows([left, fill]);

    expect(rows).toHaveLength(2);
    expect(rows[0].fields).toEqual([left]);
    expect(rows[1].fields).toEqual([fill]);
  });

  it("only emits a section header once per section, and marks only the first section overall", () => {
    const rows = buildPropertyFieldRows([
      f("left", { section: "Position", span: "half" }),
      f("top", { section: "Position", span: "half" }),
      f("width", { section: "Size", span: "half" }),
      f("height", { section: "Size", span: "half" }),
    ]);

    expect(rows.map((r) => r.sectionHeader)).toEqual([
      { text: "Position", isFirstSection: true },
      { text: "Size", isFirstSection: false },
    ]);
  });

  it("gives a lone half-span field (odd one out) its own row instead of dropping it", () => {
    const rows = buildPropertyFieldRows([f("radius", { section: "Size", span: "half" })]);

    expect(rows).toEqual([
      { key: "radius", sectionHeader: { text: "Size", isFirstSection: true }, fields: [f("radius", { section: "Size", span: "half" })] },
    ]);
  });

  it("re-emits a section header if the same section name recurs non-consecutively", () => {
    const rows = buildPropertyFieldRows([
      f("a", { section: "Transform" }),
      f("b", { section: "Other" }),
      f("c", { section: "Transform" }),
    ]);

    expect(rows.map((r) => r.sectionHeader?.text)).toEqual(["Transform", "Other", "Transform"]);
  });
});
