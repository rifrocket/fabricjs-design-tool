import { afterEach, describe, expect, it, vi } from "vitest";
import { FabricObject, Group, Rect } from "fabric";
import { EFFECTS_PROPERTY, EffectRegistry } from "@rifrocket/fdt-core";
import { __resetRenderPatchForTests, installRenderPatch, isRenderPatchInstalled } from "./installRenderPatch";

const originalRender = FabricObject.prototype.render;

function fakeCtx(): CanvasRenderingContext2D {
  return { save: vi.fn(), restore: vi.fn(), translate: vi.fn(), drawImage: vi.fn() } as unknown as CanvasRenderingContext2D;
}

afterEach(() => {
  FabricObject.prototype.render = originalRender;
  __resetRenderPatchForTests();
});

describe("installRenderPatch", () => {
  it("is idempotent: installing twice does not wrap the render method twice", () => {
    const registry = new EffectRegistry();
    installRenderPatch(registry);
    const wrappedOnce = FabricObject.prototype.render;
    installRenderPatch(registry);
    expect(FabricObject.prototype.render).toBe(wrappedOnce);
    expect(isRenderPatchInstalled()).toBe(true);
  });

  it("calls the native render unmodified for an object with no effect stack", () => {
    const nativeSpy = vi.fn();
    FabricObject.prototype.render = nativeSpy;
    installRenderPatch(new EffectRegistry());
    const rect = new Rect();

    rect.render(fakeCtx());

    expect(nativeSpy).toHaveBeenCalledTimes(1);
  });

  it("routes through the effects pipeline for an object with an enabled effect", () => {
    const nativeSpy = vi.fn();
    FabricObject.prototype.render = nativeSpy;
    const order: string[] = [];
    const registry = new EffectRegistry();
    registry.register({
      id: "shadow",
      category: "basic",
      label: "Shadow",
      track: "compositing",
      schema: [],
      defaults: {},
      renderBehind: () => order.push("behind"),
    });
    installRenderPatch(registry);
    const rect = new Rect();
    rect.set(EFFECTS_PROPERTY, [{ instanceId: "shadow_1", effectId: "shadow", enabled: true, props: {} }]);
    nativeSpy.mockImplementation(() => order.push("base"));

    rect.render(fakeCtx());

    expect(order).toEqual(["behind", "base"]);
    expect(nativeSpy).toHaveBeenCalledTimes(1);
  });

  it("skips disabled effect instances and falls back to the native render", () => {
    const nativeSpy = vi.fn();
    FabricObject.prototype.render = nativeSpy;
    const registry = new EffectRegistry();
    installRenderPatch(registry);
    const rect = new Rect();
    rect.set(EFFECTS_PROPERTY, [{ instanceId: "shadow_1", effectId: "shadow", enabled: false, props: {} }]);

    rect.render(fakeCtx());

    expect(nativeSpy).toHaveBeenCalledTimes(1);
  });

  it("reaches a Group instance through its own render() override via super.render()", () => {
    const nativeSpy = vi.fn();
    FabricObject.prototype.render = nativeSpy;
    installRenderPatch(new EffectRegistry());
    const group = new Group([new Rect()]);

    group.render(fakeCtx());

    expect(nativeSpy).toHaveBeenCalled();
  });

  // IText/Textbox also override render() via super.render() the same way Group does above, but
  // constructing one requires a DOM `document` (grapheme measurement runs in the constructor),
  // which this repo's node-only vitest environment doesn't provide — see vitest.config.ts and
  // the equivalent note on canvasEngine.integration.test.ts. Covered manually instead (plan's
  // verification section).
});
