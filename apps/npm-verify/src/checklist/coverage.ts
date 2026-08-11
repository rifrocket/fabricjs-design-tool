export type CheckStatus = "not-run" | "pass" | "fail";

export interface PackageCheck {
  id: string;
  npmName: string;
  proof: string;
}

export const PACKAGE_CHECKS: PackageCheck[] = [
  { id: "core", npmName: "@rifrocket/fabricjs-design-tool", proof: "createEditor()/CanvasEngine mounts; undo/redo flips canUndo/canRedo" },
  { id: "react", npmName: "@rifrocket/fdt-react", proof: "<DesignEditor> renders and fires onReady" },
  { id: "theme", npmName: "@rifrocket/fdt-theme", proof: "src/tokens.css resolves at build time; light/dark toggle changes colors" },
  { id: "properties", npmName: "@rifrocket/fdt-properties", proof: "editing a PropertiesPanel field updates the selected canvas object" },
  { id: "shapes-basic", npmName: "@rifrocket/fdt-plugin-shapes-basic", proof: "addObjectOfType adds a rect/circle/text/star to the canvas" },
  { id: "shapes-basic-panel", npmName: "@rifrocket/fdt-plugin-shapes-basic-panel", proof: "bare <ShapePicker/> renders and its buttons add shapes" },
  { id: "qrcode", npmName: "@rifrocket/fdt-plugin-qrcode", proof: "generateContentString/validateContent + a real qrcode object renders" },
  { id: "svg-import", npmName: "@rifrocket/fdt-plugin-svg-import", proof: "importSvgToEngine lands a fixture SVG on the canvas" },
  { id: "image", npmName: "@rifrocket/fdt-plugin-image", proof: "addObjectOfType(\"image\", ...) renders an uploaded image" },
  { id: "media-fields", npmName: "@rifrocket/fdt-plugin-media-fields", proof: "image/qrcode PropertiesPanel shows position/blend/opacity/rotation fields" },
  { id: "clipboard", npmName: "@rifrocket/fdt-plugin-clipboard", proof: "Ctrl+D duplicates the selected object" },
  { id: "export-pdf", npmName: "@rifrocket/fdt-plugin-export-pdf", proof: "engine.export(\"pdf\") returns a non-empty Blob" },
  { id: "import-json", npmName: "@rifrocket/fdt-plugin-import-json", proof: "export JSON, re-import into a fresh engine, objects restore" },
  { id: "effects", npmName: "@rifrocket/fdt-plugin-effects", proof: "applying the shadow effect programmatically changes rendered pixels" },
  { id: "effects-panel", npmName: "@rifrocket/fdt-plugin-effects-panel", proof: "bare <EffectsPanel/> browses/applies an effect through its UI" },
  { id: "local-storage", npmName: "@rifrocket/fdt-plugin-local-storage", proof: "autosave debounces, reload restores via loadDesignFromStorage" },
  { id: "alignment", npmName: "@rifrocket/fdt-plugin-alignment", proof: "useAlignmentActions align/distribute moves selected objects" },
  { id: "snapping", npmName: "@rifrocket/fdt-plugin-snapping", proof: "useSnapping().setEnabled toggles engine.snapping state" },
  { id: "devtools", npmName: "@rifrocket/fdt-plugin-devtools", proof: "CanvasStateViewer/HistoryPanel/PerformanceStats show live values" },
  { id: "pan-zoom", npmName: "@rifrocket/fdt-plugin-pan-zoom", proof: "setCanvasZoom + centerContent visibly zoom/pan the canvas" },
  { id: "pages", npmName: "@rifrocket/fdt-plugin-pages", proof: "<MultiPageDesignEditor> adds a second page with an independent engine" },
];
