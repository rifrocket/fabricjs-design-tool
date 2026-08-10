import type { DesignDocument, DocumentSnapshotData } from "@rifrocket/fabricjs-design-tool";

export const DEFAULT_STORAGE_KEY = "fdt:document-snapshot";

// Narrow surface saveDesignToStorage/loadDesignFromStorage/clearSavedDesign need — injectable
// so callers (and this package's own tests) can fake it, since plain Node has no global
// localStorage the way a browser or jsdom does.
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// A saved design bundles the document content with whatever app-defined metadata should travel
// with it as one atomic unit — page dimensions, which template/preset was active, zoom/pan,
// anything else that answers "what did this design look like", not just "what's on the canvas".
// Without this, an app needing to remember any of that ends up building a second,
// independently-written-and-read persistence key of its own — which then has to be manually kept
// in lockstep with the content it describes, and can silently drift out of sync if something
// changes one without the other. `meta` is opaque to this package; see localStoragePlugin's
// captureMeta option for how it gets populated on save.
export interface StoredDesign<TMeta = unknown> {
  snapshot: DocumentSnapshotData;
  meta: TMeta | null;
}

// `typeof localStorage` is safe even where the identifier was never declared (unlike a bare
// reference, which would throw a ReferenceError) — that's what lets this fall back to null
// instead of crashing under SSR or plain Node.
function defaultStorage(): StorageLike | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

const SOLE_PAGE_ID = "page-1";

// Public shape (StoredDesign) is unchanged — callers keep thinking in terms of one document.
// What's actually written to storage, internally, is a one-page DesignDocument: the same shape
// @rifrocket/fdt-plugin-pages' own storage format is built on (see its persistence.ts), so a
// single-document save and a multi-page save are byte-compatible JSON, not two independently
// evolving formats. width/height/name are omitted on the page entry — this package has no
// concept of per-page physical dimensions (see DesignDocumentPage's own comment); an app that
// wants that already has its own captureMeta option for it.
function toDesignDocument<TMeta>(design: StoredDesign<TMeta>): DesignDocument<TMeta> {
  return {
    meta: design.meta,
    pages: [{ id: SOLE_PAGE_ID, order: 0, snapshot: design.snapshot }],
  };
}

function fromDesignDocument<TMeta>(document: DesignDocument<TMeta>): StoredDesign<TMeta> | null {
  const snapshot = document.pages[0]?.snapshot;
  if (!snapshot) return null;
  return { snapshot, meta: document.meta ?? null };
}

// Best-effort: a failed autosave (quota exceeded, storage disabled in a private tab, a
// non-serializable value slipping into the snapshot or meta) should never surface as an error to
// the caller — the live canvas is still correct, only the backup write was skipped.
export function saveDesignToStorage<TMeta = unknown>(
  design: StoredDesign<TMeta>,
  key: string = DEFAULT_STORAGE_KEY,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(toDesignDocument(design)));
  } catch {
    // Ignored — see comment above.
  }
}

// Returns null both when nothing was ever saved and when what's stored can't be used (missing
// storage, invalid JSON, or JSON that isn't a usable DesignDocument) — callers shouldn't need to
// distinguish "no design" from "unusable design", since either way there's nothing to restore.
// Also returns null for a pre-existing entry saved under the old flat { snapshot, meta } shape —
// same "unusable data -> null" contract, no explicit migration of old entries.
export function loadDesignFromStorage<TMeta = unknown>(
  key: string = DEFAULT_STORAGE_KEY,
  storage: StorageLike | null = defaultStorage(),
): StoredDesign<TMeta> | null {
  if (!storage) return null;
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DesignDocument<TMeta>> | null;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.pages)) return null;
    return fromDesignDocument({ meta: parsed.meta ?? null, pages: parsed.pages });
  } catch {
    return null;
  }
}

export function clearSavedDesign(key: string = DEFAULT_STORAGE_KEY, storage: StorageLike | null = defaultStorage()): void {
  storage?.removeItem(key);
}
