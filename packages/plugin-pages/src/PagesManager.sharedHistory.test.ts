import { describe, expect, it } from "vitest";
import { HistoryManager } from "@rifrocket/fabricjs-design-tool";
import type { Command } from "@rifrocket/fabricjs-design-tool";
import { PagesManager } from "./PagesManager";
import type { EngineFactory } from "./PagesManager";
import { createFakeEngine, fakeCanvasElementFactory, fakeOffscreenCanvasFactory } from "./testUtils";

// Chunk 10.3 (FUTURE_IMPLEMENTATION.md Stage 10) — proves DocumentSession's `history: { scope:
// "document" }` opt-in (Chunk 4.2) works across real plugin-pages pages, and that the DEFAULT
// (unopted) path still has per-page history exactly as today (plugin-pages' own class comment:
// "history, selection, viewport, and snapping are deliberately per-page today"). Same mechanism
// as Chunk 10.2's shared-assets proof: PagesManager.ts's getOrCreateEngine() spreads the one
// captured `this.engineOptions` into every page's engine construction, so a shared HistoryManager
// passed via `engineOptions.history` reaches every page automatically — zero PagesManager wiring
// changes needed. createFakeEngine()'s stubbed `history`/`undo`/`redo` (testUtils.ts) don't
// exercise real HistoryManager behavior, so this file wires a REAL HistoryManager onto each fake
// engine locally (not a shared-fixture change), with `undo`/`redo` delegating to it, and a
// trivial no-op Command standing in for a real AddObjectCommand — sufficient to prove instance
// sharing and cross-page-visible undo/redo, without needing real scene mutation semantics.
function noopCommand(label: string): Command {
  return { label, do() {}, undo() {} };
}

function createHistoryAwareEngineFactory(): EngineFactory {
  return (_canvasEl, options) => {
    const engine = createFakeEngine();
    const history = options.history ?? new HistoryManager();
    Object.assign(engine, {
      history,
      undo: () => history.undo(),
      redo: () => history.redo(),
    });
    return engine;
  };
}

describe("PagesManager — shared HistoryManager across pages (Chunk 10.3)", () => {
  it("opt-in: undo on page 2 reverses a command executed via page 1's shared history", async () => {
    const sharedHistory = new HistoryManager();
    const manager = new PagesManager(
      {
        maxPages: 5,
        canvasElementFactory: fakeCanvasElementFactory,
        thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
        engineOptions: { history: sharedHistory },
      },
      createHistoryAwareEngineFactory(),
    );

    const page1 = manager.addPage();
    const page2 = manager.addPage();

    const page1Engine = await manager.setActivePage(page1.id);
    expect(page1Engine.history).toBe(sharedHistory);

    sharedHistory.execute(noopCommand("page1-edit"));
    expect(sharedHistory.canUndo()).toBe(true);

    const page2Engine = await manager.setActivePage(page2.id);
    expect(page2Engine.history).toBe(page1Engine.history); // same shared instance, not a copy
    expect(page2Engine.history.canUndo()).toBe(true); // page 1's edit is visible from page 2

    page2Engine.undo();
    expect(sharedHistory.canUndo()).toBe(false); // undone through the shared stack, from a different page
  });

  it("default: each page keeps its own independent history — today's per-page behavior is unaffected", async () => {
    const manager = new PagesManager(
      {
        maxPages: 5,
        canvasElementFactory: fakeCanvasElementFactory,
        thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
      },
      createHistoryAwareEngineFactory(),
    );

    const page1 = manager.addPage();
    const page2 = manager.addPage();

    const page1Engine = await manager.setActivePage(page1.id);
    const page2Engine = await manager.setActivePage(page2.id);

    expect(page1Engine.history).not.toBe(page2Engine.history);

    page1Engine.history.execute(noopCommand("page1-only-edit"));
    expect(page1Engine.history.canUndo()).toBe(true);
    expect(page2Engine.history.canUndo()).toBe(false); // page 1's edit is not visible from page 2
  });
});
