import type { DocumentSnapshotData } from "@rifrocket/fabricjs-design-tool";
import type { PageMeta } from "./types";
import type { PagesManager } from "./PagesManager";

export const DEFAULT_PAGES_STORAGE_KEY = "fdt:pages";

// Narrow surface these functions need — injectable so tests (and this package's own tests) can
// fake it, since plain Node has no global localStorage the way a browser or jsdom does. Mirrors
// plugin-local-storage's StorageLike; duplicated rather than imported so this package doesn't
// take on a dependency for one interface shape.
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PagesStorageData {
  pages: PageMeta[];
  snapshots: Record<string, DocumentSnapshotData>;
}

// `typeof localStorage` is safe even where the identifier was never declared (unlike a bare
// reference, which would throw a ReferenceError) — lets this fall back to null under SSR or
// plain Node instead of crashing.
function defaultStorage(): StorageLike | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

// Snapshots every page's current content without forcing untouched pages' engines to exist —
// see PagesManager.getSnapshotForPersistence(). A page with neither a live engine nor a pending
// snapshot (added but never opened or edited) is included in `pages` with no entry in
// `snapshots`; hydrate() leaves such a page blank, same as addPage() would have.
export function capturePagesSnapshot(manager: PagesManager): PagesStorageData {
  const pages = manager.getPages();
  const snapshots: Record<string, DocumentSnapshotData> = {};
  for (const page of pages) {
    const snapshot = manager.getSnapshotForPersistence(page.id);
    if (snapshot) snapshots[page.id] = snapshot;
  }
  return { pages, snapshots };
}

// Deliberately manual/on-demand rather than auto-debounced on every change — a consumer that
// wants autosave should call this from its own debounced handler (e.g. subscribed to
// manager.store and to each activated page's content changes), the same way an app wires up
// plugin-local-storage's autosave today. Best-effort: a failed write (quota exceeded, storage
// disabled in a private tab) never surfaces as an error — the live pages are still correct, only
// the backup write was skipped.
export function savePagesToStorage(
  manager: PagesManager,
  key: string = DEFAULT_PAGES_STORAGE_KEY,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(capturePagesSnapshot(manager)));
  } catch {
    // Ignored — see comment above.
  }
}

// Returns null both when nothing was ever saved and when what's stored can't be used (missing
// storage, invalid JSON, or JSON that isn't a { pages: [...] } object) — callers shouldn't need
// to distinguish "nothing saved" from "unusable data", since either way there's nothing to
// restore. Pass the result straight to PagesManager.hydrate().
export function loadPagesFromStorage(
  key: string = DEFAULT_PAGES_STORAGE_KEY,
  storage: StorageLike | null = defaultStorage(),
): PagesStorageData | null {
  if (!storage) return null;
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PagesStorageData> | null;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.pages)) return null;
    return { pages: parsed.pages, snapshots: parsed.snapshots ?? {} };
  } catch {
    return null;
  }
}

export function clearSavedPages(
  key: string = DEFAULT_PAGES_STORAGE_KEY,
  storage: StorageLike | null = defaultStorage(),
): void {
  storage?.removeItem(key);
}
