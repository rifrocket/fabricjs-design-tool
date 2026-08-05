import type { EditorPlugin } from "@rifrocket/fdt-core";
import { AlignmentControls } from "./AlignmentControls";

// Wraps AlignmentControls as an installable EditorPlugin; it's still exported directly too
// for consumers who want to place it manually instead.
export const alignmentPlugin: EditorPlugin = {
  name: "alignment",
  install(engine) {
    engine.registry.registerPanel("sidebar-right", { component: AlignmentControls });
  },
};
