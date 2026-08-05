import { useState } from "react";
import type { ReactElement } from "react";
import { useEditor } from "@rifrocket/fdt-react";

// Bare/unstyled, matching the convention @rifrocket/fdt-react's own shipped components
// already follow. Local useState mirrors SnapEngine.isEnabled() since SnapEngine only exposes
// an imperative getter/setter, not a reactive "enabled changed" store field or event.
export function SnappingToggle(): ReactElement {
  const engine = useEditor();
  const [enabled, setEnabled] = useState(() => engine.snapping.isEnabled());

  const toggle = () => {
    const next = !enabled;
    engine.snapping.setEnabled(next);
    setEnabled(next);
  };

  return (
    <button type="button" aria-pressed={enabled} onClick={toggle}>
      Snapping: {enabled ? "On" : "Off"}
    </button>
  );
}
