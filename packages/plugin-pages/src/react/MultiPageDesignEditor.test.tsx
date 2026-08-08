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

  it("seeds page 1 from initialDocument instead of blank, when provided", async () => {
    let capturedEngine: FakeEngine | undefined;
    const snapshot = { json: { objects: [] }, backgroundColor: "#123456" };
    renderMultiPage({
      initialDocument: { snapshot, meta: { name: "Cover", width: 1024, height: 768 } },
      onReady: (engine) => {
        capturedEngine = engine as unknown as FakeEngine;
      },
    });

    await waitFor(() => expect(capturedEngine).toBeTruthy());
    expect(capturedEngine!.__fake.setBackgroundColor).toHaveBeenCalledWith("#123456");
    expect(capturedEngine!.__fake.importFile).toHaveBeenCalledWith("json", snapshot.json);
    await waitFor(() => expect(screen.getAllByText(/Cover/).length).toBeGreaterThan(0));
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

  it("registers propertyFields overrides on each page's engine, once, without duplicating on a page revisit", async () => {
    const shapesPlugin: EditorPlugin = {
      name: "shapes",
      install: (e) => e.registry.objectTypes.register("rect", { create: () => ({}) as never }),
    };
    let capturedEngine: FakeEngine | undefined;
    renderMultiPage({
      preset: "none",
      plugins: { add: [shapesPlugin] },
      propertyFields: { rect: [{ key: "fill" }] },
      onReady: (engine) => {
        capturedEngine = engine as unknown as FakeEngine;
      },
    });

    await waitFor(() => expect(capturedEngine).toBeTruthy());
    expect(capturedEngine!.registry.objectTypes.get("rect")?.propertyFields).toEqual([{ key: "fill" }]);

    // Add a second page then switch back to page 1 — onReady re-fires against the *same* engine
    // (revisiting an already-created page), which must not re-append the same fields again.
    fireEvent.click(screen.getByTitle("Add page"));
    await waitFor(() => expect(screen.getAllByText(/Page 2/).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByText("Page 1"));
    await waitFor(() => expect(capturedEngine!.registry.objectTypes.get("rect")?.propertyFields).toEqual([{ key: "fill" }]));
  });

  it("autosave restores a prior save on mount instead of auto-seeding blank, taking priority over initialDocument", async () => {
    const storage = new Map<string, string>();
    const fakeStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };
    storage.set(
      "fdt:pages",
      JSON.stringify({
        pages: [{ id: "page_1", name: "Restored", order: 0, width: 800, height: 600 }],
        snapshots: { page_1: { json: { objects: [] }, backgroundColor: "#00ff00" } },
      }),
    );

    let capturedEngine: FakeEngine | undefined;
    renderMultiPage({
      autosave: { storage: fakeStorage },
      initialDocument: { snapshot: { json: {}, backgroundColor: "#ff0000" }, meta: { name: "Fresh" } },
      onReady: (engine) => {
        capturedEngine = engine as unknown as FakeEngine;
      },
    });

    await waitFor(() => expect(capturedEngine).toBeTruthy());
    expect(capturedEngine!.__fake.setBackgroundColor).toHaveBeenCalledWith("#00ff00");
    await waitFor(() => expect(screen.getAllByText(/Restored/).length).toBeGreaterThan(0));
    expect(screen.queryByText(/Fresh/)).toBeNull();
  });

  it("autosave debounces a save after content changes, via savePagesToStorage", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const setItem = vi.fn();
      const fakeStorage = { getItem: () => null, setItem, removeItem: vi.fn() };

      let capturedEngine: FakeEngine | undefined;
      renderMultiPage({
        autosave: { storage: fakeStorage, debounceMs: 300 },
        onReady: (engine) => {
          capturedEngine = engine as unknown as FakeEngine;
        },
      });
      await vi.waitFor(() => expect(capturedEngine).toBeTruthy());

      // Simulate a tracked content change the same way PagesManager's own thumbnail tracking
      // does — via the fake engine's store.subscribe callback.
      const scheduleHandler = (capturedEngine!.store.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0] as () => void;
      scheduleHandler();

      expect(setItem).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(300);
      expect(setItem).toHaveBeenCalledTimes(1);
      expect(setItem.mock.calls[0][0]).toBe("fdt:pages");
    } finally {
      vi.useRealTimers();
    }
  });
});
