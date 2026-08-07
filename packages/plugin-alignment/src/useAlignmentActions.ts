import { useEditor, useEditorState } from "@rifrocket/fdt-react";
import type { Alignment, DistributeAxis } from "@rifrocket/fabricjs-design-tool";

export const ALIGNMENTS: Array<{ value: Alignment; label: string }> = [
  { value: "left", label: "Align left" },
  { value: "center", label: "Align center" },
  { value: "right", label: "Align right" },
  { value: "top", label: "Align top" },
  { value: "middle", label: "Align middle" },
  { value: "bottom", label: "Align bottom" },
];

export const DISTRIBUTE_AXES: Array<{ value: DistributeAxis; label: string }> = [
  { value: "horizontal", label: "Distribute horizontally" },
  { value: "vertical", label: "Distribute vertically" },
];

// Single source of truth for align/distribute button data and enablement rules, shared by
// this package's own bare AlignmentControls and any consumer building custom-styled controls
// (e.g. apps/demo's AlignmentToolbar) on top of the same AlignmentManager-backed behavior.
export function useAlignmentActions() {
  const engine = useEditor();
  const selectedCount = useEditorState((state) => state.selectedObjectIds.length);

  return {
    alignDisabled: selectedCount === 0,
    distributeDisabled: selectedCount < 3,
    align: (value: Alignment) => engine.alignment.align(value),
    distribute: (axis: DistributeAxis) => engine.alignment.distribute(axis),
  };
}
