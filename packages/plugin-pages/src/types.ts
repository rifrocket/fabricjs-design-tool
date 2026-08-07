import type {
  EditorPlugin,
  EditorPreset,
  EngineOptions,
  OffscreenCanvasFactory,
  PluginOverrides,
} from "@rifrocket/fabricjs-design-tool";
import type { TemplateDefinition } from "./templates";

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
  // Links a front/back pair — see PagesManager's pairing helpers. Two PageMeta rows sharing a
  // pairId are the two sides of one physical document, not two independent pages.
  pairId?: string;
  side?: "front" | "back";
  // When true, resizing either side of a pair resizes the other to match.
  linkedDimensions?: boolean;
  thumbnail?: string;
}

export type NewPageInit = Partial<Pick<PageMeta, "name" | "width" | "height" | "backgroundColor" | "templateId">>;

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
}

// What PagesManager needs to mount a page's canvas off-DOM until it's activated. The consumer
// (typically a React binding) owns actually inserting/removing this element from the document;
// PagesManager only needs one to construct a CanvasEngine against.
export type CanvasElementFactory = () => HTMLCanvasElement;
