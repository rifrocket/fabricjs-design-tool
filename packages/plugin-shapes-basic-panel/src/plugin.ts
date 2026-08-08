import type { CanvasEngine, EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { ShapePicker } from "./ShapePicker";

// Keyed per-engine because plugin-pages installs the same EditorPlugin object returned by one
// createShapesBasicPanelPlugin() call across N page engines — same rationale as plugin-effects'
// installRenderPatch.ts WeakMap.
const unregisterByEngine = new WeakMap<CanvasEngine, () => void>();

// Registers ShapePicker into the "tool-rail" panel slot. Declares dependsOn: ["shapes-basic"]
// because ShapePicker's buttons call engine.addObjectOfType() against ids that plugin
// registers — installing this panel without it would throw the moment a button is clicked, not
// at install time, so the dependency is real even though nothing here reads shapes-basic's
// registry directly.
//
// Lives in a separate sibling package rather than inside plugin-shapes-basic itself for the same
// reason plugin-effects/plugin-effects-panel are split: plugin-shapes-basic is bundled into both
// <DesignEditor> presets, which is only safe because it has zero React dependency today — giving
// it a panel would force a @rifrocket/fdt-react dependency onto a package fdt-react already
// depends on, a real circular package dependency (confirmed by pnpm's own cyclic-workspace
// warning when this was tried directly). This package depends on both plugin-shapes-basic and
// fdt-react but isn't itself bundled into any preset, so no cycle is introduced.
export function createShapesBasicPanelPlugin(): EditorPlugin {
  return {
    name: "shapes-basic-panel",
    dependsOn: ["shapes-basic"],
    install(engine) {
      const unregister = engine.registry.registerPanel("tool-rail", { component: ShapePicker });
      unregisterByEngine.set(engine, unregister);
    },
    uninstall(engine) {
      unregisterByEngine.get(engine)?.();
      unregisterByEngine.delete(engine);
    },
  };
}
