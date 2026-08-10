import type { DocumentSnapshotData } from "./snapshot";

// The shared page/document vocabulary both single-document persistence
// (@rifrocket/fdt-plugin-local-storage) and multi-page persistence (@rifrocket/fdt-plugin-pages)
// build their on-disk storage format on, so a saved design is the same shape regardless of which
// one produced it — a single document is just a DesignDocument with one page. Deliberately not
// tied to either package's own richer runtime metadata (PageMeta's locked/visible/templateId/
// thumbnail/pairing fields, for example) — this is the persisted-content shape, not a runtime
// manager's own state.
export interface DesignDocumentPage {
  id: string;
  order: number;
  // Optional rather than required: plugin-pages always populates these (every PageMeta carries
  // them), but plugin-local-storage has no equivalent concept of per-page physical dimensions
  // today — forcing it to fabricate values here would be worse than omitting them.
  name?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  snapshot?: DocumentSnapshotData;
}

export interface DesignDocument<TMeta = unknown> {
  meta: TMeta | null;
  pages: DesignDocumentPage[];
}
