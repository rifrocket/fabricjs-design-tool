import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { createEngineFactory, fakeCanvasElementFactory, fakeOffscreenCanvasFactory } from "../testUtils";
import type { FakeEngine } from "../testUtils";
import { MultiPageDesignEditor } from "./MultiPageDesignEditor";

function renderMultiPage(props: Partial<ComponentProps<typeof MultiPageDesignEditor>> = {}) {
  return render(
    <MultiPageDesignEditor
      maxPages={5}
      canvasElementFactory={fakeCanvasElementFactory}
      thumbnails={{ offscreenCanvasFactory: fakeOffscreenCanvasFactory }}
      engineFactory={createEngineFactory()}
      {...props}
    />,
  );
}

describe("MultiPageDesignEditor", () => {
  it("auto-seeds page 1 on mount", async () => {
    renderMultiPage();
    await waitFor(() => expect(screen.getByRole("application")).toBeTruthy());
    // PageTabsBar (the default tabsBar) renders one page tab once seeded.
    await waitFor(() => expect(screen.getAllByText(/Page 1/).length).toBeGreaterThan(0));
  });

  it("renders the built-in PageTabsBar by default", async () => {
    renderMultiPage();
    await waitFor(() => expect(screen.getByTitle("Add page")).toBeTruthy());
  });

  it("hides the tabs bar when tabsBar={null}", async () => {
    const onReady = vi.fn();
    renderMultiPage({ tabsBar: null, onReady });
    await waitFor(() => expect(onReady).toHaveBeenCalled());
    expect(screen.queryByTitle("Add page")).toBeNull();
  });

  it("sets data-fdt-theme on the wrapper", async () => {
    renderMultiPage({ theme: "dark" });
    await waitFor(() => expect(screen.getByRole("application").getAttribute("data-fdt-theme")).toBe("dark"));
  });

  it("calls onReady with the active engine and page id, refiring on page switch", async () => {
    const onReady = vi.fn();
    renderMultiPage({ onReady });

    await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
    const [firstEngine, firstPageId] = onReady.mock.calls[0] as [FakeEngine, string];
    expect(firstEngine).toBeTruthy();
    expect(typeof firstPageId).toBe("string");

    fireEvent.click(screen.getByTitle("Add page"));
    await waitFor(() => expect(onReady).toHaveBeenCalledTimes(2));
    const [, secondPageId] = onReady.mock.calls[1] as [FakeEngine, string];
    expect(secondPageId).not.toBe(firstPageId);
  });

  it("wires default shortcuts against the active page's engine", async () => {
    let capturedEngine: FakeEngine | undefined;
    renderMultiPage({
      onReady: (engine) => {
        capturedEngine = engine as unknown as FakeEngine;
      },
    });

    await waitFor(() => expect(capturedEngine).toBeTruthy());
    expect(capturedEngine!.shortcuts.has("ctrl+z")).toBe(true);
    expect(capturedEngine!.shortcuts.has("delete")).toBe(true);
  });

  it("merges shortcuts.add on top of the defaults", async () => {
    const handler = vi.fn();
    let capturedEngine: FakeEngine | undefined;
    renderMultiPage({
      shortcuts: { add: { "ctrl+d": { handler, description: "Duplicate" } } },
      onReady: (engine) => {
        capturedEngine = engine as unknown as FakeEngine;
      },
    });

    await waitFor(() => expect(capturedEngine).toBeTruthy());
    expect(capturedEngine!.shortcuts.has("ctrl+d")).toBe(true);
  });

  it("passes plugins through to every page's engine via useAll()", async () => {
    const testPlugin: EditorPlugin = { name: "test-plugin", install: vi.fn() };
    let capturedEngine: FakeEngine | undefined;
    renderMultiPage({
      preset: "none",
      plugins: { add: [testPlugin] },
      onReady: (engine) => {
        capturedEngine = engine as unknown as FakeEngine;
      },
    });

    await waitFor(() => expect(capturedEngine).toBeTruthy());
    expect(capturedEngine!.__fake.useAll).toHaveBeenCalledWith([testPlugin]);
  });
});
