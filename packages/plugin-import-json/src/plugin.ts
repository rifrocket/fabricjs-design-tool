import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";

// Registers a "json" importer (no built-in JSON import ships anywhere, despite JSON export
// existing). Pair with engine.importFile("json", data) rather than calling this importer
// directly: loadFromJSON() fully replaces canvas contents without going through the
// add/remove command path, so nothing else notices the swap unless something also resyncs
// objectIds/selection/history — that resync is importFile()'s job, not this importer's
// (see CanvasEngine.importFile in @rifrocket/fabricjs-design-tool).
export const importJsonPlugin: EditorPlugin = {
  name: "import-json",
  install(engine) {
    engine.registry.registerImporter("json", async (canvas, input) => {
      await canvas.loadFromJSON(input as Record<string, unknown>);
      canvas.requestRenderAll();
    });
  },
};
