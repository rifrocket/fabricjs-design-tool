// Minimal structural contract letting ObjectTypeRegistry/Commands (FUTURE_IMPLEMENTATION.md
// Stages 1/3) be generic over "some live, renderer-owned object" without a wrapper/adapter
// class. FabricObject already satisfies this shape structurally — no adapter code needed.
//
// SceneNode is an interoperability constraint for this refactor, not the canonical scene-node
// representation. The real renderer-neutral node shape a document stores is CanonicalNode
// (Stage 6's canonicalDocument.ts), which is plain data, not a get/set handle. Don't build
// further abstractions on top of node.get("foo")/node.set("foo", bar) as if it were the
// framework's real object model — it isn't.
export interface SceneNode {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
}
