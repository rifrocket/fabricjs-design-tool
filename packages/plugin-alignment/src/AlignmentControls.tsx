import type { ReactElement } from "react";
import type { Alignment, DistributeAxis } from "@rifrocket/fabricjs-design-tool";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";

const ALIGNMENTS: Array<{ value: Alignment; label: string }> = [
  { value: "left", label: "Align left" },
  { value: "center", label: "Align center" },
  { value: "right", label: "Align right" },
  { value: "top", label: "Align top" },
  { value: "middle", label: "Align middle" },
  { value: "bottom", label: "Align bottom" },
];

const DISTRIBUTE_AXES: Array<{ value: DistributeAxis; label: string }> = [
  { value: "horizontal", label: "Distribute horizontally" },
  { value: "vertical", label: "Distribute vertically" },
];

// Bare/unstyled, matching the convention @rifrocket/fdt-react's own shipped components
// (LayersPanel, PropertiesPanel) already follow — AlignmentManager already exists in
// @rifrocket/fabricjs-design-tool with no UI anywhere.
export function AlignmentControls(): ReactElement {
  const engine = useEditor();
  const selectedCount = useEditorState((state) => state.selectedObjectIds.length);
  const alignDisabled = selectedCount === 0;
  const distributeDisabled = selectedCount < 3;

  return (
    <div role="group" aria-label="Align & distribute">
      {ALIGNMENTS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          disabled={alignDisabled}
          onClick={() => engine.alignment.align(value)}
        >
          {label}
        </button>
      ))}
      {DISTRIBUTE_AXES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          disabled={distributeDisabled}
          onClick={() => engine.alignment.distribute(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
