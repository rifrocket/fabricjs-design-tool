import { useState } from "react";
import type { ReactElement } from "react";
import { Magnet } from "lucide-react";
import { useEditor } from "@rifrocket/fdt-react";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { logUiEvent } from "../../dev-tools/uiEventLog";

// SnapEngine has no reactive "enabled changed" event, so this button's local state is the
// source of truth (seeded once from isEnabled()), same pattern as StampToolButton.
export function SnappingToggle(): ReactElement {
  const engine = useEditor();
  const [enabled, setEnabled] = useState(() => engine.snapping.isEnabled());

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-pressed={enabled}
        title="Toggle smart-guide snapping"
        onClick={() => {
          const next = !enabled;
          engine.snapping.setEnabled(next);
          setEnabled(next);
          logUiEvent(next ? "Enable snapping" : "Disable snapping");
        }}
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors duration-150 ${
          enabled ? "text-fdt-accent" : "text-fdt-fg-muted hover:text-fdt-fg"
        }`}
      >
        <Magnet size={13} strokeWidth={2} aria-hidden="true" />
        Snap
      </button>
      <InfoTooltip featureKey="snapping" />
    </div>
  );
}
