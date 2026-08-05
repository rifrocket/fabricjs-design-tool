import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditorContext } from "@rifrocket/fdt-react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { ImportJsonButton } from "./ImportJsonButton";

function renderWithEngine(importFile: ReturnType<typeof vi.fn>) {
  const engine = { importFile } as unknown as CanvasEngine;
  return render(
    <EditorContext.Provider value={engine}>
      <ImportJsonButton />
    </EditorContext.Provider>,
  );
}

describe("ImportJsonButton", () => {
  it("calls engine.importFile('json', <parsed file contents>) when a file is chosen", async () => {
    const importFile = vi.fn().mockResolvedValue(undefined);
    renderWithEngine(importFile);

    // jsdom's File/Blob don't implement text() — a minimal fake with just the method this
    // component actually calls sidesteps that gap instead of depending on it.
    const file = { text: async () => JSON.stringify({ objects: [] }) } as unknown as File;
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(importFile).toHaveBeenCalledWith("json", { objects: [] }));
  });

  it("does nothing when no file is chosen", () => {
    const importFile = vi.fn();
    renderWithEngine(importFile);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });

    expect(importFile).not.toHaveBeenCalled();
  });

  it("clicking the button opens the hidden file picker", () => {
    const importFile = vi.fn();
    renderWithEngine(importFile);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");

    fireEvent.click(screen.getByRole("button", { name: "Import JSON" }));

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});
