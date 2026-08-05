import { shapesBasicPlugin } from "@rifrocket/fdt-plugin-shapes-basic";
import { clipboardPlugin } from "@rifrocket/fdt-plugin-clipboard";
import { svgImportPlugin } from "@rifrocket/fdt-plugin-svg-import";
import { imagePlugin } from "@rifrocket/fdt-plugin-image";
import { createEffectsPlugin } from "@rifrocket/fdt-plugin-effects";
import { exportPdfPlugin } from "@rifrocket/fdt-plugin-export-pdf";
import { qrCodePlugin } from "@rifrocket/fdt-plugin-qrcode";
import type { DesignEditorPreset } from "./types";

// Deliberately excluded from every preset: @rifrocket/fdt-plugin-alignment, -snapping, -devtools,
// and -import-json all depend on @rifrocket/fdt-react themselves (they render via useEditor()),
// so bundling them here would be a circular package dependency (fdt-react -> plugin-x ->
// fdt-react) that pnpm/tsup can't build. shapes-basic/image/qrcode look like the same risk but
// aren't: they depend on @rifrocket/fdt-properties, which used to import a *type* from
// @rifrocket/fdt-react and create this exact cycle; that type (PropertyFieldProps) now lives in
// @rifrocket/fdt-core instead (see core's objectTypeRegistry.ts). Excluded plugins stay available
// the same way any third-party plugin is: `plugins: { add: [...] }` (see DesignEditor.tsx and
// apps/demo/src/engine/EngineHost.tsx).
//
// @rifrocket/fdt-plugin-local-storage is core-only (no circular risk) but still excluded here:
// its real value needs an app-specific captureMeta/document-id callback, so it's surfaced as
// DesignEditorProps.autosave sugar instead of bundled unconditionally.
const DEFAULT_PLUGINS = () => [
  shapesBasicPlugin,
  clipboardPlugin,
  svgImportPlugin,
  imagePlugin,
  createEffectsPlugin(),
  exportPdfPlugin,
  qrCodePlugin,
];

const MINIMAL_PLUGINS = () => [shapesBasicPlugin, clipboardPlugin, imagePlugin, createEffectsPlugin()];

// The "general-purpose editor, complete out of the box" preset. Snapping starts disabled:
// unfiltered-guide rendering made default-on snapping actively disruptive — turn it on
// explicitly via `snapping: { enabled: true }` once a consumer wants it.
export const defaultPreset: DesignEditorPreset = {
  name: "default",
  plugins: DEFAULT_PLUGINS,
  snapping: { enabled: false },
  react: { theme: "system" },
};

// Drops qrcode/export-pdf/svg-import — the same shapes/clipboard/image/effects core every
// general-purpose editor needs, without the heavier or more niche additions.
export const minimalPreset: DesignEditorPreset = {
  name: "minimal",
  plugins: MINIMAL_PLUGINS,
  snapping: { enabled: false },
  react: { theme: "system" },
};

export const NONE_PRESET: DesignEditorPreset = { name: "none", plugins: [] };
