import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Store } from "@rifrocket/fdt-core";
import type { CanvasEngine, HistoryEntry } from "@rifrocket/fdt-core";
import { EditorContext } from "@rifrocket/fdt-react";
import { HistoryPanel } from "./HistoryPanel";

function renderWithHistory(entries: HistoryEntry[]) {
  const store = new Store({ canUndo: entries.length > 0, canRedo: false });
  const engine = { history: { list: () => entries }, store } as unknown as CanvasEngine;
  return render(
    <EditorContext.Provider value={engine}>
      <HistoryPanel />
    </EditorContext.Provider>,
  );
}

describe("HistoryPanel", () => {
  it("shows a placeholder message when there's nothing to undo", () => {
    renderWithHistory([]);
    expect(screen.getByText("Nothing to undo yet.")).toBeTruthy();
  });

  it("lists engine.history.list() entries by label", () => {
    renderWithHistory([
      { label: "Add object", timestamp: 1 },
      { label: "Set fill", timestamp: 2 },
    ]);

    const items = screen.getAllByRole("listitem").map((el) => el.textContent);
    expect(items).toEqual(["Add object", "Set fill"]);
  });
});
