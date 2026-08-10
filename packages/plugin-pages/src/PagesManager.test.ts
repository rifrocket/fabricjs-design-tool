import { describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import { getObjectId } from "@rifrocket/fabricjs-design-tool";
import type { EditorPlugin, EditorPreset } from "@rifrocket/fabricjs-design-tool";
import { PagesManager } from "./PagesManager";
import type { PagesManagerOptions } from "./types";
import { capturePagesSnapshot, loadPagesFromStorage, savePagesToStorage } from "./persistence";
import type { StorageLike } from "./persistence";
import {
  createEngineFactory,
  fakeCanvasElementFactory,
  fakeOffscreenCanvasFactory,
} from "./testUtils";
import type { FakeEngine } from "./testUtils";

function createManager(overrides: Partial<PagesManagerOptions> = {}, engineFactory = createEngineFactory()) {
  return new PagesManager(
    {
      maxPages: 5,
      canvasElementFactory: fakeCanvasElementFactory,
      thumbnails: { offscreenCanvasFactory: fakeOffscreenCanvasFactory },
      ...overrides,
    },
    engineFactory,
  );
}

function createFakeStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe("PagesManager", () => {
  it("adds pages with incrementing defaults and enforces the page cap", () => {
    const manager = createManager({ maxPages: 2 });
    const first = manager.addPage();
    const second = manager.addPage({ name: "Cover" });

    expect(first.name).toBe("Page 1");
    expect(first.order).toBe(0);
    expect(second.name).toBe("Cover");
    expect(second.order).toBe(1);
    expect(() => manager.addPage()).toThrow(/maximum of 2 pages/);
  });

  it("creates a page's engine lazily, once, on first activation", async () => {
    const factory = vi.fn(createEngineFactory());
    const manager = createManager({}, factory);
    const page = manager.addPage();

    expect(manager.getEngine(page.id)).toBeUndefined();
    expect(factory).not.toHaveBeenCalled();

    const engine = await manager.setActivePage(page.id);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(manager.getActivePageId()).toBe(page.id);

    const again = await manager.setActivePage(page.id);
    expect(again).toBe(engine);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("renames and reorders pages", () => {
    const manager = createManager();
    const a = manager.addPage({ name: "A" });
    const b = manager.addPage({ name: "B" });
    const c = manager.addPage({ name: "C" });

    manager.renamePage(a.id, "Front cover");
    manager.reorderPages(0, 2);

    const ids = manager.getPages().map((p) => p.id);
    expect(ids).toEqual([b.id, c.id, a.id]);
    expect(manager.getPages().map((p) => p.order)).toEqual([0, 1, 2]);
    expect(manager.getPages().find((p) => p.id === a.id)?.name).toBe("Front cover");
  });

  it("refuses to delete the last remaining page, and destroys the engine of a deleted one", async () => {
    const manager = createManager();
    const only = manager.addPage();
    expect(() => manager.deletePage(only.id)).toThrow(/last remaining page/);

    const second = manager.addPage();
    const engine = (await manager.setActivePage(second.id)) as FakeEngine;

    manager.deletePage(second.id);
    expect(engine.__fake.destroy).toHaveBeenCalledTimes(1);
    expect(manager.getPages().map((p) => p.id)).toEqual([only.id]);
  });

  it("carries a duplicated page's content over via a pending snapshot, applied on first activation", async () => {
    const manager = createManager();
    const source = manager.addPage({ backgroundColor: "#ff0000" });
    const sourceEngine = (await manager.setActivePage(source.id)) as FakeEngine;
    sourceEngine.__fake.canvas.backgroundColor = "#ff0000";

    const duplicate = await manager.duplicatePage(source.id);
    expect(manager.getEngine(duplicate.id)).toBeUndefined(); // still lazy

    const duplicateEngine = (await manager.setActivePage(duplicate.id)) as FakeEngine;
    expect(duplicateEngine.__fake.setBackgroundColor).toHaveBeenCalledWith("#ff0000");
    expect(duplicateEngine.__fake.importFile).toHaveBeenCalledTimes(1);
  });

  it("adopts an externally-supplied snapshot as a new page via seedFromDocument, the same lazy-apply path duplicatePage uses", async () => {
    const manager = createManager();
    const existingSnapshot = { json: { objects: [] }, backgroundColor: "#00ff00" };

    const page = manager.seedFromDocument(existingSnapshot, { name: "Page 1", width: 1024, height: 768 });
    expect(page.name).toBe("Page 1");
    expect(page.width).toBe(1024);
    expect(manager.getEngine(page.id)).toBeUndefined(); // still lazy, not applied yet

    const engine = (await manager.setActivePage(page.id)) as FakeEngine;
    expect(engine.__fake.setBackgroundColor).toHaveBeenCalledWith("#00ff00");
    expect(engine.__fake.importFile).toHaveBeenCalledWith("json", existingSnapshot.json);
  });

  it("seedFromDocument composes with pages that already exist, unlike hydrate()", () => {
    const manager = createManager();
    manager.addPage();
    expect(() =>
      manager.seedFromDocument({ json: {}, backgroundColor: "#fff" }),
    ).not.toThrow();
    expect(manager.getPages()).toHaveLength(2);
  });

  it("moves an object between two pages, undoable independently on each side", async () => {
    const manager = createManager();
    const pageA = manager.addPage();
    const pageB = manager.addPage();
    const engineA = (await manager.setActivePage(pageA.id)) as FakeEngine;
    const engineB = (await manager.setActivePage(pageB.id)) as FakeEngine;

    const rect = new Rect({ left: 0, top: 0, width: 10, height: 10 });
    engineA.addObject(rect);
    const rectId = getObjectId(rect);

    await manager.moveObjectsBetweenPages([rectId], pageA.id, pageB.id);

    expect(engineA.__fake.objects).toHaveLength(0);
    expect(engineB.__fake.objects).toEqual([rect]);
    expect(engineA.removeObject).toHaveBeenCalledWith(rect);
    expect(engineB.addObject).toHaveBeenCalledWith(rect);
  });

  it("toggles selection/evented on the underlying canvas when locking a page", async () => {
    const manager = createManager();
    const page = manager.addPage();
    const engine = (await manager.setActivePage(page.id)) as FakeEngine;

    manager.setLocked(page.id, true);
    expect(engine.__fake.canvas.set).toHaveBeenCalledWith({ selection: false, evented: false });
    expect(manager.getPages()[0].locked).toBe(true);
  });

  it("renders a thumbnail automatically when a page is activated, and on manual refresh", async () => {
    const manager = createManager();
    const page = manager.addPage();

    expect(manager.getPages()[0].thumbnail).toBeUndefined();
    await manager.setActivePage(page.id);
    expect(manager.getPages()[0].thumbnail).toBe("data:image/png;base64,fake");

    await manager.refreshThumbnail(page.id);
    expect(manager.getPages()[0].thumbnail).toBe("data:image/png;base64,fake");
  });

  it("invokes onContentChange, undebounced, on the same trigger that schedules a thumbnail refresh", async () => {
    const onContentChange = vi.fn();
    const manager = createManager({ onContentChange });
    const page = manager.addPage();
    const engine = (await manager.setActivePage(page.id)) as FakeEngine;

    const scheduleHandler = (engine.store.subscribe as ReturnType<typeof vi.fn>).mock.calls[0][0] as () => void;
    scheduleHandler();

    expect(onContentChange).toHaveBeenCalledWith(page.id, manager);
  });

  it("round-trips a page collection through save/load/hydrate", async () => {
    const storage = createFakeStorage();
    const writer = createManager();
    const page = writer.addPage({ name: "Cover", backgroundColor: "#00ff00" });
    const engine = (await writer.setActivePage(page.id)) as FakeEngine;
    engine.__fake.canvas.backgroundColor = "#00ff00";

    savePagesToStorage(writer, "test-key", storage);
    const loaded = loadPagesFromStorage("test-key", storage);
    expect(loaded?.pages).toHaveLength(1);
    expect(loaded?.snapshots[page.id]).toBeDefined();

    const reader = createManager();
    reader.hydrate(loaded!);
    expect(reader.getPages()).toEqual(writer.getPages());

    const rehydratedEngine = (await reader.setActivePage(page.id)) as FakeEngine;
    expect(rehydratedEngine.__fake.setBackgroundColor).toHaveBeenCalledWith("#00ff00");
    expect(rehydratedEngine.__fake.importFile).toHaveBeenCalledTimes(1);
  });

  // The public PagesStorageData shape (pages + a snapshots map) is unchanged, but what's
  // actually written to storage is a DesignDocument (each page's snapshot inlined) — the same
  // shape @rifrocket/fdt-plugin-local-storage's own storage format is built on.
  it("writes a DesignDocument (inline per-page snapshot, no top-level snapshots map) to storage internally", async () => {
    const storage = createFakeStorage();
    const writer = createManager();
    const page = writer.addPage({ name: "Cover" });
    await writer.setActivePage(page.id);

    savePagesToStorage(writer, "test-key", storage);

    const raw = JSON.parse(storage.getItem("test-key")!);
    expect(raw.snapshots).toBeUndefined();
    expect(raw.pages).toHaveLength(1);
    expect(raw.pages[0].id).toBe(page.id);
    expect(raw.pages[0].snapshot).toBeDefined();
  });

  it("returns null for a pre-existing entry saved under the old { pages, snapshots } shape", () => {
    const storage = createFakeStorage();
    storage.setItem("test-key", JSON.stringify({ pages: [{ id: "page_1" }], snapshots: {} }));

    expect(loadPagesFromStorage("test-key", storage)).toBeNull();
  });

  it("refuses to hydrate a manager that already has pages", () => {
    const manager = createManager();
    manager.addPage();
    expect(() => manager.hydrate({ pages: [] })).toThrow(/before any pages/);
  });

  it("captures nothing for a page that was added but never opened", () => {
    const manager = createManager();
    manager.addPage();
    const snapshot = capturePagesSnapshot(manager);
    expect(Object.keys(snapshot.snapshots)).toHaveLength(0);
  });

  it("sizes a new page from its template, and seeds starter content on first activation", async () => {
    const manager = createManager({
      templates: {
        "business-card": {
          id: "business-card",
          label: "Business card",
          width: 350,
          height: 200,
          backgroundColor: "#eeeeee",
          objects: [{ typeId: "text" as never, config: { left: 10, top: 10 }, text: "Your Name" }],
        },
      },
    });

    const page = manager.addPage({ templateId: "business-card" });
    expect(page.width).toBe(350);
    expect(page.height).toBe(200);
    expect(page.backgroundColor).toBe("#eeeeee");
    expect(page.name).toBe("Business card");

    const engine = (await manager.setActivePage(page.id)) as FakeEngine;
    expect(engine.__fake.setBackgroundColor).toHaveBeenCalledWith("#eeeeee");
    expect(engine.__fake.addObjectOfType).toHaveBeenCalledTimes(1);
    expect(engine.__fake.setObjectProperty).toHaveBeenCalledWith(expect.anything(), "text", "Your Name");
    expect(engine.__fake.historyClear).toHaveBeenCalledTimes(1);
  });

  it("uses a caller-supplied captureSnapshot instead of the core default, at every internal call site", async () => {
    const customSnapshot = { json: { objects: ["custom"] }, backgroundColor: "#custom" };
    const captureSnapshot = vi.fn().mockReturnValue(customSnapshot);
    const manager = createManager({ captureSnapshot });
    const page = manager.addPage();
    const engine = (await manager.setActivePage(page.id)) as FakeEngine;

    expect(captureSnapshot).toHaveBeenCalledWith(engine);
    captureSnapshot.mockClear();

    expect(manager.getSnapshotForPersistence(page.id)).toBe(customSnapshot);
    expect(captureSnapshot).toHaveBeenCalledWith(engine);
    captureSnapshot.mockClear();

    await manager.refreshThumbnail(page.id);
    expect(captureSnapshot).toHaveBeenCalledWith(engine);
    captureSnapshot.mockClear();

    await manager.duplicatePage(page.id);
    expect(captureSnapshot).toHaveBeenCalledWith(engine);
  });

  it("prefers a hydrated page's real content over its template's starter content, when a page has both", async () => {
    const manager = createManager({
      templates: {
        blank: {
          id: "blank",
          label: "Blank",
          width: 100,
          height: 100,
          objects: [{ typeId: "text" as never, config: {} }],
        },
      },
    });
    manager.hydrate({
      pages: [
        {
          id: "page_1",
          name: "Restored",
          order: 0,
          width: 100,
          height: 100,
          templateId: "blank",
          locked: false,
          visible: true,
        },
      ],
      snapshots: { page_1: { json: { objects: [] }, backgroundColor: "#ffffff" } },
    });

    const engine = (await manager.setActivePage("page_1")) as FakeEngine;
    expect(engine.__fake.importFile).toHaveBeenCalledTimes(1);
    expect(engine.__fake.addObjectOfType).not.toHaveBeenCalled();
  });
});

describe("PagesManager page pairing", () => {
  it("creates a front/back pair sharing a pairId, correct sides, and adjacent order", () => {
    const manager = createManager();
    const { front, back } = manager.addPagePair({ name: "Card" });

    expect(front.pairId).toBe(front.id);
    expect(back.pairId).toBe(front.id);
    expect(front.pairSide).toBe("front");
    expect(back.pairSide).toBe("back");
    expect(front.order).toBe(0);
    expect(back.order).toBe(1);
    expect(front.name).toBe("Card (Front)");
    expect(back.name).toBe("Card (Back)");
  });

  it("throws and creates zero pages when fewer than 2 slots remain", () => {
    const manager = createManager({ maxPages: 2 });
    manager.addPage();
    expect(() => manager.addPagePair()).toThrow(/a pair needs 2/);
    expect(manager.getPages()).toHaveLength(1);
  });

  it("pins the back page's dimensions to the front page's resolved size", () => {
    const manager = createManager({
      templates: {
        "card-front": { id: "card-front", label: "Front", width: 350, height: 200 },
      },
    });
    const { back } = manager.addPagePair({ front: { templateId: "card-front" } });
    expect(back.width).toBe(350);
    expect(back.height).toBe(200);
  });

  it("duplicates a pair with a fresh pairId, carrying both sides' content over", async () => {
    const manager = createManager();
    const { front, back } = manager.addPagePair();
    const frontEngine = (await manager.setActivePage(front.id)) as FakeEngine;
    frontEngine.__fake.canvas.backgroundColor = "#front";
    const backEngine = (await manager.setActivePage(back.id)) as FakeEngine;
    backEngine.__fake.canvas.backgroundColor = "#back";

    const duplicate = await manager.duplicatePagePair(front.id);
    expect(duplicate.front.pairId).toBe(duplicate.front.id);
    expect(duplicate.front.pairId).not.toBe(front.pairId);
    expect(duplicate.back.pairId).toBe(duplicate.front.pairId);

    const dupFrontEngine = (await manager.setActivePage(duplicate.front.id)) as FakeEngine;
    expect(dupFrontEngine.__fake.importFile).toHaveBeenCalledTimes(1);
    const dupBackEngine = (await manager.setActivePage(duplicate.back.id)) as FakeEngine;
    expect(dupBackEngine.__fake.importFile).toHaveBeenCalledTimes(1);
  });

  it("duplicatePagePair throws on an unpaired page or insufficient capacity", async () => {
    const manager = createManager({ maxPages: 3 });
    const lone = manager.addPage();
    await expect(manager.duplicatePagePair(lone.id)).rejects.toThrow(/not part of a pair/);

    const capped = createManager({ maxPages: 2 });
    const { front } = capped.addPagePair();
    await expect(capped.duplicatePagePair(front.id)).rejects.toThrow(/a pair needs 2/);
  });

  it("deletes both sides of a pair atomically, and refuses to leave zero pages", () => {
    const manager = createManager();
    const { front } = manager.addPagePair();
    expect(() => manager.deletePagePair(front.id)).toThrow(/last remaining page/);
    expect(manager.getPages()).toHaveLength(2);

    manager.addPage();
    manager.deletePagePair(front.id);
    expect(manager.getPages()).toHaveLength(1);
  });

  it("deletePagePair throws on an unpaired page", () => {
    const manager = createManager();
    const lone = manager.addPage();
    manager.addPage();
    expect(() => manager.deletePagePair(lone.id)).toThrow(/not part of a pair/);
  });

  it("auto-unpairs the sibling when the plain deletePage() removes one side", () => {
    const manager = createManager();
    const { front, back } = manager.addPagePair();
    manager.addPage(); // so deleting `front` doesn't hit the last-page guard

    manager.deletePage(front.id);
    const remainingBack = manager.getPages().find((page) => page.id === back.id);
    expect(remainingBack?.pairId).toBeUndefined();
    expect(remainingBack?.pairSide).toBeUndefined();
  });

  it("getPairSibling returns the sibling, and undefined for an unpaired page", () => {
    const manager = createManager();
    const { front, back } = manager.addPagePair();
    const lone = manager.addPage();

    expect(manager.getPairSibling(front.id)?.id).toBe(back.id);
    expect(manager.getPairSibling(back.id)?.id).toBe(front.id);
    expect(manager.getPairSibling(lone.id)).toBeUndefined();
  });

  it("round-trips pairId/pairSide through save/load/hydrate", async () => {
    const storage = createFakeStorage();
    const writer = createManager();
    const { front, back } = writer.addPagePair();
    await writer.setActivePage(front.id);
    savePagesToStorage(writer, "pair-key", storage);

    const loaded = loadPagesFromStorage("pair-key", storage);
    const reader = createManager();
    reader.hydrate(loaded!);

    expect(reader.getPairSibling(front.id)?.id).toBe(back.id);
  });

  it("copyObjectsBetweenPages clones an object onto the destination while keeping the source's copy", async () => {
    const manager = createManager();
    const { front, back } = manager.addPagePair();
    const frontEngine = (await manager.setActivePage(front.id)) as FakeEngine;
    const backEngine = (await manager.setActivePage(back.id)) as FakeEngine;

    const rect = new Rect({ left: 1, top: 2, width: 10, height: 10 });
    frontEngine.addObject(rect);
    const rectId = getObjectId(rect);

    await manager.copyObjectsBetweenPages([rectId], front.id, back.id);

    expect(frontEngine.__fake.objects).toHaveLength(1);
    expect(backEngine.__fake.objects).toHaveLength(1);
    expect(backEngine.__fake.objects[0]).not.toBe(rect);
    expect(backEngine.addObject).toHaveBeenCalledTimes(1);
  });

  it("keeps each side of a pair's content fully independent", async () => {
    const manager = createManager();
    const { front, back } = manager.addPagePair();
    const frontEngine = (await manager.setActivePage(front.id)) as FakeEngine;
    await manager.setActivePage(back.id);

    frontEngine.addObject(new Rect({ left: 0, top: 0, width: 5, height: 5 }));

    const frontSnapshot = manager.getSnapshotForPersistence(front.id);
    const backSnapshot = manager.getSnapshotForPersistence(back.id);
    expect((frontSnapshot?.json as { objects: unknown[] }).objects).toHaveLength(1);
    expect((backSnapshot?.json as { objects: unknown[] }).objects).toHaveLength(0);
  });
});

describe("PagesManager.exportPageAsDocument", () => {
  it("defaults to the lowest-order page when no pageId is given", () => {
    const manager = createManager();
    manager.addPage({ name: "B" });
    const a = manager.addPage({ name: "A" });
    manager.reorderPages(1, 0); // "A" is now order 0

    const result = manager.exportPageAsDocument();
    expect(result?.page.name).toBe(a.name);
  });

  it("returns a specific page by id, with its own width/height/backgroundColor", () => {
    const manager = createManager();
    manager.addPage({ name: "A", width: 100, height: 100 });
    const b = manager.addPage({ name: "B", width: 350, height: 200, backgroundColor: "#eeeeee" });

    const result = manager.exportPageAsDocument(b.id);
    expect(result?.page).toEqual({ name: "B", width: 350, height: 200, backgroundColor: "#eeeeee" });
  });

  it("carries the page's real content when it has been activated and edited", async () => {
    const manager = createManager();
    const page = manager.addPage();
    const engine = (await manager.setActivePage(page.id)) as FakeEngine;
    engine.__fake.canvas.backgroundColor = "#123456";

    const result = manager.exportPageAsDocument(page.id);
    expect(result?.snapshot.backgroundColor).toBe("#123456");
  });

  it("collapses an untouched page to a blank document instead of leaving snapshot undefined", () => {
    const manager = createManager();
    const page = manager.addPage({ backgroundColor: "#abcdef" });

    const result = manager.exportPageAsDocument(page.id);
    expect(result?.snapshot).toEqual({ json: { objects: [] }, backgroundColor: "#abcdef" });
  });

  it("throws on an unknown pageId", () => {
    const manager = createManager();
    manager.addPage();
    expect(() => manager.exportPageAsDocument("nope")).toThrow(/No page with id/);
  });

  it("returns undefined for an empty manager with no pageId given", () => {
    const manager = createManager();
    expect(manager.exportPageAsDocument()).toBeUndefined();
  });
});

describe("PagesManager preset/plugins resolution", () => {
  const a: EditorPlugin = { name: "a", install: vi.fn() };
  const b: EditorPlugin = { name: "b", install: vi.fn() };
  const preset: EditorPreset = { name: "test-preset", plugins: [a, b] };

  async function installedPlugins(manager: PagesManager): Promise<unknown> {
    const engine = (await manager.setActivePage(manager.addPage().id)) as FakeEngine;
    return engine.__fake.useAll.mock.calls[0][0];
  }

  it("passes an empty array to useAll when neither preset nor plugins are given", async () => {
    expect(await installedPlugins(createManager())).toEqual([]);
  });

  it("backward compat: a flat plugins array with no preset is used as the final list unmodified", async () => {
    expect(await installedPlugins(createManager({ plugins: [a, b] }))).toEqual([a, b]);
  });

  it("installs a preset's plugins unmodified when no overrides are given", async () => {
    expect(await installedPlugins(createManager({ preset }))).toEqual([a, b]);
  });

  it("applies exclude/add/replace overrides against the preset", async () => {
    const c: EditorPlugin = { name: "c", install: vi.fn() };
    const b2: EditorPlugin = { name: "b", install: vi.fn() };
    const manager = createManager({ preset, plugins: { exclude: ["a"], add: [c], replace: { b: b2 } } });
    expect(await installedPlugins(manager)).toEqual([b2, c]);
  });

  it("treats a flat plugins array combined with a preset as { add: [...] }, appended after the preset's plugins", async () => {
    const c: EditorPlugin = { name: "c", install: vi.fn() };
    expect(await installedPlugins(createManager({ preset, plugins: [c] }))).toEqual([a, b, c]);
  });

  it("'none' preset with plugins behaves the same as no preset at all", async () => {
    expect(await installedPlugins(createManager({ preset: "none", plugins: [a] }))).toEqual([a]);
  });

  it("throws synchronously at construction on an exclude typo, before any page is created", () => {
    expect(() => createManager({ preset, plugins: { exclude: ["nope"] } })).toThrow(
      /plugins.exclude references "nope"/,
    );
  });

  it("throws synchronously at construction on a replace typo", () => {
    expect(() =>
      createManager({ preset, plugins: { replace: { nope: { name: "nope", install: vi.fn() } } } }),
    ).toThrow(/plugins.replace references "nope"/);
  });

  it("throws when exclude/replace are given without a preset (nothing to reference in the implicit empty preset)", () => {
    expect(() => createManager({ plugins: { exclude: ["a"] } })).toThrow(/plugins.exclude references "a"/);
  });

  it("resolves the plugin list once at construction, not per page activation", async () => {
    const manager = createManager({ preset, plugins: { add: [{ name: "c", install: vi.fn() }] } });
    const page1 = manager.addPage();
    const page2 = manager.addPage();
    const e1 = (await manager.setActivePage(page1.id)) as FakeEngine;
    const e2 = (await manager.setActivePage(page2.id)) as FakeEngine;
    expect(e1.__fake.useAll.mock.calls[0][0]).toBe(e2.__fake.useAll.mock.calls[0][0]);
  });

  it("surfaces resolvePreset's redirecting error for a plain string preset", () => {
    expect(() =>
      // @ts-expect-error — only a literal EditorPreset or "none" is valid here
      createManager({ preset: "default" }),
    ).toThrow(/DesignEditor preset="default"/);
  });
});
