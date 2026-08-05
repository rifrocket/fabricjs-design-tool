import type { ReactElement } from "react";
import { resetAllEffects } from "@rifrocket/fdt-core";
import { useEditor, useObjectEffects } from "@rifrocket/fdt-react";
import { InfoTooltip } from "../../docs/InfoTooltip";
import { EffectStackList } from "./EffectStackList";
import { EffectGallery } from "./EffectGallery";

// Renders nothing when there's no selection (RightSidebar guards on that too, but this stays
// self-contained for direct reuse).
export function EffectsSection(): ReactElement | null {
  const engine = useEditor();
  const [object] = engine.selection.getActiveObjects();
  const { stack, apply } = useObjectEffects(object);

  if (!object) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fdt-fg-muted">
          Effects
          <InfoTooltip featureKey="effects" />
        </div>
        {stack.length > 0 && (
          <button
            type="button"
            onClick={() => apply(resetAllEffects())}
            className="text-[11px] text-fdt-danger hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      <EffectStackList stack={stack} apply={apply} />
      <EffectGallery stack={stack} apply={apply} />
    </div>
  );
}
