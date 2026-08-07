import type { ReactElement } from "react";
import { ALIGNMENTS, DISTRIBUTE_AXES, useAlignmentActions } from "./useAlignmentActions";

// Bare/unstyled, matching the convention @rifrocket/fdt-react's own shipped components
// (LayersPanel, PropertiesPanel) already follow — AlignmentManager already exists in
// @rifrocket/fabricjs-design-tool with no UI anywhere.
export function AlignmentControls(): ReactElement {
  const { alignDisabled, distributeDisabled, align, distribute } = useAlignmentActions();

  return (
    <div role="group" aria-label="Align & distribute">
      {ALIGNMENTS.map(({ value, label }) => (
        <button key={value} type="button" aria-label={label} disabled={alignDisabled} onClick={() => align(value)}>
          {label}
        </button>
      ))}
      {DISTRIBUTE_AXES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          disabled={distributeDisabled}
          onClick={() => distribute(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
