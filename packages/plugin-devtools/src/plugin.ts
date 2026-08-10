import type { CanvasEngine, EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { EventLogPanel } from "./EventLogPanel";
import { CanvasStateViewer } from "./CanvasStateViewer";
import { HistoryPanel } from "./HistoryPanel";
import { HierarchyPanel } from "./HierarchyPanel";
import { PerformanceStats } from "./PerformanceStats";

// Keyed per-engine since this same plugin object can be installed on more than one engine (e.g.
// plugin-pages' shared per-page plugin list) — same rationale as plugin-effects' WeakMap.
const unregisterFnsByEngine = new WeakMap<CanvasEngine, Array<() => void>>();

// Wraps the panels as an installable EditorPlugin; each component is also exported directly
// for consumers who want to place it manually instead.
//
// PerformanceStats' `active` prop stays at its own default (true): PanelSlot renders
// `<Component key={index} />` with no props threaded through, so per-install configurability
// isn't available through this registration path.
export const devtoolsPlugin: EditorPlugin = {
  name: "devtools",
  install(engine) {
    unregisterFnsByEngine.set(engine, [
      engine.registry.registerPanel("sidebar-right", { component: EventLogPanel }),
      engine.registry.registerPanel("sidebar-right", { component: CanvasStateViewer }),
      engine.registry.registerPanel("sidebar-right", { component: HistoryPanel }),
      engine.registry.registerPanel("sidebar-right", { component: HierarchyPanel }),
      engine.registry.registerPanel("sidebar-right", { component: PerformanceStats }),
    ]);
  },
  uninstall(engine) {
    unregisterFnsByEngine.get(engine)?.forEach((unregister) => unregister());
    unregisterFnsByEngine.delete(engine);
  },
};
