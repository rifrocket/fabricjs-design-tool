import type { DesignDocument } from "./designDocument";
import type { AssetStore } from "../assets/assetStore";
import { InMemoryAssetStore } from "../assets/assetStore";
import { HistoryManager } from "../history/historyManager";

// Owns document data, shared assets, and (only when explicitly opted into) shared history —
// correct ownership for a multi-page document, where assets must be shared across pages and
// history ownership is a real per-product decision, not an accident of construction order
// (FUTURE_IMPLEMENTATION.md Chunk 4.2).
//
// Preferred long-term direction, not enforced: Editor -> DocumentSession -> { CanvasEngine per
// page }, rather than constructing independent CanvasEngines with no shared session. Bare
// createEditor()/createEngine() remains fully supported for existing single-document consumers.
export interface DocumentSession {
  readonly document: DesignDocument;
  readonly assets: AssetStore;
  // Present only when history.scope === "document" (see DocumentSessionOptions below);
  // per-page consumers (e.g. today's plugin-pages default) manage their own HistoryManager per
  // CanvasEngine instead — this field stays undefined in that case, preserving plugin-pages'
  // existing, deliberately-designed per-page-history behavior exactly.
  readonly history?: HistoryManager;
}

export interface DocumentSessionOptions {
  document: DesignDocument;
  // Default "per-renderer" matches today's plugin-pages behavior — each CanvasEngine keeps
  // constructing its own HistoryManager, DocumentSession.history stays undefined. "document"
  // opts into one shared HistoryManager across every renderer this session is wired into.
  history?: { scope: "document" } | { scope: "per-renderer" };
  assets?: AssetStore;
}

export function createDocumentSession(options: DocumentSessionOptions): DocumentSession {
  return {
    document: options.document,
    assets: options.assets ?? new InMemoryAssetStore(),
    history: options.history?.scope === "document" ? new HistoryManager() : undefined,
  };
}
