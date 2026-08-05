import type { ReactElement } from "react";
import { Trash2 } from "lucide-react";
import { clearSavedDesign } from "@rifrocket/fdt-plugin-local-storage";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { logUiEvent } from "../../dev-tools/uiEventLog";

const ICON_BUTTON_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg";

// Confirms first since this isn't undoable via Ctrl+Z (it only touches localStorage, not
// history), then reloads immediately so the effect is visible — otherwise the live canvas
// looks untouched even though the backup it would have resumed from is now gone.
export function ClearSavedDesignButton(): ReactElement {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Clear saved design"
        onClick={() => {
          if (!window.confirm("Clear the autosaved design backup? This can't be undone.")) return;
          clearSavedDesign();
          logUiEvent("Clear saved design");
          window.location.reload();
        }}
        className={ICON_BUTTON_CLASS}
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>
      <InfoTooltip featureKey="localStorage" />
    </div>
  );
}
