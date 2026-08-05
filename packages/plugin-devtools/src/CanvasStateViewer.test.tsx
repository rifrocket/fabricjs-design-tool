import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Store } from "@rifrocket/fdt-core";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import { EditorContext } from "@rifrocket/fdt-react";
import { CanvasStateViewer } from "./CanvasStateViewer";

function renderWithEngine() {
  const store = new Store({
    zoom: 1.5,
    panX: 10.4,
    panY: -5.2,
    objectIds: ["a", "b"],
    selectedObjectIds: ["a"],
  });
  const exportJson = vi.fn(() => ({ format: "json", fileName: "x.json", mimeType: "application/json", data: "{}" }));
  const engine = {
    store,
    snapping: { isEnabled: () => true },
    export: exportJson,
  } as unknown as CanvasEngine;
  render(
    <EditorContext.Provider value={engine}>
      <CanvasStateViewer />
    </EditorContext.Provider>,
  );
  return { exportJson };
}

describe("CanvasStateViewer", () => {
  it("renders zoom/pan/object/selection/snapping state from the store", () => {
    renderWithEngine();

    expect(screen.getByText("1.50×")).toBeTruthy();
    expect(screen.getByText("10, -5")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("on")).toBeTruthy();
  });

  it("only calls engine.export('json') once the raw-JSON toggle is opened", () => {
    const { exportJson } = renderWithEngine();
    expect(exportJson).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Show raw JSON"));

    expect(exportJson).toHaveBeenCalledWith("json");
    expect(screen.getByText("{}")).toBeTruthy();
  });
});
