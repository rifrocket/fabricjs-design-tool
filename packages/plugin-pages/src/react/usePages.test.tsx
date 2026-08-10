import { describe, expect, it, vi } from "vitest";
import { StrictMode, useEffect, useRef } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useEditor } from "@rifrocket/fdt-react";
import { PagesProvider } from "./PagesProvider";
import { usePagesContext } from "./usePagesContext";
import { createEngineFactory, fakeCanvasElementFactory, fakeOffscreenCanvasFactory } from "../testUtils";
import type { FakeEngine } from "../testUtils";
import type { PagesManager } from "../PagesManager";

function TestApp({ onManager }: { onManager?: (manager: PagesManager) => void }) {
  const { pages, activePageId, activeEngine, manager } = usePagesContext();
  onManager?.(manager);
  return (
    <div>
      <ul>
        {pages.map((page) => (
          <li key={page.id}>
            <button type="button" onClick={() => void manager.setActivePage(page.id)}>
              {page.name} {page.id === activePageId ? "(active)" : ""}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => manager.addPage({ name: "New page" })}>
        Add page
      </button>
      {/* useEditor() throws with no active page (EditorContext value is null until then), so a
          real consumer only mounts engine-dependent children once activeEngine exists — same
          guard used here. */}
      {activeEngine ? <ActiveEngineProbe /> : <div data-testid="active-engine">no engine</div>}
    </div>
  );
}

function ActiveEngineProbe() {
  const engine = useEditor();
  return <div data-testid="active-engine">{engine ? "has engine" : "no engine"}</div>;
}

function renderApp(onManager?: (manager: PagesManager) => void) {
  return render(
    <PagesProvider
      options={{
        maxPages: 5,
        canvasElementFactory: fakeCanvasElementFactory,
        thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
      }}
      engineFactory={createEngineFactory()}
    >
      <TestApp onManager={onManager} />
    </PagesProvider>,
  );
}

describe("PagesProvider / usePagesContext", () => {
  it("usePagesContext() throws outside a PagesProvider", () => {
    expect(() => render(<TestApp />)).toThrow(/usePagesContext\(\) must be called within a <PagesProvider>/);
  });

  it("starts with no pages and no active engine", () => {
    renderApp();
    expect(screen.queryByRole("button", { name: /New page/ })).toBeNull();
    expect(screen.getByTestId("active-engine").textContent).toBe("no engine");
  });

  it("re-provides EditorContext with the active page's engine on setActivePage", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "Add page" }));
    fireEvent.click(screen.getByRole("button", { name: /New page/ }));

    await waitFor(() => expect(screen.getByTestId("active-engine").textContent).toBe("has engine"));
  });

  it("does not destroy a page's engine under React StrictMode's dev-only mount->cleanup->mount simulation", async () => {
    // Mirrors apps/demo's MultiPageExample.tsx auto-seed pattern exactly: a child component's own
    // mount effect calls addPage()/setActivePage() during the *same* initial commit as
    // usePages()'s own effects, which is what actually races against StrictMode's phantom
    // cleanup — asserting from outside that render cycle (e.g. via a captured `manager` reference
    // and a separate act() call afterward) doesn't reproduce the race, since by then StrictMode's
    // one-time double-invoke has already settled.
    let manager!: PagesManager;

    function AutoSeed() {
      const { pages, manager: ctxManager } = usePagesContext();
      manager = ctxManager;
      const seededRef = useRef(false);

      useEffect(() => {
        if (seededRef.current || pages.length > 0) return;
        seededRef.current = true;
        const page = ctxManager.addPage({ name: "Page 1" });
        void ctxManager.setActivePage(page.id);
      }, [pages.length, ctxManager]);

      return null;
    }

    render(
      <StrictMode>
        <PagesProvider
          options={{
            maxPages: 5,
            canvasElementFactory: fakeCanvasElementFactory,
            thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
          }}
          engineFactory={createEngineFactory()}
        >
          <AutoSeed />
        </PagesProvider>
      </StrictMode>,
    );

    await waitFor(() => expect(manager.getPages()).toHaveLength(1));
    const pageId = manager.getPages()[0].id;
    await waitFor(() => expect(manager.getActivePageId()).toBe(pageId));

    // The regression this guards: usePages()'s destroy-effect used to call manager.destroy() —
    // tearing down every runtime engine, including one still mid-construction — as part of
    // StrictMode's phantom cleanup, which the very next synchronous remount kept using. That left
    // setActivePage()'s in-flight promise operating on a torn-down engine and never resolving, so
    // activePageId never got set — the waitFor above is what actually would have timed out.
    const fakeEngine = manager.getEngine(pageId) as FakeEngine;
    expect(fakeEngine.__fake.destroy).not.toHaveBeenCalled();
  });

  it("wires default keyboard shortcuts against the active page's engine, with no <MultiPageDesignEditor> involved", async () => {
    let manager!: PagesManager;
    renderApp((m) => (manager = m));

    fireEvent.click(screen.getByRole("button", { name: "Add page" }));
    fireEvent.click(screen.getByRole("button", { name: /New page/ }));
    await waitFor(() => expect(screen.getByTestId("active-engine").textContent).toBe("has engine"));

    const engine = manager.getEngine(manager.getActivePageId()!) as FakeEngine;
    expect(engine.shortcuts.has("ctrl+z")).toBe(true);
    expect(engine.shortcuts.has("delete")).toBe(true);
  });

  it("honors a `shortcuts` option (disable defaults, add custom combos)", async () => {
    const handler = vi.fn();
    let manager!: PagesManager;
    render(
      <PagesProvider
        options={{
          maxPages: 5,
          canvasElementFactory: fakeCanvasElementFactory,
          thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
          shortcuts: { disable: ["ctrl+z"], add: { "ctrl+d": { handler, description: "Duplicate" } } },
        }}
        engineFactory={createEngineFactory()}
      >
        <TestApp onManager={(m) => (manager = m)} />
      </PagesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add page" }));
    fireEvent.click(screen.getByRole("button", { name: /New page/ }));
    await waitFor(() => expect(screen.getByTestId("active-engine").textContent).toBe("has engine"));

    const engine = manager.getEngine(manager.getActivePageId()!) as FakeEngine;
    expect(engine.shortcuts.has("ctrl+z")).toBe(false);
    expect(engine.shortcuts.has("ctrl+d")).toBe(true);
  });

  it("still destroys every page's engine on a genuine unmount", async () => {
    let manager!: PagesManager;
    const { unmount } = renderApp((m) => (manager = m));

    fireEvent.click(screen.getByRole("button", { name: "Add page" }));
    fireEvent.click(screen.getByRole("button", { name: /New page/ }));
    await waitFor(() => expect(screen.getByTestId("active-engine").textContent).toBe("has engine"));

    const pageId = manager.getActivePageId()!;
    const fakeEngine = manager.getEngine(pageId) as FakeEngine;

    unmount();
    // destroy() is deferred by one microtask (see usePages.ts) so a real unmount doesn't skip it.
    await waitFor(() => expect(fakeEngine.__fake.destroy).toHaveBeenCalled());
  });
});
