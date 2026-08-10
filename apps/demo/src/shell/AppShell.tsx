import { useState } from "react";
import type { ReactElement } from "react";
import { X } from "lucide-react";
import type { DocumentSnapshotData } from "@rifrocket/fabricjs-design-tool";
import { useEngineOrNull } from "../engine/useEngineOrNull";
import { Header } from "./Header";
import { LeftToolRail } from "./LeftToolRail";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { RightSidebar } from "./RightSidebar";
import { StatusBar } from "./StatusBar";
import { FloatingPanelsLayer } from "./FloatingPanelsLayer";

// What turning multi-page back off hands back — the result of PagesManager.exportPageAsDocument()
// (the first page's content, collapsed to a plain single-document payload), structurally typed
// here rather than importing plugin-pages' own PageMeta just for this prop boundary.
export interface PagesCollapseResult {
  snapshot: DocumentSnapshotData;
  page: { name?: string; width?: number; height?: number; backgroundColor?: string };
}

// Two modes share this one shell (Header minus TemplatePicker/autosave, LeftToolRail,
// RightSidebar, StatusBar, FloatingPanelsLayer) rather than each maintaining its own copy.
// "workspace" is the single-document editor; "pages" is @rifrocket/fdt-plugin-pages, toggled on
// in place within the same EngineHost.tsx screen (not a separate one) — see its own comment for
// why — which supplies its own tab strip and canvas host since those have no single-document
// equivalent. Pan/zoom (containerSelector) is real in both modes — each mode's canvasArea/editor
// renders its own fixed-size viewport at that selector (see CanvasWorkspace.tsx and
// engine/PageCanvasHost.tsx) — so Header/StatusBar's zoom-dependent pieces (ExportMenu,
// ZoomControls) work unmodified in either.
type AppShellProps =
  | {
      mode: "workspace";
      editor: ReactElement;
      onEnableMultiPage: () => void;
      documentLabel: string;
      documentSize: { width: number; height: number };
      containerSelector: string;
    }
  | {
      mode: "pages";
      onDisableMultiPage: (doc: PagesCollapseResult) => void;
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
        onEnableMultiPage={props.mode === "workspace" ? props.onEnableMultiPage : undefined}
        onDisableMultiPage={props.mode === "pages" ? props.onDisableMultiPage : undefined}
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
