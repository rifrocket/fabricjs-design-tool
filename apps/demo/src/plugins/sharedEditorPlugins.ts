import type { EditorPlugin } from "@rifrocket/fabricjs-design-tool";
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";
import { alignmentPlugin } from "@rifrocket/fdt-plugin-alignment";
import { snappingPlugin } from "@rifrocket/fdt-plugin-snapping";
import { devtoolsPlugin } from "@rifrocket/fdt-plugin-devtools";
import { createEffectsPanelPlugin } from "@rifrocket/fdt-plugin-effects-panel";
import { createShapesBasicPanelPlugin } from "@rifrocket/fdt-plugin-shapes-basic-panel";
import { stampToolPlugin } from "./stampToolPlugin";

// preset="default" already installs shapes/clipboard/svg-import/image/effects/export-pdf/qrcode;
// this adds only what it doesn't bundle. alignment/snapping/devtools/effects-panel/
// shapes-basic-panel are excluded from every built-in preset (each depends on @rifrocket/fdt-react
// itself, which would be a circular package dependency if fdt-react bundled them back) — needed
// here so their registries/uninstall semantics are real, not just their headless hooks working by
// accident against always-on core managers. Their sidebar-right/tool-rail panels are suppressed
// via the editor's own `slots` prop, since AppShell/LeftToolRail/RightSidebar render their own
// styled equivalents instead.
//
// A module-level singleton (not a factory re-called per render) so the exact same plugin object
// instances are shared everywhere — that's already the normal, supported pattern in this
// framework: PagesManager itself resolves its own `plugins` array once and reuses it across every
// page's engine (see plugin-effects' per-canvas WeakMap render-patch fix for how a plugin is
// expected to handle being installed on more than one engine). The single document's engine and
// every page's engine in multi-page mode install this exact array, so it can't drift into two
// independently-maintained copies.
export const sharedEditorPlugins: EditorPlugin[] = [
  importJsonPlugin,
  stampToolPlugin,
  alignmentPlugin,
  snappingPlugin,
  devtoolsPlugin,
  createEffectsPanelPlugin(),
  createShapesBasicPanelPlugin(),
];
