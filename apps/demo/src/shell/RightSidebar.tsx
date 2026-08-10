import { lazy, Suspense, useState } from "react";
import type { ReactElement } from "react";
import { PropertiesPanel, useEditorState } from "@rifrocket/fdt-react";
import { EffectsPanel } from "@rifrocket/fdt-plugin-effects-panel";
import { AlignmentToolbar } from "../features/selection/AlignmentToolbar";
import { EnhancedLayersPanel } from "../features/layers/EnhancedLayersPanel";
import { CanvasSizeFields } from "../features/canvas/CanvasSizeFields";
import { InfoTooltip } from "../docs/InfoTooltip";

const DevToolsPanel = lazy(() => import("../dev-tools/DevToolsPanel").then((m) => ({ default: m.DevToolsPanel })));

type Tab = "properties" | "effects" | "layers" | "dev";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "properties", label: "Properties" },
  { id: "effects", label: "Effects" },
  { id: "layers", label: "Layers" },
  { id: "dev", label: "Dev Tools" },
];

// Only ever mounted once an engine is confirmed ready by the caller (see the
// {engine ? <RightSidebar/> : ...} gate in AppShell.tsx, and the equivalent gate in
// EngineHost.tsx's MultiPageWorkspace), so every hook here can safely assume a live CanvasEngine in context.
export function RightSidebar({ showCanvasSize = true }: { showCanvasSize?: boolean }): ReactElement {
  const [tab, setTab] = useState<Tab>("properties");
  const selectedCount = useEditorState((state) => state.selectedObjectIds.length);

  return (
    <aside className="flex h-full flex-col overflow-hidden border-l border-fdt-border bg-fdt-bg">
      <div role="tablist" aria-label="Sidebar panels" data-tour="sidebar-tabs" className="flex border-b border-fdt-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-2 py-2 text-xs font-medium transition-colors duration-150 ${
              tab === t.id
                ? "border-b-2 border-fdt-accent text-fdt-fg"
                : "text-fdt-fg-muted hover:text-fdt-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "properties" && (
          <div className="flex flex-col gap-4">
            <AlignmentToolbar />
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
                Properties
                <InfoTooltip featureKey="properties" />
              </div>
              {selectedCount === 0 ? (
                <p className="text-xs text-fdt-fg-muted">Select an object on the canvas to edit its properties.</p>
              ) : (
                <PropertiesPanel />
              )}
            </div>
            {showCanvasSize && selectedCount === 0 && (
              <div className="border-t border-fdt-border pt-4">
                <CanvasSizeFields />
              </div>
            )}
          </div>
        )}

        {tab === "effects" &&
          (selectedCount === 0 ? (
            <p className="text-xs text-fdt-fg-muted">Select an object on the canvas to apply effects.</p>
          ) : (
            <EffectsPanel headingExtra={<InfoTooltip featureKey="effects" />} />
          ))}

        {tab === "layers" && <EnhancedLayersPanel />}

        {tab === "dev" && (
          <Suspense fallback={<p className="text-xs text-fdt-fg-muted">Loading dev tools…</p>}>
            <DevToolsPanel />
          </Suspense>
        )}
      </div>
    </aside>
  );
}
