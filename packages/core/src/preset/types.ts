import type { EditorPlugin } from "../plugin/plugin";
import type { SnapEngineOptions } from "../engine/snapEngine";
import type { PropertyFieldDefinition } from "../plugin/objectTypeRegistry";
import type { CanvasEngine } from "../engine/canvasEngine";

export interface PresetShortcutsConfig {
  disable?: string[];
  add?: Record<
    string,
    {
      handler: (engine: CanvasEngine) => void;
      description?: string;
    }
  >;
}

// A preset is inert declarative data, not a live object — the same preset can be handed to
// createEditor() many times (once per document/tab) without carrying state between calls,
// matching CanvasEngine's existing one-engine-per-canvas model.
export interface EditorPreset {
  name: string;
  // Factory form lets a preset defer construction of stateful plugins (e.g. a curated effects
  // list) until createEditor() actually builds them.
  plugins: EditorPlugin[] | (() => EditorPlugin[]);
  // Fallback property-field registration for plugins that don't declare
  // ObjectTypeDefinition.propertyFields themselves — the escape hatch for third-party plugins
  // adding fields to a type they don't own, not the primary path for a preset's own plugins.
  propertyFields?: Record<string, PropertyFieldDefinition[]>;
  snapping?: SnapEngineOptions;
  // Declarative only here: this package registers no default shortcuts, so `disable` has
  // nothing to act on until @rifrocket/fdt-react's <DesignEditor> calls setupDefaultShortcuts().
  // createEditor() applies `add` directly; `disable` is honored by that layer instead.
  shortcuts?: PresetShortcutsConfig;
}

// The preset used when no preset (or "none") is requested — zero plugins, zero opinions,
// equivalent to calling createEngine() directly.
export const EMPTY_PRESET: EditorPreset = { name: "none", plugins: [] };
