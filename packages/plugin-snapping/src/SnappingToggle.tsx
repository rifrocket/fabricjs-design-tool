import type { ReactElement } from "react";
import { useSnapping } from "./useSnapping";

// Bare/unstyled, matching the convention @rifrocket/fdt-react's own shipped components
// already follow.
export function SnappingToggle(): ReactElement {
  const { enabled, setEnabled } = useSnapping();

  return (
    <button type="button" aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
      Snapping: {enabled ? "On" : "Off"}
    </button>
  );
}
