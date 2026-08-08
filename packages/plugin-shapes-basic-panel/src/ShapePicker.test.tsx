import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { EditorContext } from "@rifrocket/fdt-react";
import { BASIC_SHAPE_TYPE_IDS, ShapePicker } from "./ShapePicker";

function renderShapePicker(addObjectOfType = vi.fn()) {
  const engine = { addObjectOfType } as unknown as CanvasEngine;
  render(
    <EditorContext.Provider value={engine}>
      <ShapePicker />
    </EditorContext.Provider>,
  );
  return addObjectOfType;
}

describe("ShapePicker", () => {
  it("renders one button per type plugin-shapes-basic registers", () => {
    renderShapePicker();
    expect(screen.getAllByRole("button")).toHaveLength(BASIC_SHAPE_TYPE_IDS.length);
  });

  it("calls engine.addObjectOfType with the clicked shape's type id", () => {
    const addObjectOfType = renderShapePicker();
    fireEvent.click(screen.getByText("Rectangle"));
    expect(addObjectOfType).toHaveBeenCalledWith("rect", {});
  });

  it("labels a polygon type with no explicit label entry via a capitalized fallback", () => {
    renderShapePicker();
    expect(screen.getByText("Triangle")).toBeTruthy();
  });
});
