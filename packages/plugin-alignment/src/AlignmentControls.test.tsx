import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorContext } from "@rifrocket/fdt-react";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import { Store } from "@rifrocket/fdt-core";
import { AlignmentControls } from "./AlignmentControls";

function renderWithEngine(selectedObjectIds: string[]) {
  const align = vi.fn();
  const distribute = vi.fn();
  const store = new Store({ selectedObjectIds });
  const engine = { alignment: { align, distribute }, store } as unknown as CanvasEngine;
  render(
    <EditorContext.Provider value={engine}>
      <AlignmentControls />
    </EditorContext.Provider>,
  );
  return { align, distribute };
}

describe("AlignmentControls", () => {
  it("calls engine.alignment.align(value) for each align button", () => {
    const { align } = renderWithEngine(["a"]);

    fireEvent.click(screen.getByRole("button", { name: "Align left" }));
    fireEvent.click(screen.getByRole("button", { name: "Align middle" }));

    expect(align).toHaveBeenNthCalledWith(1, "left");
    expect(align).toHaveBeenNthCalledWith(2, "middle");
  });

  it("calls engine.alignment.distribute(axis) for each distribute button", () => {
    const { distribute } = renderWithEngine(["a", "b", "c"]);

    fireEvent.click(screen.getByRole("button", { name: "Distribute horizontally" }));

    expect(distribute).toHaveBeenCalledWith("horizontal");
  });

  it("disables align buttons with nothing selected, and distribute buttons below 3 selected", () => {
    renderWithEngine(["a"]);

    const distributeButton = screen.getByRole("button", { name: "Distribute horizontally" }) as HTMLButtonElement;
    const alignButton = screen.getByRole("button", { name: "Align left" }) as HTMLButtonElement;
    expect(distributeButton.disabled).toBe(true);
    expect(alignButton.disabled).toBe(false);
  });

  it("disables align buttons entirely with nothing selected", () => {
    renderWithEngine([]);

    const alignButton = screen.getByRole("button", { name: "Align left" }) as HTMLButtonElement;
    expect(alignButton.disabled).toBe(true);
  });
});
