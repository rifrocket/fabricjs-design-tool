import { useState } from "react";
import type { ReactElement } from "react";
import { Stamp } from "lucide-react";
import { useEditor } from "@rifrocket/fdt-react";
import { STAMP_TOOL_ID, SELECT_TOOL_ID } from "../../plugins/stampToolPlugin";
import { logUiEvent } from "../../dev-tools/uiEventLog";

// Demonstrates ToolRegistry directly (engine.registry.tools) rather than a feature built on
// top of shape/history APIs — see plugins/stampToolPlugin.ts for the registration side, and
// the "plugins" entry in docs/featureDocs.ts (browsable from Dev Tools) for the write-up.
// ToolRegistry has no reactive "active tool changed" event, so this button's own toggle
// state is the source of truth, same pattern as SnappingToggle.
export function StampToolButton(): ReactElement {
  const engine = useEditor();
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      title="Stamp tool (S) — click canvas to place rectangles"
      aria-pressed={active}
      onClick={() => {
        const next = !active;
        engine.registry.tools.activate(next ? STAMP_TOOL_ID : SELECT_TOOL_ID);
        setActive(next);
        logUiEvent(next ? "Activate stamp tool" : "Deactivate stamp tool");
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ${
        active ? "bg-fdt-accent text-white" : "text-fdt-fg-muted hover:bg-fdt-bg-elevated hover:text-fdt-fg"
      }`}
    >
      <Stamp size={17} strokeWidth={1.75} />
    </button>
  );
}
