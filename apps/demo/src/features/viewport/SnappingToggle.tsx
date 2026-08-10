import type { ReactElement } from "react";
import { Magnet } from "lucide-react";
import { useSnapping } from "@rifrocket/fdt-plugin-snapping";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { logUiEvent } from "../../dev-tools/uiEventLog";

// State/toggle semantics come from @rifrocket/fdt-plugin-snapping's useSnapping, the single
// source of truth also used by that package's own bare <SnappingToggle>. Only the styling and
// the demo-local uiEventLog call are specific to this component.
export function SnappingToggle(): ReactElement {
  const { enabled, setEnabled } = useSnapping();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-pressed={enabled}
        title="Toggle smart-guide snapping"
        onClick={() => {
          const next = !enabled;
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
