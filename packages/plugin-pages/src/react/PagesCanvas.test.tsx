import { describe, expect, it } from "vitest";
import { StrictMode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { PagesProvider } from "./PagesProvider";
import { usePagesContext } from "./usePagesContext";
import { PagesCanvas } from "./PagesCanvas";
import { createEngineFactory, fakeCanvasElementFactory, fakeOffscreenCanvasFactory } from "../testUtils";
import type { FakeEngine } from "../testUtils";
import type { PagesManager } from "../PagesManager";
import type { NewPageInit, PageMeta } from "../types";

// act() doesn't forward a sync callback's return value, so addPage() (which synchronously
// updates the store) is wrapped here to both flush that update and hand back the created page.
function addPage(manager: PagesManager, init: NewPageInit): PageMeta {
  let page!: PageMeta;
  act(() => {
    page = manager.addPage(init);
  });
  return page;
}

// Capturing `manager` directly during render (rather than via an effect) is safe here: it's
// memoized once for the provider's lifetime (see usePages.ts), so this assignment is harmless
// and doesn't itself cause re-renders.
function Harness({ managerBox }: { managerBox: { current: PagesManager | null } }) {
  const { manager } = usePagesContext();
  managerBox.current = manager;
  return (
    <div data-testid="canvas-container">
      <PagesCanvas fallback={<span data-testid="fallback">empty</span>} />
    </div>
  );
}

function renderApp(managerBox: { current: PagesManager | null }, strict = false) {
  const tree = (
    <PagesProvider
      options={{
        maxPages: 5,
        canvasElementFactory: fakeCanvasElementFactory,
        thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
      }}
      engineFactory={createEngineFactory()}
    >
      <Harness managerBox={managerBox} />
    </PagesProvider>
  );
  return strict ? render(<StrictMode>{tree}</StrictMode>) : render(tree);
}

describe("PagesCanvas", () => {
  it("renders the fallback with no active page", () => {
    renderApp({ current: null });
    expect(screen.getByTestId("fallback")).toBeTruthy();
  });

  it("mounts the active page's canvas and calls calcOffset on activation", async () => {
    const managerBox: { current: PagesManager | null } = { current: null };
    renderApp(managerBox);
    const manager = managerBox.current!;

    const page = addPage(manager, { name: "Page 1" });
    await act(async () => {
      await manager.setActivePage(page.id);
    });

    const engine = manager.getEngine(page.id) as FakeEngine;
    const container = screen.getByTestId("canvas-container");
    await waitFor(() => expect(engine.__fake.canvas.wrapperEl.parentElement).toBe(container.firstChild));
    expect(engine.__fake.canvas.calcOffset).toHaveBeenCalled();
  });

  it("relocates on page switch: detaches the old page's canvas, attaches the new one's", async () => {
    const managerBox: { current: PagesManager | null } = { current: null };
    renderApp(managerBox);
    const manager = managerBox.current!;

    const pageA = addPage(manager, { name: "Page A" });
    const pageB = addPage(manager, { name: "Page B" });
    await act(async () => {
      await manager.setActivePage(pageA.id);
    });
    const engineA = manager.getEngine(pageA.id) as FakeEngine;
    await waitFor(() => expect(engineA.__fake.canvas.wrapperEl.parentElement).not.toBeNull());

    await act(async () => {
      await manager.setActivePage(pageB.id);
    });
    const engineB = manager.getEngine(pageB.id) as FakeEngine;

    await waitFor(() => expect(engineB.__fake.canvas.wrapperEl.parentElement).not.toBeNull());
    expect(engineA.__fake.canvas.wrapperEl.parentElement).toBeNull();
  });

  it("detaches the canvas cleanly on unmount", async () => {
    const managerBox: { current: PagesManager | null } = { current: null };
    const { unmount } = renderApp(managerBox);
    const manager = managerBox.current!;

    const page = addPage(manager, { name: "Page 1" });
    await act(async () => {
      await manager.setActivePage(page.id);
    });
    const engine = manager.getEngine(page.id) as FakeEngine;
    await waitFor(() => expect(engine.__fake.canvas.wrapperEl.parentElement).not.toBeNull());

    expect(() => unmount()).not.toThrow();
    expect(engine.__fake.canvas.wrapperEl.parentElement).toBeNull();
  });

  it("converges to exactly one mounted canvas under React StrictMode's double-invoked effects", async () => {
    const managerBox: { current: PagesManager | null } = { current: null };
    renderApp(managerBox, true);
    const manager = managerBox.current!;

    const page = addPage(manager, { name: "Page 1" });
    await act(async () => {
      await manager.setActivePage(page.id);
    });

    const engine = manager.getEngine(page.id) as FakeEngine;
    const container = screen.getByTestId("canvas-container");
    const canvasHost = container.firstElementChild as HTMLElement;

    await waitFor(() => expect(canvasHost.childElementCount).toBe(1));
    expect(canvasHost.firstElementChild).toBe(engine.__fake.canvas.wrapperEl);
  });
});
