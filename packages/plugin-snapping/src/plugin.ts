import type { CanvasEngine, EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { SnappingToggle } from "./SnappingToggle";

// Keyed per-engine since this same plugin object can be installed on more than one engine (e.g.
// plugin-pages' shared per-page plugin list) — same rationale as plugin-effects' WeakMap.
const unregisterByEngine = new WeakMap<CanvasEngine, () => void>();

// Wraps SnappingToggle as an installable EditorPlugin; it's still exported directly too
// for consumers who want to place it manually instead.
export const snappingPlugin: EditorPlugin = {
  name: "snapping",
  install(engine) {
    const unregister = engine.registry.registerPanel("sidebar-right", { component: SnappingToggle });
    unregisterByEngine.set(engine, unregister);
  },
  uninstall(engine) {
    unregisterByEngine.get(engine)?.();
    unregisterByEngine.delete(engine);
  },
};
