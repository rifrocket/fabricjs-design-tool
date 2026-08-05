import type { EditorPlugin } from "@rifrocket/fdt-core";
import { importSVG } from "./importer";

// Proves the plugin/registry system from Phase 2 against a real gap (v1 had no SVG import
// at all) written from scratch against the public API, not ported from v1.
export const svgImportPlugin: EditorPlugin = {
  name: "svg-import",
  install(engine) {
    engine.registry.registerImporter("svg", async (canvas, input) => {
      await importSVG(canvas, String(input));
    });
  },
};
