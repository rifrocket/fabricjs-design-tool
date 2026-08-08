import type { CanvasEngine, EditorPlugin, EffectDefinition } from "@rifrocket/fabricjs-design-tool";
import { createEffectsPlugin } from "@rifrocket/fdt-plugin-effects";
import { EffectsPanel } from "./EffectsPanel";

// Keyed per-engine (not a single shared variable) because plugin-pages installs the same
// EditorPlugin object returned by one createEffectsPanelPlugin() call across N page engines —
// same rationale as plugin-effects' own installRenderPatch.ts WeakMap.
const unregisterByEngine = new WeakMap<CanvasEngine, () => void>();

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
      const unregister = engine.registry.registerPanel("sidebar-right", { component: EffectsPanel });
      unregisterByEngine.set(engine, unregister);
    },
    uninstall(engine) {
      unregisterByEngine.get(engine)?.();
      unregisterByEngine.delete(engine);
    },
  };
}

// One call installing both createEffectsPlugin() and createEffectsPanelPlugin() — the
// discoverability gap those two separate installs left (§15/§17 of the plug-and-play gap
// analysis): a consumer who only reaches for plugin-effects-panel (the package that actually
// ships the UI) had no obvious signal that plugin-effects itself is a second, required install.
// Lives here, not in plugin-effects, so plugin-effects itself stays React-free — this package
// already depends on @rifrocket/fdt-react, so depending on plugin-effects too introduces no new
// cycle (plugin-effects depends on neither fdt-react nor this package).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function effectsWithPanelPlugin(effects?: EffectDefinition<any>[]): EditorPlugin[] {
  return [createEffectsPlugin(effects), createEffectsPanelPlugin()];
}
