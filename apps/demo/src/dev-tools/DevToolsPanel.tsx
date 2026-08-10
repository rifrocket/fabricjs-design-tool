import type { ReactElement } from "react";
import { CanvasStateViewer, HistoryPanel, PerformanceStats } from "@rifrocket/fdt-plugin-devtools";
import { AlignmentControls } from "@rifrocket/fdt-plugin-alignment";
import { SnappingToggle } from "@rifrocket/fdt-plugin-snapping";
import { InfoTooltip } from "../docs/InfoTooltip";
import { ApiUsageSnippets } from "../docs/ApiUsageSnippets";
import { HierarchyPanel } from "./HierarchyPanel";
import { UiEventLogPanel } from "./UiEventLogPanel";
import { DebugModeToggle, DebugModeProvider, useDebugModeState } from "./DebugModeToggle";

// Only mounted while the "Dev Tools" sidebar tab is selected (React.lazy + Suspense in
// RightSidebar.tsx), so child-panel subscriptions/rAF loops aren't a hidden background cost otherwise.
// CanvasStateViewer/HistoryPanel/PerformanceStats come straight from @rifrocket/fdt-plugin-devtools
// and render unstyled as-is, rather than wrapped in a demo styling layer that would reintroduce
// the duplication using the shipped plugin removed.
export function DevToolsPanel(): ReactElement {
  const [debugMode, setDebugMode] = useDebugModeState();

  return (
    <DebugModeProvider value={debugMode}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <InfoTooltip featureKey="devTools" />
          <DebugModeToggle enabled={debugMode} onChange={setDebugMode} />
        </div>
        <PerformanceStats />
        <CanvasStateViewer />
        <HierarchyPanel />
        <HistoryPanel />
        <UiEventLogPanel />
        {/* AlignmentControls/SnappingToggle rendered exactly as their packages ship them —
            unstyled, no demo wrapper — proving the plug-and-play story those two plugins'
            registered sidebar-right panels actually give a consumer who installs them and adds
            nothing else. The app's own <AlignmentToolbar>/status-bar snapping toggle elsewhere
            in this demo are deliberately custom-styled rebuilds on the same packages' hooks
            (useAlignmentActions/useSnapping) — both are legitimate, but until now the demo never
            showed the zero-effort bare-component path anywhere live. See design-docs/
            PLUG_AND_PLAY_GAP_ANALYSIS_2026-08-08.md, backlog item #7. */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
            Plug-and-play preview
          </div>
          <p className="mb-2 text-xs text-fdt-fg-muted">
            @rifrocket/fdt-plugin-alignment/-snapping&apos;s own bare components, unstyled.
          </p>
          <AlignmentControls />
          <SnappingToggle />
        </div>
        <ApiUsageSnippets />
      </div>
    </DebugModeProvider>
  );
}
