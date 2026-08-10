import type {
  CanvasEngine,
  DocumentSnapshotData,
  EditorPlugin,
  EditorPreset,
  EngineOptions,
  OffscreenCanvasFactory,
  PluginOverrides,
} from "@rifrocket/fabricjs-design-tool";
import type { TemplateDefinition } from "./templates";
import type { PagesManager } from "./PagesManager";

export interface PageMeta {
  id: string;
  name: string;
  order: number;
  width: number;
  height: number;
  backgroundColor?: string;
  locked?: boolean;
  visible?: boolean;
  templateId?: string;
  thumbnail?: string;
  // Front/back pairing (business cards, ID cards, invitations, certificates, flyers, brochures,
  // packaging, product labels). Both undefined for a freestanding page. pairId always equals the
  // *front* side's own PageMeta.id — no separate pair-id counter/namespace is needed. The two
  // fields are always set/cleared together — see PagesManager.addPagePair()/deletePage()'s
  // auto-unpair. Pairs start adjacent at creation but reorderPages()/drag stays free-form and
  // unconstrained, so a pair can end up non-adjacent — consumers must not assume adjacency.
  pairId?: string;
  pairSide?: "front" | "back";
}

export type NewPageInit = Partial<Pick<PageMeta, "name" | "width" | "height" | "backgroundColor" | "templateId">>;

// width/height/name/backgroundColor are shared across both sides — this is what "linked
// dimensions" means in practice, since there is no API to resize a page after creation for any
// page today (see PagesManager class comment). front/back only override the fields that
// legitimately differ per side (name, background, starter template).
export interface NewPagePairInit {
  width?: number;
  height?: number;
  name?: string;
  backgroundColor?: string;
  front?: Partial<Pick<NewPageInit, "name" | "backgroundColor" | "templateId">>;
  back?: Partial<Pick<NewPageInit, "name" | "backgroundColor" | "templateId">>;
}

export interface PagesState {
  pages: PageMeta[];
  activePageId: string | null;
}

export interface PagesManagerOptions {
  // Hard cap on page count. Required rather than optional — "infinite pages" was explicitly
  // ruled out in favor of a bounded pool of live CanvasEngine instances, so every consumer must
  // make this call rather than getting an implicit unbounded default.
  maxPages: number;
  // Only a literal EditorPreset object or "none" (the default) — mirrors CreateEditorOptions.preset
  // in @rifrocket/fabricjs-design-tool exactly, for the same reason: PagesManager can't depend on
  // plugin packages, so named presets like "default"/"minimal" only exist one layer up, via
  // usePages()/PagesProvider's own `preset` option (see react/usePages.ts), which accepts those
  // strings and resolves them to a literal object before construction.
  preset?: EditorPreset | "none";
  // Installed on every page's CanvasEngine via useAll(), so all pages behave identically
  // (same shapes/effects/alignment/snapping) regardless of which page's engine is active.
  //
  // When `preset` is set, this is treated as PluginOverrides resolved against it — a plain array
  // here is shorthand for `{ add: array }`, i.e. appended to the preset's plugins, not a
  // replacement of them. When `preset` is omitted (or "none"), an array here is used as-is as the
  // final flat list — the original, backward-compatible shape every existing caller uses.
  plugins?: EditorPlugin[] | PluginOverrides;
  engineOptions?: Omit<EngineOptions, "width" | "height">;
  // Looked up by PageMeta.templateId when a page's engine is first created — see
  // PagesManager.getOrCreateEngine() and applyTemplateToEngine() in templates.ts. Optional: a
  // page with no matching template (or no templateId at all) just opens blank, as today.
  templates?: Record<string, TemplateDefinition>;
  // Defaults to document.createElement("canvas"). Injectable for the same reason engineFactory
  // is — it lets tests (and non-browser hosts) avoid a real DOM.
  canvasElementFactory?: CanvasElementFactory;
  thumbnails?: {
    maxDimension?: number;
    // How long to wait after the last change on a page before re-rendering its thumbnail —
    // batches bursts (drag, a sequence of undo/redo) into one render instead of one per event,
    // same rationale as plugin-local-storage's autosave debounce.
    debounceMs?: number;
    // Passed through to renderSnapshotThumbnail(); only needed to fake canvas rendering in tests
    // (see @rifrocket/fabricjs-design-tool's OffscreenCanvasFactory) — leave unset in real usage.
    offscreenCanvasFactory?: OffscreenCanvasFactory;
  };
  // Fired, undebounced, on the same events (engine.store change / object:modified / text:changed)
  // that already drive per-page thumbnail tracking — reuses that existing listener wiring rather
  // than a consumer duplicating it. This is the documented, intended extension point
  // persistence.ts's own savePagesToStorage() comment anticipates ("a consumer that wants
  // autosave should call this from its own debounced handler ... subscribed to ... each activated
  // page's content changes"): apply your own debounce, then call savePagesToStorage(manager). The
  // manager is passed as the second argument so a consumer doesn't need an external reference to
  // it — see @rifrocket/fdt-plugin-pages/react's <MultiPageDesignEditor autosave> for the
  // reference implementation.
  onContentChange?: (pageId: string, manager: PagesManager) => void;
  // Overrides how a snapshot is captured for duplicatePage()/getSnapshotForPersistence()/
  // refreshThumbnail() (the same three internal call sites — see PagesManager). Defaults to
  // @rifrocket/fabricjs-design-tool's plain captureSnapshot(engine). PagesManager can't depend on
  // @rifrocket/fdt-plugin-pan-zoom (that would be the same kind of circular/cross-plugin coupling
  // builtinPresets.ts's comment describes for @rifrocket/fdt-react), so a consumer whose page
  // engines draw their own non-content chrome — e.g. plugin-pan-zoom's page-boundary rect — needs
  // to supply plugin-pan-zoom's captureSnapshotExcludingBoundary here explicitly, the same way
  // @rifrocket/fdt-plugin-local-storage's own captureSnapshot option works.
  captureSnapshot?: (engine: CanvasEngine) => DocumentSnapshotData;
}

// What PagesManager needs to mount a page's canvas off-DOM until it's activated. The consumer
// (typically a React binding) owns actually inserting/removing this element from the document;
// PagesManager only needs one to construct a CanvasEngine against.
export type CanvasElementFactory = () => HTMLCanvasElement;
