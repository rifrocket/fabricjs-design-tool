import type { CanvasEngine, EditorPlugin } from "@rifrocket/fabricjs-design-tool";
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

// The one-hop convenience for a consumer holding only `engine` (e.g. a UI button) — the direct
// path is `engine.registry.importers.get("svg")(engine.getFabricCanvas(), svgString)`. Not
// `engine.importFile("svg", svgString)`: that facade calls `history.clear()` after every import
// (correct for formats like "json" that wholesale-replace canvas contents, wrong here — it would
// wipe every prior undo step, not just leave the SVG import itself non-undoable, which is
// already a separate, deliberate choice — see this package's own README) — see canvasEngine.ts's
// own comment on importFile(). Goes through the *registered* importer (honoring a `.replace()`'d
// one), not the pure importSVG(canvas, string) function directly, so a consumer that swapped in
// a custom SVG importer still gets it called here.
export async function importSvgToEngine(engine: CanvasEngine, svgString: string): Promise<void> {
  const importer = engine.registry.importers.get("svg");
  if (!importer) {
    throw new Error('No "svg" importer registered — install svgImportPlugin first.');
  }
  await importer(engine.getFabricCanvas(), svgString);
}
