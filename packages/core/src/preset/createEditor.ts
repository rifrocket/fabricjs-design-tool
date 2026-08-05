import { createEngine } from "../engine/canvasEngine";
import type { CanvasEngine } from "../engine/canvasEngine";
import type { EngineOptions } from "../types";
import type { EditorPlugin } from "../plugin/plugin";
import type { PropertyFieldDefinition } from "../plugin/objectTypeRegistry";
import type { EditorPreset } from "./types";
import { EMPTY_PRESET } from "./types";

export interface PluginOverrides {
  /** Plugin names to skip from the resolved preset. */
  exclude?: string[];
  /** Extra plugins installed after the preset's own list. */
  add?: EditorPlugin[];
  /** Replace a preset plugin by name with a differently-configured instance. */
  replace?: Record<string, EditorPlugin>;
}

export interface CreateEditorOptions extends EngineOptions {
  /**
   * Only a literal `EditorPreset` object or `"none"` (the default) are resolvable here — core
   * can't depend back on plugin packages, so named presets like "default" only exist one layer
   * up, in `@rifrocket/fdt-react`'s `<DesignEditor preset="default" />`.
   */
  preset?: EditorPreset | "none";
  plugins?: PluginOverrides;
  /** `null` suppresses the preset's fields for that type entirely. */
  propertyFields?: Record<string, PropertyFieldDefinition[] | null>;
}

export interface CreatedEditor {
  engine: CanvasEngine;
  /** The fully-resolved preset actually used (post-override), for introspection/debugging. */
  resolvedPreset: EditorPreset;
}

// Identity + validation: a light typo/shape guard so a preset author gets a clear error at
// definition time instead of a confusing failure inside createEditor() later.
export function definePreset(preset: EditorPreset): EditorPreset {
  if (!preset.name) {
    throw new Error("definePreset(): preset.name is required");
  }
  return preset;
}

export function resolvePreset(preset: EditorPreset | "none" | undefined): EditorPreset {
  if (!preset || preset === "none") return EMPTY_PRESET;
  if (typeof preset === "string") {
    throw new Error(
      `createEditor(): preset "${preset}" is not resolvable from @rifrocket/fabricjs-design-tool alone — core cannot ` +
        `depend on plugin packages. Use @rifrocket/fdt-react's <DesignEditor preset="${preset}" /> for named ` +
        `presets, or pass a literal EditorPreset object built with definePreset() here.`,
    );
  }
  return preset;
}

// Drops `exclude`, applies `replace` by name, appends `add` — throws on a name absent from the
// resolved preset instead of silently no-op'ing on a typo.
export function resolvePluginList(preset: EditorPreset, overrides: PluginOverrides = {}): EditorPlugin[] {
  const base = typeof preset.plugins === "function" ? preset.plugins() : preset.plugins;
  const { exclude = [], add = [], replace = {} } = overrides;
  const baseNames = new Set(base.map((plugin) => plugin.name));

  for (const name of exclude) {
    if (!baseNames.has(name)) {
      throw new Error(`createEditor(): plugins.exclude references "${name}", which is not in preset "${preset.name}"`);
    }
  }
  for (const name of Object.keys(replace)) {
    if (!baseNames.has(name)) {
      throw new Error(`createEditor(): plugins.replace references "${name}", which is not in preset "${preset.name}"`);
    }
  }

  const excludeSet = new Set(exclude);
  const resolved = base.filter((plugin) => !excludeSet.has(plugin.name)).map((plugin) => replace[plugin.name] ?? plugin);
  return [...resolved, ...add];
}

// Appends per type, or deletes on `null` — the escape hatch for the residual cross-plugin case.
export function resolvePropertyFields(
  preset: EditorPreset,
  overrides?: Record<string, PropertyFieldDefinition[] | null>,
): Record<string, PropertyFieldDefinition[]> {
  const merged: Record<string, PropertyFieldDefinition[]> = { ...(preset.propertyFields ?? {}) };
  for (const [typeId, fields] of Object.entries(overrides ?? {})) {
    if (fields === null) {
      delete merged[typeId];
    } else {
      merged[typeId] = [...(merged[typeId] ?? []), ...fields];
    }
  }
  return merged;
}

// Resolves a preset (by name or literal object), applies overrides, constructs a CanvasEngine
// against the given element, and installs everything through the existing useAll()/
// registerPropertyFields() APIs — no new engine capability, pure composition.
// `createEngine()` remains exactly as-is for consumers who want zero preset machinery.
export function createEditor(element: string | HTMLCanvasElement, options: CreateEditorOptions = {}): CreatedEditor {
  const { preset: presetInput, plugins: pluginOverrides, propertyFields: propertyFieldOverrides, ...engineOptions } = options;
  const preset = resolvePreset(presetInput);
  const engine = createEngine(element, { ...engineOptions, snapping: preset.snapping ?? engineOptions.snapping });

  const pluginList = resolvePluginList(preset, pluginOverrides);
  engine.useAll(pluginList);

  const propertyFields = resolvePropertyFields(preset, propertyFieldOverrides);
  for (const [typeId, fields] of Object.entries(propertyFields)) {
    if (fields.length > 0 && engine.registry.objectTypes.has(typeId)) {
      engine.registry.registerPropertyFields(typeId, fields);
    }
  }

  if (preset.shortcuts?.add) {
    for (const [key, { handler, description }] of Object.entries(preset.shortcuts.add)) {
      engine.shortcuts.register(key, () => handler(engine), description);
    }
  }

  return { engine, resolvedPreset: { ...preset, plugins: pluginList, propertyFields } };
}
