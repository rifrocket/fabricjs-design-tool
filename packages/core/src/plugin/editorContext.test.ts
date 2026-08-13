import { describe, expect, it } from "vitest";
import type { FabricObject } from "fabric";
import { CanvasEngine } from "../engine/canvasEngine";
import type { EditorContext } from "./editorContext";

// Compile-time proof, evaluated purely at the type level: if CanvasEngine ever stopped
// structurally satisfying EditorContext<FabricObject>, this type would resolve to `never` and
// the assignment below would fail to compile — the real check (FUTURE_IMPLEMENTATION.md Chunk
// 3.1), not just a runtime assertion. Needs no working fabric.Canvas (unavailable in this
// package's test environment — see canvasEngine.integration.test.ts's FakeCanvas comment) since
// no CanvasEngine instance is ever constructed here.
type AssertCanvasEngineIsEditorContext = CanvasEngine extends EditorContext<FabricObject> ? true : never;

const EDITOR_CONTEXT_METHODS = [
  "use",
  "useAll",
  "unuse",
  "hasPlugin",
  "createObject",
  "addObjectOfType",
  "addObject",
  "removeObject",
  "deleteSelection",
  "setObjectProperty",
  "undo",
  "redo",
] as const satisfies readonly (keyof EditorContext)[];

describe("EditorContext", () => {
  it("CanvasEngine structurally satisfies EditorContext<FabricObject> (compile-time)", () => {
    const satisfiesEditorContext: AssertCanvasEngineIsEditorContext = true;
    expect(satisfiesEditorContext).toBe(true);
  });

  it("CanvasEngine's prototype implements every EditorContext method", () => {
    const prototype = CanvasEngine.prototype as unknown as Record<string, unknown>;
    for (const method of EDITOR_CONTEXT_METHODS) {
      expect(typeof prototype[method]).toBe("function");
    }
  });
});
