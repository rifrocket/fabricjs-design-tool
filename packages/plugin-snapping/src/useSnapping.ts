import { useState } from "react";
import { useEditor } from "@rifrocket/fdt-react";

// SnapEngine has no reactive "enabled changed" event, so local state is seeded once from
// isEnabled() and kept as the source of truth thereafter — shared by this package's own bare
// SnappingToggle and any consumer building a custom-styled toggle (e.g. apps/demo's
// StatusBar toggle) on top of the same SnapEngine-backed behavior.
export function useSnapping() {
  const engine = useEditor();
  const [enabled, setEnabledState] = useState(() => engine.snapping.isEnabled());

  const setEnabled = (next: boolean) => {
    engine.snapping.setEnabled(next);
    setEnabledState(next);
  };

  return { enabled, setEnabled };
}
