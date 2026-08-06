import { useCallback, useMemo } from "react";
import type { ReactElement } from "react";
import { resolvePluginList, resolvePropertyFields } from "@rifrocket/fabricjs-design-tool";
import type { CanvasEngine, PluginOverrides, PresetShortcutsConfig, PropertyFieldDefinition } from "@rifrocket/fabricjs-design-tool";
import { localStoragePlugin } from "@rifrocket/fdt-plugin-local-storage";
import type { LocalStoragePluginOptions } from "@rifrocket/fdt-plugin-local-storage";
import { Editor } from "../Editor";
import type { EditorProps } from "../Editor";
import { defaultPreset, minimalPreset, NONE_PRESET } from "./builtinPresets";
import type { DesignEditorPreset } from "./types";

export interface DesignEditorProps extends Omit<EditorProps, "plugins" | "slots" | "theme"> {
  /**
   * Construction-time only, same as `<Editor plugins>` — changing this on a live component
   * does nothing until a `key`-driven remount (e.g. `key={documentId}`). "default" bundles the
   * built-in, dependency-light plugins (shapes, clipboard, svg-import, image, effects,
   * export-pdf, qrcode); "minimal" drops qrcode/export-pdf/svg-import; "none" is an empty
   * preset, equivalent to `<Editor>` with no plugins. See builtinPresets.ts for exactly what's
   * NOT included and why (alignment/snapping/devtools/import-json — each depends on
   * @rifrocket/fdt-react itself, so this package can't bundle them without a circular package
   * dependency; add them yourself via `plugins.add`).
   */
  preset?: DesignEditorPreset | "default" | "minimal" | "none";
  plugins?: PluginOverrides;
  /**
   * Merged with the preset's own `shortcuts`, not replaced by it: `disable` is the union of
   * both, `add` overlays this prop's entries on top of the preset's (same-combo entries here
   * win). This is what makes `PresetShortcutsConfig.disable` actually reachable — previously
   * `<Editor>` installed every default binding unconditionally with no override point.
   */
  shortcuts?: PresetShortcutsConfig;
  /** Explicit slot content always wins over the preset's own `react.slots` map. */
  slots?: EditorProps["slots"];
  /** Explicit theme always wins over the preset's own `react.theme`. */
  theme?: EditorProps["theme"];
  /** `null` suppresses the preset's fields for that type entirely. */
  propertyFields?: Record<string, PropertyFieldDefinition[] | null>;
  /**
   * Sugar for adding `@rifrocket/fdt-plugin-local-storage`'s autosave plugin — off by default
   * because bundling it unconditionally into a preset risks silently persisting one app's canvas
   * into another's localStorage key. `true` uses the plugin's own defaults; pass an options
   * object for a custom key/debounce/capture callbacks.
   */
  autosave?: true | LocalStoragePluginOptions;
}

function resolveDesignPreset(preset: DesignEditorProps["preset"]): DesignEditorPreset {
  if (!preset || preset === "none") return NONE_PRESET;
  if (preset === "default") return defaultPreset;
  if (preset === "minimal") return minimalPreset;
  return preset;
}

// disable = union (either side disabling a combo wins); add = this prop's entries overlay the
// preset's (same pattern as plugins.replace: an explicit, named override wins over the preset).
function mergeShortcuts(
  presetShortcuts: PresetShortcutsConfig | undefined,
  overrideShortcuts: PresetShortcutsConfig | undefined,
): PresetShortcutsConfig | undefined {
  if (!presetShortcuts && !overrideShortcuts) return undefined;
  return {
    disable: [...(presetShortcuts?.disable ?? []), ...(overrideShortcuts?.disable ?? [])],
    add: { ...presetShortcuts?.add, ...overrideShortcuts?.add },
  };
}

// Resolves the preset (core plugins/propertyFields/snapping + react.slots/theme), merges
// per-field overrides, then renders the same <Editor> every other consumer uses — no parallel
// rendering path, no bypass of <Editor>'s construction-time plugin contract.
export function DesignEditor(props: DesignEditorProps): ReactElement {
  const { preset: presetInput, plugins: pluginOverrides, slots, theme, shortcuts, propertyFields: propertyFieldOverrides, autosave, onReady, ...rest } = props;

  const preset = resolveDesignPreset(presetInput);

  const resolvedShortcuts = useMemo(() => mergeShortcuts(preset.shortcuts, shortcuts), [preset, shortcuts]);

  const resolvedPlugins = useMemo(() => {
    if (!autosave) return resolvePluginList(preset, pluginOverrides);
    const options = autosave === true ? {} : autosave;
    return resolvePluginList(preset, {
      ...pluginOverrides,
      add: [...(pluginOverrides?.add ?? []), localStoragePlugin(options)],
    });
  }, [preset, pluginOverrides, autosave]);

  const resolvedPropertyFields = useMemo(() => resolvePropertyFields(preset, propertyFieldOverrides), [preset, propertyFieldOverrides]);

  // <Editor> has no propertyFields prop of its own (property fields are per-object-type, not a
  // top-level engine option) — apply the resolved map the same moment createEditor() (core)
  // would: right after the engine is constructed and its plugins installed.
  const handleReady = useCallback(
    (engine: CanvasEngine) => {
      for (const [typeId, fields] of Object.entries(resolvedPropertyFields)) {
        if (fields.length > 0 && engine.registry.objectTypes.has(typeId)) {
          engine.registry.registerPropertyFields(typeId, fields);
        }
      }
      onReady?.(engine);
    },
    [resolvedPropertyFields, onReady],
  );

  return (
    <Editor
      {...rest}
      plugins={resolvedPlugins}
      snapping={preset.snapping ?? rest.snapping}
      shortcuts={resolvedShortcuts}
      theme={theme ?? preset.react?.theme}
      slots={{ ...preset.react?.slots, ...slots }}
      onReady={handleReady}
    />
  );
}
