import {
  Store,
  createEngine,
  getObjectId,
  captureSnapshot,
  restoreSnapshot,
  renderSnapshotThumbnail,
  resolvePreset,
  resolvePluginList,
} from "@rifrocket/fabricjs-design-tool";
import type {
  CanvasEngine,
  DocumentSnapshotData,
  EditorPlugin,
  EngineOptions,
  OffscreenCanvasFactory,
  PluginOverrides,
} from "@rifrocket/fabricjs-design-tool";
import type { CanvasElementFactory, NewPageInit, PageMeta, PagesManagerOptions, PagesState } from "./types";
import { applyTemplateToEngine } from "./templates";
import type { TemplateDefinition } from "./templates";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const DEFAULT_THUMBNAIL_MAX_DIMENSION = 240;
const DEFAULT_THUMBNAIL_DEBOUNCE_MS = 500;

// Injectable so tests can substitute a fake engine instead of constructing a real Fabric Canvas
// (which needs a real 2D context this repo's node test environment doesn't provide) — same
// rationale as OffscreenCanvasFactory in @rifrocket/fabricjs-design-tool's snapshot.ts.
export type EngineFactory = (canvasEl: HTMLCanvasElement, options: EngineOptions) => CanvasEngine;

const defaultCanvasElementFactory: CanvasElementFactory = () => document.createElement("canvas");
const defaultEngineFactory: EngineFactory = (canvasEl, options) => createEngine(canvasEl, options);

interface PageRuntime {
  canvasEl: HTMLCanvasElement;
  engine: CanvasEngine;
}

// Orchestrates one CanvasEngine per page rather than swapping content on a single shared
// canvas — see the design discussion this package came out of: this way undo/redo, selection,
// viewport and snapping are correctly page-scoped "for free" (each is already a per-CanvasEngine
// concern), with zero changes required to CanvasEngine itself. Each page's engine is created
// lazily, on first activation, up to options.maxPages live engines.
export class PagesManager {
  readonly store: Store<PagesState>;

  private readonly maxPages: number;
  // Always the fully-resolved flat list (preset + overrides already applied), never raw
  // options.plugins — resolved once in the constructor, see there for why.
  private readonly plugins: EditorPlugin[];
  private readonly engineOptions: PagesManagerOptions["engineOptions"];
  private readonly canvasElementFactory: CanvasElementFactory;
  private readonly engineFactory: EngineFactory;
  private readonly thumbnailMaxDimension: number;
  private readonly thumbnailDebounceMs: number;
  private readonly offscreenCanvasFactory: OffscreenCanvasFactory | undefined;
  private readonly templates: Record<string, TemplateDefinition>;

  private readonly runtimes = new Map<string, PageRuntime>();
  // Snapshot captured from a source page at duplicatePage() time, applied once the duplicate's
  // own engine is actually created — keeps duplication cheap (no engine spun up just to sit
  // idle) while still carrying the source page's content over. hydrate() reuses the same
  // mechanism for pages loaded from persisted storage.
  private readonly pendingSnapshots = new Map<string, DocumentSnapshotData>();
  private readonly thumbnailTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly thumbnailCleanup = new Map<string, () => void>();
  private idCounter = 0;

  constructor(options: PagesManagerOptions, engineFactory: EngineFactory = defaultEngineFactory) {
    if (options.maxPages < 1) {
      throw new Error("maxPages must be at least 1");
    }
    this.maxPages = options.maxPages;
    // Resolved once, synchronously, here — a typo in exclude/replace throws immediately at
    // `new PagesManager(...)`, not deferred to first setActivePage(). A plain array is shorthand
    // for `{ add: array }` (see PagesManagerOptions.plugins), so this stays backward compatible
    // with every existing caller that passes a flat EditorPlugin[] and no preset.
    const pluginOverrides: PluginOverrides = Array.isArray(options.plugins)
      ? { add: options.plugins }
      : (options.plugins ?? {});
    this.plugins = resolvePluginList(resolvePreset(options.preset), pluginOverrides);
    this.engineOptions = options.engineOptions;
    this.canvasElementFactory = options.canvasElementFactory ?? defaultCanvasElementFactory;
    this.engineFactory = engineFactory;
    this.thumbnailMaxDimension = options.thumbnails?.maxDimension ?? DEFAULT_THUMBNAIL_MAX_DIMENSION;
    this.thumbnailDebounceMs = options.thumbnails?.debounceMs ?? DEFAULT_THUMBNAIL_DEBOUNCE_MS;
    this.offscreenCanvasFactory = options.thumbnails?.offscreenCanvasFactory;
    this.templates = options.templates ?? {};
    this.store = new Store<PagesState>({ pages: [], activePageId: null });
  }

  private generateId(): string {
    this.idCounter += 1;
    return `page_${this.idCounter}`;
  }

  private getState(): PagesState {
    return this.store.getState();
  }

  getPages(): PageMeta[] {
    return this.getState().pages;
  }

  getActivePageId(): string | null {
    return this.getState().activePageId;
  }

  // Undefined until the page has been activated at least once — see class comment on lazy
  // creation. Use setActivePage() to both create-if-needed and activate.
  getEngine(id: string): CanvasEngine | undefined {
    return this.runtimes.get(id)?.engine;
  }

  addPage(init: NewPageInit = {}): PageMeta {
    const { pages } = this.getState();
    if (pages.length >= this.maxPages) {
      throw new Error(`Cannot add page: maximum of ${this.maxPages} pages reached`);
    }

    const template = init.templateId ? this.templates[init.templateId] : undefined;

    const meta: PageMeta = {
      id: this.generateId(),
      name: init.name ?? template?.label ?? `Page ${pages.length + 1}`,
      order: pages.length,
      width: init.width ?? template?.width ?? DEFAULT_WIDTH,
      height: init.height ?? template?.height ?? DEFAULT_HEIGHT,
      backgroundColor: init.backgroundColor ?? template?.backgroundColor,
      templateId: init.templateId,
      locked: false,
      visible: true,
    };

    this.store.setState({ pages: [...pages, meta] });
    return meta;
  }

  // Captures the source page's content (creating its engine first if it hasn't been activated
  // yet) and carries it over to the new page, applied lazily when the new page's own engine is
  // created — see pendingSnapshots.
  async duplicatePage(id: string): Promise<PageMeta> {
    const source = this.requireMeta(id);
    const sourceEngine = await this.getOrCreateEngine(source.id);
    const snapshot = captureSnapshot(sourceEngine);

    const duplicate = this.addPage({
      name: `${source.name} copy`,
      width: source.width,
      height: source.height,
      backgroundColor: source.backgroundColor,
    });
    this.pendingSnapshots.set(duplicate.id, snapshot);
    return duplicate;
  }

  // Same operation as duplicatePage() today — kept as a distinct method because "copy" and
  // "duplicate" are likely to diverge later (e.g. copy also placing the page on an
  // application-level clipboard for pasting into a different document), not because the
  // underlying behavior differs yet.
  copyPage(id: string): Promise<PageMeta> {
    return this.duplicatePage(id);
  }

  deletePage(id: string): void {
    const { pages, activePageId } = this.getState();
    if (pages.length <= 1) {
      throw new Error("Cannot delete the last remaining page");
    }
    const index = pages.findIndex((page) => page.id === id);
    if (index === -1) return;

    this.thumbnailCleanup.get(id)?.();
    this.thumbnailCleanup.delete(id);
    const timer = this.thumbnailTimers.get(id);
    if (timer) clearTimeout(timer);
    this.thumbnailTimers.delete(id);

    this.runtimes.get(id)?.engine.destroy();
    this.runtimes.delete(id);
    this.pendingSnapshots.delete(id);

    const remaining = pages.filter((page) => page.id !== id).map((page, i) => ({ ...page, order: i }));
    const nextActiveId =
      activePageId === id ? (remaining[Math.min(index, remaining.length - 1)]?.id ?? null) : activePageId;

    this.store.setState({ pages: remaining, activePageId: nextActiveId });
  }

  renamePage(id: string, name: string): void {
    this.patchMeta(id, { name });
  }

  reorderPages(fromIndex: number, toIndex: number): void {
    const { pages } = this.getState();
    if (
      fromIndex < 0 ||
      fromIndex >= pages.length ||
      toIndex < 0 ||
      toIndex >= pages.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const reordered = [...pages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    this.store.setState({ pages: reordered.map((page, i) => ({ ...page, order: i })) });
  }

  setLocked(id: string, locked: boolean): void {
    this.patchMeta(id, { locked });
    const engine = this.getEngine(id);
    if (!engine) return;
    // Locking is enforced at the Fabric canvas level rather than in CanvasEngine — no core
    // change needed, this is the same escape hatch every other plugin in this repo uses.
    engine.getFabricCanvas().set({ selection: !locked, evented: !locked });
  }

  setVisible(id: string, visible: boolean): void {
    this.patchMeta(id, { visible });
  }

  // Activates a page, creating its CanvasEngine on first activation. Callers (typically a React
  // binding re-pointing EditorContext.Provider's value) await this before rendering the target
  // page's chrome, since first activation may need to restore a pending snapshot.
  async setActivePage(id: string): Promise<CanvasEngine> {
    this.requireMeta(id);
    const engine = await this.getOrCreateEngine(id);
    this.store.setState({ activePageId: id });
    return engine;
  }

  // Moves objects by reference rather than cloning — the objects are removed from the source
  // page's undo-tracked history and added to the destination page's, so each side of the move is
  // independently undoable on its own page, consistent with per-page-scoped history.
  async moveObjectsBetweenPages(objectIds: string[], fromId: string, toId: string): Promise<void> {
    if (fromId === toId) return;
    const fromEngine = await this.getOrCreateEngine(fromId);
    const toEngine = await this.getOrCreateEngine(toId);

    const idSet = new Set(objectIds);
    const objects = fromEngine.layers.getObjects().filter((object) => idSet.has(getObjectId(object)));

    for (const object of objects) {
      fromEngine.removeObject(object);
      toEngine.addObject(object);
    }
  }

  // What to persist for this page right now, without forcing its engine to exist just to save an
  // untouched page. A live engine's current content wins; otherwise a not-yet-applied
  // duplicate/hydrate snapshot; otherwise undefined (nothing but the meta itself to persist).
  getSnapshotForPersistence(id: string): DocumentSnapshotData | undefined {
    const engine = this.getEngine(id);
    if (engine) return captureSnapshot(engine);
    return this.pendingSnapshots.get(id);
  }

  // Loads a previously-persisted page collection. Only valid on a manager with no pages yet —
  // like restoreSnapshot() in @rifrocket/fabricjs-design-tool, restoring is a consumer-level
  // decision (when to call this — first mount only, only if no template was explicitly chosen,
  // etc.) rather than something PagesManager does for you automatically. Page content is applied
  // lazily through the same pendingSnapshots path duplicatePage() uses, not eagerly.
  hydrate(data: { pages: PageMeta[]; snapshots?: Record<string, DocumentSnapshotData> }): void {
    if (this.getState().pages.length > 0) {
      throw new Error("hydrate() can only be called before any pages have been added");
    }
    const highestNumericId = data.pages.reduce((max, page) => {
      const match = /^page_(\d+)$/.exec(page.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    this.idCounter = Math.max(this.idCounter, highestNumericId);

    for (const [id, snapshot] of Object.entries(data.snapshots ?? {})) {
      this.pendingSnapshots.set(id, snapshot);
    }
    this.store.setState({ pages: data.pages, activePageId: null });
  }

  // Manual trigger for consumers that changed a page's content through a path this class doesn't
  // itself observe (mirrors plugin-local-storage's requestSave()). Automatic tracking is wired in
  // getOrCreateEngine() via wireThumbnailTracking().
  async refreshThumbnail(id: string): Promise<void> {
    const engine = this.getEngine(id);
    if (!engine) return;
    const meta = this.requireMeta(id);
    const snapshot = captureSnapshot(engine);
    const thumbnail = await renderSnapshotThumbnail(
      snapshot,
      { width: meta.width, height: meta.height },
      { maxDimension: this.thumbnailMaxDimension },
      this.offscreenCanvasFactory,
    );
    this.patchMeta(id, { thumbnail });
  }

  destroy(): void {
    this.thumbnailCleanup.forEach((cleanup) => cleanup());
    this.thumbnailCleanup.clear();
    this.thumbnailTimers.forEach((timer) => clearTimeout(timer));
    this.thumbnailTimers.clear();
    this.runtimes.forEach(({ engine }) => engine.destroy());
    this.runtimes.clear();
    this.pendingSnapshots.clear();
  }

  private requireMeta(id: string): PageMeta {
    const meta = this.getState().pages.find((page) => page.id === id);
    if (!meta) throw new Error(`No page with id "${id}"`);
    return meta;
  }

  private patchMeta(id: string, patch: Partial<PageMeta>): void {
    const { pages } = this.getState();
    this.store.setState({
      pages: pages.map((page) => (page.id === id ? { ...page, ...patch } : page)),
    });
  }

  private async getOrCreateEngine(id: string): Promise<CanvasEngine> {
    const existing = this.runtimes.get(id);
    if (existing) return existing.engine;

    const meta = this.requireMeta(id);
    const canvasEl = this.canvasElementFactory();
    const engine = this.engineFactory(canvasEl, {
      ...this.engineOptions,
      width: meta.width,
      height: meta.height,
      backgroundColor: meta.backgroundColor,
    });
    engine.useAll(this.plugins);
    this.runtimes.set(id, { canvasEl, engine });

    const pending = this.pendingSnapshots.get(id);
    if (pending) {
      // Real content (duplicated or hydrated from storage) always wins over a template — a
      // template is only ever a starting point for a page that has nothing else yet.
      await restoreSnapshot(engine, pending);
      this.pendingSnapshots.delete(id);
    } else {
      const template = meta.templateId ? this.templates[meta.templateId] : undefined;
      if (template) {
        await applyTemplateToEngine(engine, template);
      }
    }

    this.wireThumbnailTracking(id, engine);
    await this.refreshThumbnail(id);

    return engine;
  }

  // engine.store covers object add/remove and undo/redo; it does NOT cover interactive
  // drag/resize/rotate (Fabric commits those straight to the object, bypassing the engine) or
  // text edits — "object:modified"/"text:changed" cover that gap. Same split
  // plugin-local-storage's autosave uses, for the same reason.
  private wireThumbnailTracking(id: string, engine: CanvasEngine): void {
    const schedule = () => {
      const existing = this.thumbnailTimers.get(id);
      if (existing) clearTimeout(existing);
      this.thumbnailTimers.set(
        id,
        setTimeout(() => {
          this.thumbnailTimers.delete(id);
          void this.refreshThumbnail(id);
        }, this.thumbnailDebounceMs),
      );
    };

    const unsubscribeStore = engine.store.subscribe(schedule);
    const canvas = engine.getFabricCanvas();
    canvas.on("object:modified", schedule);
    canvas.on("text:changed", schedule);

    this.thumbnailCleanup.set(id, () => {
      unsubscribeStore();
      canvas.off("object:modified", schedule);
      canvas.off("text:changed", schedule);
    });
  }
}
