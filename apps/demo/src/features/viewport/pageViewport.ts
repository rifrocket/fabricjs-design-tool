import { captureSnapshot } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine, DocumentSnapshotData } from "@rifrocket/fabricjs-design-tool";
import { findPageBoundary } from "@rifrocket/fdt-plugin-pan-zoom";

// A plain captureSnapshot() would serialize the boundary rect as ordinary content, since
// isPageBoundary doesn't survive the round trip — left unhandled, that leaks one extra stale
// rect per reload. Toggling excludeFromExport just around this synchronous call keeps it out of
// the saved JSON without changing its real export behavior (see findPageBoundary's own note in
// @rifrocket/fdt-plugin-pan-zoom about why it isn't excludeFromExport permanently). Stays
// demo-local — tied to localStoragePlugin's single-document autosave, not a pan-zoom concern.
export function captureDesignSnapshot(engine: CanvasEngine): DocumentSnapshotData {
  const boundary = findPageBoundary(engine);
  const previous = boundary?.excludeFromExport;
  if (boundary) boundary.excludeFromExport = true;
  try {
    return captureSnapshot(engine);
  } finally {
    if (boundary) boundary.excludeFromExport = previous ?? false;
  }
}
