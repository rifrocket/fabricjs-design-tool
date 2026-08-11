import type { ReactElement } from "react";
import { DesignEditor } from "@rifrocket/fdt-react";
import type { CanvasEngine } from "@rifrocket/fabricjs-design-tool";
import { importJsonPlugin } from "@rifrocket/fdt-plugin-import-json";
import { useCoverage } from "../checklist/CoverageContext";
import { useTheme } from "../theme/ThemeContext";
import { WORKSPACE_WIDTH, WORKSPACE_HEIGHT, AUTOSAVE_STORAGE_KEY } from "../constants";
import { ToolRail } from "./workspace/ToolRail";
import { SidebarRight } from "./workspace/SidebarRight";
import { ToolbarStart } from "./workspace/ToolbarStart";

const PLUGINS = { add: [importJsonPlugin] };

// preset="default" installs shapes-basic, clipboard, svg-import, image, effects, export-pdf,
// and qrcode (per @rifrocket/fdt-react's own README) — everything else (import-json,
// local-storage, and every panel-slot plugin's UI) is added explicitly below, the same
// composition apps/demo uses.
export function MainWorkspaceSection(): ReactElement {
  const { report } = useCoverage();
  const { resolvedTheme } = useTheme();

  const handleReady = (_engine: CanvasEngine): void => {
    report("core", "pass");
    report("react", "pass");
  };

  return (
    <section className="rounded-2xl border border-fdt-border bg-fdt-bg p-5 shadow-sm">
      <h2 className="m-0 mb-3.5 text-[15px] font-semibold text-fdt-fg">Single-document workspace</h2>
      <div className="overflow-hidden rounded-xl border border-fdt-border bg-fdt-bg-elevated" data-fdt-canvas-container="true">
        <DesignEditor
          preset="default"
          plugins={PLUGINS}
          autosave={{ key: AUTOSAVE_STORAGE_KEY }}
          snapping={{ enabled: true }}
          theme={resolvedTheme}
          width={WORKSPACE_WIDTH}
          height={WORKSPACE_HEIGHT}
          className="flex flex-wrap gap-4 p-4"
          ariaLabel="npm-verify canvas"
          slots={{ "toolbar-start": ToolbarStart, "tool-rail": ToolRail, "sidebar-right": SidebarRight }}
          onReady={handleReady}
        />
      </div>
    </section>
  );
}
