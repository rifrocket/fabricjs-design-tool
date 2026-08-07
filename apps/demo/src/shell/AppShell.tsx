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

// Two modes share this one shell (Header minus TemplatePicker/autosave, LeftToolRail,
// RightSidebar, StatusBar, FloatingPanelsLayer) rather than each maintaining its own copy — see
// design-docs for the session this was split out in. "workspace" is the tuned single-document
// editor (EngineHost.tsx); "pages" is the @rifrocket/fdt-plugin-pages example
// (MultiPageExample.tsx), which supplies its own tab strip and canvas host since those have no
// single-document equivalent. Pan/zoom (containerSelector) is real in both modes now — each
// mode's canvasArea/editor renders its own fixed-size viewport at that selector (see
// CanvasWorkspace.tsx and pages-example/PageCanvasHost.tsx) — so Header/StatusBar's
// zoom-dependent pieces (ExportMenu, ZoomControls) work unmodified in either.
type AppShellProps =
  | {
      mode: "workspace";
      editor: ReactElement;
      onOpenPagesExample: () => void;
      documentLabel: string;
      documentSize: { width: number; height: number };
      containerSelector: string;
    }
  | {
      mode: "pages";
      onExit: () => void;
      tabsBar: ReactElement;
      canvasArea: ReactElement;
      documentSize: { width: number; height: number } | null;
      containerSelector: string;
    };

export function AppShell(props: AppShellProps): ReactElement {
  const engine = useEngineOrNull();
  const [mobilePanelsOpen, setMobilePanelsOpen] = useState(false);
  const pagesMode = props.mode === "pages";

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto_auto] overflow-hidden bg-fdt-bg text-fdt-fg">
      <Header
        onTogglePanels={() => setMobilePanelsOpen((prev) => !prev)}
        onOpenPagesExample={props.mode === "workspace" ? props.onOpenPagesExample : undefined}
        onExitPages={props.mode === "pages" ? props.onExit : undefined}
        documentSize={props.documentSize}
        containerSelector={props.containerSelector}
      />

      <div className="grid grid-cols-[auto_1fr] overflow-hidden lg:grid-cols-[auto_1fr_320px]">
        <LeftToolRail />
        {props.mode === "pages" ? props.canvasArea : <CanvasWorkspace editor={props.editor} />}

        <div className="hidden lg:block lg:overflow-hidden">
          {engine ? <RightSidebar showCanvasSize={!pagesMode} /> : <RightSidebarSkeleton />}
        </div>
      </div>

      {/* Docked above StatusBar, filmstrip-style — a page-tabs strip reads more like a bottom
          panel (Figma's page list, PowerPoint's slide panel) than a top-of-canvas toolbar. */}
      {props.mode === "pages" ? props.tabsBar : null}

      <StatusBar
        documentLabel={props.mode === "workspace" ? props.documentLabel : undefined}
        documentSize={props.documentSize}
        containerSelector={props.containerSelector}
      />
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
            {engine ? <RightSidebar showCanvasSize={!pagesMode} /> : <RightSidebarSkeleton />}
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
