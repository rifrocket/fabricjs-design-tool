import type { ReactElement } from "react";
import { Keyboard } from "lucide-react";
import { useEditorState } from "@rifrocket/fdt-react";
import { useEngineOrNull } from "../engine/useEngineOrNull";
import { useTemplateContext } from "../templates/TemplateContext";
import { ZoomControls } from "../features/viewport/ZoomControls";
import { SnappingToggle } from "../features/viewport/SnappingToggle";

const KBD_CLASS = "rounded border border-fdt-border bg-fdt-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-fdt-fg";

export function StatusBar(): ReactElement {
  const engine = useEngineOrNull();
  const { activeTemplate } = useTemplateContext();

  return (
    <footer className="flex h-9 items-center justify-between border-t border-fdt-border bg-fdt-bg px-3 text-xs text-fdt-fg-muted">
      <div className="hidden items-center gap-2 sm:flex">
        <Keyboard size={13} strokeWidth={2} />
        <span>
          Hold <kbd className={KBD_CLASS}>Space</kbd> to pan · Mouse wheel to zoom
        </span>
      </div>

      <span className="sm:hidden">
        {activeTemplate.label} · {activeTemplate.width} × {activeTemplate.height}px
      </span>

      {engine ? <StatusBarContent /> : <span>Loading canvas…</span>}
    </footer>
  );
}

function StatusBarContent(): ReactElement {
  const objectCount = useEditorState((state) => state.objectIds.length);
  const selectedCount = useEditorState((state) => state.selectedObjectIds.length);

  return (
    <div className="flex items-center gap-4">
      <span className="hidden md:inline">
        {objectCount} object{objectCount === 1 ? "" : "s"}
        {selectedCount > 0 ? ` · ${selectedCount} selected` : ""}
      </span>
      <SnappingToggle />
      <div className="h-4 w-px bg-fdt-border" />
      <ZoomControls />
    </div>
  );
}
