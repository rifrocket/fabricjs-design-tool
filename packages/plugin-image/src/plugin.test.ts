import { describe, expect, it } from "vitest";
import { PluginRegistry, getSerializedProperties } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { imagePlugin } from "./plugin";

function createFakeEngine(): CanvasEngine {
  return { registry: new PluginRegistry() } as unknown as CanvasEngine;
}

describe("imagePlugin", () => {
  it("registers shapeKind for serialization, so an image object's type identity survives clone and JSON export", () => {
    const engine = createFakeEngine();
    imagePlugin.install(engine);
    expect(getSerializedProperties()).toContain("shapeKind");
  });
});
