import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { EventBus } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { EditorContext } from "@rifrocket/fdt-react";
import { EventLogPanel } from "./EventLogPanel";

function renderWithEngine(events: EventBus) {
  const engine = { events } as unknown as CanvasEngine;
  return render(
    <EditorContext.Provider value={engine}>
      <EventLogPanel />
    </EditorContext.Provider>,
  );
}

describe("EventLogPanel", () => {
  it("shows a placeholder message with no events yet", () => {
    renderWithEngine(new EventBus());
    expect(screen.getByText("No events yet.")).toBeTruthy();
  });

  it("lists engine events newest-first as they're emitted", () => {
    const events = new EventBus();
    renderWithEngine(events);

    act(() => {
      events.emit("objects:changed", ["a"]);
    });
    act(() => {
      events.emit("selection:changed", ["a", "b"]);
    });

    const items = screen.getAllByRole("listitem").map((el) => el.textContent);
    expect(items).toEqual(["selection:changed (2)", "objects:changed (1)"]);
  });
});
