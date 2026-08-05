import type { ReactElement } from "react";
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
} from "lucide-react";
import { useEditor, useEditorState } from "@rifrocket/fdt-react";
import type { Alignment, DistributeAxis } from "@rifrocket/fabricjs-design-tool";
import { InfoTooltip } from "../../docs/InfoTooltip";

const ALIGN_BUTTONS: Array<{ value: Alignment; Icon: typeof AlignStartVertical; label: string }> = [
  { value: "left", Icon: AlignStartVertical, label: "Align left" },
  { value: "center", Icon: AlignCenterVertical, label: "Align center" },
  { value: "right", Icon: AlignEndVertical, label: "Align right" },
  { value: "top", Icon: AlignStartHorizontal, label: "Align top" },
  { value: "middle", Icon: AlignCenterHorizontal, label: "Align middle" },
  { value: "bottom", Icon: AlignEndHorizontal, label: "Align bottom" },
];

const DISTRIBUTE_BUTTONS: Array<{ value: DistributeAxis; Icon: typeof AlignHorizontalDistributeCenter; label: string }> = [
  { value: "horizontal", Icon: AlignHorizontalDistributeCenter, label: "Distribute horizontally" },
  { value: "vertical", Icon: AlignVerticalDistributeCenter, label: "Distribute vertically" },
];

const BUTTON_CLASS =
  "flex h-7 w-7 items-center justify-center rounded-md text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

export function AlignmentToolbar(): ReactElement {
  const engine = useEditor();
  const selectedCount = useEditorState((state) => state.selectedObjectIds.length);
  const disabled = selectedCount === 0;

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
        Align & distribute
        <InfoTooltip featureKey="alignment" />
      </div>
      <div className="flex flex-wrap gap-0.5">
        {ALIGN_BUTTONS.map(({ value, Icon, label }) => (
          <button
            key={value}
            type="button"
            title={label}
            disabled={disabled}
            className={BUTTON_CLASS}
            onClick={() => engine.alignment.align(value)}
          >
            <Icon size={15} strokeWidth={2} />
          </button>
        ))}
        <div className="mx-1 my-auto h-5 w-px bg-fdt-border" />
        {DISTRIBUTE_BUTTONS.map(({ value, Icon, label }) => (
          <button
            key={value}
            type="button"
            title={label}
            disabled={selectedCount < 3}
            className={BUTTON_CLASS}
            onClick={() => engine.alignment.distribute(value)}
          >
            <Icon size={15} strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}
