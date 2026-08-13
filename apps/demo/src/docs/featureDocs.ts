export interface FeatureDoc {
  key: string;
  title: string;
  description: string;
  usageTip: string;
  codeSnippet: string;
  docLink?: string;
}

// Single source of truth for inline tooltips (docs/InfoTooltip.tsx) and the "API usage"
// browsable list (docs/ApiUsageSnippets.tsx) — authored once, consumed twice.
export const FEATURE_DOCS: Record<string, FeatureDoc> = {
  shapes: {
    key: "shapes",
    title: "Shape creation",
    description: "Every shape button calls the object-type registry, the same extension point any plugin uses.",
    usageTip: "Click a shape to add it at a default position, then drag it into place.",
    codeSnippet: 'engine.addObjectOfType("rect", {})',
    docLink: "https://github.com/rifrocket/fabricjs-design-tool",
  },
  image: {
    key: "image",
    title: "Image upload",
    description:
      'There is no built-in "image" object type — this demo registers its own via a plugin, ' +
      "proving a consumer can add entirely new object types without touching the library.",
    usageTip: "Pick an image file; it's added as a history-tracked object like any shape.",
    codeSnippet: 'engine.registry.registerObjectType("image", { create: async (c) => FabricImage.fromURL(c.src) })',
  },
  qrcode: {
    key: "qrcode",
    title: "QR codes",
    description: "Ships as a first-party plugin (@rifrocket/fdt-plugin-qrcode), generated async via qr-code-styling.",
    usageTip: "Fill in a URL and the plugin renders + adds a scannable QR object.",
    codeSnippet: 'engine.addObjectOfType("qrcode", { contentType: "url", contentData: { url } })',
  },
  svgImport: {
    key: "svgImport",
    title: "SVG import",
    description: "Registered as an importer (not an object type) by @rifrocket/fdt-plugin-svg-import.",
    usageTip: "Known limitation: this importer adds directly to the canvas, so it isn't undoable.",
    codeSnippet: 'await engine.registry.importers.get("svg")(engine.getFabricCanvas(), svgText)',
  },
  effects: {
    key: "effects",
    title: "Object effects",
    description:
      "A plugin-driven effect stack (@rifrocket/fdt-plugin-effects) — shadow, glow, glitch, duotone and more, each an independent registration, reorderable and stackable on any object type.",
    usageTip: "Add an effect from the gallery, then expand its row to adjust it live.",
    codeSnippet: 'engine.registry.effects.register(myCustomEffect)',
  },
  layers: {
    key: "layers",
    title: "Layers",
    description: "Z-order, visibility and lock state all live on LayerManager; this panel adds drag-reorder on top.",
    usageTip: "Drag a row to reorder, or use the Up/Down buttons.",
    codeSnippet: "engine.layers.moveToIndex(object, index)",
  },
  history: {
    key: "history",
    title: "Undo / redo",
    description: "A command-pattern history (not whole-canvas snapshots) — edits to the same property while dragging merge into one undo step.",
    usageTip: "Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) anywhere.",
    codeSnippet: "engine.undo(); engine.redo();",
  },
  clipboard: {
    key: "clipboard",
    title: "Copy / paste / duplicate",
    description: "Not part of the core library — implemented here with Fabric's object.clone() plus engine.addObject().",
    usageTip: "Ctrl+C / Ctrl+V / Ctrl+D on a selection.",
    codeSnippet: "const clone = await object.clone(); engine.addObject(clone);",
  },
  grouping: {
    key: "grouping",
    title: "Group / ungroup",
    description: "SelectionManager wraps Fabric's native ActiveSelection/Group.",
    usageTip: "Select 2+ objects, then Ctrl+G to group, Ctrl+Shift+G to ungroup.",
    codeSnippet: "engine.selection.group(); engine.selection.ungroup();",
  },
  alignment: {
    key: "alignment",
    title: "Alignment & distribution",
    description: "Aligns to the canvas for a single object, or to the selection's own bounds for multiple.",
    usageTip: "Select objects, then pick an alignment edge.",
    codeSnippet: 'engine.alignment.align("left"); engine.alignment.distribute("horizontal");',
  },
  snapping: {
    key: "snapping",
    title: "Smart-guide snapping",
    description: "Always-on by default: dragging an object snaps it to nearby object edges/centers and the canvas bounds.",
    usageTip: "Toggle off if you need pixel-perfect placement without magnetism.",
    codeSnippet: "engine.snapping.setEnabled(false)",
  },
  guides: {
    key: "guides",
    title: "Guides",
    description:
      "Draggable user guide lines in this demo are cosmetic only — SnapEngine has no extension point for " +
      "custom guide magnetism, a known core-level gap, so dragging near one won't attract objects to it.",
    usageTip: "Double-click near the canvas edge to drop a guide line; click a guide to remove it.",
    codeSnippet: "engine.snapping.setEnabled(true) // real snapping is separate from these cosmetic guides",
  },
  zoomPan: {
    key: "zoomPan",
    title: "Zoom & pan",
    description: "ViewportManager exposes the math; wheel-zoom and spacebar-drag-pan are demo-built interaction bindings on top.",
    usageTip: "Scroll to zoom toward the cursor, hold Space and drag to pan.",
    codeSnippet: "engine.viewport.zoomBy(delta, { x, y }); engine.viewport.pan(dx, dy);",
  },
  export: {
    key: "export",
    title: "Export",
    description: "CanvasExporter returns raw data for 5 formats; triggering the browser download is left to the consumer.",
    usageTip: "PDF export fits the canvas onto an A4 page.",
    codeSnippet: 'engine.export("png") // { format, fileName, mimeType, data }',
  },
  importJson: {
    key: "importJson",
    title: "JSON import",
    description:
      "There's no built-in JSON import despite JSON export existing — this demo calls Fabric's " +
      "loadFromJSON via the getFabricCanvas() escape hatch, then resyncs the reactive store using public APIs.",
    usageTip: "Replaces canvas contents; not undoable as a single step.",
    codeSnippet: "await engine.getFabricCanvas().loadFromJSON(json)",
  },
  localStorage: {
    key: "localStorage",
    title: "Local-storage autosave",
    description:
      "@rifrocket/fdt-plugin-local-storage debounces the canvas content, plus any app-defined metadata (here: page " +
      "size/template), into one atomic localStorage entry on every change — restored on the very first load of a " +
      "session, not on template switches, which always load fresh.",
    usageTip: "Reload the page after editing to see your design (and its page size) come back; click the trash icon to clear the saved backup.",
    codeSnippet: 'engine.use(localStoragePlugin({ captureMeta })); loadDesignFromStorage(); clearSavedDesign();',
  },
  properties: {
    key: "properties",
    title: "Custom object properties",
    description:
      "PropertiesPanel renders nothing until an object type has propertyFields — each shipped plugin " +
      "(shapes-basic, image, qrcode) registers its own field components directly in its registerObjectType() call.",
    usageTip: "Select any object to see its editable fields here.",
    codeSnippet: 'registry.register("rect", { create: (config) => new Rect(config), propertyFields: [...] })',
  },
  events: {
    key: "events",
    title: "Event handling",
    description: 'CanvasEngine emits "objects:changed" and "selection:changed" on its EventBus.',
    usageTip: "Open Dev Tools → Event Log to watch these fire live.",
    codeSnippet: 'engine.events.on("objects:changed", (ids) => ...)',
  },
  plugins: {
    key: "plugins",
    title: "Plugin extensibility",
    description: "Every feature in this demo not shipped by a core plugin (image type, clipboard, this stamp tool) is itself a plugin.",
    usageTip: "See plugins/stampToolPlugin.ts for a heavily-commented reference example.",
    codeSnippet: "engine.use({ name: \"my-plugin\", install(engine) { /* ... */ } })",
  },
  customControls: {
    key: "customControls",
    title: "Custom Fabric controls",
    description:
      "Not built as a standalone feature in this demo — Fabric's per-object control handles are reachable " +
      "via the getFabricCanvas() escape hatch, but customizing them is Fabric-specific, not part of this framework's surface.",
    usageTip: "See Fabric.js's own docs for object.controls.",
    codeSnippet: "object.controls.myHandle = new Control({ ... })",
    docLink: "http://fabricjs.com/customization",
  },
  templates: {
    key: "templates",
    title: "Templates",
    description: "Each template is a canvas size + starter objects; switching remounts <Editor> via a key prop, since it never re-reads size props after mount.",
    usageTip: "Switching templates resets undo history (it's a fresh engine instance).",
    codeSnippet: "<Editor key={template.id} width={template.width} height={template.height} />",
  },
  canvasSize: {
    key: "canvasSize",
    title: "Custom canvas size",
    description:
      "Unlike switching templates (a full remount that reloads starter content), resizing uses the same " +
      "setDimensions() call as zoom — it changes the canvas element's physical size without touching existing objects.",
    usageTip: "Visible when nothing is selected. Enter a width/height and click Apply.",
    codeSnippet: "engine.setDimensions(width, height)",
  },
  devTools: {
    key: "devTools",
    title: "Developer tools",
    description: "HistoryManager exposes no stack introspection, so the Action Log here is a demo-recorded trail, not a read of real internal state.",
    usageTip: "Perf stats only run while this tab is open, to avoid a stray render loop.",
    codeSnippet: "engine.history.canUndo() // no stack contents available",
  },
};
