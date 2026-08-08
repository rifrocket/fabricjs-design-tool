import type { PresetShortcutsConfig } from "@rifrocket/fabricjs-design-tool";
import { defaultPreset, minimalPreset, NONE_PRESET } from "./builtinPresets";
import type { DesignEditorPreset } from "./types";
import type { DesignEditorProps } from "./DesignEditor";

// Exported for reuse by other one-liner components built on the same preset model but not on
// <Editor> itself (e.g. @rifrocket/fdt-plugin-pages' <MultiPageDesignEditor>), so "default"/
// "minimal"/"none"/a literal preset resolve identically everywhere instead of each consumer
// reimplementing this switch.
// Lives in its own file (not DesignEditor.tsx) so these plain-function exports don't share a
// module with the <DesignEditor> component export, which react-refresh/only-export-components flags.
export function resolveDesignPreset(preset: DesignEditorProps["preset"]): DesignEditorPreset {
  if (!preset || preset === "none") return NONE_PRESET;
  if (preset === "default") return defaultPreset;
  if (preset === "minimal") return minimalPreset;
  return preset;
}

// disable = union (either side disabling a combo wins); add = this prop's entries overlay the
// preset's (same pattern as plugins.replace: an explicit, named override wins over the preset).
// Exported for the same cross-package reuse reason as resolveDesignPreset above.
export function mergeShortcuts(
  presetShortcuts: PresetShortcutsConfig | undefined,
  overrideShortcuts: PresetShortcutsConfig | undefined,
): PresetShortcutsConfig | undefined {
  if (!presetShortcuts && !overrideShortcuts) return undefined;
  return {
    disable: [...(presetShortcuts?.disable ?? []), ...(overrideShortcuts?.disable ?? [])],
    add: { ...presetShortcuts?.add, ...overrideShortcuts?.add },
  };
}
