import { describe, expect, it } from "vitest";
import { PluginRegistry, getSerializedProperties } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { qrCodePlugin } from "./plugin";

function createFakeEngine(): CanvasEngine {
  return { registry: new PluginRegistry() } as unknown as CanvasEngine;
}

describe("qrCodePlugin", () => {
  it("registers shapeKind for serialization, so a QR code object's type identity survives clone and JSON export", () => {
    const engine = createFakeEngine();
    qrCodePlugin.install(engine);
    expect(getSerializedProperties()).toContain("shapeKind");
  });
});
