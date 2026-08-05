import type { EditorPlugin } from "@rifrocket/fdt-core";
import { EventLogPanel } from "./EventLogPanel";
import { CanvasStateViewer } from "./CanvasStateViewer";
import { HistoryPanel } from "./HistoryPanel";
import { HierarchyPanel } from "./HierarchyPanel";
import { PerformanceStats } from "./PerformanceStats";

// Wraps the panels as an installable EditorPlugin; each component is also exported directly
// for consumers who want to place it manually instead.
//
// PerformanceStats' `active` prop stays at its own default (true): PanelSlot renders
// `<Component key={index} />` with no props threaded through, so per-install configurability
// isn't available through this registration path.
export const devtoolsPlugin: EditorPlugin = {
  name: "devtools",
  install(engine) {
    engine.registry.registerPanel("sidebar-right", { component: EventLogPanel });
    engine.registry.registerPanel("sidebar-right", { component: CanvasStateViewer });
    engine.registry.registerPanel("sidebar-right", { component: HistoryPanel });
    engine.registry.registerPanel("sidebar-right", { component: HierarchyPanel });
    engine.registry.registerPanel("sidebar-right", { component: PerformanceStats });
  },
};
