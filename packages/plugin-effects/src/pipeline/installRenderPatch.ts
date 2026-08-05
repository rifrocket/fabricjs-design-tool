import { FabricObject } from "fabric";
import { getEffectStack } from "@rifrocket/fdt-core";
import type { EffectRegistry } from "@rifrocket/fdt-core";
import { isRenderBypassed } from "./renderGuard";
import { runEffectPipeline } from "./effectPipeline";

let installed = false;

// Monkey-patches FabricObject.prototype.render() once, globally — the one interception point
// that reaches every concrete object type without patching each class individually. Every shape
// class (Rect, Circle, Path, Text, Image...) defines its own _render() for its own geometry,
// shadowing FabricObject's near-empty base _render — patching _render would never run for real
// objects. render() is different: FabricObject supplies the only full implementation, and every
// subclass override that exists (Group, IText/Textbox, the interactive-text mixin) calls
// super.render(ctx) rather than replacing it, so this patch is still reached through the whole
// class hierarchy — including custom types a plugin registers later, as long as they follow the
// same super.render() convention Fabric's own classes use. Because each effect pass now re-runs
// the object's own full render() (not its bare _render()), Fabric's per-object caching keeps
// working unmodified for whatever a pass draws — no separate shouldCache() patch is needed.
//
// The patch binds to whichever EffectRegistry is passed on its first call — installRenderPatch
// is idempotent globally (FabricObject.prototype is shared JS-wide, not per engine instance), so
// running multiple independently configured CanvasEngines with different effect sets on the same
// page isn't supported: only the first engine's registry lookups are used. Share one registry
// (or install this plugin against the same effect set on every engine) if you need more than one.
export function installRenderPatch(registry: EffectRegistry): void {
  if (installed) return;
  installed = true;

  const proto = FabricObject.prototype;
  const originalRender = proto.render;

  proto.render = function (this: FabricObject, ctx: CanvasRenderingContext2D) {
    if (isRenderBypassed(this)) {
      originalRender.call(this, ctx);
      return;
    }
    const stack = getEffectStack(this).filter((instance) => instance.enabled);
    if (stack.length === 0) {
      originalRender.call(this, ctx);
      return;
    }
    runEffectPipeline(this, ctx, stack, registry, (renderCtx) => originalRender.call(this, renderCtx));
  };
}

export function isRenderPatchInstalled(): boolean {
  return installed;
}

// Test-only: lets a fresh test reinstall the patch against its own FabricObject.prototype spy.
export function __resetRenderPatchForTests(): void {
  installed = false;
}
