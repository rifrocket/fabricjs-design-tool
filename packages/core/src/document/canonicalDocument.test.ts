import { describe, expect, it } from "vitest";
import type { CanonicalDocument, CanonicalNode, CanonicalPage, PortableNodeProperties } from "./canonicalDocument";
import { loadCanonicalDocument, migrateCanonicalDocument, saveCanonicalDocument } from "./canonicalDocument";

// Chunk 6.1 (FUTURE_IMPLEMENTATION.md): purely a type-level check that literal values of each
// canonical shape are constructible and structurally sound — no runtime logic exists yet.
describe("canonical document types", () => {
  it("constructs a CanonicalNode with the expected shape, including optional children/metadata", () => {
    const properties: PortableNodeProperties = { left: 10, top: 20, fill: "#ff0000" };
    const child: CanonicalNode = { id: "child_1", typeId: "rect", properties };
    const node: CanonicalNode = {
      id: "node_1",
      typeId: "group",
      properties,
      children: [child],
      metadata: { layerName: "Background" },
    };

    expect(node.id).toBe("node_1");
    expect(node.children).toEqual([child]);
    expect(node.metadata).toEqual({ layerName: "Background" });
  });

  it("constructs a CanonicalPage with a page-scoped rendererId", () => {
    const page: CanonicalPage = {
      id: "page_1",
      rendererId: "fabric",
      nodes: [{ id: "node_1", typeId: "rect", properties: {} }],
    };

    expect(page.rendererId).toBe("fabric");
    expect(page.nodes).toHaveLength(1);
  });

  it("constructs a CanonicalDocument spanning multiple pages with different rendererIds", () => {
    const doc: CanonicalDocument = {
      schemaVersion: 1,
      pages: [
        { id: "page_1", rendererId: "fabric", nodes: [] },
        { id: "page_2", rendererId: "three", nodes: [] },
      ],
      assets: [{ id: "asset_1", kind: "image", url: "https://example.com/a.png" }],
    };

    expect(doc.pages.map((page) => page.rendererId)).toEqual(["fabric", "three"]);
    expect(doc.assets).toHaveLength(1);
  });
});

// Chunk 6.2: renderer-free document I/O. This is the concrete check for "document independent
// of renderer" — no RendererApi, CanvasEngine, or fabric import anywhere in this test file.
describe("loadCanonicalDocument / saveCanonicalDocument", () => {
  function createSampleDocument(): CanonicalDocument {
    return {
      schemaVersion: 1,
      pages: [
        {
          id: "page_1",
          rendererId: "fabric",
          nodes: [
            {
              id: "node_1",
              typeId: "rect",
              properties: { left: 10, top: 20 },
              children: [{ id: "node_1a", typeId: "rect", properties: {} }],
              metadata: { layerName: "Background" },
            },
          ],
        },
      ],
      assets: [{ id: "asset_1", kind: "image", url: "https://example.com/a.png" }],
    };
  }

  it("round-trips a document through saveCanonicalDocument -> loadCanonicalDocument unchanged", () => {
    const original = createSampleDocument();

    const saved = saveCanonicalDocument(original);
    const loaded = loadCanonicalDocument(saved);

    expect(loaded).toEqual(original);
  });

  it("loadCanonicalDocument rejects a non-object", () => {
    expect(() => loadCanonicalDocument(null)).toThrow("expected an object");
    expect(() => loadCanonicalDocument("nope")).toThrow("expected an object");
  });

  it("loadCanonicalDocument rejects a missing/wrong-typed schemaVersion", () => {
    expect(() => loadCanonicalDocument({ pages: [], assets: [] })).toThrow("schemaVersion");
  });

  it("loadCanonicalDocument rejects a page missing rendererId", () => {
    const malformed = { schemaVersion: 1, pages: [{ id: "page_1", nodes: [] }], assets: [] };
    expect(() => loadCanonicalDocument(malformed)).toThrow("rendererId");
  });

  it("loadCanonicalDocument rejects a node missing typeId, nested inside children", () => {
    const malformed = {
      schemaVersion: 1,
      pages: [
        {
          id: "page_1",
          rendererId: "fabric",
          nodes: [{ id: "node_1", typeId: "rect", properties: {}, children: [{ id: "bad", properties: {} }] }],
        },
      ],
      assets: [],
    };
    expect(() => loadCanonicalDocument(malformed)).toThrow("typeId");
  });
});

describe("migrateCanonicalDocument", () => {
  it("returns the document unchanged when already at the target version", () => {
    const doc: CanonicalDocument = { schemaVersion: 1, pages: [], assets: [] };
    expect(migrateCanonicalDocument(doc, 1)).toBe(doc);
  });

  it("throws for a version with no defined migration path", () => {
    const doc: CanonicalDocument = { schemaVersion: 1, pages: [], assets: [] };
    expect(() => migrateCanonicalDocument(doc, 2)).toThrow("No migration path from schemaVersion 1 to 2");
  });
});
