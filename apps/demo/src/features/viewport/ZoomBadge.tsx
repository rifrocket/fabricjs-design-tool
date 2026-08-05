import type { ReactElement } from "react";
import { useEditorState } from "@rifrocket/fdt-react";

// Passive read-only zoom display floating over the canvas corner — separate from the
// interactive ZoomControls in the status bar, matching the old demo's floating "100%" pill.
export function ZoomBadge(): ReactElement {
  const zoom = useEditorState((state) => state.zoom);

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-30 rounded-full border border-fdt-border bg-fdt-bg px-3 py-1 text-xs font-medium text-fdt-fg shadow-sm">
      {Math.round(zoom * 100)}%
    </div>
  );
}
