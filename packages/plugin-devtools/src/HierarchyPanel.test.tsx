import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rect, Group } from "fabric";
import { Store } from "@rifrocket/fdt-core";
import type { CanvasEngine } from "@rifrocket/fdt-core";
import { EditorContext } from "@rifrocket/fdt-react";
import { HierarchyPanel } from "./HierarchyPanel";

describe("HierarchyPanel", () => {
  it("shows a placeholder message with no objects yet", () => {
    const store = new Store({ objectIds: [] });
    const engine = { layers: { getObjects: () => [] }, store } as unknown as CanvasEngine;
    render(
      <EditorContext.Provider value={engine}>
        <HierarchyPanel />
      </EditorContext.Provider>,
    );

    expect(screen.getByText("No objects yet.")).toBeTruthy();
  });

  it("renders group children recursively and selects an object on click", () => {
    const rect = new Rect({ fill: "red" });
    const group = new Group([rect]);
    const store = new Store({ objectIds: ["a"] });
    const select = vi.fn();
    const engine = { layers: { getObjects: () => [group] }, selection: { select }, store } as unknown as CanvasEngine;

    render(
      <EditorContext.Provider value={engine}>
        <HierarchyPanel />
      </EditorContext.Provider>,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[1]);
    expect(select).toHaveBeenCalledWith(rect);
  });
});
