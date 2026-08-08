import { describe, expect, it } from "vitest";
import { PluginRegistry, getSerializedProperties } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { shapesBasicPlugin } from "./plugin";

function createFakeEngine(): CanvasEngine {
  return { registry: new PluginRegistry() } as unknown as CanvasEngine;
}

describe("shapesBasicPlugin", () => {
  it("registers shapeKind for serialization, so rounded-rectangle/polygon identity survives clone and JSON export", () => {
    const engine = createFakeEngine();
    shapesBasicPlugin.install(engine);
    expect(getSerializedProperties()).toContain("shapeKind");
  });
});
