import { describe, expect, it } from "vitest";
import { createDocumentSession } from "./documentSession";
import { InMemoryAssetStore } from "../assets/assetStore";
import type { DesignDocument } from "./designDocument";

function createEmptyDocument(): DesignDocument {
  return { meta: null, pages: [] };
}

describe("createDocumentSession", () => {
  it("defaults to a fresh InMemoryAssetStore and no shared history (matches today's per-page default)", () => {
    const session = createDocumentSession({ document: createEmptyDocument() });

    expect(session.assets).toBeInstanceOf(InMemoryAssetStore);
    expect(session.history).toBeUndefined();
  });

  it("uses a provided AssetStore instead of constructing a new one", () => {
    const assets = new InMemoryAssetStore();
    const session = createDocumentSession({ document: createEmptyDocument(), assets });

    expect(session.assets).toBe(assets);
  });

  it("history: { scope: 'document' } constructs a shared HistoryManager", () => {
    const session = createDocumentSession({
      document: createEmptyDocument(),
      history: { scope: "document" },
    });

    expect(session.history).toBeDefined();
  });

  it("history: { scope: 'per-renderer' } leaves history undefined, same as the default", () => {
    const session = createDocumentSession({
      document: createEmptyDocument(),
      history: { scope: "per-renderer" },
    });

    expect(session.history).toBeUndefined();
  });

  it("carries through the provided document unchanged", () => {
    const document = createEmptyDocument();
    const session = createDocumentSession({ document });

    expect(session.document).toBe(document);
  });
});
