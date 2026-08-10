import { afterEach, describe, expect, it, vi } from "vitest";
import type { Canvas } from "fabric";
import { FabricObject, Group, Rect } from "fabric";
import { EFFECTS_PROPERTY, EffectRegistry } from "@rifrocket/fabricjs-design-tool";
import {
  __resetRenderPatchForTests,
  installRenderPatch,
  isRenderPatchInstalled,
  uninstallRenderPatchForCanvas,
} from "./installRenderPatch";

function shadowRegistry(onRenderBehind: () => void): EffectRegistry {
  const registry = new EffectRegistry();
  registry.register({
    id: "shadow",
    category: "basic",
    label: "Shadow",
    track: "compositing",
    schema: [],
    defaults: {},
    renderBehind: onRenderBehind,
  });
  return registry;
}

function shadowStackProperty(): unknown {
  return [{ instanceId: "shadow_1", effectId: "shadow", enabled: true, props: {} }];
}

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

  it("resolves the correct engine's registry per-object when multiple canvases install different effect sets", () => {
    // Regression test for the real, previously-flagged multi-engine bug: the render patch used
    // to close over whichever registry installed *first*, so a second engine's own, different
    // effect set was silently ignored for its own objects.
    const nativeSpy = vi.fn();
    FabricObject.prototype.render = nativeSpy;

    const canvasA = {} as unknown as Canvas;
    const canvasB = {} as unknown as Canvas;
    const order: string[] = [];
    const registryA = shadowRegistry(() => order.push("A"));
    const registryB = shadowRegistry(() => order.push("B"));

    installRenderPatch(registryA, canvasA);
    installRenderPatch(registryB, canvasB); // installed second — must not shadow registryA

    const rectOnA = new Rect();
    rectOnA.canvas = canvasA;
    rectOnA.set(EFFECTS_PROPERTY, shadowStackProperty());

    const rectOnB = new Rect();
    rectOnB.canvas = canvasB;
    rectOnB.set(EFFECTS_PROPERTY, shadowStackProperty());

    rectOnA.render(fakeCtx());
    rectOnB.render(fakeCtx());

    expect(order).toEqual(["A", "B"]);
  });

  it("falls back to the first-installed registry for an object with no live canvas (e.g. an off-canvas thumbnail render)", () => {
    const nativeSpy = vi.fn();
    FabricObject.prototype.render = nativeSpy;
    const order: string[] = [];
    installRenderPatch(shadowRegistry(() => order.push("fallback")));

    const detachedRect = new Rect(); // .canvas intentionally left unset
    detachedRect.set(EFFECTS_PROPERTY, shadowStackProperty());
    detachedRect.render(fakeCtx());

    expect(order).toEqual(["fallback"]);
  });

  it("uninstallRenderPatchForCanvas removes only that canvas's entry, without disturbing another still-live engine", () => {
    const nativeSpy = vi.fn();
    FabricObject.prototype.render = nativeSpy;

    const canvasA = {} as unknown as Canvas;
    const canvasB = {} as unknown as Canvas;
    const order: string[] = [];
    installRenderPatch(shadowRegistry(() => order.push("A")), canvasA);
    installRenderPatch(shadowRegistry(() => order.push("B")), canvasB);

    uninstallRenderPatchForCanvas(canvasA);

    const rectOnB = new Rect();
    rectOnB.canvas = canvasB;
    rectOnB.set(EFFECTS_PROPERTY, shadowStackProperty());
    rectOnB.render(fakeCtx());
    expect(order).toEqual(["B"]); // canvas B's engine is unaffected by canvas A's uninstall

    // canvas A now has no per-canvas entry, so it falls back to the first-ever-installed
    // registry (registry A itself, in this test) rather than losing effect rendering outright —
    // the shared prototype patch is never reverted, only per-canvas entries are removed.
    const rectOnA = new Rect();
    rectOnA.canvas = canvasA;
    rectOnA.set(EFFECTS_PROPERTY, shadowStackProperty());
    rectOnA.render(fakeCtx());
    expect(order).toEqual(["B", "A"]);
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
