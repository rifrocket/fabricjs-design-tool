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
import type { Alignment, DistributeAxis } from "@rifrocket/fabricjs-design-tool";
import { ALIGNMENTS, DISTRIBUTE_AXES, useAlignmentActions } from "@rifrocket/fdt-plugin-alignment";
import { InfoTooltip } from "../../docs/InfoTooltip";

// Icons only — button values, labels, and enablement rules come from
// @rifrocket/fdt-plugin-alignment's useAlignmentActions, the single source of truth also used
// by that package's own bare <AlignmentControls>.
const ALIGN_ICONS: Record<Alignment, typeof AlignStartVertical> = {
  left: AlignStartVertical,
  center: AlignCenterVertical,
  right: AlignEndVertical,
  top: AlignStartHorizontal,
  middle: AlignCenterHorizontal,
  bottom: AlignEndHorizontal,
};

const DISTRIBUTE_ICONS: Record<DistributeAxis, typeof AlignHorizontalDistributeCenter> = {
  horizontal: AlignHorizontalDistributeCenter,
  vertical: AlignVerticalDistributeCenter,
};

const BUTTON_CLASS =
  "flex h-7 w-7 items-center justify-center rounded-md text-fdt-fg-muted transition-colors duration-150 hover:bg-fdt-bg-elevated hover:text-fdt-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

export function AlignmentToolbar(): ReactElement {
  const { alignDisabled, distributeDisabled, align, distribute } = useAlignmentActions();

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
        Align & distribute
        <InfoTooltip featureKey="alignment" />
      </div>
      <div className="flex flex-wrap gap-0.5">
        {ALIGNMENTS.map(({ value, label }) => {
          const Icon = ALIGN_ICONS[value];
          return (
            <button
              key={value}
              type="button"
              title={label}
              disabled={alignDisabled}
              className={BUTTON_CLASS}
              onClick={() => align(value)}
            >
              <Icon size={15} strokeWidth={2} />
            </button>
          );
        })}
        <div className="mx-1 my-auto h-5 w-px bg-fdt-border" />
        {DISTRIBUTE_AXES.map(({ value, label }) => {
          const Icon = DISTRIBUTE_ICONS[value];
          return (
            <button
              key={value}
              type="button"
              title={label}
              disabled={distributeDisabled}
              className={BUTTON_CLASS}
              onClick={() => distribute(value)}
            >
              <Icon size={15} strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
