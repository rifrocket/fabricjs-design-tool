import { FabricObject } from "fabric";
import type { StaticCanvas } from "fabric";
import { getEffectStack } from "@rifrocket/fabricjs-design-tool";
import type { EffectRegistry } from "@rifrocket/fabricjs-design-tool";
import { isRenderBypassed } from "./renderGuard";
import { runEffectPipeline } from "./effectPipeline";

let installed = false;

// FabricObject.prototype.render() is patched exactly once, globally — the one interception
// point that reaches every concrete object type without patching each class individually (see
// the class-hierarchy note further down). But *which* EffectRegistry a given render() call uses
// is resolved per-canvas via this map, not by closing over a single registry captured at install
// time: with multiple independently configured CanvasEngines on the page (e.g. plugin-pages'
// one-engine-per-page model), each engine's install() call registers its own canvas -> registry
// entry here, so an object always renders against the effect set its own engine actually
// installed, not whichever engine happened to install first. A WeakMap keyed by canvas means
// entries are cleaned up automatically as canvases are garbage-collected, and uninstallRenderPatch
// lets a plugin's uninstall() remove its own engine's entry without disturbing any other engine
// still relying on the (necessarily global, un-reversible) prototype patch itself.
const registryByCanvas = new WeakMap<StaticCanvas, EffectRegistry>();
// The registry from the very first installRenderPatch() call, kept as a fallback for objects
// with no live `.canvas` at render time (e.g. renderSnapshotThumbnail's detached StaticCanvas) —
// matches this module's pre-multi-engine behavior for the common single-engine case.
let fallbackRegistry: EffectRegistry | undefined;

// Every shape class (Rect, Circle, Path, Text, Image...) defines its own _render() for its own
// geometry, shadowing FabricObject's near-empty base _render — patching _render would never run
// for real objects. render() is different: FabricObject supplies the only full implementation,
// and every subclass override that exists (Group, IText/Textbox, the interactive-text mixin)
// calls super.render(ctx) rather than replacing it, so this patch is still reached through the
// whole class hierarchy — including custom types a plugin registers later, as long as they
// follow the same super.render() convention Fabric's own classes use. Because each effect pass
// now re-runs the object's own full render() (not its bare _render()), Fabric's per-object
// caching keeps working unmodified for whatever a pass draws — no separate shouldCache() patch
// is needed.
export function installRenderPatch(registry: EffectRegistry, canvas?: StaticCanvas): void {
  if (canvas) {
    registryByCanvas.set(canvas, registry);
  }
  fallbackRegistry ??= registry;

  if (installed) return;
  installed = true;

  const proto = FabricObject.prototype;
  const originalRender = proto.render;

  proto.render = function (this: FabricObject, ctx: CanvasRenderingContext2D) {
    if (isRenderBypassed(this)) {
      originalRender.call(this, ctx);
      return;
    }
    const activeRegistry = (this.canvas && registryByCanvas.get(this.canvas)) ?? fallbackRegistry;
    if (!activeRegistry) {
      originalRender.call(this, ctx);
      return;
    }
    const stack = getEffectStack(this).filter((instance) => instance.enabled);
    if (stack.length === 0) {
      originalRender.call(this, ctx);
      return;
    }
    runEffectPipeline(this, ctx, stack, activeRegistry, (renderCtx) => originalRender.call(this, renderCtx));
  };
}

// Removes one engine's canvas -> registry entry, so a plugin's uninstall() can stop influencing
// how its own engine's objects render without touching any other engine's entry or the shared
// prototype patch itself (which can't be safely reverted while any other engine may still depend
// on it — see the class comment above).
export function uninstallRenderPatchForCanvas(canvas: StaticCanvas): void {
  registryByCanvas.delete(canvas);
}

export function isRenderPatchInstalled(): boolean {
  return installed;
}

// Test-only: lets a fresh test reinstall the patch against its own FabricObject.prototype spy.
export function __resetRenderPatchForTests(): void {
  installed = false;
  fallbackRegistry = undefined;
}
