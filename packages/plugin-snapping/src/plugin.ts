import type { EditorPlugin } from "@rifrocket/fdt-core";
import { SnappingToggle } from "./SnappingToggle";

// Wraps SnappingToggle as an installable EditorPlugin; it's still exported directly too
// for consumers who want to place it manually instead.
export const snappingPlugin: EditorPlugin = {
  name: "snapping",
  install(engine) {
    engine.registry.registerPanel("sidebar-right", { component: SnappingToggle });
  },
};
