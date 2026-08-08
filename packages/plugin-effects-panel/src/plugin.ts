import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { EffectsPanel } from "./EffectsPanel";

// Wraps EffectsPanel as an installable EditorPlugin; the component is also exported directly
// for consumers who want to place it manually instead.
//
// Not bundled into @rifrocket/fdt-plugin-effects itself: that package has zero React dependency
// today (which is exactly why it's safely bundled into <DesignEditor>'s default/minimal presets),
// and giving it a panel would force a dependency on @rifrocket/fdt-react onto a package fdt-react
// already depends on — a circular package dependency. This package depends on fdt-react but not
// on plugin-effects itself (it only reads engine.registry.effects, generic to whatever effects
// got registered), so installing it alongside createEffectsPlugin() introduces no cycle.
export function createEffectsPanelPlugin(): EditorPlugin {
  return {
    name: "effects-panel",
    dependsOn: ["effects"],
    install(engine) {
      engine.registry.registerPanel("sidebar-right", { component: EffectsPanel });
    },
  };
}
