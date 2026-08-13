import {
  Store,
  createEngine,
  getObjectId,
  getSerializedProperties,
  captureSnapshot as captureDocumentSnapshot,
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
import type {
  CanvasElementFactory,
  NewPageInit,
  NewPagePairInit,
  PageMeta,
  PagesManagerOptions,
  PagesState,
} from "./types";
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
  private readonly onContentChange: PagesManagerOptions["onContentChange"];
  private readonly captureSnapshot: (engine: CanvasEngine) => DocumentSnapshotData;

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
    this.onContentChange = options.onContentChange;
    this.captureSnapshot = options.captureSnapshot ?? captureDocumentSnapshot;
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

  // The configured cap addPage() enforces — lets UI (e.g. PageTabsBar) disable its "add page"
  // affordance at the real configured limit instead of duplicating it as a second constant.
  getMaxPages(): number {
    return this.maxPages;
  }

  // Undefined until the page has been activated at least once — see class comment on lazy
  // creation. Use setActivePage() to both create-if-needed and activate.
  getEngine(id: string): CanvasEngine | undefined {
    return this.runtimes.get(id)?.engine;
  }

  // undefined both for a freestanding page and for a dangling pairId with no live sibling (the
  // latter shouldn't occur — see deletePage()'s auto-unpair — but this stays defensive rather
  // than throwing, since it's a read, not a mutation).
  getPairSibling(id: string): PageMeta | undefined {
    const meta = this.requireMeta(id);
    if (!meta.pairId) return undefined;
    return this.getState().pages.find((page) => page.pairId === meta.pairId && page.id !== meta.id);
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

  // Creates a front+back pair in one call. Capacity is checked up front for *both* slots before
  // either side is created, so a manager with only 1 slot free never ends up with a dangling,
  // unpaired front half. The back page is pinned to the front page's *resolved* width/height
  // (not init.width/height directly) so the two sides end up genuinely identical even when the
  // size came from a template default rather than an explicit init value. pairId reuses the
  // front page's own id rather than a separate id scheme — no new state to keep in sync.
  addPagePair(init: NewPagePairInit = {}): { front: PageMeta; back: PageMeta } {
    const remaining = this.maxPages - this.getState().pages.length;
    if (remaining < 2) {
      throw new Error(
        `Cannot add a page pair: only ${remaining} of ${this.maxPages} page slots remain (a pair needs 2)`,
      );
    }

    const front = this.addPage({
      name: init.front?.name ?? init.name,
      width: init.width,
      height: init.height,
      backgroundColor: init.front?.backgroundColor ?? init.backgroundColor,
      templateId: init.front?.templateId,
    });
    const back = this.addPage({
      name: init.back?.name ?? init.name,
      width: front.width,
      height: front.height,
      backgroundColor: init.back?.backgroundColor ?? init.backgroundColor,
      templateId: init.back?.templateId,
    });

    const pairId = front.id;
    const frontName = init.front?.name ?? `${front.name} (Front)`;
    const backName = init.back?.name ?? `${back.name} (Back)`;
    this.patchMeta(front.id, { pairId, pairSide: "front", name: frontName });
    this.patchMeta(back.id, { pairId, pairSide: "back", name: backName });

    return { front: this.requireMeta(front.id), back: this.requireMeta(back.id) };
  }

  // Captures the source page's content (creating its engine first if it hasn't been activated
  // yet) and carries it over to the new page, applied lazily when the new page's own engine is
  // created — see pendingSnapshots.
  async duplicatePage(id: string): Promise<PageMeta> {
    const source = this.requireMeta(id);
    const sourceEngine = await this.getOrCreateEngine(source.id);
    const snapshot = this.captureSnapshot(sourceEngine);

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

  // Duplicates both sides of a pair together, producing a *fresh* pairId (the new front page's
  // id) rather than reusing the source pair's — matching how plain duplicatePage() never reuses
  // the source page's own id. Capacity is checked up front, before any engine/snapshot work, for
  // the same fail-fast reason addPagePair() checks it early.
  async duplicatePagePair(id: string): Promise<{ front: PageMeta; back: PageMeta }> {
    const meta = this.requireMeta(id);
    if (!meta.pairId) {
      throw new Error(`Page "${id}" is not part of a pair; use duplicatePage() instead`);
    }
    const sibling = this.getPairSibling(id);
    if (!sibling) {
      throw new Error(`Page "${id}" has a dangling pairId with no sibling`);
    }

    const remaining = this.maxPages - this.getState().pages.length;
    if (remaining < 2) {
      throw new Error(
        `Cannot duplicate page pair: only ${remaining} of ${this.maxPages} page slots remain (a pair needs 2)`,
      );
    }

    const [frontSource, backSource] = meta.pairSide === "front" ? [meta, sibling] : [sibling, meta];
    const frontSnapshot = this.captureSnapshot(await this.getOrCreateEngine(frontSource.id));
    const backSnapshot = this.captureSnapshot(await this.getOrCreateEngine(backSource.id));

    const front = this.addPage({
      name: `${frontSource.name} copy`,
      width: frontSource.width,
      height: frontSource.height,
      backgroundColor: frontSource.backgroundColor,
    });
    this.pendingSnapshots.set(front.id, frontSnapshot);

    const back = this.addPage({
      name: `${backSource.name} copy`,
      width: backSource.width,
      height: backSource.height,
      backgroundColor: backSource.backgroundColor,
    });
    this.pendingSnapshots.set(back.id, backSnapshot);

    const pairId = front.id;
    this.patchMeta(front.id, { pairId, pairSide: "front" });
    this.patchMeta(back.id, { pairId, pairSide: "back" });

    return { front: this.requireMeta(front.id), back: this.requireMeta(back.id) };
  }

  // The supported bridge for "make my existing document page 1" migrations — adopts a snapshot
  // the caller already has (typically captureSnapshot() run against a single-CanvasEngine app
  // being migrated onto plugin-pages) as a new page, via the exact same lazy-apply mechanism
  // duplicatePage()/hydrate() already use (pendingSnapshots), just sourced externally instead of
  // captured from one of this manager's own pages. Unlike hydrate(), this does not require the
  // manager to have zero pages — it's just addPage() plus a pending snapshot, so it composes
  // with pages that already exist.
  seedFromDocument(snapshot: DocumentSnapshotData, init: NewPageInit = {}): PageMeta {
    const page = this.addPage(init);
    this.pendingSnapshots.set(page.id, snapshot);
    return page;
  }

  // The reverse of seedFromDocument() — collapses one page back to a plain single-document
  // payload (typically to hand to restoreSnapshot() against a single-CanvasEngine app moving off
  // plugin-pages). Defaults to the lowest-`order` page when pageId is omitted, so "give me the
  // document" has a sensible answer without the caller needing to know a specific page id.
  // Returns undefined only when the manager has no pages at all and none was specified; an
  // unknown pageId throws via requireMeta(), consistent with this class's other id-taking methods.
  exportPageAsDocument(
    pageId?: string,
  ): { snapshot: DocumentSnapshotData; page: Pick<PageMeta, "name" | "width" | "height" | "backgroundColor"> } | undefined {
    const { pages } = this.getState();
    const meta = pageId
      ? this.requireMeta(pageId)
      : [...pages].sort((a, b) => a.order - b.order)[0];
    if (!meta) return undefined;

    const snapshot = this.getSnapshotForPersistence(meta.id);
    return {
      // An untouched page (never activated, no pending snapshot) collapses to a blank document
      // rather than leaving the caller to special-case "no content" — { objects: [] } is the same
      // empty-canvas shape a real, activated-but-untouched page's own snapshot would have.
      snapshot: snapshot ?? { json: { objects: [] }, backgroundColor: meta.backgroundColor ?? "#ffffff" },
      page: { name: meta.name, width: meta.width, height: meta.height, backgroundColor: meta.backgroundColor },
    };
  }

  deletePage(id: string): void {
    const { pages } = this.getState();
    if (pages.length <= 1) {
      throw new Error("Cannot delete the last remaining page");
    }
    const meta = pages.find((page) => page.id === id);
    if (!meta) return;

    this.removePages([id]);

    // Auto-unpair the sibling — otherwise it's left carrying a pairId/pairSide pointing at a
    // page that no longer exists. Handled here, inside the plain single-page method, so the
    // invariant ("pairId always resolves to a real sibling, or is undefined") holds for every
    // caller, not only PageTabsBar's pair-aware UI wiring.
    if (meta.pairId) {
      const sibling = pages.find((page) => page.pairId === meta.pairId && page.id !== meta.id);
      if (sibling) this.patchMeta(sibling.id, { pairId: undefined, pairSide: undefined });
    }
  }

  // Deletes both sides of a pair atomically. Can't be built from two deletePage() calls: its own
  // "can't delete the last page" guard checks pages.length at call time, which would let the
  // first side through and then throw on the second when exactly the pair's own two pages
  // remain, leaving a half-deleted state. removePages() (below) does the actual batch removal
  // with no such guard; this method owns the combined-removal validation instead.
  deletePagePair(id: string): void {
    const meta = this.requireMeta(id);
    if (!meta.pairId) {
      throw new Error(`Page "${id}" is not part of a pair; use deletePage() instead`);
    }

    const { pages } = this.getState();
    const sibling = pages.find((page) => page.pairId === meta.pairId && page.id !== meta.id);
    const idsToDelete = sibling ? [meta.id, sibling.id] : [meta.id];

    if (pages.length - idsToDelete.length < 1) {
      throw new Error("Cannot delete the last remaining page");
    }
    this.removePages(idsToDelete);
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
    // Locking is enforced at the Fabric canvas level (selection/evented interactivity flags) —
    // no RendererApi equivalent exists for this, and a future renderer would implement "locking"
    // differently, not identically, so there's no shared member to converge on yet
    // (FUTURE_IMPLEMENTATION.md Chunk 8.3).
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

  // Clones rather than moves — the source page keeps its own copy. Primary use case: sharing an
  // asset (e.g. a logo) between the front and back of a pair without re-uploading it. Uses
  // object.clone(getSerializedProperties()) — the same core primitive
  // @rifrocket/fdt-plugin-clipboard's cloneFabricObject uses — rather than a bare object.clone(),
  // since Fabric's clone() only carries over properties explicitly passed to it; a bare clone()
  // would silently drop custom registered properties like shapeKind or an effect stack, the same
  // bug class already fixed for JSON export/snapshot capture.
  async copyObjectsBetweenPages(objectIds: string[], fromId: string, toId: string): Promise<void> {
    if (fromId === toId) return;
    const fromEngine = await this.getOrCreateEngine(fromId);
    const toEngine = await this.getOrCreateEngine(toId);

    const idSet = new Set(objectIds);
    const objects = fromEngine.layers.getObjects().filter((object) => idSet.has(getObjectId(object)));

    for (const object of objects) {
      const clone = await object.clone(getSerializedProperties());
      toEngine.addObject(clone);
    }
  }

  // What to persist for this page right now, without forcing its engine to exist just to save an
  // untouched page. A live engine's current content wins; otherwise a not-yet-applied
  // duplicate/hydrate snapshot; otherwise undefined (nothing but the meta itself to persist).
  getSnapshotForPersistence(id: string): DocumentSnapshotData | undefined {
    const engine = this.getEngine(id);
    if (engine) return this.captureSnapshot(engine);
    return this.pendingSnapshots.get(id);
  }

  // Loads a previously-persisted page collection — round-trips this manager's own storage
  // format (PageMeta[] + a DocumentSnapshotData per page id). For adopting a single *foreign*
  // document (e.g. migrating an existing single-CanvasEngine app onto plugin-pages), use
  // seedFromDocument() instead — hydrate() is for restoring plugin-pages' own prior state, not
  // for constructing that state from scratch. Only valid on a manager with no pages yet — like
  // restoreSnapshot() in @rifrocket/fabricjs-design-tool, restoring is a consumer-level decision
  // (when to call this — first mount only, only if no template was explicitly chosen, etc.)
  // rather than something PagesManager does for you automatically. Page content is applied
  // lazily through the same pendingSnapshots path duplicatePage()/seedFromDocument() use, not
  // eagerly.
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
    const snapshot = this.captureSnapshot(engine);
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

  // Batch removal with no "last page" guard of its own — deletePage()/deletePagePair() each own
  // that validation for their respective single/paired cases, then call this to actually tear
  // down runtimes/timers/pending snapshots and update the store in one atomic write.
  private removePages(ids: readonly string[]): void {
    const { pages, activePageId } = this.getState();
    const idSet = new Set(ids);

    for (const id of ids) {
      this.thumbnailCleanup.get(id)?.();
      this.thumbnailCleanup.delete(id);
      const timer = this.thumbnailTimers.get(id);
      if (timer) clearTimeout(timer);
      this.thumbnailTimers.delete(id);

      this.runtimes.get(id)?.engine.destroy();
      this.runtimes.delete(id);
      this.pendingSnapshots.delete(id);
    }

    const activeIndex = activePageId ? pages.findIndex((page) => page.id === activePageId) : -1;
    const remaining = pages.filter((page) => !idSet.has(page.id)).map((page, i) => ({ ...page, order: i }));
    const nextActiveId =
      activePageId && idSet.has(activePageId)
        ? (remaining[Math.min(activeIndex, remaining.length - 1)]?.id ?? null)
        : activePageId;

    this.store.setState({ pages: remaining, activePageId: nextActiveId });
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
  // plugin-local-storage's autosave uses, for the same reason. Stays on getFabricCanvas():
  // RendererApi has no event-subscription surface at all (FUTURE_IMPLEMENTATION.md Chunk 8.3).
  private wireThumbnailTracking(id: string, engine: CanvasEngine): void {
    const schedule = () => {
      // Fired undebounced, on every trigger — onContentChange consumers (e.g. <MultiPageDesignEditor
      // autosave>) apply their own debounce rather than sharing this method's thumbnail-specific
      // one, since the two concerns can legitimately want different cadences.
      this.onContentChange?.(id, this);

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
