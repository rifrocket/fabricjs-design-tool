import type { CanvasEngine, EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { AlignmentControls } from "./AlignmentControls";

// Keyed per-engine since this same plugin object can be installed on more than one engine (e.g.
// plugin-pages' shared per-page plugin list) — same rationale as plugin-effects' WeakMap.
const unregisterByEngine = new WeakMap<CanvasEngine, () => void>();

// Wraps AlignmentControls as an installable EditorPlugin; it's still exported directly too
// for consumers who want to place it manually instead.
export const alignmentPlugin: EditorPlugin = {
  name: "alignment",
  install(engine) {
    const unregister = engine.registry.registerPanel("sidebar-right", { component: AlignmentControls });
    unregisterByEngine.set(engine, unregister);
  },
  uninstall(engine) {
    unregisterByEngine.get(engine)?.();
    unregisterByEngine.delete(engine);
  },
};
