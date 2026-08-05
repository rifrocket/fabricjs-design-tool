import { useState } from "react";
import type { ReactElement } from "react";
import { X } from "lucide-react";
import { useEngineOrNull } from "../engine/useEngineOrNull";
import { Header } from "./Header";
import { LeftToolRail } from "./LeftToolRail";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { RightSidebar } from "./RightSidebar";
import { StatusBar } from "./StatusBar";
import { FloatingPanelsLayer } from "./FloatingPanelsLayer";

export function AppShell({ editor }: { editor: ReactElement }): ReactElement {
  const engine = useEngineOrNull();
  const [mobilePanelsOpen, setMobilePanelsOpen] = useState(false);

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto] overflow-hidden bg-fdt-bg text-fdt-fg">
      <Header onTogglePanels={() => setMobilePanelsOpen((prev) => !prev)} />

      <div className="grid grid-cols-[auto_1fr] overflow-hidden lg:grid-cols-[auto_1fr_320px]">
        <LeftToolRail />
        <CanvasWorkspace editor={editor} />

        <div className="hidden lg:block lg:overflow-hidden">
          {engine ? <RightSidebar /> : <RightSidebarSkeleton />}
        </div>
      </div>

      <StatusBar />
      <FloatingPanelsLayer />

      {mobilePanelsOpen && (
        <div className="fixed inset-0 z-40 flex justify-end lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobilePanelsOpen(false)} />
          <div className="fdt-animate-fade-in relative z-50 h-full w-[320px] max-w-[85vw] overflow-hidden border-l border-fdt-border bg-fdt-bg shadow-2xl">
            <div className="flex items-center justify-between border-b border-fdt-border p-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-fdt-fg-muted">Panels</span>
              <button
                type="button"
                onClick={() => setMobilePanelsOpen(false)}
                className="rounded p-1 text-fdt-fg-muted hover:bg-fdt-bg-elevated"
                aria-label="Close panels"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            {engine ? <RightSidebar /> : <RightSidebarSkeleton />}
          </div>
        </div>
      )}
    </div>
  );
}

function RightSidebarSkeleton(): ReactElement {
  return (
    <div className="flex h-full w-full flex-col gap-3 border-l border-fdt-border bg-fdt-bg-elevated p-3">
      <div className="h-4 w-24 animate-pulse rounded bg-fdt-border" />
      <div className="h-20 w-full animate-pulse rounded bg-fdt-border" />
      <div className="h-4 w-16 animate-pulse rounded bg-fdt-border" />
      <div className="h-32 w-full animate-pulse rounded bg-fdt-border" />
    </div>
  );
}
