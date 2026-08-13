import type { EditorPlugin, EffectDefinition } from "@rifrocket/fabricjs-design-tool";
import { registerSerializedProperty } from "@rifrocket/fabricjs-design-tool";
import { EFFECTS_PROPERTY } from "@rifrocket/fabricjs-design-tool";
import { installRenderPatch, uninstallRenderPatchForCanvas } from "./pipeline/installRenderPatch";
import { ALL_BUILTIN_EFFECTS } from "./effects";

// Registers the given effects (every built-in by default — pass a curated subset to exclude the
// rest from your bundle, since every built-in effect is an independent, side-effect-free export)
// and installs the shared rendering pipeline once. Safe to call more than once across multiple
// engines: registerEffect throws on a genuine duplicate id, and installRenderPatch is idempotent
// — each call also records this engine's own canvas -> registry mapping, so multiple engines
// with *different* effect sets (e.g. plugin-pages' one-engine-per-page model) each render
// against their own registry, not whichever engine happened to install first.
//
// A curated list like [shadowEffect, glowEffect] mixes several different EffectDefinition<TProps>
// instantiations; `any` here is what lets that list be passed in directly without every caller
// writing a cast. Each definition is only ever invoked with its own matching instance props at
// runtime (see core's effectStack.ts), so the erasure is safe.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEffectsPlugin(effects: EffectDefinition<any>[] = ALL_BUILTIN_EFFECTS): EditorPlugin {
  return {
    name: "effects",
    install(engine) {
      for (const effect of effects) {
        if (!engine.registry.effects.has(effect.id)) {
          engine.registry.registerEffect(effect);
        }
      }
      registerSerializedProperty(EFFECTS_PROPERTY);
      // installRenderPatch patches FabricObject.prototype._render() itself and keys its
      // canvas -> registry map by the raw Canvas instance — a Fabric rendering-pipeline
      // internal with no RendererApi equivalent (FUTURE_IMPLEMENTATION.md Chunk 8.3).
      installRenderPatch(engine.registry.effects, engine.getFabricCanvas());
    },
    // Removes this engine's own canvas -> registry entry (see installRenderPatch.ts) so a
    // destroyed/unused engine stops influencing render lookups. Does NOT revert the shared
    // FabricObject.prototype.render() patch itself — that stays installed for the process's
    // lifetime, since any other still-live engine may depend on it; it's a no-op for any object
    // with no live `.canvas` entry and no effect stack, so leaving it in place is harmless.
    // Same Fabric-rendering-internals rationale as install() above for staying on
    // getFabricCanvas().
    uninstall(engine) {
      uninstallRenderPatchForCanvas(engine.getFabricCanvas());
    },
  };
}
