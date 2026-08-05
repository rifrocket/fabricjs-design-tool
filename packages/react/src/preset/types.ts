import type { ComponentType } from "react";
import type { EditorPreset } from "@rifrocket/fdt-core";
import type { EditorTheme } from "../Editor";

export type PanelSlotName = "toolbar-start" | "sidebar-right" | "properties-footer";

export interface ReactPresetExtension {
  theme?: EditorTheme;
  slots?: Partial<Record<PanelSlotName, ComponentType>>;
}

export interface DesignEditorPreset extends EditorPreset {
  react?: ReactPresetExtension;
}
