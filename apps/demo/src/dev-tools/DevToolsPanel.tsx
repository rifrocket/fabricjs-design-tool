import type { ReactElement } from "react";
import { CanvasStateViewer, HistoryPanel, PerformanceStats } from "@rifrocket/fdt-plugin-devtools";
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
        <ApiUsageSnippets />
      </div>
    </DebugModeProvider>
  );
}
