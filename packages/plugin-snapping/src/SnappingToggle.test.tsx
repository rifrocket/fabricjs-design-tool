import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorContext } from "@rifrocket/fdt-react";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import { SnappingToggle } from "./SnappingToggle";

function renderWithEngine(initialEnabled: boolean) {
  const setEnabled = vi.fn();
  const isEnabled = vi.fn(() => initialEnabled);
  const engine = { snapping: { isEnabled, setEnabled } } as unknown as CanvasEngine;
  render(
    <EditorContext.Provider value={engine}>
      <SnappingToggle />
    </EditorContext.Provider>,
  );
  return { setEnabled };
}

describe("SnappingToggle", () => {
  it("reflects the engine's initial snapping state", () => {
    renderWithEngine(true);
    expect(screen.getByRole("button").textContent).toBe("Snapping: On");
  });

  it("toggles engine.snapping and its own label on click", () => {
    const { setEnabled } = renderWithEngine(false);

    fireEvent.click(screen.getByRole("button"));

    expect(setEnabled).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button").textContent).toBe("Snapping: On");

    fireEvent.click(screen.getByRole("button"));
    expect(setEnabled).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button").textContent).toBe("Snapping: Off");
  });
});
