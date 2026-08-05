import type { EditorPlugin, EffectDefinition } from "@rifrocket/fdt-core";
import { registerSerializedProperty } from "@rifrocket/fdt-core";
import { EFFECTS_PROPERTY } from "@rifrocket/fdt-core";
import { installRenderPatch } from "./pipeline/installRenderPatch";
import { ALL_BUILTIN_EFFECTS } from "./effects";

// Registers the given effects (every built-in by default — pass a curated subset to exclude the
// rest from your bundle, since every built-in effect is an independent, side-effect-free export)
// and installs the shared rendering pipeline once. Safe to call more than once across multiple
// engines: registerEffect throws on a genuine duplicate id, and installRenderPatch is idempotent.
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
      installRenderPatch(engine.registry.effects);
    },
  };
}
